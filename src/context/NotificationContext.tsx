import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[320px] space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              "flex items-center gap-3 p-4 rounded-2xl shadow-lg border animate-slide-up transition-all",
              n.type === 'success' && "bg-green-50 border-green-100 text-green-800",
              n.type === 'error' && "bg-red-50 border-red-100 text-red-800",
              n.type === 'warning' && "bg-amber-50 border-amber-100 text-amber-800",
              n.type === 'info' && "bg-blue-50 border-blue-100 text-blue-800"
            )}
          >
            {n.type === 'success' && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
            {n.type === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
            {n.type === 'warning' && <AlertCircle size={20} className="text-amber-500 shrink-0" />}
            {n.type === 'info' && <Info size={20} className="text-blue-500 shrink-0" />}

            <p className="text-sm font-medium flex-1 leading-tight">{n.message}</p>

            <button onClick={() => removeNotification(n.id)} className="opacity-50 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
