import { useState } from 'react'
import { CORES_BORDA } from '../constants'
import Badge from './Badge'

export default function CartaoOS({ os, index }) {
  const [aberto, setAberto] = useState(false)
  const corBorda = CORES_BORDA[index % CORES_BORDA.length]
  const fotos = [os.foto_01, os.foto_02, os.foto_03, os.foto_04, os.foto_05].filter(Boolean)

  return (
    <div
      className={`bg-white/[0.04] border border-white/8 border-l-4 ${corBorda} rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all duration-200 cursor-pointer`}
      onClick={() => setAberto(!aberto)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-slate-400 bg-white/10 px-2.5 py-0.5 rounded-lg">#{os.numero}</span>
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
        <div className="border-t border-white/5 bg-black/20 p-4">
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
              <p className="text-slate-300 text-sm bg-white/[0.04] rounded-xl p-3 border border-white/8 leading-relaxed">{os.observacao}</p>
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
