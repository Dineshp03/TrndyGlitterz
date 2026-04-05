import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "stock" | "message" | "system";
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notif) => 
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: `notif-${Date.now()}`,
              timestamp: new Date().toISOString(),
              read: false
            },
            ...state.notifications
          ].slice(0, 50) // Keep last 50
        })),
      markAsRead: (id) => 
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        })),
      markAllAsRead: () => 
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true }))
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "trendy-notifications",
    }
  )
);
