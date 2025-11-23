// Shared message store that works across Next.js routes
// Using globalThis to ensure it persists in development mode

interface Message {
  id: string;
  from: string;
  body: string;
  timestamp: number;
}

interface MessageStore {
  messages: Message[];
  listeners: Set<(message: Message) => void>;
}

// Use globalThis to persist across hot reloads in development
const getStore = (): MessageStore => {
  if (!(globalThis as any).__messageStore) {
    (globalThis as any).__messageStore = {
      messages: [],
      listeners: new Set()
    };
  }
  return (globalThis as any).__messageStore;
};

export const addMessage = (message: Message) => {
  const store = getStore();
  store.messages.push(message);
  
  // Keep only last 50 messages
  if (store.messages.length > 50) {
    store.messages.shift();
  }
  
  console.log('📨 Message added to store, notifying listeners:', store.listeners.size);
  
  // Notify all listeners
  store.listeners.forEach(listener => {
    try {
      listener(message);
    } catch (error) {
      console.error('Error notifying listener:', error);
    }
  });
};

export const getMessages = () => {
  return getStore().messages;
};

export const addListener = (listener: (message: Message) => void) => {
  const store = getStore();
  store.listeners.add(listener);
  console.log('👂 Listener added, total listeners:', store.listeners.size);
  return () => {
    store.listeners.delete(listener);
    console.log('👋 Listener removed, remaining:', store.listeners.size);
  };
};





