import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory Management',
    '/transactions': 'Transaction History',
    '/reports': 'Reports & Analytics',
    '/documents': 'Documents',
  };

  const currentTitle = pageTitles[location.pathname] || 'StockFlow Pro';

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header
          title={currentTitle}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;