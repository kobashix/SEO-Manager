import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
  link?: { href: string; text: string; };
}

interface NotificationContextType {
  addNotification: (message: string, type: 'success' | 'error', link?: Notification['link']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'success' | 'error', link?: Notification['link']) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, link }]);
    setTimeout(() => {
      removeNotification(id);
    }, 8000); // Auto-dismiss after 8 seconds
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div style={styles.container}>
        {notifications.map(n => (
          <div key={n.id} style={{ ...styles.toast, ...(n.type === 'error' ? styles.error : styles.success) }}>
            <div>
              {n.message}
              {n.link && (
                <a href={n.link.href} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {n.link.text}
                </a>
              )}
            </div>
            <button onClick={() => removeNotification(n.id)} style={styles.closeButton}><X size={16} /></button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '1rem' },
    toast: { padding: '1rem', borderRadius: '8px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '300px', maxWidth: '400px' },
    success: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--success)' },
    error: { backgroundColor: 'var(--bg-card)', border: '1px solid var(--error)' },
    link: { color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: '8px' },
    closeButton: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '1rem' }
};
