'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import MessageList, { MessageType } from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import Sidebar from '@/components/Layout/Sidebar';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function HomePage() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createBrowserClient();

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);
      loadConversations();
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setMessages([]);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(
        data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          imageUrl: msg.image_url,
        }))
      );
    }
  };

  const createNewConversation = async (firstMessage: string) => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    setCurrentConversationId(data.id);
    await loadConversations();
    return data.id;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const saveMessage = async (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    imageUrl?: string
  ) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  };

  const handleSendMessage = async (content: string, image?: File) => {
    if (isLoading) return;

    setIsLoading(true);

    // Upload image if present
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await uploadImage(image) || undefined;
    }

    // Add user message
    const userMessage: MessageType = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      imageUrl,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create or use existing conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation(content);
      if (!convId) {
        setIsLoading(false);
        return;
      }
    }

    // Save user message
    await saveMessage(convId, 'user', content, imageUrl);

    // Add assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: MessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Format messages for API - include images if present
      const formattedMessages = messages.map((m) => {
        if (m.imageUrl) {
          return {
            role: m.role,
            content: [
              { type: 'image_url', image_url: { url: m.imageUrl } },
              { type: 'text', text: m.content },
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

      // Add current message with image if present
      const currentMessage = imageUrl
        ? {
            role: 'user' as const,
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: content },
            ],
          }
        : { role: 'user' as const, content };

      // Stream response from DeepSeek
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...formattedMessages, currentMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      }

      // Save assistant message
      await saveMessage(convId, 'assistant', fullResponse);

      // Remove streaming indicator
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, an error occurred. Please try again.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-100">
        <div className="text-text-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-100">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId || undefined}
        onNewChat={handleNewChat}
        onSelectConversation={loadConversation}
        userEmail={user.email}
      />

      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} onSuggestionClick={handleSuggestionClick} />
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
