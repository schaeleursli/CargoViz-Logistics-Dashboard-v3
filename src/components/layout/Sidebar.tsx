import React from 'react';
import { MapIcon, PackageIcon, LayoutDashboardIcon, BarChartIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ModuleType } from '../../App';
interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
}
const Sidebar = ({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed,
  darkMode
}: SidebarProps) => {
  const modules = [{
    id: 'space',
    name: 'Space Management',
    icon: <MapIcon size={20} />
  }, {
    id: 'cargo',
    name: 'Cargo Management',
    icon: <PackageIcon size={20} />
  }, {
    id: 'yard',
    name: 'Yard Management',
    icon: <LayoutDashboardIcon size={20} />
  }, {
    id: 'reporting',
    name: 'Reporting',
    icon: <BarChartIcon size={20} />
  }];
  return <div className={`${collapsed ? 'w-20' : 'w-64'} 
        ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} 
        transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 flex flex-col h-full`}>
      <div className={`flex items-center p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
        <div className="flex items-center flex-1">
          <div className="bg-blue-600 h-8 w-8 rounded flex items-center justify-center text-white font-bold">
            CV
          </div>
          {!collapsed && <span className="ml-3 font-semibold text-lg">CargoViz</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}>
          {collapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />}
        </button>
      </div>
      <nav className="flex-1 pt-5">
        <ul>
          {modules.map(module => <li key={module.id} className="mb-2">
              <button onClick={() => setActiveModule(module.id as ModuleType)} className={`flex items-center px-4 py-3 w-full transition-colors duration-200
                  ${activeModule === module.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <span className={`${collapsed ? 'mx-auto' : ''}`}>
                  {module.icon}
                </span>
                {!collapsed && <span className="ml-3 font-medium">{module.name}</span>}
              </button>
            </li>)}
        </ul>
      </nav>
      <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t mt-auto`}>
        <div className="flex items-center">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-8 rounded-full"></div>
          {!collapsed && <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Logistics Manager
              </p>
            </div>}
        </div>
      </div>
    </div>;
};
export default Sidebar;