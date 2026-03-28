import { useState, useEffect, useRef } from 'react'
import { API, INTERVALO_REFRESH } from '../constants'
import ContadorAnimado from '../components/ContadorAnimado'
import DonutChart from '../components/DonutChart'
import Skeleton from '../components/Skeleton'

export default function Dashboard({ onVerLista, onToast }) {
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
        <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
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
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="relative overflow-hidden bg-white/[0.05] border border-white/8 rounded-2xl p-5">
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

      <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-6 mb-4">
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
        className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 border border-white/8 px-4 py-3 rounded-2xl hover:bg-white/[0.06] hover:text-white transition-all duration-200"
      >
        Ver lista completa de ordens <span>→</span>
      </button>
    </div>
  )
}
