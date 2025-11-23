// Serviço para gerenciar dados de cursos de programação

// Importar imagens
import portugolImage from '../img/portugol-webstudio-icon-filled-256.png'
import htmlImage from '../img/images.png'
import cssImage from '../img/png-transparent-css-logo-thumbnail.png'
import jsImage from '../img/Unofficial_JavaScript_logo_2.png'

/**
 * Lista de cursos de programação disponíveis
 */
export const courses = [
  {
    id: 'portugol-studio',
    title: 'Logica de Programação com Portugol Studio',
    subtitle: 'Logica de Programação com Portugol Studio',
    description: 'Aprenda lógica de programação com Portugol Studio, do zero ao avançado',
    category: 'Programação',
    level: 'Iniciante',
    duration: '30 horas',
    thumbnail: portugolImage,
    color: '#4ade80',
    instructor: 'Joaquim César Marques',
    rating: 4.9,
    price: 0,
    lessons: 25,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução ao Portugol Studio', lessons: 3 },
        { title: 'Variáveis e Tipos de Dados', lessons: 4 },
        { title: 'Estruturas Condicionais', lessons: 5 },
        { title: 'Estruturas de Repetição', lessons: 6 },
        { title: 'Funções e Procedimentos', lessons: 4 },
        { title: 'Vetores e Matrizes', lessons: 3 },
      ]
    }
  },
  {
    id: 'html',
    title: 'Desenvolvedor Front-end com HTML',
    subtitle: 'Desenvolvedor Front-end com HTML',
    description: 'Domine HTML5 e crie estruturas semânticas e acessíveis para web',
    category: 'Programação',
    level: 'Iniciante',
    duration: '35 horas',
    thumbnail: htmlImage,
    color: '#E34F26',
    instructor: 'Equipe de Professores',
    rating: 4.8,
    price: 0,
    lessons: 28,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Fundamentos de HTML', lessons: 5 },
        { title: 'Estrutura Semântica', lessons: 6 },
        { title: 'Formulários HTML', lessons: 5 },
        { title: 'Multimídia e Embedding', lessons: 4 },
        { title: 'HTML5 Avançado', lessons: 5 },
        { title: 'Acessibilidade Web', lessons: 3 },
      ]
    }
  },
  {
    id: 'css',
    title: 'Desenvolvedor Front-end com CSS',
    subtitle: 'Desenvolvedor Front-end com CSS',
    description: 'Aprenda CSS3, Flexbox, Grid e animações para criar interfaces modernas',
    category: 'Programação',
    level: 'Iniciante',
    duration: '40 horas',
    thumbnail: cssImage,
    color: '#1572B6',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 32,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Fundamentos de CSS', lessons: 6 },
        { title: 'Layout com Flexbox', lessons: 5 },
        { title: 'Grid Layout', lessons: 5 },
        { title: 'Animações e Transições', lessons: 4 },
        { title: 'Responsividade', lessons: 6 },
        { title: 'CSS Avançado', lessons: 6 },
      ]
    }
  },
  {
    id: 'javascript',
    title: 'Desenvolvedor Front-end com JavaScript',
    subtitle: 'Desenvolvedor Front-end com JavaScript',
    description: 'Domine JavaScript ES6+, manipulação do DOM e programação assíncrona',
    category: 'Programação',
    level: 'Intermediário',
    duration: '50 horas',
    thumbnail: jsImage,
    color: '#F7DF1E',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 40,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Fundamentos de JavaScript', lessons: 8 },
        { title: 'DOM e Eventos', lessons: 7 },
        { title: 'ES6+ Moderno', lessons: 8 },
        { title: 'Async/Await e Promises', lessons: 6 },
        { title: 'APIs e Fetch', lessons: 5 },
        { title: 'Projetos Práticos', lessons: 6 },
      ]
    }
  },
  {
    id: 'python',
    title: 'Lógica de Programação com Python',
    subtitle: 'Lógica de Programação com Python',
    description: 'Aprenda lógica de programação com Python, do zero ao avançado',
    category: 'Programação',
    level: 'Iniciante',
    duration: '40 horas',
    thumbnail: '🐍',
    color: '#3776AB',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 30,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução ao Python', lessons: 5 },
        { title: 'Variáveis e Tipos de Dados', lessons: 5 },
        { title: 'Estruturas Condicionais', lessons: 6 },
        { title: 'Estruturas de Repetição', lessons: 6 },
        { title: 'Funções e Módulos', lessons: 5 },
        { title: 'Listas, Tuplas e Dicionários', lessons: 3 },
      ]
    }
  },
  {
    id: 'http-https',
    title: 'HTTP & HTTPS — Como a web realmente funciona',
    subtitle: 'HTTP & HTTPS — Como a web realmente funciona',
    description: 'Entenda como funcionam os protocolos HTTP e HTTPS e os fundamentos da comunicação web',
    category: 'Cibersegurança',
    level: 'Iniciante',
    duration: '15 horas',
    thumbnail: '🌐',
    color: '#EF4444',
    instructor: 'Equipe de Professores',
    rating: 4.8,
    price: 0,
    lessons: 12,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução ao HTTP', lessons: 2 },
        { title: 'Como funciona o protocolo HTTP', lessons: 3 },
        { title: 'HTTPS e segurança', lessons: 3 },
        { title: 'Certificados SSL/TLS', lessons: 2 },
        { title: 'Headers e requisições', lessons: 2 },
      ]
    }
  },
  {
    id: 'ciberseguranca-iniciantes',
    title: 'Cibersegurança para Iniciantes - Fundamentos',
    subtitle: 'Cibersegurança para Iniciantes - Fundamentos',
    description: 'Aprenda os conceitos básicos de cibersegurança, proteção de dados e boas práticas de segurança digital',
    category: 'Cibersegurança',
    level: 'Iniciante',
    duration: '20 horas',
    thumbnail: '🛡️',
    color: '#EF4444',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 18,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução à Cibersegurança', lessons: 3 },
        { title: 'Ameaças Digitais Comuns', lessons: 4 },
        { title: 'Proteção de Senhas e Autenticação', lessons: 3 },
        { title: 'Segurança em Redes e Wi-Fi', lessons: 3 },
        { title: 'Proteção de Dados Pessoais', lessons: 3 },
        { title: 'Boas Práticas de Segurança', lessons: 2 },
      ]
    }
  },
  {
    id: 'photoshop',
    title: 'Adobe Photoshop - Design Gráfico Profissional',
    subtitle: 'Adobe Photoshop - Design Gráfico Profissional',
    description: 'Domine o Adobe Photoshop e crie designs profissionais, edições de imagens e composições visuais incríveis',
    category: 'Designer Gráfico',
    level: 'Iniciante',
    duration: '45 horas',
    thumbnail: '🎨',
    color: '#8B5CF6',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 35,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução ao Photoshop', lessons: 5 },
        { title: 'Ferramentas Básicas', lessons: 6 },
        { title: 'Camadas e Máscaras', lessons: 6 },
        { title: 'Edição de Imagens', lessons: 6 },
        { title: 'Efeitos e Filtros', lessons: 5 },
        { title: 'Composição e Design', lessons: 4 },
        { title: 'Projetos Práticos', lessons: 3 },
      ]
    }
  },
  {
    id: 'canva',
    title: 'Canva - Design Gráfico para Iniciantes',
    subtitle: 'Canva - Design Gráfico para Iniciantes',
    description: 'Aprenda a criar designs profissionais com Canva, do básico ao avançado, sem precisar de conhecimentos técnicos',
    category: 'Designer Gráfico',
    level: 'Iniciante',
    duration: '25 horas',
    thumbnail: '✨',
    color: '#00C4CC',
    instructor: 'Equipe de Professores',
    rating: 4.8,
    price: 0,
    lessons: 20,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução ao Canva', lessons: 3 },
        { title: 'Ferramentas e Elementos', lessons: 4 },
        { title: 'Templates e Design', lessons: 4 },
        { title: 'Tipografia e Cores', lessons: 3 },
        { title: 'Animações e Vídeos', lessons: 3 },
        { title: 'Projetos Práticos', lessons: 3 },
      ]
    }
  },
  {
    id: 'pa-pg',
    title: 'Progressão Aritmética e Progressão Geométrica',
    subtitle: 'PA e PG - Progressões Matemáticas',
    description: 'Domine Progressão Aritmética (PA) e Progressão Geométrica (PG) com exemplos práticos e exercícios resolvidos',
    category: 'Matemática',
    level: 'Intermediário',
    duration: '18 horas',
    thumbnail: '📊',
    color: '#3B82F6',
    instructor: 'Equipe de Professores',
    rating: 4.8,
    price: 0,
    lessons: 15,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução às Progressões', lessons: 2 },
        { title: 'Progressão Aritmética (PA)', lessons: 4 },
        { title: 'Fórmulas e Propriedades da PA', lessons: 3 },
        { title: 'Progressão Geométrica (PG)', lessons: 4 },
        { title: 'Fórmulas e Propriedades da PG', lessons: 2 },
      ]
    }
  },
  {
    id: 'limites',
    title: 'Limites - Cálculo Diferencial',
    subtitle: 'Limites - Cálculo Diferencial',
    description: 'Aprenda o conceito de limites, suas propriedades e aplicações no cálculo diferencial e integral',
    category: 'Matemática',
    level: 'Avançado',
    duration: '22 horas',
    thumbnail: '∞',
    color: '#3B82F6',
    instructor: 'Equipe de Professores',
    rating: 4.9,
    price: 0,
    lessons: 18,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Conceito de Limite', lessons: 3 },
        { title: 'Limites Laterais', lessons: 3 },
        { title: 'Propriedades dos Limites', lessons: 4 },
        { title: 'Limites Infinitos', lessons: 3 },
        { title: 'Limites no Infinito', lessons: 3 },
        { title: 'Continuidade', lessons: 2 },
      ]
    }
  },
  {
    id: 'exponencial',
    title: 'Função Exponencial e Logarítmica',
    subtitle: 'Função Exponencial e Logarítmica',
    description: 'Domine funções exponenciais, logarítmicas e suas aplicações em problemas reais',
    category: 'Matemática',
    level: 'Intermediário',
    duration: '20 horas',
    thumbnail: '📈',
    color: '#3B82F6',
    instructor: 'Equipe de Professores',
    rating: 4.8,
    price: 0,
    lessons: 16,
    videoUrl: 'https://www.youtube.com/embed/embed-placeholder',
    content: {
      modules: [
        { title: 'Introdução às Funções Exponenciais', lessons: 3 },
        { title: 'Propriedades da Função Exponencial', lessons: 3 },
        { title: 'Função Logarítmica', lessons: 3 },
        { title: 'Propriedades dos Logaritmos', lessons: 3 },
        { title: 'Equações Exponenciais e Logarítmicas', lessons: 2 },
        { title: 'Aplicações Práticas', lessons: 2 },
      ]
    }
  },
]

