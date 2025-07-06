import React, { useEffect, useState, useRef, createElement, Component } from "react";
import { MapContainer, TileLayer, Rectangle, Tooltip, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAreas } from '../../services/areaService';
import { getPlacedCargoByArea } from '../../services/cargoService';
import { ZoomInIcon, ZoomOutIcon, MaximizeIcon, PrinterIcon, DownloadIcon, XIcon, InfoIcon } from 'lucide-react';
interface PlacedCargo {
  cargoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  name?: string;
  type?: string;
  weight?: string;
  dimensions?: string;
}
// Map control components
function MapControls({
  fitBounds
}: {
  fitBounds: () => void;
}) {
  const map = useMap();
  const handleZoomIn = () => {
    map.zoomIn();
  };
  const handleZoomOut = () => {
    map.zoomOut();
  };
  return <div className="leaflet-top leaflet-right" style={{
    marginTop: '60px'
  }}>
      <div className="leaflet-control leaflet-bar">
        <button className="p-2 bg-white hover:bg-gray-100 border-b border-gray-300 flex items-center justify-center" onClick={handleZoomIn} title="Zoom in">
          <ZoomInIcon size={16} />
        </button>
        <button className="p-2 bg-white hover:bg-gray-100 border-b border-gray-300 flex items-center justify-center" onClick={handleZoomOut} title="Zoom out">
          <ZoomOutIcon size={16} />
        </button>
        <button className="p-2 bg-white hover:bg-gray-100 flex items-center justify-center" onClick={fitBounds} title="Fit to cargo">
          <MaximizeIcon size={16} />
        </button>
      </div>
    </div>;
}
export default function ViewPlacedCargo() {
  const orgId = 1;
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [placed, setPlaced] = useState<PlacedCargo[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<L.Map>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCargo, setSelectedCargo] = useState<PlacedCargo | null>(null);
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await getAreas(orgId);
        setAreas(res.data || []);
      } catch (error) {
        console.error('Failed to fetch areas:', error);
      }
    };
    fetchAreas();
  }, []);
  useEffect(() => {
    if (selectedAreaId) {
      setLoading(true);
      getPlacedCargoByArea(selectedAreaId).then(res => {
        // Add some mock data for name/type/dimensions if not provided by API
        const placedWithDetails = (res.data || []).map(cargo => ({
          ...cargo,
          name: cargo.name || `Cargo ${cargo.cargoId}`,
          type: cargo.type || 'Unknown',
          dimensions: cargo.dimensions || `${cargo.width}m × ${cargo.height}m`,
          weight: cargo.weight || 'Unknown'
        }));
        setPlaced(placedWithDetails);
      }).catch(err => {
        console.error('Error fetching placed cargo:', err);
      }).finally(() => setLoading(false));
    }
  }, [selectedAreaId]);
  const fitMapToCargo = () => {
    if (!mapRef.current || placed.length === 0) return;
    const bounds = L.latLngBounds(placed.map(p => [[p.y, p.x], [p.y + p.height, p.x + p.width]]));
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, {
        padding: [20, 20]
      });
    }
  };
  useEffect(() => {
    fitMapToCargo();
  }, [placed]);
  // Handle cargo click
  const handleCargoClick = (cargo: PlacedCargo) => {
    setSelectedCargo(cargo);
  };
  // Handle print functionality
  const handlePrint = () => {
    const mapElement = mapContainerRef.current;
    if (!mapElement) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popup windows to print the map');
      return;
    }
    // Create print content with map screenshot
    printWindow.document.write(`
      <html>
        <head>
          <title>Cargo Placement - ${selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.name : 'Area'}</title>
          <style>{`body { font-family: Arial, sans-serif; margin: 20px; }
            .header { margin-bottom: 20px; }
            .map-container { border: 1px solid #ccc; page-break-inside: avoid; }
            .cargo-list { margin-top: 20px; border-collapse: collapse; width: 100%; }
            .cargo-list th, .cargo-list td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .cargo-list th { background-color: #f2f2f2; }
            @media print {
              button { display: none; }
            }`}</style>
        </head>
        <body>
          <div class="header">
            <h1>Cargo Placement Map</h1>
            <p>Area: ${selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.name : 'Unknown'}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <button onclick="window.print()">Print</button>
          </div>
          <div class="map-container">
            <img src="${mapRef.current?.getRenderer().getContainer().toDataURL()}" style="width: 100%;" />
          </div>
          <h2>Cargo List</h2>
          <table class="cargo-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Dimensions</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${placed.map(cargo => `
                <tr>
                  <td>${cargo.cargoId}</td>
                  <td>${cargo.name || `Cargo ${cargo.cargoId}`}</td>
                  <td>${cargo.type || 'Unknown'}</td>
                  <td>${cargo.dimensions || `${cargo.width}m × ${cargo.height}m`}</td>
                  <td>(${cargo.x}, ${cargo.y})</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  // Handle export functionality
  const handleExport = () => {
    if (placed.length === 0) return;
    const exportData = {
      areaId: selectedAreaId,
      areaName: selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.name : 'Unknown',
      exportDate: new Date().toISOString(),
      cargo: placed
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `cargo-placement-${selectedAreaId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  // Generate colors based on cargo type
  const getCargoColor = (type?: string) => {
    if (!type) return '#3b82f6'; // Default blue
    const typeColors = {
      'Container': '#3b82f6',
      'Crate': '#10b981',
      'Pallet': '#f59e0b',
      'Equipment': '#ef4444',
      'default': '#8b5cf6' // purple
    };
    return typeColors[type] || typeColors.default;
  };
  return <div className="max-w-6xl mx-auto mt-8 mb-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold dark:text-white">View Placed Cargo</h1>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Area
              </label>
              <select value={selectedAreaId?.toString() || ''} onChange={e => setSelectedAreaId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                <option value="">-- Select an area --</option>
                {areas.map(area => <option key={area.id} value={String(area.id)}>
                    {area.name}
                  </option>)}
              </select>
            </div>
            <div className="flex space-x-2 justify-end">
              <button onClick={handlePrint} disabled={placed.length === 0} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white disabled:opacity-50" title="Print map">
                <PrinterIcon size={16} className="mr-2" />
                Print
              </button>
              <button onClick={handleExport} disabled={placed.length === 0} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md flex items-center dark:text-white disabled:opacity-50" title="Export data">
                <DownloadIcon size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
          {loading ? <div className="h-[500px] w-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div> : <div className="h-[500px] w-full border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden" ref={mapContainerRef}>
              <MapContainer crs={L.CRS.Simple} bounds={[[0, 0], [100, 100]]} style={{
            height: '100%',
            width: '100%'
          }} zoomControl={false} whenCreated={map => {
            mapRef.current = map;
          }}>
                {/* Background grid instead of tile layer */}
                <div className="leaflet-pane leaflet-tile-pane">
                  <div className="leaflet-layer">
                    <div className="leaflet-tile-container"></div>
                  </div>
                </div>
                {/* Custom map controls */}
                <MapControls fitBounds={fitMapToCargo} />
                {/* Cargo rectangles */}
                {placed.map(p => <Rectangle key={p.cargoId} bounds={[[p.y, p.x], [p.y + p.height, p.x + p.width]]} pathOptions={{
              color: getCargoColor(p.type),
              weight: 2,
              fillOpacity: 0.3,
              fillColor: getCargoColor(p.type)
            }} eventHandlers={{
              click: () => handleCargoClick(p)
            }}>
                    <Tooltip permanent direction="center">
                      <div className="text-xs font-semibold">{p.cargoId}</div>
                    </Tooltip>
                  </Rectangle>)}
              </MapContainer>
            </div>}
          {placed.length === 0 && !loading && selectedAreaId && <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No cargo placements found for this area.
            </div>}
          {placed.length > 0 && <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 dark:text-white">Cargo List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Dimensions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {placed.map(cargo => <tr key={cargo.cargoId} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => handleCargoClick(cargo)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                          {cargo.cargoId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {cargo.name || `Cargo ${cargo.cargoId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {cargo.type || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {cargo.dimensions || `${cargo.width}m × ${cargo.height}m`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          ({cargo.x}, {cargo.y})
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>}
        </div>
      </div>
      {/* Cargo detail modal */}
      {selectedCargo && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium dark:text-white flex items-center">
                <InfoIcon size={18} className="mr-2" />
                Cargo Details
              </h3>
              <button onClick={() => setSelectedCargo(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <XIcon size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">ID</span>
                  <span className="text-lg font-medium dark:text-white">{selectedCargo.cargoId}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</span>
                  <span className="text-lg dark:text-white">{selectedCargo.name || `Cargo ${selectedCargo.cargoId}`}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</span>
                    <span className="dark:text-white">{selectedCargo.type || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Weight</span>
                    <span className="dark:text-white">{selectedCargo.weight || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Dimensions</span>
                  <span className="dark:text-white">{selectedCargo.dimensions || `${selectedCargo.width}m × ${selectedCargo.height}m`}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Position</span>
                    <span className="dark:text-white">({selectedCargo.x}, {selectedCargo.y})</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Rotated</span>
                    <span className="dark:text-white">{selectedCargo.rotated ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-full h-20 rounded" style={{
                backgroundColor: getCargoColor(selectedCargo.type),
                opacity: 0.3
              }}></div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setSelectedCargo(null)} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Close
              </button>
            </div>
          </div>
        </div>}
    </div>;
}