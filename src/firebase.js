import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

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

const provider = new GoogleAuthProvider()

export function loginComGoogle() {
  return signInWithPopup(auth, provider)
}

export function logout() {
  return signOut(auth)
}
