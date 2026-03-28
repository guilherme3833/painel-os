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

export const ROLES = {
  admin: { label: 'Administrador', cor: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  tecnico: { label: 'Técnico', cor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  visualizador: { label: 'Visualizador', cor: 'text-slate-400 bg-white/5 border-white/10' },
}

// Quais páginas cada role pode acessar
export const PERMISSOES = {
  admin: ['dashboard', 'lista', 'usuarios'],
  tecnico: ['dashboard', 'lista'],
  visualizador: ['dashboard'],
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
