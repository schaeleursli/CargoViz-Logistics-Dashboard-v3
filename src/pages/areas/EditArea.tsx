import React, { useState } from 'react';
import { updateArea } from '../../services/areaService';
import AreaDrawingMap from '../../components/maps/AreaDrawingMap';
import { ArrowLeftIcon } from 'lucide-react';
interface EditAreaProps {
  area: {
    id: number;
    name: string;
    description: string;
    content: string;
    actionBy?: number;
  };
  onUpdated?: () => void;
  onCancel?: () => void;
}
const EditArea: React.FC<EditAreaProps> = ({
  area,
  onUpdated,
  onCancel
}) => {
  const [form, setForm] = useState({
    id: area.id,
    name: area.name,
    description: area.description || '',
    content: area.content,
    actionBy: area.actionBy || 1 // Default value, should be replaced with actual user ID
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
      await updateArea(form);
      setSuccess('Area updated successfully!');
      // Call onUpdated after a short delay to show the success message
      if (onUpdated) {
        setTimeout(() => {
          onUpdated();
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update area. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <button onClick={onCancel} className="mr-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Go back">
            <ArrowLeftIcon size={24} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Edit Area
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update the area details and shape
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
              Edit Area on Map *
            </label>
            <AreaDrawingMap initialGeoJson={form.content} onAreaDrawn={geoJson => setForm({
            ...form,
            content: geoJson
          })} className="h-[450px] mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {form.content ? 'Area drawn successfully' : 'No area drawn yet'}
            </p>
          </div>
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onCancel} className="px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium dark:text-white">
              Cancel
            </button>
            <button type="submit" className="px-5 py-3 bg-blue-600 text-white rounded-lg text-base font-medium disabled:opacity-50" disabled={!form.name || !form.content || submitting}>
              {submitting ? 'Updating...' : 'Update Area'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default EditArea;