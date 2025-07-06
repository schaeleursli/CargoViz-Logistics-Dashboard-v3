interface AreaPayload {
  orgId: number;
  name: string;
  description: string;
  content: string;
  actionBy: number;
}
interface UpdateAreaPayload {
  id: number;
  name: string;
  description: string;
  content: string;
  actionBy: number;
}
export const addArea = async (payload: AreaPayload): Promise<any> => {
  try {
    const response = await fetch('/api/Variant/Areas/AddArea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to add area:', error);
    throw error;
  }
};
export const getAreas = async (orgId: number): Promise<any> => {
  try {
    const response = await fetch(`/api/Variant/Areas/GetAreas?orgId=${orgId}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch areas:', error);
    throw error;
  }
};
export const updateArea = async (payload: UpdateAreaPayload): Promise<any> => {
  try {
    const response = await fetch('/api/Variant/Areas/UpdateArea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update area:', error);
    throw error;
  }
};