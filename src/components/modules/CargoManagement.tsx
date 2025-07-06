import React, { useState } from 'react';
import { PackageIcon, UploadIcon, FilterIcon, PlusIcon, SearchIcon, CheckIcon, XIcon, EditIcon, ChevronDownIcon } from 'lucide-react';
const CargoManagement = () => {
  const [cargoItems, setCargoItems] = useState([{
    id: 1,
    name: 'Container MSCU-123456',
    type: 'Container',
    status: 'Placed',
    dimensions: "40' x 8' x 8'",
    weight: '12,500 kg',
    zone: 'Storage Area A'
  }, {
    id: 2,
    name: 'Crate B-789',
    type: 'Crate',
    status: 'Pending',
    dimensions: "6' x 4' x 4'",
    weight: '1,200 kg',
    zone: 'Unassigned'
  }, {
    id: 3,
    name: 'Machinery XYZ-100',
    type: 'Equipment',
    status: 'Placed',
    dimensions: "12' x 6' x 8'",
    weight: '8,400 kg',
    zone: 'Heavy Equipment'
  }, {
    id: 4,
    name: 'Pallet P-456',
    type: 'Pallet',
    status: 'Conflict',
    dimensions: "4' x 4' x 5'",
    weight: '950 kg',
    zone: 'Staging Area'
  }, {
    id: 5,
    name: 'Container HLCU-789012',
    type: 'Container',
    status: 'Placed',
    dimensions: "20' x 8' x 8'",
    weight: '7,800 kg',
    zone: 'Container Zone B'
  }]);
  const statusColors = {
    Placed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Conflict: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Cargo Management</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center">
            <PlusIcon size={16} className="mr-2" />
            <span>Add Cargo</span>
          </button>
          <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
            <UploadIcon size={16} className="mr-2" />
            <span>Import List</span>
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 justify-between">
          <div className="relative w-full md:w-64">
            <input type="text" placeholder="Search cargo..." className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
            <SearchIcon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
                <FilterIcon size={16} className="mr-2" />
                <span>Status</span>
                <ChevronDownIcon size={16} className="ml-2" />
              </button>
            </div>
            <div className="relative">
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
                <FilterIcon size={16} className="mr-2" />
                <span>Type</span>
                <ChevronDownIcon size={16} className="ml-2" />
              </button>
            </div>
            <div className="relative">
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
                <FilterIcon size={16} className="mr-2" />
                <span>Zone</span>
                <ChevronDownIcon size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dimensions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Zone
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {cargoItems.map(item => <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-gray-400" />
                      <span className="font-medium dark:text-white">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.dimensions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.weight}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.zone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3">
                      <EditIcon size={16} />
                    </button>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                      <XIcon size={16} />
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default CargoManagement;