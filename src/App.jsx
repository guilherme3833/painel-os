import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Lista from './pages/Lista'
import Usuarios from './pages/Usuarios'
import Perfil from './pages/Perfil'
import Protocolos from './pages/Protocolos'
import ProtocolosDia from './pages/ProtocolosDia'
import FilaOS from './pages/FilaOS'
import MinhasOS from './pages/MinhasOS'

function Painel() {
  const { usuario } = useAuth()
  const [pagina, setPagina] = useState('home')
  const [toasts, setToasts] = useState([])
  const [sidebarAberta, setSidebarAberta] = useState(true)

  useEffect(() => {
    setPagina('home')
    setToasts([])
  }, [usuario?.uid])

  if (usuario === undefined) return (
    <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!usuario) return <Login />

  function adicionarToast(mensagem, tipo) {
    const id = Date.now()
    setToasts(t => [...t, { id, mensagem, tipo }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }

  function removerToast(id) {
    setToasts(t => t.filter(x => x.id !== id))
  }

  const ml = sidebarAberta ? 'ml-56' : 'ml-16'

  const paginas = {
    home: <Home setPagina={setPagina} />,
    dashboard: <Dashboard onVerLista={() => setPagina('lista')} onToast={adicionarToast} />,
    lista: <Lista />,
    protocolos: <Protocolos />,
    protocolos_dia: <ProtocolosDia />,
    fila_os: <FilaOS />,
    minhas_os: <MinhasOS />,
    usuarios: <Usuarios />,
    perfil: <Perfil />,
  }

  return (
    <div className="flex min-h-screen bg-[#0f1623] text-white">
      <Sidebar
        pagina={pagina}
        setPagina={setPagina}
        aberta={sidebarAberta}
        setAberta={setSidebarAberta}
      />
      <main className={`${ml} flex-1 min-w-0 transition-all duration-300`}>
        {paginas[pagina] || paginas.home}
      </main>
      <Toast toasts={toasts} onRemover={removerToast} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Painel />
    </AuthProvider>
  )
}
