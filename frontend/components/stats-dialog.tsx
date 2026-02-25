'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatSession } from '@/hooks/use-chat-history';
import { BarChart3, MessageSquare, FileText, Clock, TrendingUp, Calendar } from 'lucide-react';

interface StatsDialogProps {
  chats: ChatSession[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatsDialog({ chats, open, onOpenChange }: StatsDialogProps) {
  // Calculate statistics
  const totalChats = chats.length;
  const totalMessages = chats.reduce((acc, chat) => acc + chat.messages.length, 0);
  const totalDocuments = chats.reduce((acc, chat) => acc + (chat.fileMetadata?.length || 0), 0);
  const userMessages = chats.reduce(
    (acc, chat) => acc + chat.messages.filter(m => m.role === 'user').length,
    0
  );
  const assistantMessages = chats.reduce(
    (acc, chat) => acc + chat.messages.filter(m => m.role === 'assistant').length, 
    0
  );
  
  // Average messages per chat
  const avgMessagesPerChat = totalChats > 0 ? (totalMessages / totalChats).toFixed(1) : '0';
  
  // Most recent activity
  const mostRecentChat = chats.length > 0 
    ? chats.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b)
    : null;
  
  // Oldest chat
  const oldestChat = chats.length > 0
    ? chats.reduce((a, b) => a.createdAt < b.createdAt ? a : b)
    : null;

  // Chat with most messages
  const mostActiveChat = chats.length > 0
    ? chats.reduce((a, b) => a.messages.length > b.messages.length ? a : b)
    : null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Usage Statistics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<MessageSquare className="w-4 h-4" />}
              label="Total Chats"
              value={totalChats}
              color="blue"
            />
            <StatCard
              icon={<MessageSquare className="w-4 h-4" />}
              label="Total Messages"
              value={totalMessages}
              color="indigo"
            />
            <StatCard
              icon={<FileText className="w-4 h-4" />}
              label="Documents Uploaded"
              value={totalDocuments}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Avg Messages/Chat"
              value={avgMessagesPerChat}
              color="cyan"
            />
          </div>

          {/* Message Breakdown */}
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Message Breakdown</h4>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Your messages</span>
              <span className="text-sm font-semibold text-blue-400">{userMessages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">AI responses</span>
              <span className="text-sm font-semibold text-indigo-400">{assistantMessages}</span>
            </div>
            {totalMessages > 0 && (
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${(userMessages / totalMessages) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Activity Info */}
          <div className="space-y-2">
            {mostActiveChat && (
              <div className="flex items-center justify-between text-xs bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span>Most active chat</span>
                </div>
                <span className="text-slate-300 truncate max-w-[150px]">
                  {mostActiveChat.name} ({mostActiveChat.messages.length} msgs)
                </span>
              </div>
            )}
            {mostRecentChat && (
              <div className="flex items-center justify-between text-xs bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span>Last activity</span>
                </div>
                <span className="text-slate-300">{formatTimeAgo(mostRecentChat.updatedAt)}</span>
              </div>
            )}
            {oldestChat && (
              <div className="flex items-center justify-between text-xs bg-slate-800/30 rounded-lg p-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  <span>First chat created</span>
                </div>
                <span className="text-slate-300">{formatDate(oldestChat.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: 'blue' | 'indigo' | 'purple' | 'cyan';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-3 border border-slate-700/50`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
