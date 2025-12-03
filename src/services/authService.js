import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore'
import { auth, db } from './firebase'

/**
 * Registra um novo usuário
 */
export const registerUser = async (email, password, fullName) => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Atualizar o displayName no Auth
    await updateProfile(user, {
      displayName: fullName
    })

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { user, error: null }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Faz login do usuário
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user, error: null }
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Faz logout do usuário
 */
export const logoutUser = async () => {
  try {
    await signOut(auth)
    // Limpar localStorage ao fazer logout
    localStorage.removeItem('userProfile')
    return { error: null }
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return { error: error.message }
  }
}

/**
 * Atualiza o nome completo do usuário
 */
export const updateUserFullName = async (userId, fullName) => {
  try {
    // Validar se o nome é completo (tem pelo menos 2 palavras)
    const nameParts = fullName.trim().split(/\s+/)
    if (nameParts.length < 2) {
      return { error: 'Por favor, informe seu nome completo (nome e sobrenome)' }
    }

    const user = auth.currentUser
    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    // Atualizar no Auth
    await updateProfile(user, {
      displayName: fullName
    })

    // Atualizar no Firestore
    await updateDoc(doc(db, 'users', userId), {
      fullName: fullName,
      updatedAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar nome:', error)
    return { error: error.message }
  }
}

/**
 * Atualiza dados do perfil do usuário
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const user = auth.currentUser
    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    // Atualizar no Firestore
    await updateDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return { error: error.message }
  }
}

/**
 * Busca dados do usuário no Firestore
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return { data: userDoc.data(), error: null }
    }
    return { data: null, error: 'Usuário não encontrado' }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Salva dados do perfil no localStorage
 */
export const saveProfileToLocalStorage = (userId, profileData) => {
  try {
    const data = {
      userId,
      ...profileData,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('userProfile', JSON.stringify(data))
    return { error: null }
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
    return { error: error.message }
  }
}

/**
 * Carrega dados do perfil do localStorage
 */
export const loadProfileFromLocalStorage = (userId) => {
  try {
    const data = localStorage.getItem('userProfile')
    if (data) {
      const parsed = JSON.parse(data)
      // Verificar se é do mesmo usuário
      if (parsed.userId === userId) {
        return { data: parsed, error: null }
      }
    }
    return { data: null, error: null }
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Converte arquivo de imagem para base64
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime e redimensiona imagem para reduzir tamanho
 * @param {File} file - Arquivo de imagem
 * @param {number} maxWidth - Largura máxima (padrão: 800px)
 * @param {number} maxHeight - Altura máxima (padrão: 800px)
 * @param {number} quality - Qualidade da compressão 0-1 (padrão: 0.8)
 * @returns {Promise<string>} - Base64 da imagem comprimida
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo não é uma imagem'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Converter para base64 com compressão
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao comprimir imagem'))
              return
            }
            
            // Verificar se o blob ainda é muito grande (> 900KB para deixar margem)
            if (blob.size > 900 * 1024) {
              // Tentar com qualidade menor
              canvas.toBlob(
                (smallerBlob) => {
                  if (!smallerBlob) {
                    reject(new Error('Erro ao comprimir imagem'))
                    return
                  }
                  const reader2 = new FileReader()
                  reader2.onload = () => resolve(reader2.result)
                  reader2.onerror = (error) => reject(error)
                  reader2.readAsDataURL(smallerBlob)
                },
                file.type,
                0.6 // Qualidade ainda menor
              )
            } else {
              const reader2 = new FileReader()
              reader2.onload = () => resolve(reader2.result)
              reader2.onerror = (error) => reject(error)
              reader2.readAsDataURL(blob)
            }
          },
          file.type,
          quality
        )
      }
      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.src = e.target.result
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Envia email de recuperação de senha
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error)
    return { error: error.message }
  }
}

/**
 * Observa mudanças no estado de autenticação
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
