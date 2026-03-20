import { useState, useEffect } from 'react'

const API = 'https://automacao.octek.com.br/webhook/ordens'
const POR_PAGINA = 20

const STATUS = {
  1: { label: 'Aberta', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  2: { label: 'Encerrada', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  3: { label: 'Em andamento', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
}

const CORES_TIPO = [
  'border-l-blue-500', 'border-l-purple-500', 'border-l-emerald-500',
  'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500',
  'border-l-orange-500', 'border-l-teal-500', 'border-l-indigo-500',
]

const GRAFICO_CORES = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
]

function Badge({ status }) {
  const s = STATUS[status] || { label: 'Outro', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function CartaoOS({ os, index }) {
  const [aberto, setAberto] = useState(false)
  const corBorda = CORES_TIPO[index % CORES_TIPO.length]

  return (
    <div
      className={`bg-slate-800/80 border border-slate-700 border-l-4 ${corBorda} rounded-xl overflow-hidden hover:border-slate-600 transition-all duration-200 cursor-pointer`}
      onClick={() => setAberto(!aberto)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-white bg-slate-700 px-2.5 py-0.5 rounded-md">#{os.numero}</span>
            <Badge status={os.id_status} />
            {os.tipo_descricao && (
              <span className="text-xs text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-full border border-slate-600">
                {os.tipo_descricao}
              </span>
            )}
          </div>
          <span className={`text-slate-500 text-sm transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}>▾</span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-2">
          {os.descricao || <span className="text-slate-500 italic">Sem descrição</span>}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">📅 {os.data_abertura}</span>
          {os.tempo_atendim && <span className="flex items-center gap-1">⏱ {parseFloat(os.tempo_atendim).toFixed(0)}h</span>}
          {os.tipo_prioridade && (
            <span className="flex items-center gap-1 text-amber-500">★ P{os.tipo_prioridade}</span>
          )}
          {os.encerrado === 's' && os.data_encerramento && (
            <span className="flex items-center gap-1 text-emerald-500">✓ {os.data_encerramento}</span>
          )}
        </div>
      </div>

      {aberto && (
        <div className="border-t border-slate-700 bg-slate-900/50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-500 text-xs mb-1">Abertura</p>
              <p className="text-slate-200">{os.data_abertura} <span className="text-slate-400">{os.hora_abertura}</span></p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Encerramento</p>
              <p className="text-slate-200">{os.data_encerramento || <span className="text-slate-500">—</span>} <span className="text-slate-400">{os.hora_encerramento || ''}</span></p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Tipo</p>
              <p className="text-slate-200">{os.tipo_descricao || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Tempo de atendimento</p>
              <p className="text-slate-200">{os.tempo_atendim ? parseFloat(os.tempo_atendim).toFixed(2) + 'h' : '—'}</p>
            </div>
          </div>
          {os.texto_solucao && (
            <div className="mb-3">
              <p className="text-slate-500 text-xs mb-1">Solução</p>
              <p className="text-slate-300 text-sm bg-slate-800 rounded-lg p-3 border border-slate-700">{os.texto_solucao}</p>
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
  const tipos = {}
  ordens.forEach(os => {
    const tipo = os.tipo_descricao || 'Sem tipo'
    tipos[tipo] = (tipos[tipo] || 0) + 1
  })
  const top = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const max = top[0]?.[1] || 1
  const totalGrafico = top.reduce((a, [, v]) => a + v, 0)

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-white">Distribuição por tipo</h2>
          <p className="text-xs text-slate-500 mt-0.5">Página atual · {totalGrafico} ordens</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {top.map(([tipo, qtd], i) => (
          <div key={tipo} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${GRAFICO_CORES[i]}`} />
            <span className="text-xs text-slate-400 w-40 truncate">{tipo}</span>
            <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${GRAFICO_CORES[i]} transition-all duration-500`}
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
    buscarOrdens(0)
  }, [])

  function mudarPagina(novaPag) {
    if (novaPag < 0 || novaPag >= totalPaginas) return
    setPagina(novaPag)
    buscarOrdens(novaPag)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtradas = ordens.filter(os => {
    const matchBusca = !busca || os.numero?.toString().includes(busca) || os.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || os.id_status?.toString() === filtroStatus
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
            <p className="text-xs text-emerald-600 mb-1">Encerradas</p>
            <p className="text-2xl font-medium text-emerald-400">{encerradas}</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-600 mb-1">Abertas</p>
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
            <option value="1">Aberta</option>
            <option value="2">Encerrada</option>
            <option value="3">Em andamento</option>
          </select>
        </div>

        {/* Estado de carregamento */}
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

            <div className="flex flex-col gap-3 mb-8">
              {filtradas.map((os, i) => <CartaoOS key={os.codigo} os={os} index={i} />)}
            </div>

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
                {totalPaginas > 5 && <span className="text-slate-600 text-xs px-1">...</span>}
                {totalPaginas > 5 && (
                  <button
                    onClick={() => mudarPagina(totalPaginas - 1)}
                    className={`w-8 h-8 text-xs rounded-lg transition ${pagina === totalPaginas - 1 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
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