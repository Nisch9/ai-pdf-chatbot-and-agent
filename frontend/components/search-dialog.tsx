'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ChatSession } from '@/hooks/use-chat-history';
import { searchChats, SearchResult } from '@/lib/search-chats';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider-context';

interface SearchDialogProps {
  chats: ChatSession[];
  onSelectResult: (chatId: string, messageId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({
  chats,
  onSelectResult,
  open,
  onOpenChange,
}: SearchDialogProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchChats(chats, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, chats]);

  if (!open) return null;

  const isDark = theme === 'dark';

  return (
    <div 
      className={`fixed inset-0 z-40 backdrop-blur-md ${
        isDark ? 'bg-black/40' : 'bg-black/30'
      }`}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed inset-x-0 top-16 mx-auto max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={`glass-effect border rounded-xl shadow-2xl overflow-hidden ${
            isDark 
              ? 'border-slate-700 bg-slate-900/80' 
              : 'border-blue-300 bg-white shadow-blue-500/10'
          }`}
        >
          {/* Search Input */}
          <div 
            className={`p-5 border-b ${
              isDark
                ? 'border-slate-700 bg-gradient-to-r from-slate-900/80 to-slate-800/80'
                : 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50'
            }`}
          >
            <div 
              className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                isDark
                  ? 'bg-slate-950/50 border-slate-700/50'
                  : 'bg-white border-blue-300 shadow-sm'
              }`}
            >
              <Search className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <Input
                placeholder="Search chats, messages, and files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg ${
                  isDark
                    ? 'text-slate-100 placeholder:text-slate-500'
                    : 'text-gray-900 placeholder:text-gray-500'
                }`}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery('');
                  onOpenChange(false);
                }}
                className={`${isDark ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-100' : 'hover:bg-blue-100 text-gray-600 hover:text-gray-900'}`}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Results */}
          <div 
            className={`max-h-[500px] overflow-y-auto ${
              isDark ? 'bg-slate-900/60' : 'bg-gradient-to-b from-slate-50 to-white'
            }`}
          >
            {results.length > 0 ? (
              <div className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-300'}`}>
                {results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectResult(result.chatId, `msg-${result.messageIndex}`);
                      onOpenChange(false);
                      setQuery('');
                    }}
                    className={`w-full text-left p-4 transition-colors duration-200 group border-l-4 border-transparent ${
                      isDark
                        ? 'hover:bg-slate-800 hover:border-blue-500'
                        : 'hover:bg-blue-50 hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {result.chatName}
                        </p>
                        <p className={`text-sm line-clamp-2 transition-colors ${
                          isDark 
                            ? 'text-slate-200 group-hover:text-white' 
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {result.content}
                        </p>
                      </div>
                      <span className="text-lg ml-4 flex-shrink-0">
                        {result.role === 'user' ? '👤' : '🤖'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className={`p-12 text-center ${
                isDark 
                  ? 'bg-slate-900/40 text-slate-400' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <p className="text-lg">🔍 No results found for <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>"{query}"</span></p>
              </div>
            ) : (
              <div className={`p-12 text-center ${
                isDark 
                  ? 'bg-slate-900/40 text-slate-500' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <p className="text-lg">✨ Start typing to search your chats, messages, and files...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
