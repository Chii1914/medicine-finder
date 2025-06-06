import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const MOCK_MEDICATIONS = [
  { id: 1, name: "Paracetamol", image: "https://cdn.aerohealthcare.com/wp-content/uploads/2024/12/HV20G_01_1000px-600x600.png" },
  { id: 2, name: "Ibuprofeno", image: "https://cdn.aerohealthcare.com/wp-content/uploads/2024/12/HV20G_01_1000px-600x600.png" },
  { id: 3, name: "Amoxicilina", image: "https://cdn.aerohealthcare.com/wp-content/uploads/2024/12/HV20G_01_1000px-600x600.png" },
  { id: 4, name: "Aspirina", image: "https://cdn.aerohealthcare.com/wp-content/uploads/2024/12/HV20G_01_1000px-600x600.png" },
  { id: 5, name: "Omeprazol", image: "https://cdn.aerohealthcare.com/wp-content/uploads/2024/12/HV20G_01_1000px-600x600.png" }
];

export default function Medications() {
  const [search, setSearch] = useState("");

  const filteredMedications = MOCK_MEDICATIONS.filter(medication => 
    medication.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-[#c6e6eb] p-6 md:p-8 lg:p-10">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 bg-white shadow-sm rounded-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#19608f]">Medicamentos</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtrar
          </button>
        </div>
      </header>
      
      {/* Grid Content */}
      <main className="flex-1 overflow-auto mt-4 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedications.map(medication => (
            <div key={medication.id} className="p-4 bg-gray-100 rounded-lg shadow hover:bg-gray-200 cursor-pointer transition-all">
              <img src={medication.image} alt={medication.name} className="w-full h-32 object-cover rounded-md" />
              <h3 className="text-lg font-semibold text-gray-900 mt-3">{medication.name}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
