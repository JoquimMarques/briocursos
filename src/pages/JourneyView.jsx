import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { getJourneyById } from '../services/coursesApi'
import './JourneyView.css'

function JourneyView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [journey, setJourney] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setLoading(true)
        const data = await getJourneyById(id)
        
        if (!data) {
          setError('Jornada não encontrada')
          return
        }
        
        setJourney(data)
      } catch (err) {
        console.error('Erro ao carregar jornada:', err)
        setError('Erro ao carregar a jornada')
      } finally {
        setLoading(false)
      }
    }

    fetchJourney()
  }, [id])

  if (loading) {
    return (
      <div className="journey-view-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando jornada...</p>
        </div>
      </div>
    )
  }

  if (error || !journey) {
    return (
      <div className="journey-view-page">
        <div className="error-container">
          <h2>Erro</h2>
          <p>{error || 'Jornada não encontrada'}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="journey-view-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Voltar
        </button>
        
        <div className="journey-header">
          <div 
            className="journey-icon"
            style={{ 
              backgroundColor: journey.color || '#667eea',
              fontSize: '8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '200px',
              height: '200px',
              borderRadius: '20px',
              marginBottom: '2rem'
            }}
          >
            {journey.icon || '📚'}
          </div>
          <h1 className="journey-title">{journey.title}</h1>
          <p className="journey-description">{journey.description}</p>
          <div className="journey-stats">
            <span>📚 {journey.coursesCount || 0} cursos</span>
            {journey.students !== undefined && (
              <span>👥 {journey.students.toLocaleString()} alunos</span>
            )}
          </div>
        </div>

        <div className="journey-courses-section">
          <h2 className="section-title">Cursos da Jornada</h2>
          
          {journey.courses && journey.courses.length > 0 ? (
            <div className="courses-grid">
              {journey.courses.map((course) => (
                <CourseCard key={course.id} course={{
                  ...course,
                  type: 'course'
                }} />
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <p>Nenhum curso disponível nesta jornada ainda.</p>
              <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>
                Os cursos serão adicionados em breve!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JourneyView

