import { ChevronDown, MoreVertical, Plus, Trash2, Edit2, X, Pin, PinOff, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChatSession } from '@/hooks/use-chat-history';
import { exportChatAsPDF } from '@/lib/export-chat-pdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatSidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newName: string) => void;
  onTogglePinChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToDeleteName, setChatToDeleteName] = useState<string>('');

  const handleRename = (chatId: string, currentName: string) => {
    setEditingId(chatId);
    setEditingName(currentName);
  };

  const saveRename = (chatId: string) => {
    if (editingName.trim()) {
      onRenameChat(chatId, editingName.trim());
    }
    setEditingId(null);
  };

  const handleExportPDF = async (chat: ChatSession) => {
    try {
      await exportChatAsPDF(chat);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 glass-effect border-r border-neutral-800/60 flex flex-col z-20">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/60 flex items-center justify-between">
        <h2 className="font-semibold text-slate-100">Chats</h2>
        <Button
          onClick={() => onNewChat()}
          size="icon"
          variant="ghost"
          className="h-8 w-8 hover:bg-slate-700/50 transition-colors"
        >
          <Plus className="h-4 w-4 text-blue-400" />
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-1 p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No chats yet</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeChatId === chat.id
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'hover:bg-slate-700/30'
              }`}
              onClick={() => {
                if (editingId !== chat.id) {
                  onSwitchChat(chat.id);
                }
              }}
            >
              <div
                className="flex-1 min-w-0"
                onClick={(e) => {
                  if (editingId === chat.id) {
                    e.stopPropagation();
                  }
                }}
              >
                {editingId === chat.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveRename(chat.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    onBlur={() => saveRename(chat.id)}
                    className="w-full bg-slate-800/50 border border-blue-500 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    {chat.isPinned && (
                      <Pin className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                    )}
                    <p className="text-sm text-slate-100 truncate font-medium">
                      {chat.name}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-400">
                  {chat.messages.length} messages
                </p>
              </div>

              {editingId === chat.id ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 hover:bg-slate-700/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                >
                  <X className="h-3 w-3 text-slate-400" />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-slate-700/50 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinChat(chat.id);
                      }}
                      className="flex gap-2 cursor-pointer"
                    >
                      {chat.isPinned ? (
                        <>
                          <PinOff className="h-4 w-4" />
                          <span>Unpin</span>
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4" />
                          <span>Pin to top</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(chat.id, chat.name);
                      }}
                      className="flex gap-2 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(chat);
                      }}
                      className="flex gap-2 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(chat.id);
                        setChatToDeleteName(chat.name);
                        setDeleteDialogOpen(true);
                      }}
                      className="flex gap-2 cursor-pointer text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-effect border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Delete Chat</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete <span className="font-semibold text-slate-300">"{chatToDeleteName}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (chatToDelete) {
                  onDeleteChat(chatToDelete);
                  setChatToDelete(null);
                  setChatToDeleteName('');
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
