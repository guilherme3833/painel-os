import { initializeApp, deleteApp } from 'firebase/app'
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  addDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'
import { ROLE_ADMIN_ID, PERMISSOES_ADMIN, PAGINAS_CONFIG } from './constants'

const firebaseConfig = {
  apiKey: "AIzaSyAG46e5T0rZvNbD0F1aTiNUxsLLY4nVnxM",
  authDomain: "painel-os-941ae.firebaseapp.com",
  projectId: "painel-os-941ae",
  storageBucket: "painel-os-941ae.firebasestorage.app",
  messagingSenderId: "283829730102",
  appId: "1:283829730102:web:ca71773a983a92f7d11197"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// ── Auth ──────────────────────────────────────────────────────────────────────

export function loginComEmail(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha)
}

export async function cadastrar(nome, email, senha) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha)
  await updateProfile(cred.user, { displayName: nome })
  return cred
}

export function esqueceuSenha(email) {
  return sendPasswordResetEmail(auth, email)
}

const googleProvider = new GoogleAuthProvider()

export function loginComGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function logout() {
  return signOut(auth)
}

// ── Usuários ──────────────────────────────────────────────────────────────────

const ROLES_PADRAO = {
  visualizador: { nome: 'Visualizador', cor: 'slate' },
  tecnico:      { nome: 'Técnico',      cor: 'indigo' },
}

function permissoesVazias() {
  return Object.fromEntries(
    PAGINAS_CONFIG.map(p => [p.id, Object.fromEntries(p.acoes.map(a => [a.id, false]))])
  )
}

async function garantirRolePadrao(roleId) {
  if (roleId === ROLE_ADMIN_ID) return { permissoes: PERMISSOES_ADMIN, servicos_fila: [] }
  const base = permissoesVazias()
  const roleRef = doc(db, 'roles', roleId)
  const roleSnap = await getDoc(roleRef)
  if (roleSnap.exists()) {
    const data = roleSnap.data()
    const salvo = data.permissoes || {}
    const permissoes = Object.fromEntries(
      Object.keys(base).map(pagina => [pagina, { ...base[pagina], ...(salvo[pagina] || {}) }])
    )
    return { permissoes, servicos_fila: data.servicos_fila || [] }
  }
  const padrao = ROLES_PADRAO[roleId]
  if (padrao) {
    try { await setDoc(roleRef, { ...padrao, permissoes: base, servicos_fila: [] }) } catch {}
  }
  return { permissoes: base, servicos_fila: [] }
}

export async function buscarOuCriarUsuario(user) {
  const ref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    let roleId = 'visualizador'
    try {
      const conviteSnap = await getDoc(doc(db, 'convites', user.email.toLowerCase()))
      if (conviteSnap.exists() && !conviteSnap.data().usado) {
        const roleDoConvite = conviteSnap.data().roleId || 'visualizador'
        roleId = roleDoConvite === ROLE_ADMIN_ID ? 'visualizador' : roleDoConvite
        await updateDoc(doc(db, 'convites', user.email.toLowerCase()), { usado: true })
      }
    } catch { }

    await setDoc(ref, {
      nome: user.displayName || '',
      email: user.email || '',
      roleId,
      criadoEm: serverTimestamp(),
    })

    const { permissoes, servicos_fila } = await garantirRolePadrao(roleId)
    return { roleId, permissoes, servicos_fila }
  }

  const data = snap.data()
  const roleId = data.roleId || data.role || 'visualizador'

  try {
    const conviteRef = doc(db, 'convites', user.email.toLowerCase())
    const conviteSnap = await getDoc(conviteRef)
    if (conviteSnap.exists() && !conviteSnap.data().usado) {
      await updateDoc(conviteRef, { usado: true })
    }
  } catch { }

  if (roleId === ROLE_ADMIN_ID) {
    return { roleId, permissoes: PERMISSOES_ADMIN, servicos_fila: [] }
  }

  const { permissoes, servicos_fila } = await garantirRolePadrao(roleId)
  return { roleId, permissoes, servicos_fila }
}

export async function listarUsuarios() {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }))
}

export async function atualizarRoleUsuario(uid, roleId) {
  return updateDoc(doc(db, 'usuarios', uid), { roleId })
}

// ── Perfis (roles) ────────────────────────────────────────────────────────────

