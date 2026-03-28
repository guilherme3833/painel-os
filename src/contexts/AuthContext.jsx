import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, buscarOuCriarUsuario } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined) // undefined = carregando
  const [role, setRole] = useState('visualizador')

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const r = await buscarOuCriarUsuario(user)
        setRole(r)
        setUsuario(user)
      } else {
        setUsuario(null)
        setRole('visualizador')
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
