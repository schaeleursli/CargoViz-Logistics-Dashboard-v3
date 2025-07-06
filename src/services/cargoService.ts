import { CargoPlacementResult } from './CargoPlacementService';
export interface CargoItem {
  id: number;
  name: string;
  type: string;
  status: string;
  dimensions: string;
  weight: string;
  zone: string;
  width?: number;
  height?: number;
  allowRotate?: boolean;
}
// Mock cargo data for development
const mockCargoItems: CargoItem[] = [{
  id: 1,
  name: 'Container MSCU-123456',
  type: 'Container',
  status: 'Pending',
  dimensions: "40' x 8' x 8'",
  weight: '12,500 kg',
  zone: 'Unassigned',
  width: 12,
  // 40 feet in meters (approx)
  height: 2.4,
  // 8 feet in meters (approx)
  allowRotate: false
}, {
  id: 2,
  name: 'Crate B-789',
  type: 'Crate',
  status: 'Pending',
  dimensions: "6' x 4' x 4'",
  weight: '1,200 kg',
  zone: 'Unassigned',
  width: 1.8,
  // 6 feet in meters (approx)
  height: 1.2,
  // 4 feet in meters (approx)
  allowRotate: true
}, {
  id: 3,
  name: 'Machinery XYZ-100',
  type: 'Equipment',
  status: 'Pending',
  dimensions: "12' x 6' x 8'",
  weight: '8,400 kg',
  zone: 'Unassigned',
  width: 3.7,
  // 12 feet in meters (approx)
  height: 1.8,
  // 6 feet in meters (approx)
  allowRotate: false
}, {
  id: 4,
  name: 'Pallet P-456',
  type: 'Pallet',
  status: 'Pending',
  dimensions: "4' x 4' x 5'",
  weight: '950 kg',
  zone: 'Unassigned',
  width: 1.2,
  // 4 feet in meters (approx)
  height: 1.2,
  // 4 feet in meters (approx)
  allowRotate: true
}, {
  id: 5,
  name: 'Container HLCU-789012',
  type: 'Container',
  status: 'Pending',
  dimensions: "20' x 8' x 8'",
  weight: '7,800 kg',
  zone: 'Unassigned',
  width: 6.1,
  // 20 feet in meters (approx)
  height: 2.4,
  // 8 feet in meters (approx)
  allowRotate: false
}];
export const getCargoList = async (): Promise<{
  data: {
    items: CargoItem[];
  };
}> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch('/api/Cargo/GetCargo')
    // return await response.json()
    // For now, return mock data
    return {
      data: {
        items: mockCargoItems
      }
    };
  } catch (error) {
    console.error('Failed to fetch cargo items:', error);
    throw error;
  }
};
export const placeCargoInAreaAPI = async (data: {
  areaId: number;
  cargoPlacements: CargoPlacementResult[];
}): Promise<any> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch('/api/Cargo/PlaceInArea', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // })
    // return await response.json()
    // For now, log the data and return a mock response
    console.log('Placing cargo in area:', data);
    return {
      success: true,
      message: 'Cargo placement saved successfully'
    };
  } catch (error) {
    console.error('Failed to save cargo placement:', error);
    throw error;
  }
};
// Mock function to get placed cargo by area
export const getPlacedCargoByArea = async (areaId: number): Promise<any> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(`/api/Variant/Cargo/GetPlacedCargo/${areaId}`)
    // return await response.json()
    // For now, return mock data based on the areaId
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Generate some mock placed cargo
    const mockPlacedCargo = [{
      cargoId: 'MSCU-123456',
      name: 'Container MSCU-123456',
      type: 'Container',
      x: 10,
      y: 15,
      width: 12,
      height: 2.4,
      rotated: false,
      weight: '12,500 kg',
      dimensions: "40' x 8' x 8'"
    }, {
      cargoId: 'HLCU-789012',
      name: 'Container HLCU-789012',
      type: 'Container',
      x: 10,
      y: 20,
      width: 6.1,
      height: 2.4,
      rotated: false,
      weight: '7,800 kg',
      dimensions: "20' x 8' x 8'"
    }, {
      cargoId: 'CRATE-B789',
      name: 'Crate B-789',
      type: 'Crate',
      x: 25,
      y: 15,
      width: 1.8,
      height: 1.2,
      rotated: true,
      weight: '1,200 kg',
      dimensions: "6' x 4' x 4'"
    }, {
      cargoId: 'MACH-XYZ100',
      name: 'Machinery XYZ-100',
      type: 'Equipment',
      x: 28,
      y: 15,
      width: 3.7,
      height: 1.8,
      rotated: false,
      weight: '8,400 kg',
      dimensions: "12' x 6' x 8'"
    }, {
      cargoId: 'PLT-P456',
      name: 'Pallet P-456',
      type: 'Pallet',
      x: 25,
      y: 18,
      width: 1.2,
      height: 1.2,
      rotated: false,
      weight: '950 kg',
      dimensions: "4' x 4' x 5'"
    }];
    return {
      data: mockPlacedCargo
    };
  } catch (error) {
    console.error('Failed to fetch placed cargo:', error);
    throw error;
  }
};