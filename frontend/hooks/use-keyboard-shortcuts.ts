import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSearch?: () => void;
  onNewChat?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts({
  onSearch,
  onNewChat,
  onEscape,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd/Ctrl + K (Search)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onSearch?.();
      }
      // Check for Cmd/Ctrl + N (New Chat)
      else if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onNewChat?.();
      }
      // Check for Escape
      else if (event.key === 'Escape') {
        onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onNewChat, onEscape]);
}