export async function listarPerfis() {
  const snap = await getDocs(collection(db, 'roles'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function salvarPerfil(id, dados) {
  return setDoc(doc(db, 'roles', id), dados)
}

export async function atualizarPerfil(id, dados) {
  return updateDoc(doc(db, 'roles', id), dados)
}

export async function deletarPerfil(id) {
  return deleteDoc(doc(db, 'roles', id))
}

// ── Perfil do usuário ─────────────────────────────────────────────────────────

export async function atualizarNome(user, novoNome) {
  await updateProfile(user, { displayName: novoNome })
  await updateDoc(doc(db, 'usuarios', user.uid), { nome: novoNome })
}

// ── Convites ──────────────────────────────────────────────────────────────────

export async function listarConvites() {
  const snap = await getDocs(collection(db, 'convites'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function criarConvite(email, roleId, criadoPor) {
  const id = email.toLowerCase().trim()
  return setDoc(doc(db, 'convites', id), {
    email: id,
    roleId,
    criadoPor,
    criadoEm: serverTimestamp(),
    usado: false,
  })
}

export async function deletarConvite(email) {
  return deleteDoc(doc(db, 'convites', email.toLowerCase().trim()))
}

// ── Config: Falta de Água ─────────────────────────────────────────────────────

export async function buscarConfigFaltaAgua() {
  const snap = await getDoc(doc(db, 'config', 'falta_agua'))
  if (snap.exists()) return snap.data()
  return { ids: [] }
}

export async function salvarConfigFaltaAgua(ids) {
  return setDoc(doc(db, 'config', 'falta_agua'), { ids })
}

// ── Config: Fila OS ───────────────────────────────────────────────────────────

export async function salvarFilaOS(ordem) {
  return setDoc(doc(db, 'config', 'fila_os'), { ordem })
}

export function ouvirFilaOS(callback) {
  return onSnapshot(doc(db, 'config', 'fila_os'), snap => {
    callback(snap.exists() ? (snap.data().ordem || []) : [])
  })
}

// ── Atribuições de OS ─────────────────────────────────────────────────────────

export function ouvirAtribuicoes(callback) {
  return onSnapshot(doc(db, 'config', 'fila_os_atribuicao'), snap => {
    callback(snap.exists() ? snap.data() : {})
  })
}

export async function atribuirOS(codigo, uid, nome) {
  const ref = doc(db, 'config', 'fila_os_atribuicao')
  const snap = await getDoc(ref)
  const atual = snap.exists() ? snap.data() : {}
  return setDoc(ref, { ...atual, [String(codigo)]: { uid, nome } })
}

// ── Log de atividades ─────────────────────────────────────────────────────────

export async function registrarLog(uid, nome, acao, detalhes = {}) {
  const agora = new Date()
  const expiraEm = new Date(agora.getTime() + 300 * 24 * 60 * 60 * 1000)
  return addDoc(collection(db, 'logs'), {
    uid,
    nome,
    acao,
    detalhes,
    criadoEm: serverTimestamp(),
    expiraEm: Timestamp.fromDate(expiraEm),
  })
}

export function ouvirLogs(callback) {
  const limite300 = Date.now() - 300 * 24 * 60 * 60 * 1000
  const q = query(
    collection(db, 'logs'),
    orderBy('criadoEm', 'desc'),
    limit(500)
  )
  return onSnapshot(q, snap => {
    const docs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.criadoEm?.toMillis?.() >= limite300)
    callback(docs)
  })
}

export async function removerAtribuicaoOS(codigo) {
  const ref = doc(db, 'config', 'fila_os_atribuicao')
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const atual = { ...snap.data() }
  delete atual[String(codigo)]
  return setDoc(ref, atual)
}

export async function criarUsuarioAdmin(email, roleId, criadoPor) {
  // Usa app secundária para não deslogar o admin atual
  const appSecundario = initializeApp(firebaseConfig, `temp_${Date.now()}`)
  const authSecundario = getAuth(appSecundario)
  try {
    const senhaTemp = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '1!'
    await createUserWithEmailAndPassword(authSecundario, email, senhaTemp)
    await sendPasswordResetEmail(authSecundario, email)
    await signOut(authSecundario)
    // Salva convite já como usado (usuário já foi criado)
    await criarConvite(email, roleId, criadoPor)
    await updateDoc(doc(db, 'convites', email.toLowerCase().trim()), { usado: false, criado: true })
  } finally {
    await deleteApp(appSecundario)
  }
}
