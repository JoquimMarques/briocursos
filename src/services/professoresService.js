import { 
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Busca todos os professores do Firestore
 */
export const getProfessores = async () => {
  try {
    const professoresRef = collection(db, 'professores')
    // Tentar com orderBy, mas fazer fallback se falhar
    let querySnapshot
    try {
      const q = query(professoresRef, orderBy('createdAt', 'desc'))
      querySnapshot = await getDocs(q)
    } catch (orderError) {
      // Se orderBy falhar (índice não criado ou campo não existe), buscar sem ordenação
      querySnapshot = await getDocs(professoresRef)
    }
    
    const professores = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Remover campo foto se existir
      const { foto, ...professorData } = data
      professores.push({
        id: doc.id,
        ...professorData
      })
    })
    
    return { data: professores, error: null }
  } catch (error) {
    // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
    if (error.code !== 'permission-denied') {
      console.error('Erro ao buscar professores:', error)
    }
    return { data: [], error: error.message }
  }
}

/**
 * Adiciona um novo professor
 */
export const addProfessor = async (professorData) => {
  try {
    const professoresRef = collection(db, 'professores')
    
    const newProfessor = {
      nome: professorData.nome,
      especialidade: professorData.especialidade || professorData.profissao,
      bio: professorData.bio || professorData.descricao,
      experiencia: professorData.experiencia || '',
      instituicao: professorData.instituicao || '',
      cursos: professorData.cursos || [],
      // Foto removida conforme solicitado
      redesSociais: {
        briolink: professorData.briolink || '',
        portfolio: professorData.portfolio || '',
        linkedin: professorData.linkedin || '',
        github: professorData.github || '',
        twitter: professorData.twitter || '',
        instagram: professorData.instagram || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const docRef = await addDoc(professoresRef, newProfessor)
    
    return { data: { id: docRef.id, ...newProfessor }, error: null }
  } catch (error) {
    console.error('Erro ao adicionar professor:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Atualiza um professor existente
 */
export const updateProfessor = async (professorId, professorData) => {
  try {
    const professorRef = doc(db, 'professores', professorId)
    
    const updateData = {
      ...professorData,
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(professorRef, updateData)
    
    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar professor:', error)
    return { error: error.message }
  }
}

/**
 * Remove um professor
 */
export const deleteProfessor = async (professorId) => {
  try {
    const professorRef = doc(db, 'professores', professorId)
    await deleteDoc(professorRef)
    
    return { error: null }
  } catch (error) {
    console.error('Erro ao remover professor:', error)
    return { error: error.message }
  }
}

