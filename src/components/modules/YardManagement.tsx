import React, { useState } from 'react';
import { LayersIcon, FilterIcon, RefreshCwIcon, SquareIcon, SaveIcon, ArrowRightIcon, CheckIcon, XIcon, Maximize2Icon } from 'lucide-react';
import YardMap from '../maps/YardMap';
const YardManagement = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [zones, setZones] = useState([{
    id: 1,
    name: 'Storage Area A',
    capacity: '2500 sq ft',
    usage: '80%'
  }, {
    id: 2,
    name: 'Container Zone B',
    capacity: '1800 sq ft',
    usage: '65%'
  }, {
    id: 3,
    name: 'Heavy Equipment',
    capacity: '3200 sq ft',
    usage: '45%'
  }, {
    id: 4,
    name: 'Staging Area',
    capacity: '1200 sq ft',
    usage: '90%'
  }]);
  const [pendingItems, setPendingItems] = useState([{
    id: 1,
    name: 'Crate B-789',
    type: 'Crate',
    dimensions: "6' x 4' x 4'"
  }, {
    id: 2,
    name: 'Pallet P-456',
    type: 'Pallet',
    dimensions: "4' x 4' x 5'"
  }]);
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Yard Management</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center">
            <SaveIcon size={16} className="mr-2" />
            <span>Save Layout</span>
          </button>
          <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
            <RefreshCwIcon size={16} className="mr-2" />
            <span>Auto-place</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-medium flex items-center">
              <LayersIcon size={18} className="mr-2" />
              Yard Overview
            </h2>
            <div className="flex space-x-2">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button className={`px-3 py-1 text-sm ${viewMode === '2D' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setViewMode('2D')}>
                  2D
                </button>
                <button className={`px-3 py-1 text-sm ${viewMode === '3D' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={() => setViewMode('3D')}>
                  3D
                </button>
              </div>
              <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <FilterIcon size={16} />
              </button>
              <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <Maximize2Icon size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <YardMap zones={zones} viewMode={viewMode} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium">Zone Status</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                {zones.map(zone => <li key={zone.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-white">
                      {zone.name}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                        <div className={`h-2.5 rounded-full ${parseInt(zone.usage) > 80 ? 'bg-red-500' : parseInt(zone.usage) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{
                      width: zone.usage
                    }}></div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {zone.usage}
                      </span>
                    </div>
                  </li>)}
              </ul>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex-1">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium">Pending Placement</h2>
            </div>
            <div className="overflow-y-auto" style={{
            maxHeight: 'calc(100% - 57px)'
          }}>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingItems.map(item => <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div size={18} className="mr-2 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-sm dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.dimensions}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded">
                          <ArrowRightIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default YardManagement;