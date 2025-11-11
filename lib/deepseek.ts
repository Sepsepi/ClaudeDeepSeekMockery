import OpenAI from 'openai';

// DeepSeek uses OpenAI-compatible API
export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export type MessageContent =
  | string
  | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;

export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
};

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
