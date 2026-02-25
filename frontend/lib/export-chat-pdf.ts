import { ChatSession } from '@/hooks/use-chat-history';

/**
 * Export a single chat as a PDF using browser print functionality
 * Creates a styled HTML document and triggers print dialog
 */
export async function exportChatAsPDF(chat: ChatSession): Promise<void> {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${chat.name} - Chat Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }
    
    .header {
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 8px;
    }
    
    .header .meta {
      font-size: 12px;
      color: #64748b;
    }
    
    .header .meta span {
      margin-right: 20px;
    }
    
    .documents {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 30px;
    }
    
    .documents h3 {
      font-size: 14px;
      color: #475569;
      margin-bottom: 10px;
    }
    
    .documents ul {
      list-style: none;
      font-size: 13px;
      color: #64748b;
    }
    
    .documents li {
      padding: 4px 0;
    }
    
    .message {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .message-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    
    .message-role {
      font-weight: 600;
      font-size: 14px;
    }
    
    .message-role.user {
      color: #3b82f6;
    }
    
    .message-role.assistant {
      color: #8b5cf6;
    }
    
    .message-time {
      font-size: 11px;
      color: #94a3b8;
    }
    
    .message-content {
      padding: 15px;
      border-radius: 8px;
      font-size: 14px;
      white-space: pre-wrap;
    }
    
    .message.user .message-content {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white;
      margin-left: 20px;
    }
    
    .message.assistant .message-content {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    
    .sources {
      margin-top: 10px;
      padding: 10px;
      background: #fafafa;
      border-radius: 6px;
      font-size: 12px;
      color: #64748b;
    }
    
    .sources-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .message {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(chat.name)}</h1>
    <div class="meta">
      <span>Created: ${formatDate(chat.createdAt)}</span>
      <span>Last updated: ${formatDate(chat.updatedAt)}</span>
      <span>Messages: ${chat.messages.length}</span>
    </div>
  </div>
  
  ${chat.fileMetadata && chat.fileMetadata.length > 0 ? `
  <div class="documents">
    <h3>📄 Uploaded Documents</h3>
    <ul>
      ${chat.fileMetadata.map(file => `
        <li>• ${escapeHtml(file.name)} (${formatFileSize(file.size)})</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}
  
  <div class="messages">
    ${chat.messages.map(msg => `
      <div class="message ${msg.role}">
        <div class="message-header">
          <span class="message-role ${msg.role}">
            ${msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
          </span>
          ${msg.timestamp ? `<span class="message-time">${formatMessageTime(msg.timestamp)}</span>` : ''}
        </div>
        <div class="message-content">${escapeHtml(msg.content)}</div>
        ${msg.sources && msg.sources.length > 0 ? `
          <div class="sources">
            <div class="sources-title">Sources:</div>
            ${msg.sources.slice(0, 3).map(src => `
              <div>• Page ${src.metadata?.page || 'N/A'}: ${escapeHtml((src.pageContent || '').substring(0, 100))}...</div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    Exported from AI-PDF Chatbot on ${formatDate(Date.now())}
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
