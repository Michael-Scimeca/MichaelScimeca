"use client";

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  from: string;
  body: string;
  timestamp: number;
}

interface Notification extends Message {
  isVisible: boolean;
}

export default function SmsNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const connectToStream = () => {
      const eventSource = new EventSource('/api/messages/stream');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'history') {
            // Handle historical messages (don't show as notifications)
            console.log('Received message history:', data.messages);
          } else if (data.type === 'message') {
            // New message - show as notification
            const message = data.message;
            console.log('📱 NEW MESSAGE - Showing notification:', message);
            showNotification(message);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToStream, 5000);
      };

      return eventSource;
    };

    const eventSource = connectToStream();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const showNotification = (message: Message) => {
    const notification: Notification = {
      ...message,
      isVisible: true,
    };

    console.log('🔔 Adding notification to state:', notification);
    setNotifications((prev) => {
      const updated = [...prev, notification];
      console.log('📋 Current notifications array:', updated);
      return updated;
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      hideNotification(message.id);
    }, 10000);
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isVisible: false } : n))
    );

    // Remove from DOM after animation
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 500);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number (e.g., +15551234567 -> (555) 123-4567)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div>
        <div id="body"
          key={notification.id}
          className={`
            pointer-events-auto
            bg-white rounded-lg shadow-2xl border border-gray-200
            p-4 min-w-[320px] max-w-[400px]
            transition-all duration-500 ease-out
            ${notification.isVisible 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-[120%]'
            }
          `}
          style={{
            animation: notification.isVisible
              ? 'slideInFromRight 0.5s ease-out'
              : undefined,
          }}
        >
          <div className="flex items-start gap-3">
            {/* SMS Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">
                  New Text Message
                </p>
                <button
                  onClick={() => hideNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close notification"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* From */}
              <p className="text-xs text-gray-500 mb-2">
                From: {formatPhoneNumber(notification.from)}
              </p>

              {/* Message Body */}
              <p className="text-sm text-gray-800 break-words">
                {notification.body}
              </p>

              {/* Timestamp */}
              <p className="text-xs text-gray-400 mt-2">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>
          </div>
        </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
