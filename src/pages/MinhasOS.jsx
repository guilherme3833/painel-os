import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ouvirAtribuicoes } from '../firebase'

const API = 'https://automacao.octek.com.br/webhook/os/fila'

function dataLocal(iso) {
  if (!iso) return '—'
  const s = String(iso).split('T')[0]
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

function diasEspera(iso) {
  if (!iso) return 0
  const s = String(iso).split('T')[0]
  const [y, m, d] = s.split('-')
  const abertura = new Date(Number(y), Number(m) - 1, Number(d))
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  return Math.floor((hoje - abertura) / 86400000)
}

function BadgeDias({ dias }) {
  const cor = dias >= 30
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : dias >= 15
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-slate-700/40 text-slate-500 border-slate-600/30'
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cor}`}>
      {dias}d
    </span>
  )
}

function barraEspera(dias) {
  if (dias >= 30) return 'bg-rose-500'
  if (dias >= 15) return 'bg-amber-500'
  return 'bg-indigo-500'
}

function CardOS({ os }) {
  const [expandido, setExpandido] = useState(false)
  const dias = diasEspera(os.data_abertura)

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden`}>
      <div className={`w-1 self-stretch shrink-0 ${barraEspera(dias)}`} />

      <div className="flex-1 min-w-0 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
            OS {os.numero}
          </span>
          <span className="text-xs text-slate-600">{dataLocal(os.data_abertura)}</span>
          <BadgeDias dias={dias} />
        </div>

        {os.servico && (
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Serviço</span>
            <span className="text-xs font-medium text-amber-400 truncate">{os.servico}</span>
          </div>
        )}

        {os.endereco_final && (
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Endereço</span>
            <span className="text-xs text-slate-300 truncate">{os.endereco_final}</span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Descrição</span>
          <button onClick={() => setExpandido(e => !e)} className="text-left min-w-0 flex-1 group">
            <p className={`text-xs text-slate-400 group-hover:text-slate-200 transition-colors ${expandido ? '' : 'truncate'}`}>
              {os.descricao || '—'}
            </p>
            {!expandido && os.descricao?.length > 60 && (
              <span className="text-[10px] text-slate-600 group-hover:text-indigo-400 transition-colors">ver mais</span>
            )}
          </button>
        </div>
      </div>
      <div className="pr-3" />
    </div>
  )
}

export default function MinhasOS() {
  const { usuario } = useAuth()

  const [todasOS, setTodasOS]       = useState([])
  const [atribuicoes, setAtribuicoes] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState(false)
  const [erro, setErro]             = useState('')
  const timerRef = useRef(null)

  const buscarOS = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true)
    else setCarregando(true)
    try {
      const res = await fetch(API).then(r => r.json())
      setTodasOS(Array.isArray(res) ? res : [])
    } catch (e) {
      setErro('Erro ao carregar: ' + e.message)
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = ouvirAtribuicoes(data => setAtribuicoes(data))
    return () => unsubscribe()
  }, [])

  useEffect(() => { buscarOS() }, [buscarOS])

  useEffect(() => {
    timerRef.current = setInterval(() => buscarOS(true), 60000)
    return () => clearInterval(timerRef.current)
  }, [buscarOS])

  const minhasOS = todasOS.filter(os =>
    atribuicoes[String(os.codigo)]?.uid === usuario?.uid
  )

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto fade-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Minhas OS</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            {carregando ? 'Carregando...' : `${minhasOS.length} ordem${minhasOS.length !== 1 ? 's' : ''} atribuída${minhasOS.length !== 1 ? 's' : ''}`}
            {atualizando && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />}
          </p>
        </div>
        <button onClick={() => buscarOS()} disabled={carregando}
          className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50">
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{erro}</div>
      )}

      {carregando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      ) : minhasOS.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-slate-500 text-sm">Nenhuma OS atribuída a você</p>
          <p className="text-slate-700 text-xs">Solicite ao gestor que atribua OS na Fila</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {minhasOS.map(os => <CardOS key={os.codigo} os={os} />)}
        </div>
      )}
    </div>
  )
}
