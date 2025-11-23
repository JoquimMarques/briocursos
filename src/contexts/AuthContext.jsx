import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChange, getUserData, loadProfileFromLocalStorage } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Buscar dados adicionais do Firestore
        const { data: firestoreData, error } = await getUserData(firebaseUser.uid)
        
        // Buscar dados do localStorage
        const { data: localData } = loadProfileFromLocalStorage(firebaseUser.uid)
        
        // Mesclar dados: Firestore primeiro, depois localStorage (para foto de perfil)
        const mergedData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || '',
          ...(firestoreData || {}),
          // Foto de perfil vem do localStorage
          ...(localData?.profilePhoto ? { profilePhoto: localData.profilePhoto } : {}),
          // Data de nascimento pode vir do localStorage se não estiver no Firestore
          ...(localData?.birthDate && !firestoreData?.birthDate ? { birthDate: localData.birthDate } : {}),
        }
        
        setUserData(mergedData)
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userData,
    loading,
    setUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
