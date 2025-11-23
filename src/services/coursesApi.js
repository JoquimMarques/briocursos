// Serviço simplificado para buscar cursos - apenas dados locais, sem API externa

import { 
  getAllCourses as getAllCoursesLocal,
  getCourseById as getCourseByIdLocal,
  getAllJourneys as getAllJourneysLocal,
  getJourneyById as getJourneyByIdLocal,
  transformCourseData as transformCourseDataLocal,
} from './coursesData'

/**
 * Busca todos os cursos disponíveis
 */
export const getAllCourses = async () => {
  const coursesData = await getAllCoursesLocal()
  return coursesData.map(transformCourseDataLocal)
}

/**
 * Busca um curso específico por ID
 */
export const getCourseById = async (courseId) => {
  const course = await getCourseByIdLocal(courseId)
  return course ? transformCourseDataLocal(course) : null
}

/**
 * Busca todas as jornadas disponíveis
 */
export const getAllJourneys = async () => {
  return await getAllJourneysLocal()
}

/**
 * Busca uma jornada específica por ID
 */
export const getJourneyById = async (journeyId) => {
  return await getJourneyByIdLocal(journeyId)
}

export default {
  getAllCourses,
  getCourseById,
  getAllJourneys,
  getJourneyById,
}
