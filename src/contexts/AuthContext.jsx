import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, buscarOuCriarUsuario, registrarLog } from '../firebase'
import { ROLE_ADMIN_ID } from '../constants'

const AuthContext = createContext({
  usuario: undefined,
  role: 'visualizador',
  permissoes: {},
  servicosPermitidos: [],
  podeVer: () => false,
  temPermissao: () => false,
})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const [role, setRole] = useState('visualizador')
  const [permissoes, setPermissoes] = useState({})
  const [servicosPermitidos, setServicosPermitidos] = useState([])

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const { roleId, permissoes: p, servicos_fila } = await buscarOuCriarUsuario(user)
          setRole(roleId)
          setPermissoes(p)
          setServicosPermitidos(servicos_fila || [])
          registrarLog(user.uid, user.displayName || user.email, 'login', { email: user.email }).catch(() => {})
        } catch (err) {
          console.error('[AuthContext] erro ao buscar usuário:', err)
          setRole('visualizador')
          setPermissoes({})
          setServicosPermitidos([])
        }
        setUsuario(user)
      } else {
        setUsuario(null)
        setRole('visualizador')
        setPermissoes({})
        setServicosPermitidos([])
      }
    })
  }, [])

  function podeVer(pagina) {
    if (role === ROLE_ADMIN_ID) return true
    return permissoes?.[pagina]?.ver ?? false
  }

  function temPermissao(pagina, acao) {
    if (role === ROLE_ADMIN_ID) return true
    return permissoes?.[pagina]?.[acao] ?? false
  }

  return (
    <AuthContext.Provider value={{ usuario, role, permissoes, servicosPermitidos, podeVer, temPermissao }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
