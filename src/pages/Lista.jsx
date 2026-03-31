import { useState, useEffect } from 'react'
import { API, POR_PAGINA, INTERVALO_REFRESH } from '../constants'
import CartaoOS from '../components/CartaoOS'
import Skeleton from '../components/Skeleton'

export default function Lista() {
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
        <div className="relative overflow-hidden bg-white/[0.05] border border-white/8 rounded-2xl p-5">
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
            className="w-full bg-white/[0.05] border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.07] transition-all"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="bg-white/[0.05] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-all"
        >
          <option value="todos">Todos os status</option>
          {statusDisponiveis.map(s => <option key={s} value={s} className="bg-[#111827] text-slate-200">{s}</option>)}
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

          <div className="flex items-center justify-between bg-white/[0.04] border border-white/8 rounded-2xl px-4 py-3">
            <button onClick={() => mudarPagina(pagina - 1)} disabled={pagina === 0}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors px-2 py-1">
              ← Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(0, Math.min(pagina - 2, totalPaginas - 5)) + i
                return (
                  <button key={p} onClick={() => mudarPagina(p)}
                    className={`w-8 h-8 text-xs rounded-xl transition-all ${p === pagina ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                    {p + 1}
                  </button>
                )
              })}
              {totalPaginas > 5 && pagina < totalPaginas - 3 && (
                <>
                  <span className="text-slate-600 text-xs px-1">...</span>
                  <button onClick={() => mudarPagina(totalPaginas - 1)}
                    className="w-8 h-8 text-xs rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all">
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
