import React, { useState } from 'react';

interface VideoTestProps {
  onVideoSrcChange: (src: string) => void;
  currentSrc: string;
}

const VideoTest: React.FC<VideoTestProps> = ({ onVideoSrcChange, currentSrc }) => {
  const [showTest, setShowTest] = useState(false);
  
  const testVideos = [
    {
      name: "Local Video (GreenMart)",
      src: "/natural_banner.mp4",
      type: "local"
    },
    {
      name: "YouTube: Big Buck Bunny",
      src: "M7lc1UVf-VE", // Big Buck Bunny - always works
      type: "youtube"
    },
    {
      name: "YouTube: Nature Video",
      src: "EngW7tLk6R8", // Beautiful nature video
      type: "youtube"
    },
    {
      name: "YouTube: Farm Life",
      src: "LXb3EKWsInQ", // Farm/agriculture content
      type: "youtube"
    },
    {
      name: "Test Video 1 (Online)",
      src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      type: "online"
    }
  ];

  if (!showTest) {
    return (
      <button
        onClick={() => setShowTest(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-xs z-50 opacity-50 hover:opacity-100"
      >
        Video Test
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm">Video Test Panel</h4>
        <button 
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {testVideos.map((video, index) => (
          <button
            key={index}
            onClick={() => onVideoSrcChange(video.src)}
            className={`w-full text-left p-2 rounded text-xs transition-colors ${
              currentSrc === video.src 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium">{video.name}</div>
            <div className="text-gray-600 text-xs truncate">{video.src}</div>
            <div className="text-xs">
              <span className={`px-1 rounded ${
                video.type === 'local' ? 'bg-blue-200' : 
                video.type === 'youtube' ? 'bg-red-200' : 'bg-orange-200'
              }`}>
                {video.type}
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
        <div className="font-medium mb-1">Current:</div>
        <div className="text-gray-600 truncate">{currentSrc}</div>
      </div>
    </div>
  );
};

export default VideoTest;
