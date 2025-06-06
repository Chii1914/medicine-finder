import React, { useState, useEffect } from 'react';
import { SearchIcon, X } from 'lucide-react';
import { Modal, Box } from '@mui/material';
import { MAP_CONFIG } from '../config/map';

const style = {
  border: 'none',
  outline: 'none',
};

const exampleData = [
  { id: 1, name: 'Paracetamol' },
  { id: 2, name: 'Ibuprofeno' },
  { id: 3, name: 'Aspirina' },
  { id: 4, name: 'Vitamina C' },
  { id: 5, name: 'Amoxicilina' },
];

export default function Search({ isCentered, setIsCentered, selectedMedicine, setSelectedMedicine, searchRadius, setSearchRadius }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(exampleData);
  const [previusMedicine, setPreviusMedicine] = useState(selectedMedicine);

  useEffect(() => {
    setPreviusMedicine(selectedMedicine);
  }, [selectedMedicine]);

  const handleOpen = () => {
    setOpen(true);
    setIsCentered(true);
    setSearchQuery('');
  };

  const handleClose = () => {
    setOpen(false);
    setIsCentered(false);
    setSearchQuery('');
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filteredResults = exampleData.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults(exampleData);
    }
  };

  const handleSelectMedicine = (medicine) => {
    if (previusMedicine?.id === medicine.id) {
      handleClose();
    } else {
      setSelectedMedicine(medicine);
      setPreviusMedicine(medicine);
    }
  };

  useEffect(() => {
    if (selectedMedicine) {
      handleClose();
    }
  }, [selectedMedicine]);

  return (
    <>
      <div
        className={`flex ${isCentered ? 'opacity-0 md:translate-x-4' : 'md:opacity-100 md:translate-x-0'} md:transition-all duration-400`}>

        <div className="w-full max-w-full md:max-w-sm">
          <div className="relative pointer-events-auto">
            <div
              onClick={handleOpen}
              className="text-gray-300 cursor-pointer w-full h-12 px-12 py-2 rounded-lg border border-gray-700 shadow-xl bg-gray-800 hover:border-gray-600 hover:bg-gray-750 text-lg transition-all duration-300"
            >
              {selectedMedicine ? selectedMedicine.name : 'Buscar medicamento'}
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {selectedMedicine && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-gray-700 rounded-full p-1 transition-colors duration-200"
                onClick={() => setSelectedMedicine(null)}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style} className="w-full flex flex-col items-center justify-center p-6 border-none relative">
          <div className="relative w-full max-w-lg">
            {/* Input de búsqueda */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar medicamento"
                value={searchQuery}
                onChange={handleSearch}
                autoFocus
                className="w-full flex-grow h-12 outline-none px-12 py-3 border border-gray-700 shadow-lg bg-gray-800 text-gray-100 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-gray-600 focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 text-lg pointer-events-auto rounded-lg"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 hover:bg-gray-700 rounded-full transition-colors duration-200"
                >
                  <X size={18} className="text-gray-400 hover:text-gray-300" />
                </button>
              )}
            </div>

            {/* Slider de radio de búsqueda */}
            <div className="mt-6 flex flex-col items-center w-full bg-gray-800 p-4 rounded-lg border border-gray-700">
              <span className="text-gray-300 text-sm font-medium mb-3">
                Radio de búsqueda: <span className="text-white font-semibold">{searchRadius} km</span>
              </span>

              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min={MAP_CONFIG.searchRadius}
                  max={10000}
                  step={1000}
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  className="w-full h-2 rounded-lg bg-gray-700 appearance-none cursor-pointer transition-all duration-300 hover:bg-gray-600 focus:outline-none slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${((searchRadius - MAP_CONFIG.searchRadius) / (10000 - MAP_CONFIG.searchRadius)) * 100}%, #374151 ${((searchRadius - MAP_CONFIG.searchRadius) / (10000 - MAP_CONFIG.searchRadius)) * 100}%, #374151 100%)`
                  }}
                />
              </div>

              <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
                <span>{MAP_CONFIG.searchRadius} km</span>
                <span>10 km</span>
              </div>
            </div>

            {/* Lista de resultados */}
            {searchQuery && (
              <div className="absolute left-0 w-full bg-gray-800 border border-gray-700 shadow-2xl mt-2 rounded-lg max-h-60 overflow-y-auto z-10">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div
                      key={result.id}
                      onClick={() => handleSelectMedicine(result)}
                      className={`p-4 ${index !== searchResults.length - 1 ? 'border-b border-gray-700' : ''} hover:bg-gray-700 cursor-pointer transition-all duration-200 flex justify-between items-center group`}
                    >
                      <span className="text-gray-200 font-medium group-hover:text-white">{result.name}</span>
                      <span className="text-sm text-gray-400 group-hover:text-gray-300">({searchRadius} km)</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-400 text-center">No se encontraron resultados</div>
                )}
              </div>
            )}
          </div>
        </Box>
      </Modal>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          background: #059669;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #065f46;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          background: #059669;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </>
  );
}