/**
 * Lista de jornadas por categoria
 */
export const journeys = [
  {
    id: 'programacao',
    title: 'Jornada de Programação',
    category: 'Programação',
    description: 'Aprenda programação do zero ao avançado com os melhores cursos',
    icon: '💻',
    color: '#4ade80',
    courses: ['portugol-studio', 'html', 'css', 'javascript', 'python']
  },
  {
    id: 'ciberseguranca',
    title: 'Jornada de Cibersegurança para Iniciantes',
    category: 'Cibersegurança',
    description: 'Proteja-se e aprenda os fundamentos da segurança digital',
    icon: '🔒',
    color: '#EF4444',
    courses: ['ciberseguranca-iniciantes', 'http-https']
  },
  {
    id: 'marketing',
    title: 'Jornada de Designer Gráfico',
    category: 'Designer Gráfico',
    description: 'Aprenda design gráfico, criação visual e ferramentas de design',
    icon: '🎨',
    color: '#8B5CF6',
    courses: ['photoshop', 'canva']
  },
  {
    id: 'matematica',
    title: 'Jornada de Matemática',
    category: 'Matemática',
    description: 'Aprenda matemática de forma prática e aplicada',
    icon: '📐',
    color: '#3B82F6',
    courses: ['pa-pg', 'limites', 'exponencial']
  }
]

