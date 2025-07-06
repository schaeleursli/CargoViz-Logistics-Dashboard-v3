import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, LayersIcon, PackageIcon, RefreshCwIcon, SaveIcon, RotateCwIcon, XIcon, PlusIcon, InfoIcon } from 'lucide-react';
import { getAreas } from '../../services/areaService';
import { getCargoList, placeCargoInAreaAPI, CargoItem } from '../../services/cargoService';
import { placeCargo, CargoPlacementResult, estimateAreaDimensions } from '../../services/CargoPlacementService';
import CargoPlacementPreview from '../../components/maps/CargoPlacementPreview';
const PlaceCargoInArea: React.FC = () => {
  const orgId = 1; // placeholder, should be from user context
  // State
  const [areas, setAreas] = useState<any[]>([]);
  const [availableCargo, setAvailableCargo] = useState<CargoItem[]>([]);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<CargoItem[]>([]);
  const [boundary, setBoundary] = useState<number>(1);
  const [allowRotation, setAllowRotation] = useState<boolean>(true);
  const [placements, setPlacements] = useState<CargoPlacementResult[]>([]);
  const [areaWidth, setAreaWidth] = useState<number>(100);
  const [areaHeight, setAreaHeight] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Load areas and cargo data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load areas
        const areasResponse = await getAreas(orgId);
        if (areasResponse.data) {
          setAreas(areasResponse.data);
        }
        // Load cargo items
        const cargoResponse = await getCargoList();
        if (cargoResponse.data && cargoResponse.data.items) {
          setAvailableCargo(cargoResponse.data.items);
        }
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // When an area is selected, estimate its dimensions
  useEffect(() => {
    if (selectedArea && selectedArea.content) {
      try {
        const geoJson = JSON.parse(selectedArea.content);
        const dimensions = estimateAreaDimensions(geoJson);
        setAreaWidth(dimensions.width);
        setAreaHeight(dimensions.height);
      } catch (error) {
        console.error('Error parsing area content:', error);
        // Set default dimensions
        setAreaWidth(100);
        setAreaHeight(100);
      }
    }
  }, [selectedArea]);
  // Handle area selection
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaId = parseInt(e.target.value);
    const area = areas.find(a => a.id === areaId);
    setSelectedArea(area || null);
    // Clear placements when area changes
    setPlacements([]);
  };
  // Handle cargo selection
  const handleCargoSelect = (cargo: CargoItem) => {
    setSelectedCargo(prev => [...prev, cargo]);
    // Remove from available cargo
    setAvailableCargo(prev => prev.filter(c => c.id !== cargo.id));
  };
  // Handle cargo removal
  const handleCargoRemove = (cargo: CargoItem) => {
    setSelectedCargo(prev => prev.filter(c => c.id !== cargo.id));
    // Add back to available cargo
    setAvailableCargo(prev => [...prev, cargo]);
  };
  // Run the placement algorithm
  const runPlacement = () => {
    if (!selectedArea) {
      setError('Please select an area first');
      return;
    }
    if (selectedCargo.length === 0) {
      setError('Please select at least one cargo item');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const results = placeCargo(selectedCargo, areaWidth, areaHeight, boundary, allowRotation);
      // Check if all items were placed
      if (results.length < selectedCargo.length) {
        setError(`Only ${results.length} of ${selectedCargo.length} items could be placed. Consider increasing area size or reducing boundary.`);
      } else {
        setSuccess(`Successfully placed ${results.length} cargo items`);
      }
      setPlacements(results);
    } catch (err) {
      setError('Failed to run placement algorithm');
      console.error(err);
    }
  };
  // Save the placement to the API
  const savePlacement = async () => {
    if (!selectedArea || placements.length === 0) {
      setError('Nothing to save');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await placeCargoInAreaAPI({
        areaId: selectedArea.id,
        cargoPlacements: placements
      });
      setSuccess('Cargo placement saved successfully');
    } catch (err) {
      setError('Failed to save cargo placement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-6xl mx-auto mt-8 px-4 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <PackageIcon size={24} className="mr-2" />
          Cargo Placement
        </h1>
        <Link to="/areas/list" className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center dark:text-white">
          <ArrowLeftIcon size={18} className="mr-2" />
          Back to Areas
        </Link>
      </div>
      {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>}
      {success && <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with controls */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium flex items-center">
                <LayersIcon size={18} className="mr-2" />
                Placement Settings
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Area Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Area
                </label>
                <select value={selectedArea?.id || ''} onChange={handleAreaChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                  <option value="">-- Select an area --</option>
                  {areas.map(area => <option key={area.id} value={area.id}>
                      {area.name}
                    </option>)}
                </select>
              </div>
              {/* Boundary Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boundary (meters)
                </label>
                <input type="number" min="0" max="10" step="0.5" value={boundary} onChange={e => setBoundary(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Space between cargo items
                </p>
              </div>
              {/* Rotation Toggle */}
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={allowRotation} onChange={e => setAllowRotation(e.target.checked)} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Allow 90° Rotation
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Rotate cargo for better fit
                </p>
              </div>
              {/* Area Dimensions */}
              {selectedArea && <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Area Dimensions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Width (m)
                      </label>
                      <input type="number" min="10" value={areaWidth} onChange={e => setAreaWidth(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Height (m)
                      </label>
                      <input type="number" min="10" value={areaHeight} onChange={e => setAreaHeight(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                </div>}
              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button onClick={runPlacement} disabled={!selectedArea || selectedCargo.length === 0 || loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <RefreshCwIcon size={18} className="mr-2" />
                  Run Placement
                </button>
                {placements.length > 0 && <button onClick={savePlacement} disabled={loading} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <SaveIcon size={18} className="mr-2" />
                    Save Placement
                  </button>}
              </div>
            </div>
          </div>
          {/* Selected Cargo List */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium flex items-center">
                <PackageIcon size={18} className="mr-2" />
                Selected Cargo
              </h2>
            </div>
            <div className="p-4">
              {selectedCargo.length === 0 ? <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No cargo selected
                </div> : <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                  {selectedCargo.map(cargo => <li key={cargo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{
                    backgroundColor: cargo.type === 'Container' ? '#3b82f6' : cargo.type === 'Crate' ? '#10b981' : cargo.type === 'Pallet' ? '#f59e0b' : cargo.type === 'Equipment' ? '#ef4444' : '#8b5cf6'
                  }}></div>
                        <div>
                          <p className="text-sm font-medium dark:text-white">
                            {cargo.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {cargo.width}m × {cargo.height}m
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleCargoRemove(cargo)} className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                        <XIcon size={16} />
                      </button>
                    </li>)}
                </ul>}
            </div>
          </div>
        </div>
        {/* Main content area */}
        <div className="lg:col-span-3">
          {/* Preview map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-medium flex items-center">
                <LayersIcon size={18} className="mr-2" />
                Placement Preview
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <InfoIcon size={16} className="mr-1" />
                {placements.length} of {selectedCargo.length} items placed
              </div>
            </div>
            <div className="p-4">
              {!selectedArea ? <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select an area to see the preview
                  </p>
                </div> : placements.length === 0 ? <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No placement data yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Select cargo items and run the placement algorithm
                  </p>
                </div> : <CargoPlacementPreview placements={placements} areaWidth={areaWidth} areaHeight={areaHeight} geoJson={selectedArea.content ? JSON.parse(selectedArea.content) : null} />}
            </div>
          </div>
          {/* Available cargo items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium flex items-center">
                <PackageIcon size={18} className="mr-2" />
                Available Cargo
              </h2>
            </div>
            <div className="p-4">
              {loading ? <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div> : availableCargo.length === 0 ? <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No available cargo items
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCargo.map(cargo => <div key={cargo.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium dark:text-white text-sm">
                          {cargo.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${cargo.status === 'Placed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : cargo.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {cargo.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div>
                          <span className="block font-medium dark:text-gray-300">
                            Type
                          </span>
                          {cargo.type}
                        </div>
                        <div>
                          <span className="block font-medium dark:text-gray-300">
                            Weight
                          </span>
                          {cargo.weight}
                        </div>
                        <div>
                          <span className="block font-medium dark:text-gray-300">
                            Dimensions
                          </span>
                          {cargo.dimensions}
                        </div>
                        <div>
                          <span className="block font-medium dark:text-gray-300">
                            Size (m)
                          </span>
                          {cargo.width} × {cargo.height}
                        </div>
                      </div>
                      <button onClick={() => handleCargoSelect(cargo)} className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded flex items-center justify-center">
                        <PlusIcon size={14} className="mr-1" />
                        Add to Selection
                      </button>
                    </div>)}
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PlaceCargoInArea;