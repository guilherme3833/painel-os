import { logout } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { PERMISSOES, ROLES, saudacao, formatarData } from '../constants'

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

export default function Sidebar({ pagina, setPagina, aberta, setAberta }) {
  const { usuario, role } = useAuth()
  const paginasPermitidas = PERMISSOES[role] || []
  const itensVisiveis = ITENS_NAV.filter(item => paginasPermitidas.includes(item.id))

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
        {aberta ? (
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            {usuario.photoURL ? (
              <img src={usuario.photoURL} className="w-8 h-8 rounded-full shrink-0" alt="" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                {(usuario.displayName || usuario.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate leading-tight">{usuario.displayName || 'Usuário'}</p>
              <p className="text-[10px] truncate leading-tight">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${ROLES[role]?.cor || ''}`}>
                  {ROLES[role]?.label || role}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            {usuario.photoURL ? (
              <img src={usuario.photoURL} className="w-8 h-8 rounded-full" alt="" title={usuario.email} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold" title={usuario.email}>
                {(usuario.displayName || usuario.email || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
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
