import { Layers, Navigation, Plus, Minus, MapPin, User } from 'lucide-react';
import { useState } from 'react';

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onLayerChange,
  onCenterOnUser,
  currentStyle = 'standard'
}) => {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="absolute right-4 top-4 z-10 flex flex-col space-y-2">
      {/* Zoom controls */}
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg 
                    focus:outline-none transition-colors s"
          aria-label="Zoom in"
        >
          <Plus size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg 
                    focus:outline-none transition-colors"
          aria-label="Zoom out"
        >
          <Minus size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Layer control */}
      <div className="relative">
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={`p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md 
                    hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors
                    ${showLayers ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          aria-label="Change map style"
          aria-expanded={showLayers}
        >
          <Layers size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {showLayers && (
          <div className="absolute right-full mr-2 bottom-0 bg-white dark:bg-gray-800 
                         rounded-lg shadow-lg p-2 w-36">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">
              Map Style
            </div>
            <button
              onClick={() => {
                onLayerChange('standard');
                setShowLayers(false);
              }}
              className={`flex items-center w-full px-2 py-1.5 text-left rounded 
                         ${currentStyle === 'standard' 
                           ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                           : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <MapPin size={16} className="mr-2" />
              <span className="text-sm">Standard</span>
            </button>
            <button
              onClick={() => {
                onLayerChange('minimal');
                setShowLayers(false);
              }}
              className={`flex items-center w-full px-2 py-1.5 text-left rounded 
                         ${currentStyle === 'minimal' 
                           ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                           : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Navigation size={16} className="mr-2" />
              <span className="text-sm">Minimal</span>
            </button>
          </div>
        )}
      </div>

      {/* Center on user button */}
      <button
        onClick={onCenterOnUser}
        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md 
                  hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
        aria-label="Center on my location"
      >
        <User size={20} className="text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};

export default MapControls;
