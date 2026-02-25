import { ChatSession } from '@/hooks/use-chat-history';

export interface SearchResult {
  chatId: string;
  chatName: string;
  messageIndex: number;
  role: 'user' | 'assistant';
  content: string;
}

export function searchChats(chats: ChatSession[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  chats.forEach((chat) => {
    // Search in messages
    chat.messages.forEach((message, messageIndex) => {
      if (message.content.toLowerCase().includes(lowerQuery)) {
        results.push({
          chatId: chat.id,
          chatName: chat.name,
          messageIndex,
          role: message.role,
          content: message.content,
        });
      }
    });

    // Search in file names
    if (chat.fileMetadata) {
      chat.fileMetadata.forEach((file) => {
        if (file.name.toLowerCase().includes(lowerQuery)) {
          results.push({
            chatId: chat.id,
            chatName: chat.name,
            messageIndex: -1,
            role: 'assistant',
            content: `📄 File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          });
        }
      });
    }
  });

  // Remove duplicates and sort
  const uniqueResults = Array.from(
    new Map(results.map(r => [
      `${r.chatId}-${r.messageIndex}-${r.content.substring(0, 50)}`,
      r
    ])).values()
  );

  return uniqueResults;
}
