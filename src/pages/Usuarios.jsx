import { useState, useEffect } from 'react'
import { listarUsuarios, atualizarRoleUsuario, listarPerfis, salvarPerfil, deletarPerfil, listarConvites, criarUsuarioAdmin, deletarConvite } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { PAGINAS_CONFIG, PERMISSOES_PADRAO, COR_OPTIONS, corDoPerfil, ROLE_ADMIN_ID } from '../constants'

// ── Aba: Usuários ─────────────────────────────────────────────────────────────
function AbaUsuarios({ perfis }) {
  const { usuario: usuarioAtual, temPermissao } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState({})
  const [feedback, setFeedback] = useState({})

  useEffect(() => {
    listarUsuarios()
      .then(lista => { setUsuarios(lista); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  async function mudarRole(uid, roleId) {
    setSalvando(s => ({ ...s, [uid]: true }))
    try {
      await atualizarRoleUsuario(uid, roleId)
      setUsuarios(prev => prev.map(u => u.uid === uid ? { ...u, roleId } : u))
      setFeedback(f => ({ ...f, [uid]: 'ok' }))
      setTimeout(() => setFeedback(f => ({ ...f, [uid]: null })), 2000)
    } catch (err) {
      console.error('[Usuarios] erro ao mudar role:', err)
      setFeedback(f => ({ ...f, [uid]: 'erro' }))
      setTimeout(() => setFeedback(f => ({ ...f, [uid]: null })), 2000)
    }
    setSalvando(s => ({ ...s, [uid]: false }))
  }

  const opcoesRole = [
    { id: ROLE_ADMIN_ID, nome: 'Administrador' },
    ...perfis.map(p => ({ id: p.id, nome: p.nome })),
  ]

  if (carregando) return (
    <div className="flex flex-col gap-2">
      {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-white/[0.04] border border-white/8 rounded-2xl h-16" />)}
    </div>
  )

  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/5">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Usuário</p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-40 text-center">Perfil de acesso</p>
        <p className="w-6" />
      </div>

      {usuarios.length === 0 && (
        <div className="py-12 text-center text-slate-500 text-sm">Nenhum usuário cadastrado.</div>
      )}

      {usuarios.map((u, i) => {
        const ehEuMesmo = u.uid === usuarioAtual?.uid
        return (
          <div key={u.uid} className={`grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4 ${i < usuarios.length - 1 ? 'border-b border-white/5' : ''} ${ehEuMesmo ? 'bg-indigo-500/5' : ''}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300 shrink-0">
                {(u.nome || u.email || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {u.nome || 'Sem nome'}
                  {ehEuMesmo && <span className="ml-2 text-[10px] text-indigo-400 font-normal">(você)</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
            </div>

            <div className="w-40">
              {temPermissao('usuarios', 'editar') ? (
                <select
                  value={u.roleId || 'visualizador'}
                  onChange={e => mudarRole(u.uid, e.target.value)}
                  disabled={salvando[u.uid]}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {opcoesRole.map(op => (
                    <option key={op.id} value={op.id} className="bg-[#111827] text-slate-200">{op.nome}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-slate-400">
                  {opcoesRole.find(op => op.id === (u.roleId || 'visualizador'))?.nome || u.roleId}
                </span>
              )}
            </div>

            <div className="w-6 flex justify-center">
              {salvando[u.uid] && <div className="w-4 h-4 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />}
              {!salvando[u.uid] && feedback[u.uid] === 'ok' && <span className="text-emerald-400 text-sm">✓</span>}
              {!salvando[u.uid] && feedback[u.uid] === 'erro' && <span className="text-red-400 text-sm">✕</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Modal: criar/editar perfil ────────────────────────────────────────────────
function ModalPerfil({ perfil, onSalvar, onFechar }) {
  const editando = !!perfil
  const [nome, setNome] = useState(perfil?.nome || '')
  const [cor, setCor] = useState(perfil?.cor || 'indigo')
  const [permissoes, setPermissoes] = useState(perfil?.permissoes || PERMISSOES_PADRAO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function toggleAcao(pagina, acao) {
    setPermissoes(prev => ({
      ...prev,
      [pagina]: { ...prev[pagina], [acao]: !prev[pagina]?.[acao] },
    }))
  }

  async function salvar() {
    if (!nome.trim()) { setErro('Digite um nome para o perfil.'); return }
    setSalvando(true)
    setErro('')
    try {
      const id = editando ? perfil.id : nome.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      await salvarPerfil(id, { nome: nome.trim(), cor, permissoes })
      onSalvar()
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="font-semibold text-white">{editando ? 'Editar perfil' : 'Novo perfil de acesso'}</h2>
          <button onClick={onFechar} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Nome do perfil</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Supervisor, Cliente, Parceiro..."
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
            />
          </div>

          {/* Cor */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Cor do badge</label>
            <div className="flex gap-2 flex-wrap">
              {COR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCor(c.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${c.cls} ${cor === c.id ? 'ring-2 ring-white/30 scale-105' : 'opacity-60 hover:opacity-100'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Permissões por tela */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 block">Permissões por tela</label>
            <div className="space-y-2">
              {PAGINAS_CONFIG.map(pagina => (
                <div key={pagina.id} className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{pagina.label}</p>
                      <p className="text-[11px] text-slate-500">{pagina.descricao}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {pagina.acoes.map(acao => {
                      const ativo = permissoes?.[pagina.id]?.[acao.id] ?? false
                      return (
                        <button
                          key={acao.id}
                          onClick={() => toggleAcao(pagina.id, acao.id)}
                          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            ativo
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                              : 'bg-white/[0.03] border-white/10 text-slate-500 hover:border-white/20'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] ${ativo ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-600'}`}>
                            {ativo && '✓'}
                          </span>
                          {acao.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {erro && <p className="text-red-400 text-xs">{erro}</p>}
        </div>

        <div className="px-6 py-4 border-t border-white/8 flex justify-end gap-3">
          <button onClick={onFechar} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancelar</button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {salvando && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Aba: Perfis de Acesso ─────────────────────────────────────────────────────
function AbaPerfis() {
  const { temPermissao } = useAuth()
  const [perfis, setPerfis] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modal, setModal] = useState(null) // null | 'novo' | perfil obj
  const [deletando, setDeletando] = useState(null)

  function carregar() {
    setCarregando(true)
    listarPerfis()
      .then(lista => { setPerfis(lista); setCarregando(false) })
      .catch(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id) {
    setDeletando(id)
    try {
      await deletarPerfil(id)
      setPerfis(prev => prev.filter(p => p.id !== id))
    } catch {}
    setDeletando(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">Defina quais telas e ações cada perfil pode acessar.</p>
        {temPermissao('usuarios', 'editar') && (
          <button
            onClick={() => setModal('novo')}
            className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all"
          >
            <span className="text-base leading-none">+</span> Novo perfil
          </button>
        )}
      </div>

      {/* Perfil admin fixo */}
      <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-2 py-1 rounded font-semibold border text-rose-400 bg-rose-500/10 border-rose-500/20">Administrador</span>
          <p className="text-sm text-slate-400">Acesso total a todas as telas e ações — não pode ser editado.</p>
        </div>
        <span className="text-xs text-slate-600 italic">fixo</span>
      </div>

      {carregando && (
        <div className="flex flex-col gap-2 mt-2">
          {[...Array(2)].map((_, i) => <div key={i} className="animate-pulse bg-white/[0.04] border border-white/8 rounded-2xl h-16" />)}
        </div>
      )}

      {!carregando && perfis.map(p => (
        <div key={p.id} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2 py-1 rounded font-semibold border ${corDoPerfil(p.cor)}`}>{p.nome}</span>
            </div>
            {temPermissao('usuarios', 'editar') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModal(p)}
                  className="text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1 rounded-lg transition-all"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluir(p.id)}
                  disabled={deletando === p.id}
                  className="text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                >
                  {deletando === p.id ? '...' : 'Excluir'}
                </button>
              </div>
            )}
          </div>

          {/* Resumo de permissões */}
          <div className="flex flex-wrap gap-2">
            {PAGINAS_CONFIG.map(pagina => {
              const temAcesso = pagina.acoes.some(a => p.permissoes?.[pagina.id]?.[a.id])
              return (
                <span
                  key={pagina.id}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                    temAcesso
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-slate-600 bg-white/[0.02] border-white/5'
                  }`}
                >
                  {temAcesso ? '✓' : '✗'} {pagina.label}
                </span>
              )
            })}
          </div>
        </div>
      ))}

      {!carregando && perfis.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">
          Nenhum perfil criado ainda. Clique em "Novo perfil" para começar.
        </div>
      )}

      {modal && (
        <ModalPerfil
          perfil={modal === 'novo' ? null : modal}
          onSalvar={() => { setModal(null); carregar() }}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}

// ── Aba: Convites ─────────────────────────────────────────────────────────────
function AbaConvites({ perfis }) {
  const { usuario: usuarioAtual, temPermissao } = useAuth()
  const [convites, setConvites] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [deletando, setDeletando] = useState(null)

  const opcoesRole = [
    { id: ROLE_ADMIN_ID, nome: 'Administrador' },
    ...perfis.map(p => ({ id: p.id, nome: p.nome })),
  ]

  function carregar() {
    listarConvites()
      .then(lista => { setConvites(lista); setCarregando(false) })
      .catch(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    if (opcoesRole.length > 1) setRoleId(opcoesRole[1].id)
  }, [perfis])

  async function enviar(e) {
    e.preventDefault()
    if (!email.trim()) { setErro('Digite um e-mail.'); return }
    if (!roleId) { setErro('Selecione um perfil.'); return }
    const emailNorm = email.trim().toLowerCase()
    if (convites.find(c => c.id === emailNorm)) { setErro('Já existe um convite para este e-mail.'); return }
    setSalvando(true)
    setErro('')
    try {
      await criarUsuarioAdmin(emailNorm, roleId, usuarioAtual.uid)
      setEmail('')
      carregar()
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErro('Este e-mail já está cadastrado.')
      } else {
        setErro('Erro ao criar usuário. Tente novamente.')
      }
    }
    setSalvando(false)
  }

  async function remover(id) {
    setDeletando(id)
    try {
      await deletarConvite(id)
      setConvites(prev => prev.filter(c => c.id !== id))
    } catch {}
    setDeletando(null)
  }

  return (
    <div className="space-y-4">
      {/* Formulário novo convite */}
      {temPermissao('usuarios', 'editar') && <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Convidar usuário</h3>
        <p className="text-xs text-slate-500 mb-4">
          Cria a conta e envia um e-mail de definição de senha. O usuário acessa o link e define sua própria senha.
        </p>
        <form onSubmit={enviar} className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErro('') }}
            placeholder="email@exemplo.com"
            className="flex-1 min-w-48 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all"
          />
          <select
            value={roleId}
            onChange={e => setRoleId(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-all"
          >
            {opcoesRole.map(op => (
              <option key={op.id} value={op.id} className="bg-[#111827] text-slate-200">{op.nome}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all disabled:opacity-60"
          >
            {salvando && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            Criar e enviar e-mail
          </button>
        </form>
        {erro && <p className="text-red-400 text-xs mt-2">{erro}</p>}
      </div>}

      {/* Lista de convites */}
      {carregando && (
        <div className="flex flex-col gap-2">
          {[...Array(2)].map((_, i) => <div key={i} className="animate-pulse bg-white/[0.04] border border-white/8 rounded-2xl h-14" />)}
        </div>
      )}

      {!carregando && convites.filter(c => !c.usado).length === 0 && (
        <div className="text-center py-10 text-slate-500 text-sm">Nenhum convite pendente.</div>
      )}

      {!carregando && convites.filter(c => !c.usado).length > 0 && (
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/5">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">E-mail</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Perfil</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Status</p>
            <p className="w-14" />
          </div>
          {convites.filter(c => !c.usado).map((c, i, arr) => {
            const perfil = perfis.find(p => p.id === c.roleId)
            const nomeRole = c.roleId === ROLE_ADMIN_ID ? 'Administrador' : (perfil?.nome || c.roleId)
            return (
              <div key={c.id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                <p className="text-sm text-slate-300 truncate">{c.email}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${c.roleId === ROLE_ADMIN_ID ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : corDoPerfil(perfil?.cor)}`}>
                  {nomeRole}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${c.usado ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                  {c.usado ? 'Usado' : 'Pendente'}
                </span>
                <button
                  onClick={() => remover(c.id)}
                  disabled={deletando === c.id}
                  className="text-xs text-slate-500 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 px-3 py-1 rounded-lg transition-all disabled:opacity-50 w-14 text-center"
                >
                  {deletando === c.id ? '...' : 'Remover'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Usuarios() {
  const [aba, setAba] = useState('usuarios')
  const [perfis, setPerfis] = useState([])

  useEffect(() => {
    listarPerfis().then(setPerfis).catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Gerenciar Usuários</h1>
        <p className="text-sm text-slate-500 mt-1">Atribua perfis de acesso e configure permissões por tela.</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/8 p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'usuarios', label: 'Usuários' },
          { id: 'perfis', label: 'Perfis de Acesso' },
          { id: 'convites', label: 'Convites' },
        ].map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              aba === a.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'usuarios' && <AbaUsuarios perfis={perfis} />}
      {aba === 'perfis' && <AbaPerfis />}
      {aba === 'convites' && <AbaConvites perfis={perfis} />}

      <p className="text-xs text-slate-600 mt-5 px-1">
        Alterações de perfil têm efeito no próximo login do usuário.
      </p>
    </div>
  )
}
