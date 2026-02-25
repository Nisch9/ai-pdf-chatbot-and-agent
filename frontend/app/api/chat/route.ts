import { NextResponse } from 'next/server';
import { retrievalAssistantStreamConfig } from '@/constants/graphConfigs';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { message, threadId, queryModel } = await req.json();

    if (!message) {
      return new NextResponse(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!threadId) {
      return new NextResponse(
        JSON.stringify({ error: 'Thread ID is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (!process.env.LANGGRAPH_RETRIEVAL_ASSISTANT_ID) {
      return new NextResponse(
        JSON.stringify({
          error: 'LANGGRAPH_RETRIEVAL_ASSISTANT_ID is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL;
    if (!apiUrl) {
      return new NextResponse(
        JSON.stringify({
          error: 'NEXT_PUBLIC_LANGGRAPH_API_URL is not set',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    try {
      const assistantId = process.env.LANGGRAPH_RETRIEVAL_ASSISTANT_ID;

      // Direct fetch to backend instead of using LangGraph SDK
      const backendResponse = await fetch(`${apiUrl}/threads/${threadId}/runs/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistant_id: assistantId,
          input: { query: message, threadId },
          stream_mode: ['messages', 'updates'],
          config: {
            configurable: {
              ...retrievalAssistantStreamConfig,
              ...(queryModel && { queryModel }),
            },
          },
        }),
      });

      if (!backendResponse.ok) {
        throw new Error(`Backend error: ${backendResponse.status}`);
      }

      // Forward the SSE stream directly
      return new Response(backendResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (error) {
      // Handle streamRun errors
      console.error('Stream initialization error:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (error) {
    // Handle JSON parsing errors
    console.error('Route error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
