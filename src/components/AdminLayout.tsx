import React, { useEffect, useState } from 'react';
import ToastContainer from './ToastContainer';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import Sidebar from './Common/Sidebar';
import Header from './Common/Header';
import Breadcrumbs from './Common/Breadcrumbs';

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);
  return (
    <div id="admin-app-root" className="h-screen w-screen overflow-hidden flex bg-slate-50 dark:bg-slate-950  transition-colors duration-300">
      <Sidebar sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full" id="main-content-viewport">
          <div className="max-w-7xl mx-auto w-full">
            <Breadcrumbs />
            <div className="animate-fade-in duration-300">
              {children}
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
