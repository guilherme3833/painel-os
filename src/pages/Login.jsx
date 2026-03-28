import { useState } from 'react'
import { loginComEmail, loginComGoogle, cadastrar, esqueceuSenha } from '../firebase'

export default function Login() {
  const [tela, setTela] = useState('login')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })

  function atualizar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  function trocarTela(nova) {
    setTela(nova)
    setErro('')
    setSucesso('')
  }

  async function entrar(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      await loginComEmail(form.email, form.senha)
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
      }
      setErro(msgs[err.code] || 'Erro ao fazer login. Tente novamente.')
      setCarregando(false)
    }
  }

  async function registrar(e) {
    e.preventDefault()
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setCarregando(true)
    setErro('')
    try {
      await cadastrar(form.nome, form.email, form.senha)
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca.',
      }
      setErro(msgs[err.code] || 'Erro ao criar conta. Tente novamente.')
      setCarregando(false)
    }
  }

  async function recuperar(e) {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    try {
      await esqueceuSenha(form.email)
      setSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      setCarregando(false)
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
        'auth/invalid-email': 'E-mail inválido.',
      }
      setErro(msgs[err.code] || 'Erro ao enviar e-mail. Tente novamente.')
      setCarregando(false)
    }
  }

  const titulos = {
    login: { titulo: 'Bem-vindo de volta', sub: 'Entre com sua conta' },
    cadastro: { titulo: 'Criar conta', sub: 'Preencha os dados para se cadastrar' },
    esqueci: { titulo: 'Recuperar senha', sub: 'Enviaremos um link para seu e-mail' },
  }

  const inputCls = 'w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all'
  const btnPrimary = 'w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1'

  return (
    <div className="min-h-screen bg-[#0f1623] bg-grid flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600 opacity-20 blur-[120px] pointer-events-none" />
      <div className="orb-2 absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600 opacity-15 blur-[140px] pointer-events-none" />
      <div className="orb-3 absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500 opacity-10 blur-[100px] pointer-events-none" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 12"/>
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 12"/>
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 12"/>
        <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#818cf8" strokeWidth="1" strokeDasharray="6 12"/>
      </svg>

      <div className="w-full max-w-sm fade-up relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Octek" className="w-[50%] mx-auto mb-5 rounded-2xl" />
          <h1 className="text-xl font-bold text-white">{titulos[tela].titulo}</h1>
          <p className="text-slate-500 text-sm mt-1.5">{titulos[tela].sub}</p>
        </div>

        <div className="bg-white/[0.05] border border-white/8 rounded-2xl p-6">
          {tela === 'login' && (
            <form onSubmit={entrar} className="flex flex-col gap-3">
              <input name="email" type="email" placeholder="E-mail" required value={form.email} onChange={atualizar} className={inputCls} />
              <input name="senha" type="password" placeholder="Senha" required value={form.senha} onChange={atualizar} className={inputCls} />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              <button type="submit" disabled={carregando} className={btnPrimary}>
                {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
              <button type="button" onClick={() => trocarTela('esqueci')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors text-center mt-1">
                Esqueci minha senha
              </button>
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-700/50" />
                <span className="text-xs text-slate-600">ou</span>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>
              <button type="button" disabled={carregando}
                onClick={async () => { setCarregando(true); try { await loginComGoogle() } catch { setErro('Não foi possível entrar com Google.'); setCarregando(false) } }}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>
            </form>
          )}

          {tela === 'cadastro' && (
            <form onSubmit={registrar} className="flex flex-col gap-3">
              <input name="nome" type="text" placeholder="Nome completo" required value={form.nome} onChange={atualizar} className={inputCls} />
              <input name="email" type="email" placeholder="E-mail" required value={form.email} onChange={atualizar} className={inputCls} />
              <input name="senha" type="password" placeholder="Senha (mín. 6 caracteres)" required value={form.senha} onChange={atualizar} className={inputCls} />
              <input name="confirmar" type="password" placeholder="Confirmar senha" required value={form.confirmar} onChange={atualizar} className={inputCls} />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              <button type="submit" disabled={carregando} className={btnPrimary}>
                {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {carregando ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}

          {tela === 'esqueci' && (
            <form onSubmit={recuperar} className="flex flex-col gap-3">
              <input name="email" type="email" placeholder="Seu e-mail" required value={form.email} onChange={atualizar} className={inputCls} />
              {erro && <p className="text-red-400 text-xs">{erro}</p>}
              {sucesso && <p className="text-emerald-400 text-xs">{sucesso}</p>}
              {!sucesso && (
                <button type="submit" disabled={carregando} className={btnPrimary}>
                  {carregando && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              )}
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 mt-5 text-xs text-slate-600">
          {tela === 'login' && (
            <>
              <span>Não tem conta?</span>
              <button onClick={() => trocarTela('cadastro')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Cadastre-se</button>
            </>
          )}
          {tela !== 'login' && (
            <>
              <span>Já tem conta?</span>
              <button onClick={() => trocarTela('login')} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Entrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
