import { useState, useEffect } from 'react'

const API = 'https://automacao.octek.com.br/webhook/ordens'
const POR_PAGINA = 20

const CORES_BORDA = [
  'border-l-blue-500', 'border-l-purple-500', 'border-l-emerald-500',
  'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500',
  'border-l-orange-500', 'border-l-teal-500', 'border-l-indigo-500',
]

const BADGE_PALETTES = [
  { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function Badge({ status }) {
  if (!status) return null
  const palette = BADGE_PALETTES[hashString(status) % BADGE_PALETTES.length]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${palette.bg} ${palette.text} ${palette.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${palette.dot}`} />
      {status}
    </span>
  )
}

function CartaoOS({ os, index }) {
  const [aberto, setAberto] = useState(false)
  const corBorda = CORES_BORDA[index % CORES_BORDA.length]
  const fotos = [os.foto_01, os.foto_02, os.foto_03, os.foto_04, os.foto_05].filter(Boolean)

  return (
    <div
      className={`bg-slate-800/80 border border-slate-700 border-l-4 ${corBorda} rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 cursor-pointer`}
      onClick={() => setAberto(!aberto)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-white bg-slate-700 px-2.5 py-0.5 rounded-md">#{os.numero}</span>
            {os.status && <Badge status={os.status} />}
          </div>
          <span className={`text-slate-500 text-sm transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>▾</span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-2">
          {os.descricao || <span className="text-slate-500 italic">Sem descrição</span>}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">📅 {os.data_abertura}</span>
          {os.encerrado === 's' && os.data_encerramento && (
            <span className="flex items-center gap-1 text-emerald-500">✓ {os.data_encerramento}</span>
          )}
          {fotos.length > 0 && (
            <span className="flex items-center gap-1">🖼 {fotos.length} foto{fotos.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {aberto && (
        <div className="border-t border-slate-700 bg-slate-900/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Abertura</p>
              <p className="text-slate-200">{os.data_abertura || '—'}</p>
            </div>
            {os.encerrado === 's' && os.data_encerramento && (
              <div>
                <p className="text-slate-500 text-xs mb-1">Encerramento</p>
                <p className="text-slate-200">{os.data_encerramento}</p>
              </div>
            )}
          </div>

          {os.observacao && (
            <div className="mb-3">
              <p className="text-slate-500 text-xs mb-1">Observação</p>
              <p className="text-slate-300 text-sm bg-slate-800 rounded-lg p-3 border border-slate-700">{os.observacao}</p>
            </div>
          )}

          {fotos.length > 0 && (
            <div className="mb-3">
              <p className="text-slate-500 text-xs mb-2">Fotos</p>
              <div className="flex gap-2 flex-wrap">
                {fotos.map((f, i) => (
                  <a
                    key={i}
                    href={f}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 text-xs underline hover:text-blue-300"
                    onClick={e => e.stopPropagation()}
                  >
                    Foto {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {os.arquivo_pdf && (
            <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
              <span>📄</span>
              <span>{os.arquivo_pdf}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Grafico({ ordens }) {
  const contagem = {}
  ordens.forEach(os => {
    const s = os.status || 'Sem status'
    contagem[s] = (contagem[s] || 0) + 1
  })
  const top = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = top[0]?.[1] || 1
  const totalGrafico = top.reduce((a, [, v]) => a + v, 0)
  const CORES = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-white">Distribuição por status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Página atual · {totalGrafico} ordens</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {top.map(([status, qtd], i) => (
          <div key={status} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CORES[i]}`} />
            <span className="text-xs text-slate-400 w-40 truncate">{status}</span>
            <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${CORES[i]} transition-all duration-500`}
                style={{ width: `${(qtd / max) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-2 w-16 justify-end">
              <span className="text-xs text-slate-400">{qtd}</span>
              <span className="text-xs text-slate-600">{Math.round((qtd / totalGrafico) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
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
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">🗂</div>
            <div>
              <h1 className="text-sm font-medium text-white">Ordens de Serviço</h1>
              <p className="text-slate-500 text-xs">{total.toLocaleString()} registros · Pág. {pagina + 1}/{totalPaginas}</p>
            </div>
          </div>
          <button
            onClick={() => buscarOrdens(pagina)}
            className="flex items-center gap-2 text-xs border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total no banco</p>
            <p className="text-2xl font-medium text-white">{total.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-600 mb-1">Encerradas (pág.)</p>
            <p className="text-2xl font-medium text-emerald-400">{encerradas}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-600 mb-1">Abertas (pág.)</p>
            <p className="text-2xl font-medium text-amber-400">{abertas}</p>
          </div>
        </div>

        {/* Gráfico */}
        {!carregando && ordens.length > 0 && <Grafico ordens={ordens} />}

        {/* Filtros */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar número ou descrição..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="todos">Todos os status</option>
            {statusDisponiveis.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Carregando */}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Carregando ordens...</p>
          </div>
        )}

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{erro}</div>
        )}

        {!carregando && !erro && (
          <>
            <p className="text-slate-600 text-xs mb-3">{filtradas.length} ordem(ns) nesta página</p>

            {filtradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
                <span className="text-3xl">🔎</span>
                <p className="text-sm">Nenhuma ordem encontrada para este filtro.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-8">
                {filtradas.map((os, i) => <CartaoOS key={os.codigo} os={os} index={i} />)}
              </div>
            )}

            {/* Paginação */}
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3">
              <button
                onClick={() => mudarPagina(pagina - 1)}
                disabled={pagina === 0}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  const p = Math.max(0, Math.min(pagina - 2, totalPaginas - 5)) + i
                  return (
                    <button
                      key={p}
                      onClick={() => mudarPagina(p)}
                      className={`w-8 h-8 text-xs rounded-lg transition ${p === pagina ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                      {p + 1}
                    </button>
                  )
                })}
                {totalPaginas > 5 && pagina < totalPaginas - 3 && (
                  <span className="text-slate-600 text-xs px-1">...</span>
                )}
                {totalPaginas > 5 && pagina < totalPaginas - 3 && (
                  <button
                    onClick={() => mudarPagina(totalPaginas - 1)}
                    className="w-8 h-8 text-xs rounded-lg transition text-slate-400 hover:bg-slate-700 hover:text-white"
                  >
                    {totalPaginas}
                  </button>
                )}
              </div>

              <button
                onClick={() => mudarPagina(pagina + 1)}
                disabled={pagina >= totalPaginas - 1}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Próxima →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
