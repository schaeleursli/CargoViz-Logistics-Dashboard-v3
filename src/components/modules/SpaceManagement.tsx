import React, { useState, createElement, Component } from 'react';
import { Link } from 'react-router-dom';
import { LayersIcon, PlusIcon, DownloadIcon, UploadIcon, EditIcon, TrashIcon, SearchIcon, MapPinIcon, SaveIcon, XIcon, EyeIcon } from 'lucide-react';
import YardMap from '../maps/YardMap';
import ZoneEditor from '../maps/ZoneEditor';
import AreaSubmissionForm from '../maps/AreaSubmissionForm';
// Add GeoJSON interface
interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: any[];
}
const SpaceManagement = () => {
  const [zones, setZones] = useState([{
    id: 1,
    name: 'Storage Area A',
    capacity: '2500 sq ft',
    surface: 'Concrete',
    elevation: '12 ft',
    coordinates: [],
    area: 2500
  }, {
    id: 2,
    name: 'Container Zone B',
    capacity: '1800 sq ft',
    surface: 'Asphalt',
    elevation: '10 ft',
    coordinates: [],
    area: 1800
  }, {
    id: 3,
    name: 'Heavy Equipment',
    capacity: '3200 sq ft',
    surface: 'Reinforced',
    elevation: '8 ft',
    coordinates: [],
    area: 3200
  }, {
    id: 4,
    name: 'Staging Area',
    capacity: '1200 sq ft',
    surface: 'Gravel',
    elevation: '11 ft',
    coordinates: [],
    area: 1200
  }]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneSurface, setNewZoneSurface] = useState('Concrete');
  const [newZoneElevation, setNewZoneElevation] = useState('');
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [polygonMeasurements, setPolygonMeasurements] = useState({
    area: 0,
    width: 0,
    length: 0
  });
  // New state for GeoJSON export
  const [currentGeoJSON, setCurrentGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  const [showApiSubmission, setShowApiSubmission] = useState(false);
  const startNewZone = () => {
    setIsEditing(true);
    setEditingZone(null);
    setNewZoneName('');
    setNewZoneSurface('Concrete');
    setNewZoneElevation('');
    setDrawnPolygon(null);
    setPolygonMeasurements({
      area: 0,
      width: 0,
      length: 0
    });
    setCurrentGeoJSON(null);
  };
  const editZone = zone => {
    setIsEditing(true);
    setEditingZone(zone);
    setNewZoneName(zone.name);
    setNewZoneSurface(zone.surface);
    setNewZoneElevation(zone.elevation.replace(' ft', ''));
    // If we had coordinates, we would set them here
  };
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingZone(null);
    setShowApiSubmission(false);
  };
  const saveZone = () => {
    if (!newZoneName) {
      alert('Please enter a zone name');
      return;
    }
    if (!drawnPolygon || drawnPolygon.length < 3) {
      alert('Please draw a valid zone on the map (at least 3 points)');
      return;
    }
    const areaInSqFt = Math.round(polygonMeasurements.area * 10.764); // Convert m² to ft²
    if (editingZone) {
      // Update existing zone
      const updatedZones = zones.map(zone => zone.id === editingZone.id ? {
        ...zone,
        name: newZoneName,
        surface: newZoneSurface,
        elevation: `${newZoneElevation} ft`,
        capacity: `${areaInSqFt} sq ft`,
        coordinates: drawnPolygon,
        area: areaInSqFt
      } : zone);
      setZones(updatedZones);
    } else {
      // Create new zone
      const newZone = {
        id: Date.now(),
        name: newZoneName,
        surface: newZoneSurface,
        elevation: `${newZoneElevation} ft`,
        capacity: `${areaInSqFt} sq ft`,
        coordinates: drawnPolygon,
        area: areaInSqFt
      };
      setZones([...zones, newZone]);
    }
    // Show API submission form if we have GeoJSON data
    if (currentGeoJSON && currentGeoJSON.features.length > 0) {
      setShowApiSubmission(true);
    } else {
      setIsEditing(false);
      setEditingZone(null);
    }
  };
  const handleApiSubmissionSuccess = () => {
    setShowApiSubmission(false);
    setIsEditing(false);
    setEditingZone(null);
    // Maybe refresh zones from API here
  };
  const deleteZone = id => {
    setZones(zones.filter(zone => zone.id !== id));
  };
  const handlePolygonDrawn = (polygon, measurements) => {
    setDrawnPolygon(polygon);
    setPolygonMeasurements(measurements);
  };
  const handleGeoJSONExport = (geoJSON: GeoJSONFeatureCollection) => {
    setCurrentGeoJSON(geoJSON);
  };
  const exportGeoJSON = () => {
    if (!currentGeoJSON || currentGeoJSON.features.length === 0) {
      alert('No area drawn to export');
      return;
    }
    // Create a download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentGeoJSON));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'area_export.geojson');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  return <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Space Management</h1>
        <div className="flex space-x-2">
          {!isEditing ? <>
              <button onClick={startNewZone} className="px-3 py-2 bg-blue-600 text-white rounded-md flex items-center">
                <PlusIcon size={16} className="mr-2" />
                <span>New Zone</span>
              </button>
              <Link to="/areas/add" className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center">
                <MapPinIcon size={16} className="mr-2" />
                <span>Add Area</span>
              </Link>
              <Link to="/yard/overview" className="px-3 py-2 bg-purple-600 text-white rounded-md flex items-center">
                <EyeIcon size={16} className="mr-2" />
                <span>Yard Overview</span>
              </Link>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
                <UploadIcon size={16} className="mr-2" />
                <span>Import GIS</span>
              </button>
              <button onClick={exportGeoJSON} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white" disabled={!currentGeoJSON || currentGeoJSON.features.length === 0}>
                <DownloadIcon size={16} className="mr-2" />
                <span>Export GeoJSON</span>
              </button>
            </> : showApiSubmission ? <button onClick={cancelEditing} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
              <XIcon size={16} className="mr-2" />
              <span>Cancel</span>
            </button> : <>
              <button onClick={saveZone} className="px-3 py-2 bg-green-600 text-white rounded-md flex items-center">
                <SaveIcon size={16} className="mr-2" />
                <span>Save Zone</span>
              </button>
              <button onClick={cancelEditing} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white">
                <XIcon size={16} className="mr-2" />
                <span>Cancel</span>
              </button>
            </>}
        </div>
      </div>

      {isEditing ? showApiSubmission ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-medium flex items-center">
                  <MapPinIcon size={18} className="mr-2" />
                  Submit Area to API
                </h2>
              </div>
              <div className="h-[calc(100%-56px)] p-4">
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Your area has been successfully created in the local system.
                  You can now submit it to the API for permanent storage.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-4 overflow-auto max-h-60">
                  <pre className="text-xs text-gray-700 dark:text-gray-300">
                    {JSON.stringify(currentGeoJSON, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <AreaSubmissionForm geoJSON={currentGeoJSON} onSubmitSuccess={handleApiSubmissionSuccess} onCancel={cancelEditing} darkMode={document.documentElement.classList.contains('dark')} />
            </div>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-medium flex items-center">
                  <MapPinIcon size={18} className="mr-2" />
                  {editingZone ? `Edit Zone: ${editingZone.name}` : 'Create New Zone'}
                </h2>
              </div>
              <div className="h-[calc(100%-56px)]">
                <ZoneEditor onPolygonDrawn={handlePolygonDrawn} initialPolygon={editingZone?.coordinates} onGeoJSONExport={handleGeoJSONExport} />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-medium">Zone Details</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Zone Name
                    </label>
                    <input type="text" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Enter zone name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Surface Type
                    </label>
                    <select value={newZoneSurface} onChange={e => setNewZoneSurface(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                      <option value="Concrete">Concrete</option>
                      <option value="Asphalt">Asphalt</option>
                      <option value="Gravel">Gravel</option>
                      <option value="Reinforced">Reinforced</option>
                      <option value="Dirt">Dirt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Elevation (ft)
                    </label>
                    <input type="number" value={newZoneElevation} onChange={e => setNewZoneElevation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="Enter elevation in feet" />
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Measurements
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Area
                        </span>
                        <span className="text-sm font-medium dark:text-white">
                          {Math.round(polygonMeasurements.area)} m² (
                          {Math.round(polygonMeasurements.area * 10.764)} sq ft)
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Perimeter
                        </span>
                        <span className="text-sm font-medium dark:text-white">
                          {Math.round(polygonMeasurements.perimeter)} m
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Width
                        </span>
                        <span className="text-sm font-medium dark:text-white">
                          {Math.round(polygonMeasurements.width)} m
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Length
                        </span>
                        <span className="text-sm font-medium dark:text-white">
                          {Math.round(polygonMeasurements.length)} m
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Draw a polygon on the map to define the zone area.
                  </div>
                </div>
              </div>
            </div>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-medium flex items-center">
                <LayersIcon size={18} className="mr-2" />
                Yard Map
              </h2>
              <div className="flex space-x-2">
                <button className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <LayersIcon size={16} />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-56px)]">
              <YardMap zones={zones} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium">Defined Zones</h2>
              <div className="mt-2 relative">
                <input type="text" placeholder="Search zones..." className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                <SearchIcon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="overflow-y-auto" style={{
          maxHeight: 'calc(100% - 89px)'
        }}>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {zones.map(zone => <li key={zone.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex justify-between">
                      <h3 className="font-medium dark:text-white">
                        {zone.name}
                      </h3>
                      <div className="flex space-x-2">
                        <button onClick={() => editZone(zone)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                          <EditIcon size={16} />
                        </button>
                        <button onClick={() => deleteZone(zone.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Capacity
                        </span>
                        {zone.capacity}
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Surface
                        </span>
                        {zone.surface}
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          Elevation
                        </span>
                        {zone.elevation}
                      </div>
                    </div>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>}
    </div>;
};
export default SpaceManagement;