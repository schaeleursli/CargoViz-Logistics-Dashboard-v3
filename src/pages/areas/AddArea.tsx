import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addArea } from '../../services/areaService';
import AreaDrawingMap from '../../components/maps/AreaDrawingMap';
import { ArrowLeftIcon } from 'lucide-react';
const AddArea: React.FC = () => {
  const [form, setForm] = useState({
    orgId: 1,
    name: '',
    description: '',
    content: '',
    actionBy: 1 // Default value, should be replaced with actual user ID
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter a name for this area');
      return;
    }
    if (!form.content) {
      setError('Please draw an area on the map first');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await addArea(form);
      setSuccess('Area submitted successfully!');
      // Reset form
      setForm({
        ...form,
        name: '',
        description: '',
        content: ''
      });
    } catch (err) {
      setError('Failed to submit area. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Link to="/areas/list" className="mr-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex" aria-label="Go back to list">
            <ArrowLeftIcon size={24} />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Create New Area
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Draw an area on the map and provide details
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>}
          {success && <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>}
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Area Name *
            </label>
            <input id="name" type="text" value={form.name} onChange={e => setForm({
            ...form,
            name: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-base" placeholder="Enter area name" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea id="description" value={form.description} onChange={e => setForm({
            ...form,
            description: e.target.value
          })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-base" placeholder="Enter description (optional)" rows={4} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              Draw Area on Map *
            </label>
            <AreaDrawingMap onAreaDrawn={geoJson => setForm({
            ...form,
            content: geoJson
          })} className="h-[450px] mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {form.content ? 'Area drawn successfully' : 'No area drawn yet'}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Tap on the map to add points and create your area
            </p>
          </div>
          <div className="flex justify-end pt-4 space-x-4">
            <Link to="/areas/list" className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium dark:text-white">
              Cancel
            </Link>
            <button type="submit" className="px-5 py-3 bg-blue-600 text-white rounded-lg text-base font-medium disabled:opacity-50" disabled={!form.name || !form.content || submitting}>
              {submitting ? 'Submitting...' : 'Submit Area'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default AddArea;