import { useState, useEffect, useRef } from 'react'
import { auth, loginComEmail, cadastrar, esqueceuSenha, logout } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

const API = 'https://automacao.octek.com.br/webhook/ordens'
const POR_PAGINA = 20
const INTERVALO_REFRESH = 60 * 1000 // 1 minuto

const CORES_BORDA = [
  'border-l-indigo-500', 'border-l-violet-500', 'border-l-emerald-500',
  'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500',
  'border-l-orange-500', 'border-l-teal-500', 'border-l-blue-500',
]

const BADGE_PALETTES = [
  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', dot: 'bg-indigo-400' },
  { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
]

const PIZZA_CORES = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#14b8a6', '#a855f7', '#ec4899']

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatarData() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function ContadorAnimado({ valor, duracao = 1200 }) {
  const [atual, setAtual] = useState(0)
  useEffect(() => {
    if (!valor) { setAtual(0); return }
    let inicio = null
    const animar = (ts) => {
      if (!inicio) inicio = ts
      const p = Math.min((ts - inicio) / duracao, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setAtual(Math.floor(ease * valor))
      if (p < 1) requestAnimationFrame(animar)
    }
    requestAnimationFrame(animar)
  }, [valor])
  return atual.toLocaleString('pt-BR')
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800/60 rounded-2xl ${className}`} />
}

function ToastContainer({ toasts, onRemover }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-sm font-medium pointer-events-auto
            transition-all duration-300 animate-fade-up
            ${t.tipo === 'abertas'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
        >
          <span className="text-base">{t.tipo === 'abertas' ? '🔔' : '✅'}</span>
          <span>{t.mensagem}</span>
          <button
            onClick={() => onRemover(t.id)}
            className="ml-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >✕</button>
        </div>
      ))}
    </div>
  )
}

function Badge({ status }) {
  if (!status) return null
  const p = BADGE_PALETTES[hashString(status) % BADGE_PALETTES.length]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${p.bg} ${p.text} ${p.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {status}
    </span>
  )
}

function DonutChart({ dados }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const total = dados.reduce((a, d) => a + Number(d.total), 0)

  if (total === 0) return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
      <span className="text-4xl">🎉</span>
      <p className="text-sm">Nenhuma OS aberta no momento!</p>
    </div>
  )

  const cx = 110, cy = 110, ro = 90, ri = 60
  let angulo = -Math.PI / 2

  const fatias = dados.map((d, i) => {
    const qtd = Number(d.total)
    const arco = (qtd / total) * 2 * Math.PI
    const ox1 = cx + ro * Math.cos(angulo)
    const oy1 = cy + ro * Math.sin(angulo)
    const ox2 = cx + ro * Math.cos(angulo + arco)
    const oy2 = cy + ro * Math.sin(angulo + arco)
    const ix1 = cx + ri * Math.cos(angulo + arco)
    const iy1 = cy + ri * Math.sin(angulo + arco)
    const ix2 = cx + ri * Math.cos(angulo)
    const iy2 = cy + ri * Math.sin(angulo)
    const large = arco > Math.PI ? 1 : 0
    const path = `M ${ox1.toFixed(2)} ${oy1.toFixed(2)} A ${ro} ${ro} 0 ${large} 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)} L ${ix1.toFixed(2)} ${iy1.toFixed(2)} A ${ri} ${ri} 0 ${large} 0 ${ix2.toFixed(2)} ${iy2.toFixed(2)} Z`
    angulo += arco
    return { ...d, qtd, path, cor: PIZZA_CORES[i % PIZZA_CORES.length] }
  })

  const hovered = hoveredIndex !== null ? fatias[hoveredIndex] : null

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <svg viewBox="0 0 220 220" className="w-52 h-52 flex-shrink-0">
        {fatias.map((f, i) => (
          <path
            key={i}
            d={f.path}
            fill={f.cor}
            stroke="#0f172a"
            strokeWidth="2"
            opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.35}
            className="cursor-pointer transition-opacity duration-200"
            style={{ animation: `fadeSlice 0.5s ease ${i * 0.07}s both` }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={ri - 2} fill="#0f172a" />
        {hovered ? (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">{hovered.qtd.toLocaleString('pt-BR')}</text>
            <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize="7.5">{(hovered.status || 'Sem status').slice(0, 16)}</text>
            <text x={cx} y={cy + 21} textAnchor="middle" fill={hovered.cor} fontSize="11" fontWeight="700">{Math.round((hovered.qtd / total) * 100)}%</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{total.toLocaleString('pt-BR')}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fill="#64748b" fontSize="9">abertas</text>
          </>
        )}
      </svg>

      <div className="flex flex-col gap-1 w-full">
        {fatias.map((f, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors duration-150 ${hoveredIndex === i ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: f.cor }} />
            <span className="text-sm text-slate-300 flex-1 truncate">{f.status || 'Sem status'}</span>
            <div className="flex items-center gap-2.5">
              <div className="w-16 bg-slate-700/40 rounded-full h-1 overflow-hidden">
                <div className="h-1 rounded-full transition-all duration-700" style={{ width: `${(f.qtd / total) * 100}%`, backgroundColor: f.cor }} />
              </div>
              <span className="text-sm font-semibold text-white w-8 text-right tabular-nums">{f.qtd}</span>
              <span className="text-xs text-slate-500 w-8 text-right tabular-nums">{Math.round((f.qtd / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Dashboard({ onVerLista, onToast }) {
  const [dados, setDados] = useState([])
  const [totais, setTotais] = useState({ total: 0, abertas: 0, encerradas: 0 })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null)
  const abertasAnterior = useRef(null)

  function carregar(primeiro = false) {
    Promise.all([
      fetch(`${API}?acao=grafico`).then(r => r.json()),
      fetch(`${API}?acao=total`).then(r => r.json()),
    ])
      .then(([grafico, total]) => {
        const totalGeral = Number(total[0]?.total || 0)
        const abertas = grafico.reduce((a, d) => a + Number(d.total), 0)

        if (!primeiro && abertasAnterior.current !== null) {
          const diff = abertas - abertasAnterior.current
          if (diff > 0) onToast(`${diff} nova${diff > 1 ? 's' : ''} OS aberta${diff > 1 ? 's' : ''}`, 'abertas')
          else if (diff < 0) onToast(`${Math.abs(diff)} OS encerrada${Math.abs(diff) > 1 ? 's' : ''}`, 'encerradas')
        }
        abertasAnterior.current = abertas

        setDados(grafico)
        setTotais({ total: totalGeral, abertas, encerradas: totalGeral - abertas })
        setUltimaAtualizacao(new Date())
        setCarregando(false)
      })
      .catch(() => { setErro('Erro ao carregar dados.'); setCarregando(false) })
  }

  useEffect(() => {
    carregar(true)
    const intervalo = setInterval(() => carregar(false), INTERVALO_REFRESH)
    return () => clearInterval(intervalo)
  }, [])

  if (carregando) return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-80" />
    </div>
  )

  if (erro) return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
        <span className="text-xl">⚠️</span> {erro}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-widest">Total</p>
          <p className="text-3xl font-bold text-white tabular-nums"><ContadorAnimado valor={totais.total} /></p>
          <span className="absolute bottom-3 right-4 text-3xl opacity-10 select-none">📋</span>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-500/3 border border-amber-500/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-amber-600/80 mb-2 uppercase tracking-widest">Abertas</p>
          <p className="text-3xl font-bold text-amber-400 tabular-nums"><ContadorAnimado valor={totais.abertas} /></p>
          <span className="absolute bottom-3 right-4 text-3xl opacity-20 select-none">🔓</span>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/3 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-emerald-600/80 mb-2 uppercase tracking-widest">Encerradas</p>
          <p className="text-3xl font-bold text-emerald-400 tabular-nums"><ContadorAnimado valor={totais.encerradas} /></p>
          <span className="absolute bottom-3 right-4 text-3xl opacity-20 select-none">✅</span>
        </div>
      </div>

      {/* Gráfico donut */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-semibold text-white text-base">OS Abertas por Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Passe o mouse sobre as fatias para detalhes</p>
          </div>
          {ultimaAtualizacao && (
            <span className="text-[11px] text-slate-600">
              Atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <DonutChart dados={dados} />
      </div>

      <button
        onClick={onVerLista}
        className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 border border-slate-700/40 px-4 py-3 rounded-2xl hover:bg-slate-800/50 hover:text-white transition-all duration-200"
      >
        Ver lista completa de ordens <span>→</span>
      </button>
    </div>
  )
}

function CartaoOS({ os, index }) {
  const [aberto, setAberto] = useState(false)
  const corBorda = CORES_BORDA[index % CORES_BORDA.length]
  const fotos = [os.foto_01, os.foto_02, os.foto_03, os.foto_04, os.foto_05].filter(Boolean)

  return (
    <div
      className={`bg-slate-800/50 border border-slate-700/40 border-l-4 ${corBorda} rounded-2xl overflow-hidden hover:bg-slate-800/70 hover:border-slate-600/60 transition-all duration-200 cursor-pointer`}
      onClick={() => setAberto(!aberto)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-700/60 px-2.5 py-0.5 rounded-lg">#{os.numero}</span>
            {os.status && <Badge status={os.status} />}
          </div>
          <span className={`text-slate-500 text-sm flex-shrink-0 transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`}>▾</span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-2">
          {os.descricao || <span className="text-slate-500 italic text-xs">Sem descrição</span>}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>📅 {os.data_abertura}</span>
          {os.encerrado === 's' && os.data_encerramento && (
            <span className="text-emerald-500">✓ {os.data_encerramento}</span>
          )}
          {fotos.length > 0 && (
            <span>🖼 {fotos.length} foto{fotos.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${aberto ? 'max-h-96' : 'max-h-0'}`}>
        <div className="border-t border-slate-700/40 bg-slate-900/40 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Abertura</p>
              <p className="text-slate-200 font-medium">{os.data_abertura || '—'}</p>
            </div>
            {os.encerrado === 's' && os.data_encerramento && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Encerramento</p>
                <p className="text-slate-200 font-medium">{os.data_encerramento}</p>
              </div>
            )}
          </div>

          {os.observacao && (
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Observação</p>
              <p className="text-slate-300 text-sm bg-slate-800/70 rounded-xl p-3 border border-slate-700/40 leading-relaxed">{os.observacao}</p>
            </div>
          )}

          {fotos.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Fotos</p>
              <div className="flex gap-2 flex-wrap">
                {fotos.map((f, i) => (
                  <a key={i} href={f} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                    onClick={e => e.stopPropagation()}>
                    Foto {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {os.arquivo_pdf && (
            <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-2.5">
              <span>📄</span>
              <span>{os.arquivo_pdf}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Lista() {
  const [ordens, setOrdens] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const totalPaginas = Math.ceil(total / POR_PAGINA)

  function buscarOrdens(pag) {
    setCarregando(true)
    fetch(`${API}?acao=fallback&limit=${POR_PAGINA}&offset=${pag * POR_PAGINA}`)
      .then(r => r.json())
      .then(dados => { setOrdens(dados); setCarregando(false) })
      .catch(() => { setErro('Erro ao carregar ordens.'); setCarregando(false) })
  }

  useEffect(() => {
    fetch(`${API}?acao=total`)
      .then(r => r.json())
      .then(dados => setTotal(dados[0]?.total || 0))
      .catch(() => {})
    buscarOrdens(0)
    const intervalo = setInterval(() => buscarOrdens(pagina), INTERVALO_REFRESH)
    return () => clearInterval(intervalo)
  }, [])

  function mudarPagina(novaPag) {
    if (novaPag < 0 || novaPag >= totalPaginas) return
    setPagina(novaPag)
    buscarOrdens(novaPag)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const statusDisponiveis = [...new Set(ordens.map(os => os.status).filter(Boolean))]

  const filtradas = ordens.filter(os => {
    const matchBusca = !busca || os.numero?.toString().includes(busca) || os.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || os.status === filtroStatus
    return matchBusca && matchStatus
  })

  const encerradas = ordens.filter(o => o.encerrado === 's').length
  const abertas = ordens.filter(o => o.encerrado !== 's').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-widest">Total</p>
          <p className="text-2xl font-bold text-white tabular-nums">{total.toLocaleString('pt-BR')}</p>
          <span className="absolute bottom-3 right-4 text-2xl opacity-10 select-none">📋</span>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-emerald-600/80 mb-2 uppercase tracking-widest">Encerradas</p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{encerradas}</p>
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-600">nesta pág.</span>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-5">
          <p className="text-[11px] font-semibold text-amber-600/80 mb-2 uppercase tracking-widest">Abertas</p>
          <p className="text-2xl font-bold text-amber-400 tabular-nums">{abertas}</p>
          <span className="absolute bottom-2 right-3 text-[10px] text-slate-600">nesta pág.</span>
        </div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 relative min-w-48">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por número ou descrição..."
            className="w-full bg-slate-800/50 border border-slate-700/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
        >
          <option value="todos">Todos os status</option>
          {statusDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {carregando && (
        <div className="flex flex-col gap-2.5">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      )}

      {erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span> {erro}
        </div>
      )}

      {!carregando && !erro && (
        <>
          <p className="text-slate-600 text-xs mb-3 px-1">{filtradas.length} ordem(ns) nesta página</p>

          {filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <span className="text-4xl">🔎</span>
              <p className="text-sm">Nenhuma ordem encontrada para este filtro.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 mb-8">
              {filtradas.map((os, i) => <CartaoOS key={os.codigo} os={os} index={i} />)}
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-2xl px-4 py-3">
            <button onClick={() => mudarPagina(pagina - 1)} disabled={pagina === 0}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1">
              ← Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(0, Math.min(pagina - 2, totalPaginas - 5)) + i
                return (
                  <button key={p} onClick={() => mudarPagina(p)}
                    className={`w-8 h-8 text-xs rounded-xl transition-all ${p === pagina ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                    {p + 1}
                  </button>
                )
              })}
              {totalPaginas > 5 && pagina < totalPaginas - 3 && (
                <>
                  <span className="text-slate-600 text-xs px-1">...</span>
                  <button onClick={() => mudarPagina(totalPaginas - 1)}
                    className="w-8 h-8 text-xs rounded-xl text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>
            <button onClick={() => mudarPagina(pagina + 1)} disabled={pagina >= totalPaginas - 1}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1">
              Próxima →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function TelaLogin() {
  const [tela, setTela] = useState('login') // 'login' | 'cadastro' | 'esqueci'
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })

  function atualizar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  function trocarTela(nova) {
    setTela(nova)
    setErro('')
    setSucesso('')
  }

  async function entrar(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      await loginComEmail(form.email, form.senha)
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
      }
      setErro(msgs[err.code] || 'Erro ao fazer login. Tente novamente.')
      setCarregando(false)
    }
  }

  async function registrar(e) {
    e.preventDefault()
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setCarregando(true)
    setErro('')
    try {
      await cadastrar(form.nome, form.email, form.senha)
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca.',
      }
      setErro(msgs[err.code] || 'Erro ao criar conta. Tente novamente.')
      setCarregando(false)
    }
  }

  async function recuperar(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      await esqueceuSenha(form.email)
      setSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setCarregando(false)
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      setErro(msgs[err.code] || 'Erro ao enviar e-mail. Tente novamente.')
      setCarregando(false)
    }
  }

  const titulos = {
    login: { titulo: 'Bem-vindo de volta', sub: 'Entre com sua conta' },
    cadastro: { titulo: 'Criar conta', sub: 'Preencha os dados para se cadastrar' },
    esqueci: { titulo: 'Recuperar senha', sub: 'Enviaremos um link para seu e-mail' },
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 text-3xl mx-auto mb-5">
            🗂
          </div>
          <h1 className="text-xl font-bold text-white">{titulos[tela].titulo}</h1>
          <p className="text-slate-500 text-sm mt-1.5">{titulos[tela].sub}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6">

          {/* LOGIN */}
          {tela === 'login' && (
            <form onSubmit={entrar} className="flex flex-col gap-3">
              <input
                name="email" type="email" placeholder="E-mail" required
                value={form.email} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <input
                name="senha" type="password" placeholder="Senha" required
                value={form.senha} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              <button type="submit" disabled={carregando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
              <button type="button" onClick={() => trocarTela('esqueci')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-center mt-1">
                Esqueci minha senha
              </button>
            </form>
          )}

          {/* CADASTRO */}
          {tela === 'cadastro' && (
            <form onSubmit={registrar} className="flex flex-col gap-3">
              <input
                name="nome" type="text" placeholder="Nome completo" required
                value={form.nome} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <input
                name="email" type="email" placeholder="E-mail" required
                value={form.email} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <input
                name="senha" type="password" placeholder="Senha (mín. 6 caracteres)" required
                value={form.senha} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              <input
                name="confirmar" type="password" placeholder="Confirmar senha" required
                value={form.confirmar} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              <button type="submit" disabled={carregando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {carregando ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          {/* ESQUECI SENHA */}
          {tela === 'esqueci' && (
            <form onSubmit={recuperar} className="flex flex-col gap-3">
              <input
                name="email" type="email" placeholder="Seu e-mail" required
                value={form.email} onChange={atualizar}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
              />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              {sucesso && <p className="text-emerald-400 text-xs">{sucesso}</p>}
              {!sucesso && (
                <button type="submit" disabled={carregando}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                  {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              )}
            </form>
          )}
        </div>

        {/* Links de navegação */}
        <div className="flex items-center justify-center gap-1 mt-5 text-xs text-slate-600">
          {tela === 'login' && (
            <>
              <span>Não tem conta?</span>
              <button onClick={() => trocarTela('cadastro')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Cadastre-se</button>
            </>
          )}
          {tela !== 'login' && (
            <>
              <span>Já tem conta?</span>
              <button onClick={() => trocarTela('login')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Entrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [usuario, setUsuario] = useState(undefined)
  const [pagina, setPagina] = useState('dashboard')
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user)
    })
    return unsubscribe
  }, [])

  function adicionarToast(mensagem, tipo) {
    const id = Date.now()
    setToasts(t => [...t, { id, mensagem, tipo }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000)
  }

  function removerToast(id) {
    setToasts(t => t.filter(x => x.id !== id))
  }

  // Carregando estado inicial do auth
  if (usuario === undefined) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!usuario) return <TelaLogin />

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900/80 border-b border-slate-800/60 px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-base">
              🗂
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">Ordens de Serviço</h1>
              <p className="text-[11px] text-slate-500 capitalize leading-tight mt-0.5">{saudacao()} · {formatarData()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/40">
              <button
                onClick={() => setPagina('dashboard')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${pagina === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setPagina('lista')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium ${pagina === 'lista' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Lista
              </button>
            </div>
            <button
              onClick={logout}
              title={`Sair (${usuario.email})`}
              className="flex items-center gap-2 text-xs text-slate-400 border border-slate-700/40 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
            >
              {usuario.photoURL && (
                <img src={usuario.photoURL} className="w-4 h-4 rounded-full" alt="" />
              )}
              Sair
            </button>
          </div>
        </div>
      </div>

      {pagina === 'dashboard' ? <Dashboard onVerLista={() => setPagina('lista')} onToast={adicionarToast} /> : <Lista />}

      <ToastContainer toasts={toasts} onRemover={removerToast} />
    </div>
  )
}

export default App
