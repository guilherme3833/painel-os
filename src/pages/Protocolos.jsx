import { useState, useEffect, useCallback, useRef } from 'react'
import ReactECharts from 'echarts-for-react'

const API = 'https://automacao.octek.com.br/webhook/chamados/resumo'

const PRESETS = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7d',   label: '7 dias' },
  { id: '30d',  label: '30 dias' },
  { id: 'mes',  label: 'Este mês' },
  { id: 'custom', label: 'Personalizado' },
]

const REFRESH_OPTIONS = [
  { id: 0,   label: 'Manual' },
  { id: 30,  label: '30s' },
  { id: 60,  label: '1 min' },
  { id: 300, label: '5 min' },
  { id: 600, label: '10 min' },
]

const CORES = ['#6366f1','#f43f5e','#10b981','#f59e0b','#06b6d4','#f97316','#84cc16','#ec4899','#8b5cf6','#14b8a6']

function dataLocal(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hoje()       { return dataLocal() }
function diasAtras(n) { const d = new Date(); d.setDate(d.getDate() - n); return dataLocal(d) }
function inicioMes()  { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01` }

function rangeDoPreset(preset) {
  switch (preset) {
    case 'hoje': return { inicio: hoje(), fim: hoje() }
    case '7d':   return { inicio: diasAtras(6), fim: hoje() }
    case '30d':  return { inicio: diasAtras(29), fim: hoje() }
    case 'mes':  return { inicio: inicioMes(), fim: hoje() }
    default:     return { inicio: diasAtras(29), fim: hoje() }
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
  const [, mm, dd] = iso.split('-')
  return `${dd}/${mm}`
}

// ── Gráfico de barras 3D (cilindros) ──────────────────────────────────────────
function GraficoBarras({ dados }) {
  if (!dados?.length) return (
    <div className="flex items-center justify-center h-full text-slate-600 text-sm">Sem dados no período</div>
  )

  const step = Math.ceil(dados.length / 8)

  const option = {
    backgroundColor: 'transparent',
    grid: { top: 16, right: 12, bottom: 28, left: 36, containLabel: false },
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
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        formatter: (v, i) => i % step === 0 ? formatarDataEixo(v) : '',
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    series: [
      {
        name: 'Total',
        type: 'bar',
        data: dados.map(d => d.total),
        barMaxWidth: 18,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99,102,241,0.7)' },
              { offset: 1, color: 'rgba(99,102,241,0.1)' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99,102,241,0.9)' },
                { offset: 1, color: 'rgba(99,102,241,0.2)' },
              ],
            },
          },
        },
      },
      {
        name: 'Encerrados',
        type: 'bar',
        data: dados.map(d => d.encerrados),
        barMaxWidth: 18,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#818cf8' },
              { offset: 1, color: '#4f46e5' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
          },
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
}

// ── Gráfico de rosca 3D ────────────────────────────────────────────────────────
function GraficoRosca({ dados, campo }) {
  if (!dados?.length) return (
    <div className="flex items-center justify-center h-full text-slate-600 text-sm">Sem dados no período</div>
  )

  const total = dados.reduce((s, d) => s + Number(d.total), 0)

  const seriesData = dados.map((d, i) => ({
    name: d[campo],
    value: Number(d.total),
    itemStyle: {
      color: CORES[i % CORES.length],
    },
  }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#141c2e',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) =>
        `<b style="color:${p.color}">${p.name}</b><br/>` +
        `${p.value} &nbsp;<span style="color:#64748b">${p.percent.toFixed(1)}%</span>`,
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '50%'],
        data: seriesData,
        padAngle: 2,
        itemStyle: { borderRadius: 4, borderWidth: 0 },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: {},
          label: {
            show: true,
            fontSize: 11,
            color: '#e2e8f0',
            formatter: '{b}\n{c}',
          },
        },
        graphic: [{
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: String(total), fill: '#fff', font: 'bold 20px sans-serif', textAlign: 'center' },
        }],
      },
    ],
  }

  return (
    <div className="flex items-center gap-3 h-full">
      <div className="shrink-0" style={{ width: 130, height: '100%' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
      </div>
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 overflow-hidden">
        {dados.slice(0, 8).map((d, i) => (
          <div key={i} className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CORES[i % CORES.length] }} />
            <span className="text-xs text-slate-400 truncate flex-1">{d[campo]}</span>
            <span className="text-xs font-medium text-slate-300 shrink-0">{d.total}</span>
            <span className="text-[10px] text-slate-600 shrink-0 w-7 text-right">
              {Math.round(Number(d.total) / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── Card de número ─────────────────────────────────────────────────────────────
function Card({ label, valor, sub, cor = 'indigo', destaque }) {
  const cores = {
    indigo:  'text-indigo-400',
    emerald: 'text-emerald-400',
    amber:   'text-amber-400',
    rose:    'text-rose-400',
  }
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

// ── Página principal ───────────────────────────────────────────────────────────
export default function Protocolos() {
  const [preset, setPreset] = useState('hoje')
  const [customInicio, setCustomInicio] = useState(diasAtras(29))
  const [customFim, setCustomFim]       = useState(hoje())
  const [refreshInterval, setRefreshInterval] = useState(0)
  const [dados, setDados]               = useState(null)
  const [carregando, setCarregando]     = useState(true)
  const [atualizando, setAtualizando]   = useState(false)
  const [erro, setErro]                 = useState('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null)
  const timerRef = useRef(null)

  const range = preset === 'custom'
    ? { inicio: customInicio, fim: customFim }
    : rangeDoPreset(preset)

  const buscar = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true)
    else { setCarregando(true); setDados(null) }
    setErro('')
    try {
      const url = `${API}?inicio=${range.inicio}&fim=${range.fim}`
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
  }, [range.inicio, range.fim])

  useEffect(() => { buscar() }, [buscar])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (refreshInterval > 0) {
      timerRef.current = setInterval(() => buscar(true), refreshInterval * 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [refreshInterval, buscar])

  const t = dados?.totais
  const pctEncerrados = t?.total ? Math.round((t.encerrados / t.total) * 100) : 0

  return (
    <div className="px-6 py-6 max-w-6xl mx-auto fade-up">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Protocolos</h1>
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
            <select value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-400 focus:outline-none pr-1">
              {REFRESH_OPTIONS.map(r => (
                <option key={r.id} value={r.id} className="bg-[#111827]">{r.label}</option>
              ))}
            </select>
          </div>

          <button onClick={buscar} disabled={carregando}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50">
            Atualizar
          </button>
        </div>
      </div>

      {/* Range personalizado */}
      {preset === 'custom' && (
        <div className="flex items-center gap-3 mb-5 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
          <label className="text-xs text-slate-500">De</label>
          <input type="date" value={customInicio} onChange={e => setCustomInicio(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60" />
          <label className="text-xs text-slate-500">até</label>
          <input type="date" value={customFim} onChange={e => setCustomFim(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60" />
        </div>
      )}

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

      {/* Barras por dia */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Chamados por dia</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'rgba(99,102,241,0.4)' }} /> Total
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-3 h-2 rounded-sm bg-indigo-400 inline-block" /> Encerrados
            </span>
          </div>
        </div>
        <div className="h-44">
          {carregando ? <Skeleton h="h-44" /> : <GraficoBarras dados={dados?.por_dia} />}
        </div>
      </div>

      {/* Roscas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { titulo: 'Por atendente', key: 'por_atendente', campo: 'atendente' },
          { titulo: 'Por canal',     key: 'por_canal',     campo: 'canal'     },
          { titulo: 'Por tipo',      key: 'por_tipo',      campo: 'tipo'      },
        ].map(({ titulo, key, campo }) => (
          <div key={key} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-3">{titulo}</p>
            <div className="h-44">
              {carregando
                ? <Skeleton h="h-44" />
                : <GraficoRosca dados={dados?.[key]} campo={campo} />
              }
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
