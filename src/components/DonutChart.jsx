import { useState } from 'react'
import { PIZZA_CORES } from '../constants'

export default function DonutChart({ dados }) {
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
