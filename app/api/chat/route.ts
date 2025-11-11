import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/deepseek';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    console.log('Received messages:', messages);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('Starting DeepSeek API call...');
          const completion = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4000,
          });

          console.log('DeepSeek API responded, streaming chunks...');

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          console.log('Stream completed');
          controller.close();
        } catch (error: any) {
          console.error('DeepSeek API error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
