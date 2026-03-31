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
  serverTimestamp,
} from 'firebase/firestore'
import { ROLE_ADMIN_ID, PERMISSOES_ADMIN } from './constants'

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
  visualizador: {
    nome: 'Visualizador',
    cor: 'slate',
    permissoes: {
      dashboard: { ver: true },
      lista: { ver: false },
      usuarios: { ver: false },
    },
  },
  tecnico: {
    nome: 'Técnico',
    cor: 'indigo',
    permissoes: {
      dashboard: { ver: true },
      lista: { ver: true },
      usuarios: { ver: false },
    },
  },
}

async function garantirRolePadrao(roleId) {
  if (roleId === ROLE_ADMIN_ID) return PERMISSOES_ADMIN
  const roleRef = doc(db, 'roles', roleId)
  const roleSnap = await getDoc(roleRef)
  if (roleSnap.exists()) return roleSnap.data().permissoes
  // Cria o perfil padrão se não existir (pode falhar se não-admin — ok, ainda retorna)
  const padrao = ROLES_PADRAO[roleId]
  if (padrao) {
    try { await setDoc(roleRef, padrao) } catch {}
    return padrao.permissoes
  }
  // Perfil customizado sem documento — dá acesso ao dashboard por segurança
  return { dashboard: { ver: true }, lista: { ver: false }, usuarios: { ver: false } }
}

export async function buscarOuCriarUsuario(user) {
  const ref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    let roleId = 'visualizador'
    try {
      const conviteSnap = await getDoc(doc(db, 'convites', user.email.toLowerCase()))
      if (conviteSnap.exists() && !conviteSnap.data().usado) {
        roleId = conviteSnap.data().roleId || 'visualizador'
        await updateDoc(doc(db, 'convites', user.email.toLowerCase()), { usado: true })
      }
    } catch { }

    await setDoc(ref, {
      nome: user.displayName || '',
      email: user.email || '',
      roleId,
      criadoEm: serverTimestamp(),
    })

    const permissoes = await garantirRolePadrao(roleId)
    return { roleId, permissoes }
  }

  const data = snap.data()
  const roleId = data.roleId || data.role || 'visualizador'

  // Marca convite como usado caso ainda esteja pendente
  try {
    const conviteRef = doc(db, 'convites', user.email.toLowerCase())
    const conviteSnap = await getDoc(conviteRef)
    if (conviteSnap.exists() && !conviteSnap.data().usado) {
      await updateDoc(conviteRef, { usado: true })
    }
  } catch { }

  if (roleId === ROLE_ADMIN_ID) {
    return { roleId, permissoes: PERMISSOES_ADMIN }
  }

  const permissoes = await garantirRolePadrao(roleId)
  return { roleId, permissoes }
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
