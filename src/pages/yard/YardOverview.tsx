import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAreas } from '../../services/areaService';
import { LayersIcon, FilterIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon, MapPinIcon, InfoIcon } from 'lucide-react';
// Fix Leaflet's default icon problem
const MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const MARKER_RETINA_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
// Fix Leaflet's default icon problem
L.Icon.Default.mergeOptions({
  iconUrl: MARKER_ICON_URL,
  iconRetinaUrl: MARKER_RETINA_URL,
  shadowUrl: MARKER_SHADOW_URL,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
interface Area {
  id: number;
  orgId: number;
  name: string;
  description: string;
  content: string;
  dateAdded: string;
  active: boolean;
}
const YardOverview: React.FC = () => {
  const orgId = 1; // placeholder, should be from user context
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const geoJsonLayers = useRef<{
    [key: number]: L.GeoJSON;
  }>({});
  const [areas, setAreas] = useState<Area[]>([]);
  const [visibleAreas, setVisibleAreas] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);
  // Predefined colors for areas
  const areaColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16' // lime
  ];
  // Load areas from API
  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAreas(orgId);
        const areaData = response.data || [];
        setAreas(areaData);
        // Set all areas to visible by default
        const initialVisibility = {};
        areaData.forEach(area => {
          initialVisibility[area.id] = true;
        });
        setVisibleAreas(initialVisibility);
      } catch (err) {
        setError('Failed to load areas. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
  }, []);
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Initialize the map with touch settings
    const map = L.map(mapRef.current, {
      center: [47.6062, -122.3321],
      zoom: 13,
      layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      })],
      tap: true,
      touchZoom: true,
      bounceAtZoomLimits: true
    });
    // Disable default touch behavior to prevent scrolling issues on iOS
    if (map.tap) {
      map.touchZoom.enable();
      map.dragging.enable();
      map.tap.enable();
      map.doubleClickZoom.enable();
    }
    leafletMap.current = map;
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  // Update map when areas or visibility changes
  useEffect(() => {
    if (!leafletMap.current || areas.length === 0) return;
    // Clear existing layers
    Object.values(geoJsonLayers.current).forEach(layer => {
      if (leafletMap.current) {
        layer.removeFrom(leafletMap.current);
      }
    });
    geoJsonLayers.current = {};
    // Add visible areas to map
    const visibleLayers: L.GeoJSON[] = [];
    areas.forEach((area, index) => {
      try {
        // Skip if area is not visible
        if (!visibleAreas[area.id]) return;
        const color = areaColors[index % areaColors.length];
        const geoJson = JSON.parse(area.content);
        // Create GeoJSON layer with styling
        const layer = L.geoJSON(geoJson, {
          style: {
            color: color,
            weight: 4,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.2
          },
          onEachFeature: (feature, layer) => {
            // Add popup with area info
            const popupContent = `
              <div class="area-popup">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${area.name}</h3>
                ${area.description ? `<p style="margin-bottom: 8px;">${area.description}</p>` : ''}
                <p style="font-size: 12px; color: #666;">Added: ${area.dateAdded ? new Date(area.dateAdded).toLocaleDateString() : 'N/A'}</p>
              </div>
            `;
            // Make popup touch-friendly
            const popupOptions = {
              maxWidth: 300,
              className: 'area-popup'
            };
            layer.bindPopup(popupContent, popupOptions);
            // Add hover interaction for desktop
            layer.on({
              mouseover: e => {
                const l = e.target;
                l.setStyle({
                  weight: 5,
                  fillOpacity: 0.4
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  l.bringToFront();
                }
              },
              mouseout: e => {
                layer.resetStyle(e.target);
              },
              click: e => {
                // For touch devices, bring to front on click
                const l = e.target;
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  l.bringToFront();
                }
              }
            });
            // Add area name label
            const center = layer.getBounds().getCenter();
            const nameMarker = L.marker(center, {
              icon: L.divIcon({
                className: 'area-label',
                html: `<div style="background-color: rgba(255,255,255,0.8); color: #333; padding: 5px 10px; border-radius: 4px; font-weight: bold; white-space: nowrap;">${area.name}</div>`,
                iconSize: [100, 40],
                iconAnchor: [50, 20]
              })
            }).addTo(leafletMap.current!);
            // Store the label marker to remove it when layer is removed
            layer.on('remove', () => {
              nameMarker.remove();
            });
          }
        }).addTo(leafletMap.current);
        geoJsonLayers.current[area.id] = layer;
        visibleLayers.push(layer);
      } catch (error) {
        console.error(`Error parsing GeoJSON for area ${area.id}:`, error);
      }
    });
    // Fit bounds to all visible layers
    if (visibleLayers.length > 0) {
      const group = L.featureGroup(visibleLayers);
      leafletMap.current.fitBounds(group.getBounds(), {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }, [areas, visibleAreas]);
  // Toggle area visibility
  const toggleAreaVisibility = (areaId: number) => {
    setVisibleAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };
  // Toggle all areas visibility
  const toggleAllAreas = (visible: boolean) => {
    const newVisibility = {};
    areas.forEach(area => {
      newVisibility[area.id] = visible;
    });
    setVisibleAreas(newVisibility);
  };
  // When the map resizes, we need to invalidate the size
  useEffect(() => {
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    // Call once to ensure map is properly sized on initial render
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 500); // Call again after a delay to handle any layout shifts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return <div className="max-w-6xl mx-auto mt-8 px-4 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <LayersIcon size={24} className="mr-2" />
          Yard Overview
        </h1>
        <div className="flex space-x-2">
          <Link to="/areas/list" className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center dark:text-white">
            <ArrowLeftIcon size={18} className="mr-2" />
            Back to Areas
          </Link>
          <button onClick={() => toggleAllAreas(true)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center dark:text-white">
            <EyeIcon size={18} className="mr-2" />
            Show All
          </button>
          <button onClick={() => toggleAllAreas(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center dark:text-white">
            <EyeOffIcon size={18} className="mr-2" />
            Hide All
          </button>
          <button onClick={() => setFilterOpen(!filterOpen)} className={`px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center dark:text-white ${filterOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : ''}`}>
            <FilterIcon size={18} className="mr-2" />
            Filters
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with area filters */}
        {filterOpen && <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-medium flex items-center">
                  <MapPinIcon size={18} className="mr-2" />
                  Area Visibility
                </h2>
              </div>
              <div className="p-4">
                {loading ? <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                  </div> : error ? <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div> : areas.length === 0 ? <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No areas found
                  </div> : <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    <div className="space-y-3">
                      {areas.map((area, index) => <div key={area.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="w-5 h-5 rounded-full mr-3" style={{
                    backgroundColor: areaColors[index % areaColors.length]
                  }}></div>
                          <div className="flex-1 mr-3">
                            <span className="block font-medium dark:text-white text-base truncate">
                              {area.name}
                            </span>
                          </div>
                          <button onClick={() => toggleAreaVisibility(area.id)} className={`p-2 rounded-md ${visibleAreas[area.id] ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`} aria-label={visibleAreas[area.id] ? 'Hide area' : 'Show area'}>
                            {visibleAreas[area.id] ? <EyeIcon size={22} /> : <EyeOffIcon size={22} />}
                          </button>
                        </div>)}
                    </div>
                  </div>}
              </div>
            </div>
          </div>}
        {/* Map container */}
        <div className={`${filterOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-medium flex items-center">
                <LayersIcon size={18} className="mr-2" />
                Yard Map
              </h2>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                  {Object.values(visibleAreas).filter(Boolean).length} of{' '}
                  {areas.length} areas visible
                </span>
                <div className="relative group">
                  <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Map help">
                    <InfoIcon size={18} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 hidden group-hover:block">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      • Tap on an area to see details
                      <br />
                      • Use two fingers to zoom and pan
                      <br />• Toggle visibility using the sidebar
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[600px] relative">
              {loading ? <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading map data...
                    </p>
                  </div>
                </div> : <div ref={mapRef} className="w-full h-full bg-gray-100"></div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default YardOverview;