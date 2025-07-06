import { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Label, Textarea, Badge, CodeBlock
} from '@magicpatterns/ui';
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-api-url.com',
  withCredentials: true,
});

export default function APITestDashboard() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoints = [
    {
      label: 'GET Areas (orgId: 1)',
      key: 'getAreas',
      fn: () => API.get('/api/Variant/Areas/GetAreas/1'),
    },
    {
      label: 'POST Add Area',
      key: 'addArea',
      fn: () => API.post('/api/Variant/Areas/AddArea', {
        orgId: 1,
        name: 'Test Area',
        description: 'Test Description',
        content: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]],
        }),
        actionBy: 1,
      }),
    },
    {
      label: 'POST Place Cargo In Area',
      key: 'placeCargo',
      fn: () => API.post('/api/Cargo/PlaceInArea', {
        areaId: 1,
        cargoPlacements: [
          {
            id: 'cargo-001',
            x: 0,
            y: 0,
            width: 4,
            height: 2,
            rotated: false,
          },
          {
            id: 'cargo-002',
            x: 5,
            y: 3,
            width: 3,
            height: 2,
            rotated: true,
          },
        ],
      }),
    },
    {
      label: 'GET Placed Cargo (areaId: 1)',
      key: 'getPlacedCargo',
      fn: () => API.get('/api/Variant/Cargo/GetPlacedCargo/1'),
    },
    {
      label: 'GET Cargo List',
      key: 'getCargoList',
      fn: () => API.get('/api/Cargo/GetCargo'),
    },
  ];

  const runTest = async (key: string, fn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fn();
      setResults(prev => ({ ...prev, [key]: { success: true, data: res.data } }));
    } catch (err: any) {
      setResults(prev => ({
        ...prev,
        [key]: {
          success: false,
          error: err.response?.data || err.message,
        },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <Card className="max-w-5xl mx-auto mt-10 p-6">
      <CardHeader>
        <CardTitle>🧪 API Test Dashboard — CargoViz MVP1</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {testEndpoints.map(({ label, key, fn }) => (
          <div key={key} className="space-y-2 border-b pb-4">
            <div className="flex justify-between items-center">
              <Label>{label}</Label>
              <Button
                onClick={() => runTest(key, fn)}
                disabled={loading[key]}
              >
                {loading[key] ? 'Testing...' : 'Run'}
              </Button>
            </div>

            {results[key] && (
              <div>
                <Badge variant={results[key].success ? 'success' : 'danger'}>
                  {results[key].success ? 'Success' : 'Error'}
                </Badge>
                <CodeBlock className="mt-2" code={JSON.stringify(
                  results[key].success ? results[key].data : results[key].error,
                  null,
                  2
                )} />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
