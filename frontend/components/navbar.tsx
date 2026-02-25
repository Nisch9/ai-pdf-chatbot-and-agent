'use client';

import { Brain, Settings, Zap, Book, Download, Search, Moon, Sun, BarChart3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { ChatSession } from '@/hooks/use-chat-history';
import { exportChatsAsJSON } from '@/lib/export-chats';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider-context';
import { SearchDialog } from '@/components/search-dialog';
import { StatsDialog } from '@/components/stats-dialog';
import { AVAILABLE_MODELS } from '@/components/model-selector';

interface NavbarProps {
  chats: ChatSession[];
  onSelectChat?: (chatId: string) => void;
  searchOpen?: boolean;
  onSearchOpenChange?: (open: boolean) => void;
  selectedModel?: string;
}

export function Navbar({ chats, onSelectChat, searchOpen: controlledSearchOpen, onSearchOpenChange, selectedModel }: NavbarProps) {
  const [isConnected] = useState(true); // TODO: Connect to actual backend status
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const searchOpen = controlledSearchOpen !== undefined ? controlledSearchOpen : internalSearchOpen;
  const setSearchOpen = onSearchOpenChange || setInternalSearchOpen;

  const handleExportChats = () => {
    try {
      exportChatsAsJSON(chats);
      toast({
        title: 'Export Successful',
        description: `Exported ${chats.length} chat${chats.length !== 1 ? 's' : ''} as JSON`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export chats. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass-effect border-b border-neutral-800/60 z-50">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Logo & Title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
              AI-PDF Chatbot
            </h1>
            <p className="text-xs text-slate-400">Intelligence from documents</p>
          </div>
        </Link>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2 mr-4 px-3 py-1 rounded-lg bg-slate-800/50">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                isConnected ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-red-400'
              }`}
            />
            <span className="text-xs text-slate-300">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-slate-700/50 transition-colors"
            title="Search chats and documents"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5 text-slate-300 hover:text-blue-400" />
          </Button>

          {/* Stats Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-slate-700/50 transition-colors"
            title="View usage statistics"
            onClick={() => setStatsOpen(true)}
          >
            <BarChart3 className="w-5 h-5 text-slate-300 hover:text-green-400" />
          </Button>

          {/* Dark/Light Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-slate-700/50 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-slate-300 hover:text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-300 hover:text-indigo-400" />
            )}
          </Button>

          {/* About Button */}
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-700/50 transition-colors"
              title="About this app"
            >
              <Info className="w-5 h-5 text-slate-300 hover:text-cyan-400" />
            </Button>
          </Link>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-slate-700/50 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-slate-300 hover:text-purple-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2 space-y-1">
                <div className="flex items-center gap-2 px-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">
                    Model: {selectedModel 
                      ? (AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Unknown')
                      : 'Not selected'}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Book className="w-4 h-4 mr-2 text-blue-400" />
                <span>View Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={handleExportChats}
                disabled={chats.length === 0}
              >
                <Download className="w-4 h-4 mr-2 text-green-400" />
                <span>Export All Chats (JSON)</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-slate-400 text-xs">
                <span>Version 1.0.0</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Search Dialog */}
      <SearchDialog
        chats={chats}
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectResult={(chatId: string) => {
          onSelectChat?.(chatId);
          setSearchOpen(false);
        }}
      />
      
      {/* Stats Dialog */}
      <StatsDialog
        chats={chats}
        open={statsOpen}
        onOpenChange={setStatsOpen}
      />
    </nav>
  );
}
