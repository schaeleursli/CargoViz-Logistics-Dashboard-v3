// A simplified MaxRects bin packing algorithm implementation
// Based on the concept from https://github.com/ajraamot/maxrects-packer
export interface CargoItem {
  id: number | string;
  name: string;
  width: number;
  height: number;
  allowRotate: boolean;
  type?: string;
}
export interface CargoPlacementResult {
  id: number | string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
  name: string;
  type?: string;
}
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
// Free rectangle for the packing algorithm
class FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  // Check if this free rectangle can fit the given width and height
  canFit(width: number, height: number): boolean {
    return this.width >= width && this.height >= height;
  }
  // Get the score for placing an item here (lower is better)
  getScore(width: number, height: number, method: 'best-area' | 'best-short-side' = 'best-area'): number {
    const remainingWidth = this.width - width;
    const remainingHeight = this.height - height;
    if (method === 'best-area') {
      // Best area fit - minimize wasted area
      return remainingWidth * remainingHeight;
    } else {
      // Best short side fit - minimize the shorter leftover side
      return Math.min(remainingWidth, remainingHeight);
    }
  }
}
export function placeCargo(items: CargoItem[], areaWidth: number, areaHeight: number, boundary: number = 0, allowRotation: boolean = true): CargoPlacementResult[] {
  // Sort items by area (largest first) for better packing
  const sortedItems = [...items].sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    return areaB - areaA; // Descending order
  });
  // Add padding to items if boundary > 0
  const paddedItems = sortedItems.map(item => ({
    ...item,
    width: item.width + boundary * 2,
    height: item.height + boundary * 2
  }));
  // Initialize with a single free rectangle covering the entire area
  const freeRectangles: FreeRect[] = [new FreeRect(0, 0, areaWidth, areaHeight)];
  const placements: CargoPlacementResult[] = [];
  // Try to place each item
  for (const item of paddedItems) {
    // Find the best free rectangle to place this item
    let bestRect: FreeRect | null = null;
    let bestScore = Infinity;
    let bestRotated = false;
    // Try normal orientation
    for (const rect of freeRectangles) {
      if (rect.canFit(item.width, item.height)) {
        const score = rect.getScore(item.width, item.height);
        if (score < bestScore) {
          bestRect = rect;
          bestScore = score;
          bestRotated = false;
        }
      }
    }
    // Try rotated orientation if allowed
    if (allowRotation && item.allowRotate) {
      for (const rect of freeRectangles) {
        if (rect.canFit(item.height, item.width)) {
          const score = rect.getScore(item.height, item.width);
          if (score < bestScore) {
            bestRect = rect;
            bestScore = score;
            bestRotated = true;
          }
        }
      }
    }
    // If we found a place for this item
    if (bestRect) {
      const placedWidth = bestRotated ? item.height : item.width;
      const placedHeight = bestRotated ? item.width : item.height;
      // Add to placements
      placements.push({
        id: item.id,
        name: item.name,
        type: item.type,
        x: bestRect.x + boundary,
        // Adjust for boundary
        y: bestRect.y + boundary,
        // Adjust for boundary
        width: placedWidth - boundary * 2,
        // Adjust width back to original
        height: placedHeight - boundary * 2,
        // Adjust height back to original
        rotated: bestRotated
      });
      // Remove the used rectangle from the free list
      const index = freeRectangles.indexOf(bestRect);
      freeRectangles.splice(index, 1);
      // Split the free rectangle into up to 4 new free rectangles
      // Right of the placed item
      if (bestRect.x + placedWidth < bestRect.x + bestRect.width) {
        freeRectangles.push(new FreeRect(bestRect.x + placedWidth, bestRect.y, bestRect.width - placedWidth, placedHeight));
      }
      // Bottom of the placed item
      if (bestRect.y + placedHeight < bestRect.y + bestRect.height) {
        freeRectangles.push(new FreeRect(bestRect.x, bestRect.y + placedHeight, bestRect.width, bestRect.height - placedHeight));
      }
      // Bottom-right of the placed item
      if (bestRect.x + placedWidth < bestRect.x + bestRect.width && bestRect.y + placedHeight < bestRect.y + bestRect.height) {
        freeRectangles.push(new FreeRect(bestRect.x + placedWidth, bestRect.y + placedHeight, bestRect.width - placedWidth, bestRect.height - placedHeight));
      }
    }
  }
  return placements;
}
// Utility function to estimate width/height from GeoJSON polygon
export function estimateAreaDimensions(geoJsonPolygon: any): {
  width: number;
  height: number;
} {
  try {
    if (!geoJsonPolygon || !geoJsonPolygon.features || !geoJsonPolygon.features[0] || !geoJsonPolygon.features[0].geometry || !geoJsonPolygon.features[0].geometry.coordinates || !geoJsonPolygon.features[0].geometry.coordinates[0]) {
      return {
        width: 100,
        height: 100
      }; // Default fallback
    }
    const coordinates = geoJsonPolygon.features[0].geometry.coordinates[0];
    // Find min/max coordinates
    let minLng = Infinity,
      maxLng = -Infinity,
      minLat = Infinity,
      maxLat = -Infinity;
    for (const coord of coordinates) {
      const [lng, lat] = coord;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    // Calculate width and height in meters (approximate)
    // 111,319.9 meters per degree of latitude
    const height = (maxLat - minLat) * 111319.9;
    // 111,319.9 * cos(latitude) meters per degree of longitude
    const avgLat = (minLat + maxLat) / 2;
    const width = (maxLng - minLng) * 111319.9 * Math.cos(avgLat * Math.PI / 180);
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  } catch (error) {
    console.error('Error estimating area dimensions:', error);
    return {
      width: 100,
      height: 100
    }; // Default fallback
  }
}