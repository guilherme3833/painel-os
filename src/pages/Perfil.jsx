import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { atualizarNome, esqueceuSenha } from '../firebase'
import { corDoPerfil } from '../constants'

export default function Perfil() {
  const { usuario, role } = useAuth()
  const [nome, setNome] = useState(usuario?.displayName || '')
  const [salvando, setSalvando] = useState(false)
  const [feedbackNome, setFeedbackNome] = useState('')
  const [enviandoSenha, setEnviandoSenha] = useState(false)
  const [feedbackSenha, setFeedbackSenha] = useState('')

  const ehGoogle = usuario?.providerData?.[0]?.providerId === 'google.com'

  async function salvarNome(e) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    setFeedbackNome('')
    try {
      await atualizarNome(usuario, nome.trim())
      setFeedbackNome('ok')
    } catch {
      setFeedbackNome('erro')
    }
    setSalvando(false)
    setTimeout(() => setFeedbackNome(''), 3000)
  }

  async function enviarRedefinicao() {
    setEnviandoSenha(true)
    setFeedbackSenha('')
    try {
      await esqueceuSenha(usuario.email)
      setFeedbackSenha('ok')
    } catch {
      setFeedbackSenha('erro')
    }
    setEnviandoSenha(false)
  }

  const inputCls = 'w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all'

  return (
    <div className="max-w-lg mx-auto px-4 py-6 fade-up">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Meu perfil</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie suas informações pessoais.</p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4 bg-white/[0.04] border border-white/8 rounded-2xl p-5 mb-4">
        {usuario?.photoURL ? (
          <img src={usuario.photoURL} referrerPolicy="no-referrer" className="w-14 h-14 rounded-full shrink-0" alt="" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold shrink-0">
            {(usuario?.displayName || usuario?.email || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold text-white truncate">{usuario?.displayName || 'Sem nome'}</p>
          <p className="text-sm text-slate-500 truncate">{usuario?.email}</p>
          <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded font-semibold border ${corDoPerfil(null)} capitalize`}>
            {role === 'admin' ? 'Administrador' : role}
          </span>
        </div>
      </div>

      {/* Alterar nome */}
      <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">Alterar nome</h2>
        <form onSubmit={salvarNome} className="flex gap-3">
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome completo"
            className={inputCls}
          />
          <button
            type="submit"
            disabled={salvando || !nome.trim() || nome.trim() === usuario?.displayName}
            className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {salvando && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            Salvar
          </button>
        </form>
        {feedbackNome === 'ok' && <p className="text-emerald-400 text-xs mt-2">✓ Nome atualizado com sucesso.</p>}
        {feedbackNome === 'erro' && <p className="text-red-400 text-xs mt-2">Erro ao atualizar o nome. Tente novamente.</p>}
      </div>

      {/* Redefinir senha (apenas e-mail/senha) */}
      {!ehGoogle && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-1">Redefinir senha</h2>
          <p className="text-xs text-slate-500 mb-4">Enviaremos um link de redefinição para <span className="text-slate-300">{usuario?.email}</span>.</p>
          <button
            onClick={enviarRedefinicao}
            disabled={enviandoSenha || feedbackSenha === 'ok'}
            className="flex items-center gap-2 text-sm border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {enviandoSenha && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {feedbackSenha === 'ok' ? '✓ E-mail enviado!' : 'Enviar e-mail de redefinição'}
          </button>
          {feedbackSenha === 'erro' && <p className="text-red-400 text-xs mt-2">Erro ao enviar o e-mail. Tente novamente.</p>}
        </div>
      )}

      {ehGoogle && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Conta vinculada ao Google. A senha é gerenciada pela sua conta Google.</p>
        </div>
      )}
    </div>
  )
}
