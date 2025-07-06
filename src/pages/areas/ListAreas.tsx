import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAreas } from '../../services/areaService';
import ViewArea from './ViewArea';
import EditArea from './EditArea';
import { SearchIcon, EditIcon, EyeIcon, ArrowLeftIcon, PlusIcon, LayersIcon } from 'lucide-react';
interface Area {
  id: number;
  orgId: number;
  name: string;
  description: string;
  content: string;
  dateAdded: string;
  active: boolean;
}
const ListAreas: React.FC = () => {
  const orgId = 1; // placeholder, should be from user context
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Area | null>(null);
  const [editing, setEditing] = useState<Area | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loadAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAreas(orgId);
      setAreas(response.data || []);
    } catch (err) {
      setError('Failed to load areas. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAreas();
  }, []);
  const filtered = areas.filter(area => area.name.toLowerCase().includes(search.toLowerCase()) || area.description && area.description.toLowerCase().includes(search.toLowerCase()));
  if (editing) {
    return <EditArea area={editing} onUpdated={() => {
      setEditing(null);
      loadAreas();
    }} onCancel={() => setEditing(null)} />;
  }
  if (selected) {
    return <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <button onClick={() => setSelected(null)} className="mr-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Go back">
              <ArrowLeftIcon size={24} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Area Details
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Viewing details for the selected area
              </p>
            </div>
          </div>
          <div className="p-6">
            <ViewArea area={selected} />
            <div className="mt-6 flex justify-end">
              <button onClick={() => {
              setEditing(selected);
              setSelected(null);
            }} className="px-5 py-3 bg-blue-600 text-white rounded-md text-base font-medium">
                Edit Area
              </button>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Area List
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your defined areas
          </p>
        </div>
        <div className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <input type="text" placeholder="Search by name or description..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-base" />
              <SearchIcon size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Link to="/yard/overview" className="px-4 py-3 bg-purple-600 text-white rounded-lg flex items-center justify-center md:justify-start font-medium">
              <LayersIcon size={18} className="mr-2" />
              View All Areas on Map
            </Link>
          </div>
          {loading ? <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
            </div> : <>
              {filtered.length === 0 ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  {search ? 'No areas match your search criteria' : 'No areas found. Create your first area!'}
                </div> : <div className="overflow-x-auto">
                  <div className="md:hidden space-y-4">
                    {filtered.map(area => <div key={area.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium dark:text-white text-base">
                            {area.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {area.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {area.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {area.description}
                          </p>}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          Added:{' '}
                          {area.dateAdded ? new Date(area.dateAdded).toLocaleDateString() : '-'}
                        </div>
                        <div className="flex space-x-2 justify-end">
                          <button onClick={() => setSelected(area)} className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300" aria-label="View Area">
                            <EyeIcon size={20} />
                          </button>
                          <button onClick={() => setEditing(area)} className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 dark:bg-green-900 dark:text-green-300" aria-label="Edit Area">
                            <EditIcon size={20} />
                          </button>
                        </div>
                      </div>)}
                  </div>
                  <table className="w-full hidden md:table">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date Added
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filtered.map(area => <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-5 whitespace-nowrap text-base font-medium dark:text-white">
                            {area.name}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                            {area.description || '-'}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-base text-gray-500 dark:text-gray-400">
                            {area.dateAdded ? new Date(area.dateAdded).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${area.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                              {area.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <button onClick={() => setSelected(area)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mx-2 p-2" title="View Area">
                              <EyeIcon size={22} />
                            </button>
                            <button onClick={() => setEditing(area)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mx-2 p-2" title="Edit Area">
                              <EditIcon size={22} />
                            </button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>}
              <div className="mt-8 flex justify-end">
                <Link to="/areas/add" className="px-5 py-3 bg-blue-600 text-white rounded-lg flex items-center font-medium">
                  <PlusIcon size={18} className="mr-2" />
                  Add New Area
                </Link>
              </div>
            </>}
        </div>
      </div>
    </div>;
};
export default ListAreas;