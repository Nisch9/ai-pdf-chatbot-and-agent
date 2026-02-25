'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Loader2, X, Upload, FileText, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'loading' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  progress?: number; // 0-100 for upload progress
  duration?: number; // ms, 0 for persistent
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (default 5s, 0 for persistent)
    const duration = notification.duration ?? (notification.type === 'loading' ? 0 : 5000);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updates } : n))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, updateNotification, removeNotification, clearAll }}
    >
      {children}
      <NotificationPanel />
    </NotificationContext.Provider>
  );
}

function NotificationPanel() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    loading: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <FileText className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    success: 'from-green-500/20 to-green-600/10 border-green-500/30',
    error: 'from-red-500/20 to-red-600/10 border-red-500/30',
    loading: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    warning: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    info: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  };

  return (
    <div
      className={`glass-effect bg-gradient-to-r ${bgColors[notification.type]} border rounded-lg p-3 shadow-lg animate-slideInRight`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[notification.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100">{notification.title}</p>
          {notification.message && (
            <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
          )}
          {notification.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${notification.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{notification.progress}%</p>
            </div>
          )}
        </div>
        {notification.type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
