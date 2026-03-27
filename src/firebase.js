import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'

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

export function logout() {
  return signOut(auth)
}
