import { useState, useEffect } from 'react';
import { PDFDocument } from '@/types/graphTypes';

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl?: string; // Store the file data URL for preview
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    sources?: PDFDocument[];
    timestamp?: number;
  }>;
  fileMetadata: FileMetadata[];
  threadId: string | null;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

const STORAGE_KEY = 'chat_history';
const ACTIVE_CHAT_KEY = 'active_chat_id';

// Convert File to FileMetadata for storage (without dataUrl for basic storage)
export function fileToMetadata(file: File): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

// Convert File to FileMetadata with dataUrl for preview capability
export async function fileToMetadataWithPreview(file: File): Promise<FileMetadata> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Get file display name from metadata
export function getFileDisplayName(metadata: FileMetadata): string {
  return metadata.name;
}

export function useChatHistory() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedActiveChatId = localStorage.getItem(ACTIVE_CHAT_KEY);

    if (saved) {
      try {
        const parsedChats = JSON.parse(saved) as ChatSession[];
        // Migrate old chat data to new format
        const migratedChats = parsedChats.map(chat => ({
          ...chat,
          fileMetadata: chat.fileMetadata || [], // Default to empty array if missing
        }));
        setChats(migratedChats);
        
        if (savedActiveChatId && migratedChats.some(c => c.id === savedActiveChatId)) {
          setActiveChatId(savedActiveChatId);
        } else if (migratedChats.length > 0) {
          setActiveChatId(migratedChats[0].id);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats, isLoaded]);

  // Save active chat ID
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    }
  }, [activeChatId]);

  const createChat = (name?: string) => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: name || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      fileMetadata: [],
      threadId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat;
  };

  const getActiveChat = (): ChatSession | null => {
    return chats.find(c => c.id === activeChatId) || null;
  };

  const updateActiveChat = (updates: Partial<Omit<ChatSession, 'id' | 'createdAt'>>) => {
    if (!activeChatId) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              ...updates,
              updatedAt: Date.now(),
            }
          : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter(c => c.id !== chatId));

    if (activeChatId === chatId) {
      const remaining = chats.filter(c => c.id !== chatId);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId(null);
      }
    }
  };

  const switchChat = (chatId: string) => {
    // Delete current chat if it has no messages and no files
    if (activeChatId && activeChatId !== chatId) {
      const currentChat = chats.find(c => c.id === activeChatId);
      if (currentChat && currentChat.messages.length === 0 && currentChat.fileMetadata.length === 0) {
        setChats((prev) => prev.filter(c => c.id !== activeChatId));
      }
    }
    setActiveChatId(chatId);
  };

  const renameChat = (chatId: string, newName: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, name: newName, updatedAt: Date.now() }
          : chat
      )
    );
  };

  const togglePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, isPinned: !chat.isPinned, updatedAt: Date.now() }
          : chat
      )
    );
  };

  // Sort chats: pinned first, then by updatedAt
  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return {
    chats: sortedChats,
    activeChatId,
    activeChat: getActiveChat(),
    createChat,
    updateActiveChat,
    deleteChat,
    switchChat,
    renameChat,
    togglePinChat,
    isLoaded,
  };
}
