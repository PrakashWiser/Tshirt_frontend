import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { BreadcrumbItem } from "../../types";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  breadcrumbs: BreadcrumbItem[];
  toasts: ToastMessage[];
}

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem("theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: getInitialDarkMode(),
  breadcrumbs: [],
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      const root = window.document.documentElement;
      if (state.darkMode) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, "id">>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setBreadcrumbs,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
export type { ToastMessage };
