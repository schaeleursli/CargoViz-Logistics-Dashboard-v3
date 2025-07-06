import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
interface ViewAreaProps {
  area: {
    id: number;
    name: string;
    description: string;
    content: string; // GeoJSON string
  };
}
const ViewArea: React.FC<ViewAreaProps> = ({
  area
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
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
    try {
      // Parse GeoJSON
      const geoJson = JSON.parse(area.content);
      // Add GeoJSON to map with thicker lines for easier touch interaction
      const geoJsonLayer = L.geoJSON(geoJson, {
        style: {
          color: '#3388ff',
          weight: 4,
          opacity: 0.7,
          fillOpacity: 0.2
        }
      }).addTo(map);
      // Fit bounds to GeoJSON
      map.fitBounds(geoJsonLayer.getBounds(), {
        padding: [50, 50]
      });
    } catch (error) {
      console.error('Error parsing GeoJSON:', error);
    }
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [area.content]);
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
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3 dark:text-white">
            Area Details
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Name
              </span>
              <span className="text-lg text-gray-900 dark:text-white">
                {area.name}
              </span>
            </div>
            {area.description && <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </span>
                <span className="text-gray-900 dark:text-white">
                  {area.description}
                </span>
              </div>}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3 dark:text-white">
            Area Metadata
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                ID
              </span>
              <span className="text-lg text-gray-900 dark:text-white">
                {area.id}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                GeoJSON Size
              </span>
              <span className="text-gray-900 dark:text-white">
                {area.content.length} characters
              </span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-3 dark:text-white">Area Map</h3>
        <div ref={mapRef} className="w-full h-[450px] bg-gray-100 rounded-lg"></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Use two fingers to zoom and pan the map
        </p>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-3 dark:text-white">
          Raw GeoJSON
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-60">
          <pre className="text-sm text-gray-700 dark:text-gray-300">
            {JSON.stringify(JSON.parse(area.content), null, 2)}
          </pre>
        </div>
      </div>
    </div>;
};
export default ViewArea;