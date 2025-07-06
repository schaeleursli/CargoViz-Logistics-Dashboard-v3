import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CargoPlacementResult } from '../../services/CargoPlacementService';
interface CargoPlacementPreviewProps {
  placements: CargoPlacementResult[];
  areaWidth: number;
  areaHeight: number;
  geoJson?: any;
}
const CargoPlacementPreview: React.FC<CargoPlacementPreviewProps> = ({
  placements,
  areaWidth,
  areaHeight,
  geoJson
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const cargoLayerGroup = useRef<L.LayerGroup | null>(null);
  // Create different colors for different cargo types
  const typeColors = {
    Container: '#3b82f6',
    Crate: '#10b981',
    Pallet: '#f59e0b',
    Equipment: '#ef4444',
    default: '#8b5cf6' // purple (default)
  };
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    // Initialize the map with simple CRS for rectangular coordinates
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2
    });
    leafletMap.current = map;
    // Create a layer group for cargo items
    cargoLayerGroup.current = L.layerGroup().addTo(map);
    // Define bounds based on area dimensions
    const bounds: L.LatLngBoundsExpression = [[0, 0], [areaHeight, areaWidth]];
    map.fitBounds(bounds);
    // Add grid lines for better visualization
    const gridSize = Math.max(areaWidth, areaHeight) / 20;
    const gridLayer = L.layerGroup().addTo(map);
    // Add horizontal grid lines
    for (let y = 0; y <= areaHeight; y += gridSize) {
      L.polyline([[y, 0], [y, areaWidth]], {
        color: '#ddd',
        weight: 1,
        opacity: 0.5,
        dashArray: '5,5'
      }).addTo(gridLayer);
    }
    // Add vertical grid lines
    for (let x = 0; x <= areaWidth; x += gridSize) {
      L.polyline([[0, x], [areaHeight, x]], {
        color: '#ddd',
        weight: 1,
        opacity: 0.5,
        dashArray: '5,5'
      }).addTo(gridLayer);
    }
    // If GeoJSON is provided, add it to the map
    if (geoJson) {
      try {
        // Transform GeoJSON coordinates to match our simple CRS
        const transformedGeoJson = JSON.parse(JSON.stringify(geoJson));
        L.geoJSON(transformedGeoJson, {
          style: {
            color: '#6b7280',
            weight: 2,
            opacity: 0.8,
            fillColor: '#9ca3af',
            fillOpacity: 0.1
          }
        }).addTo(map);
      } catch (error) {
        console.error('Error rendering GeoJSON:', error);
      }
    }
    // Add a scale indicator
    L.control.scale({
      position: 'bottomleft',
      imperial: false
    }).addTo(map);
    // Add a legend
    const legend = L.control({
      position: 'bottomright'
    });
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend');
      div.innerHTML = `
        <div style="background: white; padding: 10px; border-radius: 4px; box-shadow: 0 1px 5px rgba(0,0,0,0.4);">
          <h4 style="margin: 0 0 5px 0; font-size: 14px;">Cargo Types</h4>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 15px; height: 15px; background: ${typeColors['Container']}; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Container</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 15px; height: 15px; background: ${typeColors['Crate']}; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Crate</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <div style="width: 15px; height: 15px; background: ${typeColors['Pallet']}; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Pallet</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 15px; height: 15px; background: ${typeColors['Equipment']}; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Equipment</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [areaWidth, areaHeight, geoJson]);
  // Update cargo placements
  useEffect(() => {
    if (!leafletMap.current || !cargoLayerGroup.current) return;
    // Clear existing cargo items
    cargoLayerGroup.current.clearLayers();
    // Add each cargo placement as a rectangle
    placements.forEach(placement => {
      const {
        x,
        y,
        width,
        height,
        rotated,
        name,
        type
      } = placement;
      // Get color based on cargo type
      const color = type && typeColors[type] ? typeColors[type] : typeColors.default;
      // Create rectangle for the cargo item
      const rect = L.rectangle([[y, x], [y + height, x + width]], {
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.3
      });
      // Add popup with cargo details
      rect.bindPopup(`
        <div>
          <strong>${name}</strong><br>
          ${type ? `Type: ${type}<br>` : ''}
          Size: ${width}m × ${height}m<br>
          Position: (${x}m, ${y}m)<br>
          ${rotated ? '(Rotated)' : ''}
        </div>
      `);
      // Add label
      const center = rect.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: 'cargo-label',
          html: `<div style="background-color: rgba(255,255,255,0.8); color: #333; padding: 2px 5px; border-radius: 3px; font-size: 10px; white-space: nowrap; text-align: center; width: auto;">${name}</div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        })
      });
      // Add to layer group
      cargoLayerGroup.current.addLayer(rect);
      cargoLayerGroup.current.addLayer(label);
    });
  }, [placements, typeColors]);
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
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
    </div>;
};
export default CargoPlacementPreview;