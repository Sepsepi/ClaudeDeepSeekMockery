'use client';

import React from 'react';
import Image from 'next/image';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  isStreaming?: boolean;
}

export default function Message({ role, content, imageUrl, isStreaming }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`group relative transition-colors ${
        isUser ? 'bg-bg-100' : 'bg-bg-000'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                isUser
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm'
                  : 'bg-white border-2 border-gray-200 shadow-sm overflow-hidden'
              }`}
            >
              {isUser ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Chinese Flag
                <div className="w-full h-full flex items-center justify-center bg-red-600">
                  <svg viewBox="0 0 30 20" className="w-full h-full">
                    <rect width="30" height="20" fill="#DE2910"/>
                    <polygon
                      points="5,3 6.5,6.5 10,6.5 7,9 8.5,12.5 5,10 1.5,12.5 3,9 0,6.5 3.5,6.5"
                      fill="#FFDE00"
                    />
                    <polygon
                      points="11,1 11.5,2.5 13,2.5 11.8,3.5 12.3,5 11,4 9.7,5 10.2,3.5 9,2.5 10.5,2.5"
                      fill="#FFDE00"
                      transform="rotate(23 11 3)"
                    />
                    <polygon
                      points="13,4 13.5,5.5 15,5.5 13.8,6.5 14.3,8 13,7 11.7,8 12.2,6.5 11,5.5 12.5,5.5"
                      fill="#FFDE00"
                      transform="rotate(-10 13 6)"
                    />
                    <polygon
                      points="13,8 13.5,9.5 15,9.5 13.8,10.5 14.3,12 13,11 11.7,12 12.2,10.5 11,9.5 12.5,9.5"
                      fill="#FFDE00"
                      transform="rotate(-30 13 10)"
                    />
                    <polygon
                      points="11,11 11.5,12.5 13,12.5 11.8,13.5 12.3,15 11,14 9.7,15 10.2,13.5 9,12.5 10.5,12.5"
                      fill="#FFDE00"
                      transform="rotate(-45 11 13)"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Image if present */}
            {imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-border-100/20 max-w-md">
                <Image
                  src={imageUrl}
                  alt="Uploaded image"
                  width={500}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Text content */}
            <div className="text-text-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {content}
              {isStreaming && (
                <span className="inline-flex ml-1 w-[3px] h-5 bg-accent-main-100 animate-pulse align-middle" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          {/* Copy button */}
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="btn-icon w-8 h-8"
            title="Copy message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
