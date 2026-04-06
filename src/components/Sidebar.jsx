import { logout } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { saudacao, formatarData } from '../constants'

const ITENS_NAV = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
      </svg>
    ),
  },
  {
    id: 'lista',
    label: 'Lista de OS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/>
        <circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'fila_os',
    label: 'Fila de OS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>
      </svg>
    ),
  },
  {
    id: 'protocolos_dia',
    label: "Falta d'água",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'minhas_os',
    label: 'Minhas OS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    id: 'logs',
    label: 'Log de Atividades',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

export default function Sidebar({ pagina, setPagina, aberta, setAberta, }) {
  const { usuario, role, podeVer } = useAuth()
  const itensVisiveis = ITENS_NAV.filter(item => podeVer(item.id))

  const sw = aberta ? 'w-56' : 'w-16'

  return (
    <aside className={`${sw} bg-[#0a1020] border-r border-white/5 fixed top-0 left-0 h-full flex flex-col z-20 transition-all duration-300 overflow-hidden`}>

      {/* Logo + toggle */}
      <div className="px-3 py-4 border-b border-white/5 flex items-center justify-between gap-2 min-h-[72px]">
        {aberta && (
          <div className="flex-1 min-w-0">
            <img src="/logo.jpg" alt="Octek" className="h-16 w-auto rounded-xl" />
            <p className="text-[11px] text-slate-500 mt-1 capitalize">{saudacao()}</p>
            <p className="text-[10px] text-slate-600 capitalize leading-tight">{formatarData()}</p>
          </div>
        )}
        <button
          onClick={() => setAberta(v => !v)}
          title={aberta ? 'Recolher menu' : 'Expandir menu'}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            {aberta
              ? <><line x1="18" y1="6" x2="6" y2="6"/><line x1="18" y1="12" x2="6" y2="12"/><line x1="18" y1="18" x2="6" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-0.5">
        {aberta && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 py-2">Menu</p>
        )}
        {itensVisiveis.map(item => (
          <button
            key={item.id}
            onClick={() => setPagina(item.id)}
            title={!aberta ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              aberta ? 'text-left' : 'justify-center'
            } ${
              pagina === item.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <span className={`shrink-0 ${pagina === item.id ? 'text-white' : 'text-slate-500'}`}>{item.icon}</span>
            {aberta && item.label}
          </button>
        ))}
      </nav>

      {/* Usuário e logout */}
      <div className="p-2 border-t border-white/5 space-y-1">
        {/* Botão de perfil */}
        <button
          onClick={() => setPagina('perfil')}
          title={!aberta ? 'Meu perfil' : undefined}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer ${pagina === 'perfil' ? 'bg-white/[0.06]' : ''} ${!aberta ? 'justify-center' : ''}`}
        >
          {usuario.photoURL ? (
            <img src={usuario.photoURL} className="w-8 h-8 rounded-full shrink-0" alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
              {(usuario.displayName || usuario.email || '?')[0].toUpperCase()}
            </div>
          )}
          {aberta && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-medium text-white truncate leading-tight">{usuario.displayName || 'Usuário'}</p>
              <p className="text-[10px] text-slate-500 truncate leading-tight capitalize">{role === 'admin' ? 'Administrador' : role}</p>
            </div>
          )}
        </button>
        <button
          onClick={logout}
          title={!aberta ? 'Sair' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150 ${!aberta ? 'justify-center' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {aberta && 'Sair'}
        </button>
      </div>
    </aside>
  )
}
