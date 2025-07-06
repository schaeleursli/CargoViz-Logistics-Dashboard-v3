import React from 'react';
import { FileTextIcon, DownloadIcon, PrinterIcon, BarChart2Icon, PieChartIcon, CalendarIcon, FileIcon, MapIcon } from 'lucide-react';
const Reporting = () => {
  const reports = [{
    id: 1,
    name: 'Yard Manifest',
    icon: <FileTextIcon size={18} />,
    format: 'CSV, PDF'
  }, {
    id: 2,
    name: 'Placement Snapshot',
    icon: <MapIcon size={18} />,
    format: 'PNG, PDF'
  }, {
    id: 3,
    name: 'GeoJSON Export',
    icon: <FileIcon size={18} />,
    format: 'JSON'
  }, {
    id: 4,
    name: 'Daily Summary',
    icon: <CalendarIcon size={18} />,
    format: 'PDF, Excel'
  }];
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Reporting</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
            <PrinterIcon size={16} className="mr-2" />
            <span>Print</span>
          </button>
          <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
            <DownloadIcon size={16} className="mr-2" />
            <span>Export All</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Cargo Items
              </p>
              <h3 className="text-2xl font-semibold mt-1 dark:text-white">
                142
              </h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
              <BarChart2Icon size={20} className="text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Placement Rate
              </span>
              <span className="font-medium dark:text-white">87%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-blue-600 h-2 rounded-full" style={{
              width: '87%'
            }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Space Utilization
              </p>
              <h3 className="text-2xl font-semibold mt-1 dark:text-white">
                72%
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
              <PieChartIcon size={20} className="text-green-600 dark:text-green-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Available Space
              </span>
              <span className="font-medium dark:text-white">2,450 sq ft</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-green-600 h-2 rounded-full" style={{
              width: '28%'
            }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Items
              </p>
              <h3 className="text-2xl font-semibold mt-1 dark:text-white">
                18
              </h3>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md">
              <BarChart2Icon size={20} className="text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Processing Time
              </span>
              <span className="font-medium dark:text-white">2.4 days avg</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-yellow-600 h-2 rounded-full" style={{
              width: '65%'
            }}></div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Placement Conflicts
              </p>
              <h3 className="text-2xl font-semibold mt-1 dark:text-white">3</h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-md">
              <BarChart2Icon size={20} className="text-red-600 dark:text-red-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Resolution Rate
              </span>
              <span className="font-medium dark:text-white">92%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
              <div className="bg-red-600 h-2 rounded-full" style={{
              width: '92%'
            }}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-medium">Available Reports</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(report => <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md mr-3">
                        {report.icon}
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Format: {report.format}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      <DownloadIcon size={16} />
                    </button>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-medium">Recent Activity</h2>
          </div>
          <div className="p-4">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                  <FileTextIcon size={14} className="text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    Daily Summary Generated
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Today, 10:30 AM
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                  <MapIcon size={14} className="text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    Yard Layout Exported
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yesterday, 4:15 PM
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                  <PrinterIcon size={14} className="text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    Cargo Manifest Printed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Yesterday, 2:30 PM
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full mr-3">
                  <FileIcon size={14} className="text-yellow-600 dark:text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    GeoJSON Data Exported
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aug 10, 11:45 AM
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                  <BarChart2Icon size={14} className="text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    Monthly Analytics Report
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aug 1, 9:00 AM
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>;
};
export default Reporting;