/**
 * Busca o número real de alunos inscritos em um curso do Firestore
 */
export const getCourseStudentsCount = async (courseId) => {
  try {
    // Importar Firestore dinamicamente para evitar problemas de inicialização
    const { db } = await import('./firebase')
    const { collection, getDocs } = await import('firebase/firestore')
    
    // Contar inscrições do curso
    const enrollmentsRef = collection(db, 'courses', courseId, 'enrollments')
    const snapshot = await getDocs(enrollmentsRef)
    
    return snapshot.size || 0
  } catch (error) {
    console.error('Erro ao buscar número de alunos:', error)
    return 0
  }
}

/**
 * Busca todas as jornadas
 */
export const getAllJourneys = async () => {
  const journeysData = await Promise.all(
    journeys.map(async (journey) => {
      // Buscar cursos da jornada
      const journeyCourses = courses.filter(c => journey.courses.includes(c.id))
      
      // Calcular estatísticas da jornada
      const totalStudents = await Promise.all(
        journeyCourses.map(async (course) => {
          return await getCourseStudentsCount(course.id)
        })
      )
      const studentsCount = totalStudents.reduce((sum, count) => sum + count, 0)
      const totalLessons = journeyCourses.reduce((sum, course) => sum + (course.lessons || 0), 0)
      const totalDuration = journeyCourses.reduce((sum, course) => {
        const hours = parseFloat(course.duration?.replace(' horas', '')) || 0
        return sum + hours
      }, 0)
      
      return {
        ...journey,
        students: studentsCount,
        coursesCount: journeyCourses.length,
        totalLessons,
        totalDuration: `${totalDuration} horas`,
        type: 'journey',
        courses: journeyCourses
      }
    })
  )
  return journeysData
}

