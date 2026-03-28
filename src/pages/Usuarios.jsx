import { useState, useEffect } from 'react'
import { listarUsuarios, atualizarRole } from '../firebase'
import { ROLES } from '../constants'
import { useAuth } from '../contexts/AuthContext'

export default function Usuarios() {
  const { usuario: usuarioAtual } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState({})
  const [feedback, setFeedback] = useState({})

  useEffect(() => {
    listarUsuarios()
      .then(lista => { setUsuarios(lista); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  async function mudarRole(uid, novoRole) {
    setSalvando(s => ({ ...s, [uid]: true }))
    try {
      await atualizarRole(uid, novoRole)
      setUsuarios(prev => prev.map(u => u.uid === uid ? { ...u, role: novoRole } : u))
      setFeedback(f => ({ ...f, [uid]: 'ok' }))
      setTimeout(() => setFeedback(f => ({ ...f, [uid]: null })), 2000)
    } catch {
      setFeedback(f => ({ ...f, [uid]: 'erro' }))
      setTimeout(() => setFeedback(f => ({ ...f, [uid]: null })), 2000)
    }
    setSalvando(s => ({ ...s, [uid]: false }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">

      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Gerenciar Usuários</h1>
        <p className="text-sm text-slate-500 mt-1">Defina o nível de acesso de cada usuário cadastrado.</p>
      </div>

      {/* Legenda de roles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(ROLES).map(([key, info]) => (
          <div key={key} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg border mb-2 ${info.cor}`}>
              {info.label}
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {key === 'admin' && 'Acesso total: dashboard, lista e gerência de usuários.'}
              {key === 'tecnico' && 'Acesso ao dashboard e lista de OS.'}
              {key === 'visualizador' && 'Apenas dashboard. Modo somente leitura.'}
            </p>
          </div>
        ))}
      </div>

      {carregando && (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/[0.04] border border-white/8 rounded-2xl h-16" />
          ))}
        </div>
      )}

      {!carregando && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Usuário</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-36 text-center">Nível de acesso</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-8"></p>
          </div>

          {usuarios.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">Nenhum usuário cadastrado ainda.</div>
          )}

          {usuarios.map((u, i) => {
            const ehEuMesmo = u.uid === usuarioAtual?.uid
            const statusFeedback = feedback[u.uid]
            return (
              <div
                key={u.uid}
                className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 ${i < usuarios.length - 1 ? 'border-b border-white/5' : ''} ${ehEuMesmo ? 'bg-indigo-500/5' : ''}`}
              >
                {/* Info do usuário */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/40 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                    {(u.nome || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate leading-tight">
                      {u.nome || 'Sem nome'}
                      {ehEuMesmo && <span className="ml-2 text-[10px] text-indigo-400 font-normal">(você)</span>}
                    </p>
                    <p className="text-xs text-slate-500 truncate leading-tight">{u.email}</p>
                  </div>
                </div>

                {/* Seletor de role */}
                <div className="w-36">
                  <select
                    value={u.role || 'visualizador'}
                    onChange={e => mudarRole(u.uid, e.target.value)}
                    disabled={salvando[u.uid] || ehEuMesmo}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {Object.entries(ROLES).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status de salvo */}
                <div className="w-8 flex justify-center">
                  {salvando[u.uid] && (
                    <div className="w-4 h-4 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
                  )}
                  {!salvando[u.uid] && statusFeedback === 'ok' && (
                    <span className="text-emerald-400 text-sm">✓</span>
                  )}
                  {!salvando[u.uid] && statusFeedback === 'erro' && (
                    <span className="text-red-400 text-sm">✕</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-4 px-1">
        Alterações de nível de acesso têm efeito no próximo login do usuário.
      </p>
    </div>
  )
}
