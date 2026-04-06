import { useAuth } from '../contexts/AuthContext'

const ATALHOS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    descricao: 'Visão geral das ordens de serviço',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
      </svg>
    ),
    cor: 'indigo',
  },
  {
    id: 'lista',
    label: 'Lista de OS',
    descricao: 'Ordens de serviço abertas e encerradas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/>
        <circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
    cor: 'violet',
  },
  {
    id: 'minhas_os',
    label: 'Minhas OS',
    descricao: 'Ordens de serviço atribuídas a mim',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    cor: 'rose',
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    descricao: 'Dashboard de chamados por período',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
    cor: 'cyan',
  },
  {
    id: 'fila_os',
    label: 'Fila de OS',
    descricao: 'Ordens de serviço abertas com reordenação manual',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <polyline points="3 6 4 7 6 5"/><polyline points="3 12 4 13 6 11"/><polyline points="3 18 4 19 6 17"/>
      </svg>
    ),
    cor: 'amber',
  },
  {
    id: 'protocolos_dia',
    label: "Falta d'água",
    descricao: 'Resumo diário de chamados por bairro',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    cor: 'blue',
  },
  {
    id: 'logs',
    label: 'Log de Atividades',
    descricao: 'Histórico de ações dos usuários',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
      </svg>
    ),
    cor: 'violet',
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    descricao: 'Gestão de usuários, perfis e convites',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    cor: 'emerald',
  },
]

const CORES = {
  indigo:  { card: 'border-indigo-500/20  bg-indigo-500/5  hover:border-indigo-500/40  hover:bg-indigo-500/10',  icon: 'bg-indigo-500/15 text-indigo-400' },
  violet:  { card: 'border-violet-500/20  bg-violet-500/5  hover:border-violet-500/40  hover:bg-violet-500/10',  icon: 'bg-violet-500/15 text-violet-400' },
  cyan:    { card: 'border-cyan-500/20    bg-cyan-500/5    hover:border-cyan-500/40    hover:bg-cyan-500/10',    icon: 'bg-cyan-500/15   text-cyan-400'   },
  emerald: { card: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10', icon: 'bg-emerald-500/15 text-emerald-400' },
  rose:    { card: 'border-rose-500/20    bg-rose-500/5    hover:border-rose-500/40    hover:bg-rose-500/10',    icon: 'bg-rose-500/15   text-rose-400'   },
  blue:    { card: 'border-blue-500/20    bg-blue-500/5    hover:border-blue-500/40    hover:bg-blue-500/10',    icon: 'bg-blue-500/15   text-blue-400'   },
  amber:   { card: 'border-amber-500/20   bg-amber-500/5   hover:border-amber-500/40   hover:bg-amber-500/10',   icon: 'bg-amber-500/15  text-amber-400'  },
}

function saudacaoHora() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Home({ setPagina }) {
  const { usuario, role, podeVer } = useAuth()
  const nome = usuario?.displayName?.split(' ')[0] || 'usuário'
  const atalhos = ATALHOS.filter(a => podeVer(a.id))

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto fade-up">

      {/* Saudação */}
      <div className="mb-10">
        <p className="text-slate-500 text-sm mb-1">{saudacaoHora()},</p>
        <h1 className="text-2xl font-bold text-white capitalize">{nome}</h1>
        <p className="text-slate-500 text-sm mt-1 capitalize">
          {role === 'admin' ? 'Administrador' : role}
        </p>
      </div>

      {/* Atalhos para páginas com acesso */}
      {atalhos.length > 0 ? (
        <>
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-4">Acesso rápido</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {atalhos.map(a => {
              const c = CORES[a.cor]
              return (
                <button
                  key={a.id}
                  onClick={() => setPagina(a.id)}
                  className={`border rounded-2xl p-5 text-left flex items-start gap-4 transition-all duration-150 group ${c.card}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${c.icon}`}>
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-white">{a.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{a.descricao}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-500">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">Nenhuma página disponível</p>
          <p className="text-slate-600 text-xs mt-1">Solicite acesso ao administrador do sistema.</p>
        </div>
      )}
    </div>
  )
}
