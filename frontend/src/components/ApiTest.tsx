import { useState } from 'react';

const ApiTest = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      if (text) {
        try {
          const data = JSON.parse(text);
          setResult(`✅ API Connection Success: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          setResult(`⚠️ Response not JSON: ${text}`);
        }
      } else {
        setResult(`❌ Empty response with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setResult(`❌ Connection Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBasicRoute = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/', {
        method: 'GET'
      });
      
      const text = await response.text();
      setResult(`Basic route response: ${text}`);
    } catch (error: any) {
      setResult(`❌ Basic route error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-[9999] max-w-md">
      <h3 className="font-bold mb-2">API Debug Tool</h3>
      <div className="flex gap-2 mb-2">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test API
        </button>
        <button 
          onClick={testBasicRoute}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Basic
        </button>
      </div>
      {loading && <p className="text-sm text-gray-500">Testing...</p>}
      {result && (
        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 max-h-40 overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
};

export default ApiTest;
