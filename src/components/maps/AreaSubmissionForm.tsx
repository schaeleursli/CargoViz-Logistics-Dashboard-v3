import React, { useEffect, useState } from 'react';
import { addArea } from '../../services/areaService';
interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: any[];
}
interface AreaSubmissionFormProps {
  geoJSON: GeoJSONFeatureCollection | null;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  darkMode?: boolean;
}
const AreaSubmissionForm: React.FC<AreaSubmissionFormProps> = ({
  geoJSON,
  onSubmitSuccess,
  onCancel,
  darkMode = false
}) => {
  const [form, setForm] = useState({
    orgId: 1,
    name: '',
    description: '',
    content: '',
    actionBy: 1 // Default value, should be replaced with actual user ID
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Update content when geoJSON changes
  useEffect(() => {
    if (geoJSON && geoJSON.features.length > 0) {
      setForm(prev => ({
        ...prev,
        content: JSON.stringify(geoJSON)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        content: ''
      }));
    }
  }, [geoJSON]);
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
    setIsSubmitting(true);
    setError(null);
    try {
      await addArea(form);
      if (onSubmitSuccess) onSubmitSuccess();
      // Reset form
      setForm({
        ...form,
        name: '',
        description: ''
      });
    } catch (err) {
      setError('Failed to submit area. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <h3 className="text-lg font-medium mb-4">Submit Area</h3>
      {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Area Name *
          </label>
          <input type="text" value={form.name} onChange={e => setForm({
          ...form,
          name: e.target.value
        })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Enter area name" required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea value={form.description} onChange={e => setForm({
          ...form,
          description: e.target.value
        })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Enter description (optional)" rows={3} />
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {geoJSON && geoJSON.features.length > 0 ? `Area drawn with ${geoJSON.features[0].geometry.coordinates[0].length} points` : 'No area drawn yet'}
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          {onCancel && <button type="button" onClick={onCancel} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white" disabled={isSubmitting}>
              Cancel
            </button>}
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center" disabled={isSubmitting || !form.content}>
            {isSubmitting ? 'Submitting...' : 'Submit Area'}
          </button>
        </div>
      </form>
    </div>;
};
export default AreaSubmissionForm;