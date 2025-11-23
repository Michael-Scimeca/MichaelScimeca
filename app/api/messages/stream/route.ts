import { NextRequest } from 'next/server';
import { getMessages, addListener } from '../../../../lib/messageStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create a TransformStream for Server-Sent Events
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Send initial connection message
  const sendMessage = (data: any) => {
    writer.write(
      encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
    );
  };

  // Send recent messages (last 10)
  const recentMessages = getMessages().slice(-10);
  if (recentMessages.length > 0) {
    sendMessage({ type: 'history', messages: recentMessages });
  }

  // Listen for new messages
  const listener = (message: any) => {
    console.log('🔔 SSE: Broadcasting new message to client:', message);
    sendMessage({ type: 'message', message });
  };

  const removeListener = addListener(listener);

  // Keep connection alive with periodic pings
  const pingInterval = setInterval(() => {
    try {
      writer.write(encoder.encode(': ping\n\n'));
    } catch (error) {
      console.error('Error sending ping:', error);
      cleanup();
    }
  }, 30000); // Every 30 seconds

  // Cleanup function
  const cleanup = () => {
    clearInterval(pingInterval);
    removeListener();
    try {
      writer.close();
    } catch (error) {
      console.error('Error closing writer:', error);
    }
  };

  // Cleanup on connection close
  request.signal.addEventListener('abort', cleanup);

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

