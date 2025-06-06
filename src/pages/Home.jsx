import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()
  {/* Función para manejar la búsqueda avanzada */ }
  const handleAdvancedSearch = () => {
    navigate('/medications')
  }

  return (
    <div className="relative min-h-screen bg-gray-800 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Radar-like pulse animation (Waze inspired) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full border-2 border-blue-400/5 animate-ping"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full border-2 border-purple-400/5 animate-ping animation-delay-1000"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full border-2 border-cyan-400/5 animate-ping animation-delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-xl mx-auto px-6 relative z-10">
        <div className="text-center animate-fade-in space-y-6">
          <h1 className={`font-bold text-5xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
            Medicamentos
          </h1>
          <p className="text-xl text-gray-300 mt-4">
            La salud que usted necesita
          </p>

          <div className="space-y-4">
            <button
              onClick={handleAdvancedSearch}
              className="group bg-blue-900 hover:bg-blue-700 text-white shadow-lg rounded-full px-6 py-3.5 flex items-center gap-3 mx-auto transition-all duration-300"
            >
              <Search className="h-5 w-5" />
              <span className="">Buscar medicamentos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
