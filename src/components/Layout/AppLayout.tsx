
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        {/* Fixed position sidebar for desktop, fixed drawer for mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 
          lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-10 lg:h-auto lg:overflow-y-auto
          lg:transform-none lg:transition-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <Sidebar open={sidebarOpen} />
        </div>
        
        {/* Overlay when sidebar is open on mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Main content area */}
        <main className="flex-1 py-4 px-4 lg:px-8 w-full lg:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
