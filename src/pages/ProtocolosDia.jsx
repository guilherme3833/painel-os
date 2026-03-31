import { useState, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { buscarConfigFaltaAgua, salvarConfigFaltaAgua } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const API_DIA   = 'https://automacao.octek.com.br/webhook/chamados/dia'
const API_TIPOS = 'https://automacao.octek.com.br/webhook/chamados/tipos'

const PRESETS = [
  { id: 'hoje',   label: 'Hoje' },
  { id: 'ontem',  label: 'Ontem' },
  { id: '7d',     label: '7 dias' },
]

const REFRESH_OPTIONS = [
  { id: 0,   label: 'Manual' },
  { id: 30,  label: '30s' },
  { id: 60,  label: '1 min' },
  { id: 300, label: '5 min' },
]

function dataLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hoje()       { return dataLocal() }
function diasAtras(n) { const d = new Date(); d.setDate(d.getDate() - n); return dataLocal(d) }

function rangeDoPreset(preset) {
  switch (preset) {
    case 'hoje':  return { inicio: hoje(), fim: hoje() }
    case 'ontem': return { inicio: diasAtras(1), fim: diasAtras(1) }
    case '7d':    return { inicio: diasAtras(6), fim: hoje() }
    default:      return { inicio: hoje(), fim: hoje() }
  }
}

function formatarDataTooltip(iso) {
  if (!iso) return ''
  const [y, mm, dd] = iso.split('-')
  const data = new Date(Number(y), Number(mm) - 1, Number(dd))
  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' })
  return `${dd}/${mm}/${y} · ${diaSemana}`
}

function formatarDataEixo(iso) {
  if (!iso) return ''
  const [y, mm, dd] = iso.split('-')
  const data = new Date(Number(y), Number(mm) - 1, Number(dd))
  const sem = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return `${dd}/${mm}\n${sem}`
}

// ── Gráfico de barras ──────────────────────────────────────────────────────────
function GraficoBarras({ dados }) {
  if (!dados?.length) return (
    <div className="flex items-center justify-center h-full text-slate-600 text-sm">Sem dados no período</div>
  )

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 12, right: 12, bottom: 36, left: 36, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#141c2e',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params) => {
        const label = formatarDataTooltip(params[0]?.axisValue)
        const linhas = params.map(p =>
          `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>${p.value}</b>`
        ).join('<br/>')
        return `<div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${label}</div>${linhas}`
      },
    },
    xAxis: {
      type: 'category',
      data: dados.map(d => d.dia),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 10,
        formatter: formatarDataEixo,
        lineHeight: 14,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      minInterval: 1,
    },
    series: [
      {
        name: 'Total',
        type: 'bar',
        data: dados.map(d => d.total),
        barMaxWidth: 32,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99,102,241,0.7)' },
              { offset: 1, color: 'rgba(99,102,241,0.15)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Encerrados',
        type: 'bar',
        data: dados.map(d => d.encerrados),
        barMaxWidth: 32,
        itemStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#818cf8' },
              { offset: 1, color: '#4f46e5' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
}

// ── Card de número ─────────────────────────────────────────────────────────────
function Card({ label, valor, sub, cor = 'indigo', destaque }) {
  const cores = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400' }
  return (
    <div className={`bg-white/[0.04] border rounded-2xl p-5 flex flex-col gap-1 ${destaque ? 'border-indigo-500/30' : 'border-white/[0.08]'}`}>
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
      <p className={`text-3xl font-bold ${cores[cor]}`}>{valor ?? '—'}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function Skeleton({ h = 'h-40' }) {
  return <div className={`${h} animate-pulse bg-white/[0.03] rounded-xl`} />
}

// ── Modal de configuração ──────────────────────────────────────────────────────
function ModalConfig({ onFechar, onSalvar }) {
  const [tipos, setTipos] = useState([])
  const [selecionados, setSelecionados] = useState(new Set())
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const [resTipos, config] = await Promise.all([
          fetch(API_TIPOS).then(r => r.json()),
          buscarConfigFaltaAgua(),
        ])
        const lista = Array.isArray(resTipos) ? resTipos : []
        setTipos(lista)
        setSelecionados(new Set((config.ids || []).map(Number)))
      } catch (e) {
        setErro('Erro ao carregar tipos: ' + e.message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function toggle(id) {
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function salvar() {
    setSalvando(true)
    try {
      const ids = [...selecionados]
      await salvarConfigFaltaAgua(ids)
      onSalvar(ids)
    } catch (e) {
      setErro('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="bg-[#141c2e] border border-white/[0.08] rounded-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-sm font-semibold text-white">Configurar tipos</p>
            <p className="text-xs text-slate-500 mt-0.5">Selecione os tipos de chamado para este relatório</p>
          </div>
          <button onClick={onFechar} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {carregando ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : erro ? (
            <p className="text-rose-400 text-sm py-4">{erro}</p>
          ) : tipos.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">Nenhum tipo encontrado.</p>
          ) : (
            <div className="space-y-1">
              {tipos.map(t => (
                <label key={t.id_tipo} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selecionados.has(Number(t.id_tipo))}
                    onChange={() => toggle(Number(t.id_tipo))}
                    className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-indigo-500"
                  />
                  <span className="text-sm text-slate-300">{t.nome_tipo}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{selecionados.size} tipo{selecionados.size !== 1 ? 's' : ''} selecionado{selecionados.size !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
            <button onClick={onFechar} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all">
              Cancelar
            </button>
            <button onClick={salvar} disabled={salvando || carregando}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition-all disabled:opacity-50">
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function ProtocolosDia() {
  const { temPermissao } = useAuth()
  const [preset, setPreset] = useState('hoje')
  const [refreshInterval, setRefreshInterval] = useState(300)
  const [dados, setDados]           = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro]             = useState('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null)
  const [configAberta, setConfigAberta] = useState(false)
  const [idsConfig, setIdsConfig] = useState(null)
  const timerRef = useRef(null)
  const configCarregadaRef = useRef(false)

  const range = rangeDoPreset(preset)

  // Carrega config do Firestore na primeira renderização
  useEffect(() => {
    if (configCarregadaRef.current) return
    configCarregadaRef.current = true
    buscarConfigFaltaAgua().then(c => setIdsConfig(c.ids || []))
  }, [])

  const buscar = useCallback(async (silencioso = false) => {
    if (idsConfig === null) return // aguarda config carregar
    if (silencioso) setAtualizando(true)
    else { setCarregando(true); setDados(null) }
    setErro('')
    try {
      const ids = idsConfig.join(',')
      const url = `${API_DIA}?inicio=${range.inicio}&fim=${range.fim}${ids ? `&ids=${ids}` : ''}`
      const res  = await fetch(url)
      const text = await res.text()
      if (!text)   throw new Error(`Resposta vazia (HTTP ${res.status})`)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`)
      const json = JSON.parse(text)
      setDados(Array.isArray(json) ? json[0] : json)
      setUltimaAtualizacao(new Date())
    } catch (e) {
      setErro(`Erro: ${e.message}`)
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [range.inicio, range.fim, idsConfig])

  useEffect(() => { buscar() }, [buscar])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (refreshInterval > 0) {
      timerRef.current = setInterval(() => buscar(true), refreshInterval * 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [refreshInterval, buscar])

  function handleSalvarConfig(ids) {
    setIdsConfig(ids)
    setConfigAberta(false)
  }

  const t = dados?.totais
  const pctEncerrados = t?.total ? Math.round((t.encerrados / t.total) * 100) : 0
  const maxBairro = dados?.por_bairro?.[0]?.total || 1

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto fade-up">

      {configAberta && <ModalConfig onFechar={() => setConfigAberta(false)} onSalvar={handleSalvarConfig} />}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-white">Falta de água</h1>
            {temPermissao('protocolos_dia', 'configurar') && <button onClick={() => setConfigAberta(true)} title="Configurar tipos"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>}
          </div>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            {ultimaAtualizacao
              ? `Atualizado às ${ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Carregando...'}
            {atualizando && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => setPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  preset === p.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`w-3.5 h-3.5 text-slate-500 ml-1 ${atualizando ? 'animate-spin' : ''}`}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {temPermissao('protocolos_dia', 'configurar') ? (
              <select value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-slate-400 focus:outline-none pr-1">
                {REFRESH_OPTIONS.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#111827]">{r.label}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 px-1">5 min</span>
            )}
          </div>

          <button onClick={buscar} disabled={carregando}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50">
            Atualizar
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{erro}</div>
      )}

      {/* Cards totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Card label="Total"               valor={t?.total}      cor="indigo" destaque />
        <Card label="Abertos"             valor={t?.abertos}    cor="amber"
          sub={t?.total ? `${Math.round((t.abertos / t.total) * 100)}% do total` : ''} />
        <Card label="Encerrados"          valor={t?.encerrados} cor="emerald"
          sub={t?.total ? `${pctEncerrados}% do total` : ''} />
        <Card label="Taxa de encerramento"
          valor={t?.total ? `${pctEncerrados}%` : '—'}
          cor={pctEncerrados >= 80 ? 'emerald' : pctEncerrados >= 50 ? 'amber' : 'rose'} />
      </div>

      {/* Gráfico + Bairros lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0 overflow-hidden">

        {/* Barras por dia */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Chamados por dia</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'rgba(99,102,241,0.4)' }} /> Total
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-3 h-2 rounded-sm bg-indigo-400 inline-block" /> Enc.
              </span>
            </div>
          </div>
          <div className="h-52">
            {carregando ? <Skeleton h="h-52" /> : <GraficoBarras dados={dados?.por_dia} />}
          </div>
        </div>

        {/* Bairros */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 min-w-0">
          <p className="text-sm font-semibold text-white mb-4">Por bairro</p>
          {carregando ? <Skeleton h="h-52" /> : (
            <div className="flex flex-col gap-2 overflow-y-auto pr-3" style={{ maxHeight: '208px' }}>
              {dados?.por_bairro?.length ? dados.por_bairro.map((d, i) => (
                <div key={i} className="grid gap-1" style={{ gridTemplateColumns: '1rem 1fr' }}>
                  <span className="text-[10px] text-slate-600 text-right pt-0.5">{i + 1}</span>
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-300 truncate">{d.bairro}</span>
                      <span className="text-xs font-medium text-slate-400 ml-2 shrink-0">{d.total}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.round((d.total / maxBairro) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm pt-16">Sem dados no período</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
