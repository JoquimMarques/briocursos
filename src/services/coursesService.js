import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  increment
} from 'firebase/firestore'
import { db } from './firebase'

/**
 * Inscreve um usuário em um curso
 */
export const enrollInCourse = async (userId, courseId) => {
  try {
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', userId)
    const enrollmentSnap = await getDoc(enrollmentRef)
    
    if (enrollmentSnap.exists()) {
      return { error: 'Você já está inscrito neste curso' }
    }

    // Criar inscrição
    await setDoc(enrollmentRef, {
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedVideos: [],
      progress: 0
    })

    // Incrementar contador de alunos no curso
    const courseRef = doc(db, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (courseSnap.exists()) {
      await updateDoc(courseRef, {
        students: increment(1)
      })
    } else {
      // Se o curso não existe no Firestore, criar com alunos = 1
      await setDoc(courseRef, {
        students: 1
      }, { merge: true })
    }

    return { error: null }
  } catch (error) {
    console.error('Erro ao inscrever no curso:', error)
    return { error: error.message }
  }
}

/**
 * Verifica se o usuário está inscrito no curso
 */
export const isEnrolledInCourse = async (userId, courseId) => {
  try {
    if (!userId) return false
    
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', userId)
    const enrollmentSnap = await getDoc(enrollmentRef)
    return enrollmentSnap.exists()
  } catch (error) {
    console.error('Erro ao verificar inscrição:', error)
    return false
  }
}

/**
 * Busca o progresso do usuário no curso
 */
export const getUserProgress = async (userId, courseId) => {
  try {
    if (!userId) return { completedVideos: [], progress: 0 }
    
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', userId)
    const enrollmentSnap = await getDoc(enrollmentRef)
    
    if (enrollmentSnap.exists()) {
      const data = enrollmentSnap.data()
      return {
        completedVideos: data.completedVideos || [],
        progress: data.progress || 0
      }
    }
    
    return { completedVideos: [], progress: 0 }
  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    return { completedVideos: [], progress: 0 }
  }
}

/**
 * Marca um vídeo como concluído
 */
export const markVideoAsCompleted = async (userId, courseId, videoId, totalVideos) => {
  try {
    if (!userId) return { error: 'Usuário não autenticado' }
    
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', userId)
    const enrollmentSnap = await getDoc(enrollmentRef)
    
    if (!enrollmentSnap.exists()) {
      return { error: 'Você não está inscrito neste curso' }
    }

    const data = enrollmentSnap.data()
    const completedVideos = data.completedVideos || []
    
    // Se o vídeo já foi concluído, não fazer nada
    if (completedVideos.includes(videoId)) {
      return { error: null }
    }

    // Adicionar vídeo aos concluídos
    const updatedCompletedVideos = [...completedVideos, videoId]
    
    // Calcular progresso (percentual de vídeos concluídos)
    const progress = totalVideos > 0 
      ? Math.round((updatedCompletedVideos.length / totalVideos) * 100)
      : 0

    // Atualizar no Firestore
    await updateDoc(enrollmentRef, {
      completedVideos: updatedCompletedVideos,
      progress: progress,
      lastUpdated: new Date().toISOString()
    })

    return { error: null, progress }
  } catch (error) {
    console.error('Erro ao marcar vídeo como concluído:', error)
    return { error: error.message }
  }
}

/**
 * Conta o número total de alunos inscritos em um curso
 */
export const getCourseEnrollmentCount = async (courseId) => {
  try {
    const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments')
    const enrollmentsSnapshot = await getDocs(enrollmentsRef)
    return enrollmentsSnapshot.size
  } catch (error) {
    // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
    if (error.code !== 'permission-denied') {
      console.error('Erro ao contar inscrições:', error)
    }
    return 0
  }
}

/**
 * Busca o número de alunos do curso (do documento do curso ou contando inscrições)
 */
export const getCourseStudents = async (courseId) => {
  try {
    // Primeiro, tentar buscar do documento do curso
    const courseRef = doc(db, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (courseSnap.exists()) {
      const data = courseSnap.data()
      if (data.students !== undefined) {
        return data.students
      }
    }
    
    // Se não tiver no documento, contar as inscrições
    return await getCourseEnrollmentCount(courseId)
  } catch (error) {
    // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
    if (error.code !== 'permission-denied') {
      console.error('Erro ao buscar número de alunos:', error)
    }
    // Em caso de erro, contar as inscrições
    return await getCourseEnrollmentCount(courseId)
  }
}

