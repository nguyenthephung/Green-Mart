import React, { useState } from 'react';
import { uploadService } from '../services/uploadService';
import { useFileUpload } from '../hooks/useFileUpload';

const CloudinaryTestComponent: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadFile, isUploading } = useFileUpload();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testDirectUpload = async (
    file: File,
    type: 'products' | 'banners' | 'avatars' | 'ratings'
  ) => {
    try {
      setIsLoading(true);
      addResult(`🔄 Testing direct upload to ${type}...`);

      let response;
      switch (type) {
        case 'products':
          response = await uploadService.uploadProductImage(file);
          break;
        case 'banners':
          response = await uploadService.uploadBannerImage(file);
          break;
        case 'avatars':
          response = await uploadService.uploadAvatarImage(file);
          break;
        case 'ratings':
          response = await uploadService.uploadRatingImages([file]);
          break;
      }

      if (response.success) {
        const imageUrl = (response.data as any).imageUrl || (response.data as any).imageUrls?.[0];
        addResult(`✅ Direct upload success: ${imageUrl}`);
        return imageUrl;
      } else {
        addResult(`❌ Direct upload failed: ${response.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Direct upload error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testHookUpload = async (
    file: File,
    type: 'products' | 'banners' | 'avatars' | 'ratings'
  ) => {
    try {
      addResult(`🔄 Testing hook upload to ${type}...`);

      const result = await uploadFile(file, type);

      if (result.success && result.url) {
        addResult(`✅ Hook upload success: ${result.url}`);
        return result.url;
      } else {
        addResult(`❌ Hook upload failed: ${result.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Hook upload error: ${error.message}`);
    }
  };

  const handleFileTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addResult(`📁 Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Test all upload types
    const types: ('products' | 'banners' | 'avatars' | 'ratings')[] = [
      'products',
      'banners',
      'avatars',
      'ratings',
    ];

    for (const type of types) {
      // Test direct service
      await testDirectUpload(file, type);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests

      // Test hook
      await testHookUpload(file, type);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🌿 Cloudinary Upload System Test</h1>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">📋 Test Configuration</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Backend: Cloudinary configured with dvbo6qxz4</li>
          <li>✅ Frontend: uploadService + useFileUpload hook</li>
          <li>✅ Endpoints: /api/upload/product, /banner, /avatar, /rating</li>
          <li>✅ Auto fallback to base64 if Cloudinary fails</li>
        </ul>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileTest}
          className="mb-4"
          disabled={isLoading || isUploading}
        />
        <p className="text-gray-600">
          {isLoading || isUploading
            ? '🔄 Testing uploads...'
            : 'Select an image to test all upload types'}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          disabled={isLoading || isUploading}
        >
          🗑️ Clear Results
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📊 Test Results</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet...</p>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.includes('✅')
                    ? 'bg-green-100 text-green-800'
                    : result.includes('❌')
                      ? 'bg-red-100 text-red-800'
                      : result.includes('🔄')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {(isLoading || isUploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Testing uploads...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTestComponent;
