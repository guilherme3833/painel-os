import { initializeApp } from 'firebase/app'
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
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

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

// Auth
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

// Firestore - Usuários
export async function buscarOuCriarUsuario(user) {
  const ref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      nome: user.displayName || '',
      email: user.email || '',
      role: 'visualizador',
      criadoEm: serverTimestamp(),
    })
    return 'visualizador'
  }
  return snap.data().role || 'visualizador'
}

export async function listarUsuarios() {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }))
}

export async function atualizarRole(uid, role) {
  return updateDoc(doc(db, 'usuarios', uid), { role })
}