/**
 * Busca uma jornada específica por ID
 */
export const getJourneyById = async (journeyId) => {
  const journey = journeys.find(j => j.id === journeyId)
  if (!journey) return null

  // Buscar cursos da jornada
  const journeyCourses = courses.filter(c => journey.courses.includes(c.id))
  
  // Calcular estatísticas
  const totalStudents = await Promise.all(
    journeyCourses.map(async (course) => {
      return await getCourseStudentsCount(course.id)
    })
  )
  const studentsCount = totalStudents.reduce((sum, count) => sum + count, 0)
  const totalLessons = journeyCourses.reduce((sum, course) => sum + (course.lessons || 0), 0)
  const totalDuration = journeyCourses.reduce((sum, course) => {
    const hours = parseFloat(course.duration?.replace(' horas', '')) || 0
    return sum + hours
  }, 0)

  return {
    ...journey,
    students: studentsCount,
    coursesCount: journeyCourses.length,
    totalLessons,
    totalDuration: `${totalDuration} horas`,
    type: 'journey',
    courses: journeyCourses
  }
}

/**
 * Busca todos os cursos/jornadas
 */
export const getAllCourses = async () => {
  const coursesData = await Promise.all(
    courses.map(async (course) => {
      const studentsCount = await getCourseStudentsCount(course.id)
      return {
        ...course,
        students: studentsCount,
        type: 'course',
      }
    })
  )
  return coursesData
}

/**
 * Busca um curso/jornada específico por ID
 */
export const getCourseById = async (courseId) => {
  const course = courses.find(c => c.id === courseId)
  if (!course) return null

  const studentsCount = await getCourseStudentsCount(courseId)

  return {
    ...course,
    students: studentsCount,
    type: 'course',
  }
}

/**
 * Busca o total de alunos únicos da plataforma
 * Conta todos os usuários únicos que estão inscritos em pelo menos um curso
 */
export const getTotalPlatformStudents = async () => {
  try {
    // Importar Firestore dinamicamente para evitar problemas de inicialização
    const { db } = await import('./firebase')
    const { collection, getDocs } = await import('firebase/firestore')
    
    const allUserIds = new Set()
    
    // Para cada curso, buscar todos os alunos inscritos
    for (const course of courses) {
      try {
        const enrollmentsRef = collection(db, 'courses', course.id, 'enrollments')
        const snapshot = await getDocs(enrollmentsRef)
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.userId) {
            allUserIds.add(data.userId)
          }
        })
      } catch (error) {
        console.error(`Erro ao buscar alunos do curso ${course.id}:`, error)
        // Continua para o próximo curso mesmo se houver erro
      }
    }
    
    return allUserIds.size
  } catch (error) {
    console.error('Erro ao buscar total de alunos da plataforma:', error)
    return 0
  }
}

/**
 * Transforma dados de curso/jornada no formato esperado pelo site
 */
export const transformCourseData = (course) => {
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle || course.title,
    description: course.description,
    category: course.category || 'Programação',
    level: course.level || 'Iniciante',
    duration: course.duration || '20 horas',
    thumbnail: course.thumbnail || '📚',
    color: course.color || '#667eea',
    type: 'course',
    instructor: course.instructor,
    rating: course.rating,
    students: course.students || 0,
    price: course.price || 0,
    lessons: course.lessons,
    videoUrl: course.videoUrl,
    content: course.content,
  }
}

export default {
  getAllCourses,
  getCourseById,
  getAllJourneys,
  getJourneyById,
  transformCourseData,
}
