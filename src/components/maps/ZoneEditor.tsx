import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Define marker icon URLs using absolute paths
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
// Add support for GeoJSON export
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}
interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings (first is exterior, rest are holes)
}
interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPolygon;
  properties: Record<string, any>;
}
interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
interface ZoneEditorProps {
  onPolygonDrawn: (polygon: any, measurements: any) => void;
  initialPolygon?: any;
  onGeoJSONExport?: (geoJSON: GeoJSONFeatureCollection) => void;
}
const ZoneEditor = ({
  onPolygonDrawn,
  initialPolygon,
  onGeoJSONExport
}: ZoneEditorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  // Calculate measurements of a polygon
  const calculateMeasurements = (latLngs: L.LatLng[]) => {
    if (latLngs.length < 3) {
      return {
        area: 0,
        perimeter: 0,
        width: 0,
        length: 0
      };
    }
    // Calculate area (simplified - not geodesic)
    let area = 0;
    // Simple shoelace formula for area
    for (let i = 0; i < latLngs.length; i++) {
      const j = (i + 1) % latLngs.length;
      area += latLngs[i].lat * latLngs[j].lng;
      area -= latLngs[j].lat * latLngs[i].lng;
    }
    area = Math.abs(area) * 111319.9 * 111319.9 / 2; // Approximate conversion to square meters
    // Calculate perimeter
    let perimeter = 0;
    for (let i = 0; i < latLngs.length; i++) {
      const j = (i + 1) % latLngs.length;
      perimeter += latLngs[i].distanceTo(latLngs[j]);
    }
    // Calculate width and length (using bounding box as approximation)
    let minLat = Number.MAX_VALUE,
      maxLat = Number.MIN_VALUE;
    let minLng = Number.MAX_VALUE,
      maxLng = Number.MIN_VALUE;
    for (const point of latLngs) {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    }
    const southWest = L.latLng(minLat, minLng);
    const northEast = L.latLng(maxLat, maxLng);
    const northWest = L.latLng(maxLat, minLng);
    const width = southWest.distanceTo(northWest);
    const length = northWest.distanceTo(northEast);
    return {
      area,
      perimeter,
      width,
      length
    };
  };
  const updatePolygon = () => {
    if (!leafletMap.current) return;
    // Get all marker positions
    const points = markersRef.current.map(marker => marker.getLatLng());
    // Need at least 3 points for a polygon
    if (points.length < 3) {
      if (polygonRef.current) {
        polygonRef.current.remove();
        polygonRef.current = null;
      }
      onPolygonDrawn(null, {
        area: 0,
        perimeter: 0,
        width: 0,
        length: 0
      });
      return;
    }
    // Remove old polygon if it exists
    if (polygonRef.current) {
      polygonRef.current.remove();
    }
    // Create new polygon
    polygonRef.current = L.polygon(points, {
      color: '#3388ff',
      weight: 3,
      fillOpacity: 0.2
    }).addTo(leafletMap.current);
    // Calculate and report measurements
    const measurements = calculateMeasurements(points);
    const coordinates = points.map(point => [point.lat, point.lng]);
    onPolygonDrawn(coordinates, measurements);
    // Generate GeoJSON if callback is provided
    if (onGeoJSONExport && polygonRef.current) {
      const geoJSON = createGeoJSON(polygonRef.current);
      onGeoJSONExport(geoJSON);
    }
  };
  // Create GeoJSON from polygon
  const createGeoJSON = (polygon: L.Polygon): GeoJSONFeatureCollection => {
    // Convert to GeoJSON
    const rawGeoJSON = polygon.toGeoJSON() as GeoJSONFeature;
    // Create a feature collection
    const featureCollection: GeoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: [rawGeoJSON]
    };
    return featureCollection;
  };
  const addMarker = (latlng: L.LatLng) => {
    if (!leafletMap.current || !mapReady) return;
    const marker = L.marker(latlng, {
      draggable: true
    }).addTo(leafletMap.current);
    // Add event listeners to the marker
    marker.on('drag', updatePolygon);
    marker.on('click', e => {
      if (L.DomEvent.originalEvent) {
        L.DomEvent.stopPropagation(L.DomEvent.originalEvent);
      }
      if (!leafletMap.current) return;
      marker.remove();
      markersRef.current = markersRef.current.filter(m => m !== marker);
      updatePolygon();
    });
    markersRef.current.push(marker);
    updatePolygon();
  };
  const clearAll = () => {
    if (!leafletMap.current) return;
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    // Remove polygon
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }
    // Reset measurements
    onPolygonDrawn(null, {
      area: 0,
      perimeter: 0,
      width: 0,
      length: 0
    });
    // Reset GeoJSON if callback is provided
    if (onGeoJSONExport) {
      onGeoJSONExport({
        type: 'FeatureCollection',
        features: []
      });
    }
  };
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    // Update button styling
    const startDrawingBtn = document.getElementById('start-drawing');
    if (startDrawingBtn) {
      startDrawingBtn.style.background = !drawingMode ? '#c2e0ff' : 'white';
      startDrawingBtn.innerHTML = !drawingMode ? '✓' : '+';
      startDrawingBtn.title = !drawingMode ? 'Finish drawing' : 'Start drawing';
    }
  };
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Initialize the map
    const map = L.map(mapRef.current, {
      center: [47.6062, -122.3321],
      zoom: 16,
      layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      })]
    });
    leafletMap.current = map;
    setMapReady(true);
    // Add custom controls for drawing
    const drawControl = L.control({
      position: 'topright'
    });
    drawControl.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        <a href="#" title="Start drawing" id="start-drawing" style="display: block; width: 30px; height: 30px; line-height: 30px; text-align: center; text-decoration: none; color: black; background: white; font-weight: bold;">+</a>
        <a href="#" title="Clear all" id="clear-all" style="display: block; width: 30px; height: 30px; line-height: 30px; text-align: center; text-decoration: none; color: black; background: white; font-weight: bold;">×</a>
      `;
      return div;
    };
    drawControl.addTo(map);
    // Add event listeners to custom controls
    setTimeout(() => {
      const startDrawingBtn = document.getElementById('start-drawing');
      const clearAllBtn = document.getElementById('clear-all');
      if (startDrawingBtn) {
        startDrawingBtn.addEventListener('click', e => {
          e.preventDefault();
          toggleDrawingMode();
        });
      }
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', e => {
          e.preventDefault();
          clearAll();
        });
      }
    }, 100);
    // Click handler for adding points
    map.on('click', e => {
      if (drawingMode) {
        addMarker(e.latlng);
      }
    });
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  // When the component mounts or initialPolygon changes, initialize with any existing polygon
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    // Clear existing markers and polygon
    clearAll();
    // If there's an initial polygon, draw it
    if (initialPolygon && initialPolygon.length >= 3) {
      initialPolygon.forEach(point => {
        addMarker(L.latLng(point[0], point[1]));
      });
      // Fit the map to the polygon bounds
      if (polygonRef.current) {
        leafletMap.current.fitBounds(polygonRef.current.getBounds());
      }
    }
  }, [initialPolygon, mapReady]);
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
  return <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full bg-gray-100"></div>
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-md shadow-md z-[1000] border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <p className="text-sm font-medium flex items-center">
          {drawingMode ? <>
              <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
              Click on map to add points
            </> : <>
              <span className="inline-block w-4 h-4 bg-gray-300 rounded-full mr-2"></span>
              Click + to start drawing
            </>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Click on markers to remove them
        </p>
      </div>
    </div>;
};
export default ZoneEditor;