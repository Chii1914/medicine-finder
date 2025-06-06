import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { MOCK_MEDICATIONS } from '../mocks/medications'
import { MOCK_PHARMACIES } from '../mocks/pharmacies'

export default function PharmacyFinder() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)

  // Filter medications based on search query
  const filteredMedications = MOCK_MEDICATIONS.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsSearchBoxOpen(false)
        setIsSearching(false)
        setSearchQuery('')
        navigate('/')
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [navigate])

  const handleMedicationSelect = (medicationId) => {
    if (!document.startViewTransition) {
      navigate(`/medication/${medicationId}`)
      return
    }

    document.startViewTransition(() => {
      navigate(`/medication/${medicationId}`)
    })
  }

  // Manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
  }

  // Manejar tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && filteredMedications.length > 0) {
      handleMedicationSelect(filteredMedications[0].id)
    }
  }

  // Manejar clic en el botón de búsqueda
  const handleSearchButtonClick = () => {
    setIsSearchBoxOpen(true)
    setIsSearching(true)
    // Pequeño timeout para enfocar el input después de la animación
    setTimeout(() => {
      const input = document.getElementById('searchInput')
      input?.focus()
      input?.select()
    }, 100)
  }

  const handleAdvancedSearch = () => {
    navigate('/medications')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl mx-auto transition-all duration-300">
        {/* Búsqueda avanzada */}
        {showAdvancedSearch && (
          <div className="relative animate-fade-slide-down mt-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Buscar por características</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleMedicationSelect('top-sellers')}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm">Más vendidos</span>
                  </button>
                  <button
                    onClick={() => handleMedicationSelect('most-prescribed')}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm">Más recetados</span>
                  </button>
                  <button
                    onClick={() => handleMedicationSelect('most-used')}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm">Más usados</span>
                  </button>
                  <button
                    onClick={() => handleMedicationSelect('by-symptoms')}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm">Por síntomas</span>
                  </button>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowAdvancedSearch(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Volver al buscador normal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buscador expandido */}
          <div className="relative animate-fade-slide-down mt-8">
            <input
              id="searchInput"
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border-0 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>

        {/* Resultados de búsqueda */}
        {searchQuery.length > 0 && filteredMedications.length > 0 && (
          <div className="mt-6  bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredMedications.map((medication) => {
                // Encontrar el precio más bajo en las farmacias
                const pharmaciesWithMed = MOCK_PHARMACIES.filter((pharmacy) =>
                  pharmacy.medications.some((m) => m.id === medication.id)
                )
                const lowestPrice = Math.min(
                  ...pharmaciesWithMed.map((pharmacy) =>
                    pharmacy.medications.find((m) => m.id === medication.id)?.price || Infinity
                  )
                )

                return (
                  <div
                    key={medication.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      medication.id === filteredMedications[0].id
                        ? 'bg-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleMedicationSelect(medication.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{medication.name}</h3>
                        <p className="text-sm text-gray-600">{medication.type}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-sm">
                        {pharmaciesWithMed.length} farmacias
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {isSearching && filteredMedications.length === 0 && (
          <div className="mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 text-center text-gray-600">
            No se encontraron medicamentos
          </div>
        )}
      </div>
    </div>
  )
}
