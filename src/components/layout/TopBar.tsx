import React from 'react';
import { MenuIcon, BellIcon, SunIcon, MoonIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import ProjectSelector from '../ui/ProjectSelector';
import ThemeToggle from '../ui/ThemeToggle';
interface TopBarProps {
  toggleSidebar: () => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}
const TopBar = ({
  toggleSidebar,
  darkMode,
  setDarkMode
}: TopBarProps) => {
  return <header className={`${darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'} border-b px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="mr-4 lg:hidden focus:outline-none">
          <MenuIcon size={20} />
        </button>
        <ProjectSelector darkMode={darkMode} />
      </div>
      <div className="relative mx-4 flex-1 max-w-xl hidden md:block">
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <SearchIcon size={16} />
        </div>
        <input type="text" placeholder="Search..." className={`block w-full pl-10 pr-3 py-2 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`} />
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <button className={`relative p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          <BellIcon size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="text-xs font-medium">AU</span>
          </div>
          <ChevronDownIcon size={16} className="ml-1" />
        </div>
      </div>
    </header>;
};
export default TopBar;