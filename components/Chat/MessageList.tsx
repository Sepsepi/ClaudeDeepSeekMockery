'use client';

import React, { useEffect, useRef } from 'react';
import Message from './Message';

export interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  isStreaming?: boolean;
}

interface MessageListProps {
  messages: MessageType[];
  onSuggestionClick?: (prompt: string) => void;
}

export default function MessageList({ messages, onSuggestionClick }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
      ),
      title: 'Explain concepts',
      desc: 'Get clear explanations on any topic',
      prompt: 'I need you to explain a concept to me. What topic would you like me to explain?',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: 'Write code',
      desc: 'Generate and debug code in any language',
      prompt: 'I can help you write code! What programming language or task do you need help with?',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: 'Boost productivity',
      desc: 'Automate tasks and save time',
      prompt: 'I can help boost your productivity! What task or workflow would you like to improve or automate?',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
        </svg>
      ),
      title: 'Create content',
      desc: 'Write, edit, and brainstorm ideas',
      prompt: 'I can help you create content! What type of content do you want to write? (blog post, article, social media, etc.)',
    },
  ];

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                fillRule="evenodd"
                d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-text-100 mb-3">
            Start a conversation
          </h2>
          <p className="text-lg text-text-200 mb-8">
            Ask me anything. I'm here to help with your questions and tasks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(item.prompt)}
                className="p-4 rounded-lg border border-border-100/10 bg-bg-000 hover:bg-bg-200 hover:border-border-100/20 transition-all cursor-pointer text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-bg-300 flex items-center justify-center text-accent-main-100">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-100 mb-1">
                      {item.title}
                    </div>
                    <div className="text-sm text-text-300">{item.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, idx) => (
        <div key={message.id} className="fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
          <Message
            role={message.role}
            content={message.content}
            imageUrl={message.imageUrl}
            isStreaming={message.isStreaming}
          />
        </div>
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
