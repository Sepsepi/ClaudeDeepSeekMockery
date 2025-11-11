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
  const [incognitoConversations, setIncognitoConversations] = useState<Set<string>>(new Set());
  const [chatMode, setChatMode] = useState<'assistant' | 'creative' | 'technical' | 'casual'>('assistant');

  const router = useRouter();
  const supabase = createBrowserClient();

  // Check authentication and load preferences
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
      loadUserPreferences(user.id);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/login');
      } else {
        setUser(session.user);
        loadUserPreferences(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserPreferences = async (userId: string) => {
    const { data } = await supabase
      .from('user_preferences')
      .select('chat_mode')
      .eq('user_id', userId)
      .single();

    if (data) {
      setChatMode(data.chat_mode || 'assistant');
    }
  };

  const handleToggleIncognito = (conversationId: string, isIncognito: boolean) => {
    setIncognitoConversations(prev => {
      const newSet = new Set(prev);
      if (isIncognito) {
        newSet.add(conversationId);
        // Clear messages when enabling incognito on current conversation
        if (conversationId === currentConversationId) {
          setMessages([]);
        }
      } else {
        newSet.delete(conversationId);
        // Reload messages when disabling incognito on current conversation
        if (conversationId === currentConversationId) {
          loadConversation(conversationId);
        }
      }
      return newSet;
    });
  };

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

    // Don't load messages if conversation is in incognito mode
    if (incognitoConversations.has(conversationId)) {
      return;
    }

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

    // Check if current conversation is in incognito mode
    const isIncognito = currentConversationId ? incognitoConversations.has(currentConversationId) : false;

    // Upload image if present (only if not in incognito mode)
    let imageUrl: string | undefined;
    if (image && !isIncognito) {
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

    // Create or use existing conversation (skip if incognito mode)
    let convId = currentConversationId;
    if (!isIncognito) {
      if (!convId) {
        convId = await createNewConversation(content);
        if (!convId) {
          setIsLoading(false);
          return;
        }
      }

      // Save user message
      await saveMessage(convId, 'user', content, imageUrl);
    }

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
      // Format messages for API
      // Note: DeepSeek doesn't support image analysis yet, so we just mention the image in text
      const formattedMessages = messages.map((m) => {
        if (m.imageUrl) {
          return {
            role: m.role,
            content: `${m.content} [User attached an image: ${m.imageUrl}]`,
          };
        }
        return { role: m.role, content: m.content };
      });

      // Add current message
      const currentMessage = {
        role: 'user' as const,
        content: imageUrl
          ? `${content} [User attached an image: ${imageUrl}]`
          : content,
      };

      // Add system prompt based on chat mode
      const systemPrompts = {
        assistant: 'You are a helpful, balanced AI assistant. Provide clear and accurate responses.',
        creative: 'You are a creative and imaginative AI assistant. Think outside the box and provide expressive, innovative responses.',
        technical: 'You are a precise and technical AI assistant. Provide detailed, accurate, and well-structured technical responses.',
        casual: 'You are a friendly and conversational AI assistant. Respond in a casual, warm, and approachable manner.',
      };

      const systemMessage = { role: 'system' as const, content: systemPrompts[chatMode] };

      // Stream response from DeepSeek
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMessage, ...formattedMessages, currentMessage],
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

      // Save assistant message (skip if incognito mode)
      if (!isIncognito && convId) {
        await saveMessage(convId, 'assistant', fullResponse);
      }

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
        onToggleIncognito={handleToggleIncognito}
        userEmail={user.email}
      />

      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} onSuggestionClick={handleSuggestionClick} />
        <MessageInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
