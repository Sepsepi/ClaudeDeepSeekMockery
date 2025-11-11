import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// DeepSeek uses OpenAI-compatible API
export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

// Use OpenAI's native types for compatibility
export type Message = ChatCompletionMessageParam;

export async function streamDeepSeekResponse(
  messages: Message[],
  onChunk: (chunk: string) => void
) {
  const stream = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      onChunk(content);
    }
  }
}
