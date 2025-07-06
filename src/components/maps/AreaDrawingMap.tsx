import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
interface AreaDrawingMapProps {
  onAreaDrawn: (geoJson: string) => void;
  initialGeoJson?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  className?: string;
}
const AreaDrawingMap: React.FC<AreaDrawingMapProps> = ({
  onAreaDrawn,
  initialGeoJson,
  initialCenter = [47.6062, -122.3321],
  initialZoom = 14,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const drawnItems = useRef<L.FeatureGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [polygon, setPolygon] = useState<L.Polygon | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Initialize the map with touch zoom and tap handlers enabled
    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
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
    // Initialize the drawn items layer
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    drawnItems.current = featureGroup;
    // Add custom drawing controls with larger touch targets
    const drawingControl = L.control({
      position: 'topright'
    });
    drawingControl.onAdd = function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      // Style the container for better touch
      container.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
      const drawButton = L.DomUtil.create('a', '', container);
      drawButton.href = '#';
      drawButton.title = 'Draw polygon';
      drawButton.innerHTML = '✏️';
      drawButton.style.fontSize = '20px';
      drawButton.style.lineHeight = '40px';
      drawButton.style.textAlign = 'center';
      drawButton.style.width = '40px';
      drawButton.style.height = '40px';
      drawButton.style.display = 'block';
      drawButton.style.backgroundColor = 'white';
      const clearButton = L.DomUtil.create('a', '', container);
      clearButton.href = '#';
      clearButton.title = 'Clear drawing';
      clearButton.innerHTML = '🗑️';
      clearButton.style.fontSize = '20px';
      clearButton.style.lineHeight = '40px';
      clearButton.style.textAlign = 'center';
      clearButton.style.width = '40px';
      clearButton.style.height = '40px';
      clearButton.style.display = 'block';
      clearButton.style.backgroundColor = 'white';
      // Add touch-friendly event listeners
      const addTouchEvents = (element: HTMLElement, callback: (e: Event) => void) => {
        // For touch devices
        element.addEventListener('touchend', e => {
          e.preventDefault();
          callback(e);
        }, false);
        // For mouse devices
        element.addEventListener('click', e => {
          e.preventDefault();
          callback(e);
        }, false);
      };
      addTouchEvents(drawButton, () => {
        setDrawingMode(!drawingMode);
        drawButton.style.backgroundColor = drawingMode ? 'white' : '#c2e0ff';
      });
      addTouchEvents(clearButton, () => {
        clearDrawing();
      });
      return container;
    };
    drawingControl.addTo(map);
    // Handle both click and touch events for adding points
    map.on('click', function (e) {
      if (drawingMode) {
        addPoint(e.latlng);
      }
    });
    // If initialGeoJson is provided, add it to the map
    if (initialGeoJson) {
      try {
        const geoJson = JSON.parse(initialGeoJson);
        const geoJsonLayer = L.geoJSON(geoJson);
        // Add each layer from the GeoJSON to the feature group
        geoJsonLayer.eachLayer(layer => {
          featureGroup.addLayer(layer);
        });
        // Try to extract points from the GeoJSON
        if (geoJson.features && geoJson.features.length > 0) {
          const feature = geoJson.features[0];
          if (feature.geometry && feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];
            const latLngs = coordinates.map(coord => L.latLng(coord[1], coord[0]));
            setPoints(latLngs);
            // Create markers for each point
            const newMarkers = latLngs.map(latLng => {
              const marker = L.marker(latLng, {
                draggable: true,
                // Increase marker size for better touch targets
                icon: new L.Icon({
                  iconUrl: MARKER_ICON_URL,
                  iconRetinaUrl: MARKER_RETINA_URL,
                  shadowUrl: MARKER_SHADOW_URL,
                  iconSize: [30, 46],
                  iconAnchor: [15, 46],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                })
              });
              marker.addTo(map);
              // Add touch-friendly events
              marker.on('drag', updatePolygon);
              // Make markers easier to remove on touch devices
              marker.on('click', event => {
                if (event.originalEvent) {
                  L.DomEvent.stopPropagation(event.originalEvent);
                }
                removePoint(marker);
              });
              return marker;
            });
            setMarkers(newMarkers);
            // Create polygon
            const poly = L.polygon(latLngs, {
              color: '#3388ff',
              weight: 3,
              fillOpacity: 0.2
            }).addTo(map);
            setPolygon(poly);
          }
        }
        // Fit bounds to the GeoJSON
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50]
          });
        }
      } catch (error) {
        console.error('Error parsing initial GeoJSON:', error);
      }
    }
    setMapReady(true);
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [initialCenter, initialZoom, initialGeoJson]);
  // Toggle drawing mode
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.getContainer().style.cursor = drawingMode ? 'crosshair' : '';
    }
  }, [drawingMode]);
  // Add a point to the polygon
  const addPoint = (latLng: L.LatLng) => {
    if (!leafletMap.current) return;
    // Create a new marker with larger touch target
    const marker = L.marker(latLng, {
      draggable: true,
      icon: new L.Icon({
        iconUrl: MARKER_ICON_URL,
        iconRetinaUrl: MARKER_RETINA_URL,
        shadowUrl: MARKER_SHADOW_URL,
        iconSize: [30, 46],
        iconAnchor: [15, 46],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(leafletMap.current);
    // Add event listeners
    marker.on('drag', updatePolygon);
    marker.on('click', e => {
      if (e.originalEvent) {
        L.DomEvent.stopPropagation(e.originalEvent);
      }
      removePoint(marker);
    });
    // Update state
    setMarkers(prev => [...prev, marker]);
    setPoints(prev => [...prev, latLng]);
    // Update polygon
    updatePolygon();
  };
  // Remove a point from the polygon
  const removePoint = (marker: L.Marker) => {
    if (!leafletMap.current) return;
    // Remove marker from map
    marker.remove();
    // Update state
    const latLng = marker.getLatLng();
    setMarkers(prev => prev.filter(m => m !== marker));
    setPoints(prev => prev.filter(p => p !== latLng));
    // Update polygon
    updatePolygon();
  };
  // Update the polygon when points change
  const updatePolygon = () => {
    if (!leafletMap.current) return;
    // Get current points from markers
    const currentPoints = markers.map(marker => marker.getLatLng());
    // Remove existing polygon
    if (polygon) {
      polygon.remove();
    }
    // Create new polygon if we have at least 3 points
    if (currentPoints.length >= 3) {
      const newPolygon = L.polygon(currentPoints, {
        color: '#3388ff',
        weight: 3,
        fillOpacity: 0.2
      }).addTo(leafletMap.current);
      setPolygon(newPolygon);
      // Convert to GeoJSON and notify parent
      const geoJson = polygonToGeoJSON(currentPoints);
      onAreaDrawn(JSON.stringify(geoJson));
    } else {
      setPolygon(null);
      onAreaDrawn('');
    }
  };
  // Clear the drawing
  const clearDrawing = () => {
    // Remove all markers
    markers.forEach(marker => marker.remove());
    // Remove polygon
    if (polygon) {
      polygon.remove();
    }
    // Reset state
    setMarkers([]);
    setPoints([]);
    setPolygon(null);
    // Notify parent
    onAreaDrawn('');
  };
  // Convert polygon points to GeoJSON
  const polygonToGeoJSON = (latLngs: L.LatLng[]) => {
    // Ensure the polygon is closed (first and last points are the same)
    const closedLatLngs = [...latLngs];
    if (latLngs.length > 0 && !latLngs[0].equals(latLngs[latLngs.length - 1])) {
      closedLatLngs.push(latLngs[0]);
    }
    // Convert to GeoJSON format
    const coordinates = closedLatLngs.map(latLng => [latLng.lng, latLng.lat]);
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }]
    };
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
  return <div className={`relative w-full ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg"></div>
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-md shadow-md z-[1000] border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <p className="text-base font-medium flex items-center">
          <span className={`inline-block w-5 h-5 ${drawingMode ? 'bg-blue-500' : 'bg-gray-300'} rounded-full mr-3`}></span>
          {drawingMode ? 'Tap on map to add points' : 'Tap ✏️ to start drawing'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {markers.length > 0 ? 'Tap on markers to remove them' : 'Draw a polygon to define an area'}
        </p>
      </div>
    </div>;
};
export default AreaDrawingMap;