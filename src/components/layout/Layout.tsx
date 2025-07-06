import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ModuleType } from '../../App';
interface LayoutProps {
  children: ReactNode;
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
const Layout = ({
  children,
  activeModule,
  setActiveModule,
  darkMode,
  setDarkMode
}: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return <div className="flex h-screen w-full overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} darkMode={darkMode} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className={`flex-1 overflow-auto p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
          {children}
        </main>
      </div>
    </div>;
};
export default Layout;