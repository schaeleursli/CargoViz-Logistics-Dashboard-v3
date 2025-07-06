import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SpaceManagement from './components/modules/SpaceManagement';
import CargoManagement from './components/modules/CargoManagement';
import YardManagement from './components/modules/YardManagement';
import Reporting from './components/modules/Reporting';
import AddArea from './pages/areas/AddArea';
import ListAreas from './pages/areas/ListAreas';
import YardOverview from './pages/yard/YardOverview';
import PlaceCargoInArea from './pages/cargo/PlaceCargoInArea';
export type ModuleType = 'space' | 'cargo' | 'yard' | 'reporting';
export function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('space');
  const [darkMode, setDarkMode] = useState(false);
  const renderModule = () => {
    switch (activeModule) {
      case 'space':
        return <SpaceManagement />;
      case 'cargo':
        return <CargoManagement />;
      case 'yard':
        return <YardManagement />;
      case 'reporting':
        return <Reporting />;
      default:
        return <SpaceManagement />;
    }
  };
  return <BrowserRouter>
      <div className={`w-full min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Routes>
          <Route path="/" element={<Layout activeModule={activeModule} setActiveModule={setActiveModule} darkMode={darkMode} setDarkMode={setDarkMode}>
                {renderModule()}
              </Layout>} />
          <Route path="/areas/add" element={<AddArea />} />
          <Route path="/areas/list" element={<ListAreas />} />
          <Route path="/yard/overview" element={<YardOverview />} />
          <Route path="/cargo/place" element={<PlaceCargoInArea />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>;
}