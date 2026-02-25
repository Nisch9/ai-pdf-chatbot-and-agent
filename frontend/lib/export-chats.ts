import { ChatSession } from '@/hooks/use-chat-history';

export function exportChatsAsJSON(chats: ChatSession[]) {
  if (chats.length === 0) {
    console.warn('No chats to export');
    return;
  }

  // Create export data with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    totalChats: chats.length,
    chats: chats.map((chat) => ({
      id: chat.id,
      name: chat.name,
      threadId: chat.threadId,
      createdAt: new Date(chat.createdAt).toISOString(),
      updatedAt: new Date(chat.updatedAt).toISOString(),
      messagesCount: chat.messages.length,
      filesCount: chat.fileMetadata?.length ?? 0,
      files: chat.fileMetadata || [],
      messages: chat.messages.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        content: msg.content,
        sources: msg.sources?.map(source => ({
          pageContent: source.pageContent,
          pageNumber: source.metadata?.loc?.pageNumber,
          pdfTitle: source.metadata?.pdf?.info?.Title,
        })) || [],
      })),
    })),
  };

  // Convert to JSON string with nice formatting
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-pdf-chatbot-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
