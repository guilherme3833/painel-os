export const API = 'https://automacao.octek.com.br/webhook/ordens'
export const POR_PAGINA = 20
export const INTERVALO_REFRESH = 60 * 1000

export const CORES_BORDA = [
  'border-l-indigo-500', 'border-l-violet-500', 'border-l-emerald-500',
  'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500',
  'border-l-orange-500', 'border-l-teal-500', 'border-l-blue-500',
]

export const BADGE_PALETTES = [
  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
]

export const PIZZA_CORES = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#f43f5e', '#3b82f6', '#14b8a6', '#a855f7', '#ec4899',
]

// Perfil especial fixo — sempre tem acesso total
export const ROLE_ADMIN_ID = 'admin'

// Definição de todas as telas e ações disponíveis no sistema
export const PAGINAS_CONFIG = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    descricao: 'Visão geral e gráficos de OS',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
    ],
  },
  {
    id: 'lista',
    label: 'Lista de OS',
    descricao: 'Listagem completa das ordens de serviço',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
    ],
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    descricao: 'Dashboard de chamados e protocolos',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
    ],
  },
  {
    id: 'fila_os',
    label: 'Fila de OS',
    descricao: 'Fila de ordens de serviço abertas com reordenação manual',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
      { id: 'reordenar', label: 'Reordenar' },
      { id: 'atribuir', label: 'Atribuir OS' },
      { id: 'aceitar_atribuicao', label: 'Receber atribuições' },
    ],
  },
  {
    id: 'minhas_os',
    label: 'Minhas OS',
    descricao: 'Ordens de serviço atribuídas ao usuário logado',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
    ],
  },
  {
    id: 'protocolos_dia',
    label: 'Chamados do dia',
    descricao: 'Resumo diário de chamados por bairro',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
      { id: 'configurar', label: 'Configurar tipos' },
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    descricao: 'Gerenciar usuários e perfis de acesso',
    acoes: [
      { id: 'ver', label: 'Visualizar' },
      { id: 'editar', label: 'Editar (roles, perfis, convites)' },
    ],
  },
]

// Permissões padrão para novos perfis (tudo bloqueado)
export const PERMISSOES_PADRAO = Object.fromEntries(
  PAGINAS_CONFIG.map(p => [p.id, Object.fromEntries(p.acoes.map(a => [a.id, false]))])
)

// Permissões completas (admin)
export const PERMISSOES_ADMIN = Object.fromEntries(
  PAGINAS_CONFIG.map(p => [p.id, Object.fromEntries(p.acoes.map(a => [a.id, true]))])
)

export const COR_OPTIONS = [
  { id: 'indigo', label: 'Índigo', cls: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'violet', label: 'Violeta', cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { id: 'emerald', label: 'Verde', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'amber', label: 'Âmbar', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'rose', label: 'Rosa', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'cyan', label: 'Ciano', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'slate', label: 'Cinza', cls: 'text-slate-400 bg-white/5 border-white/10' },
]

export function corDoPerfil(cor) {
  return COR_OPTIONS.find(c => c.id === cor)?.cls || COR_OPTIONS[6].cls
}

export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

export function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function formatarData() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
