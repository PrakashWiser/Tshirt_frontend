import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  timestamp?: string;
  read?: boolean;
  data?: any;
}

interface NotificationState {
  list: Notification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  list: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.list.unshift({
        ...action.payload,
        timestamp: action.payload.timestamp || new Date().toISOString(),
        read: false,
      });
      state.unreadCount += 1;
    },

    markAllRead: (state) => {
      state.list.forEach((notification) => {
        notification.read = true;
      });

      state.unreadCount = 0;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.list.find((n) => n.id === action.payload);

      if (notification && !notification.read) {
        notification.read = true;

        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    clearNotifications: (state) => {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllRead, markAsRead, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
