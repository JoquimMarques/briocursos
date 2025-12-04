import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isEnrolledInCourse, getUserProgress } from '../services/coursesService'
import './CourseCard.css'

function CourseCard({ course }) {
  const { user } = useAuth()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnrollment = async () => {
      // Se for jornada, não verificar inscrição
      if (!user || !course || course.type === 'journey') {
        setLoading(false)
        return
      }

      try {
        const enrolled = await isEnrolledInCourse(user.uid, course.id)
        setIsEnrolled(enrolled)
        
        if (enrolled) {
          const userProgress = await getUserProgress(user.uid, course.id)
          setProgress(userProgress.progress || 0)
        }
      } catch (error) {
        console.error('Erro ao verificar inscrição:', error)
      } finally {
        setLoading(false)
      }
    }

    checkEnrollment()
  }, [user, course])

  if (!course) return null

  return (
    <div className="course-card">
      <div className="course-image-container">
        <div 
          className="course-thumbnail"
          style={{ 
            backgroundColor: course.color || '#667eea',
            fontSize: '5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: course.thumbnail && (typeof course.thumbnail === 'string' && (course.thumbnail.startsWith('/') || course.thumbnail.startsWith('http')) ? `url(${course.thumbnail})` : typeof course.thumbnail !== 'string' ? `url(${course.thumbnail})` : 'none'),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {course.thumbnail && typeof course.thumbnail === 'string' && !course.thumbnail.startsWith('/') && !course.thumbnail.startsWith('http') ? course.thumbnail : ''}
        </div>
        {course.category && (
          <span className="course-category">{course.category}</span>
        )}
      </div>
      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <h4 className="course-subtitle">{course.subtitle || course.title}</h4>
        <p className="course-description">
          {course.description || 'Descrição não disponível'}
        </p>
        <div className="course-footer">
          <div className="course-footer-top">
            {course.students !== undefined && (
              <span className="course-students">
                👥 {course.students.toLocaleString()} alunos
              </span>
            )}
            {course.rating !== undefined && course.rating > 0 && (
              <span className="course-rating">
                ⭐ {course.rating.toFixed(1)} {course.ratingCount > 0 && `(${course.ratingCount})`}
              </span>
            )}
          </div>
          {!loading && !isEnrolled && course.price !== undefined && (
            <span className="course-price">
              {course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'Grátis'}
            </span>
          )}
          {!loading && isEnrolled && (
            <div className="course-progress-container">
              <div className="circular-progress" style={{ '--progress': progress }}>
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="#e0e0e0"
                    strokeWidth="6"
                    fill="transparent"
                    r="24"
                    cx="30"
                    cy="30"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke="#4ade80"
                    strokeWidth="6"
                    fill="transparent"
                    r="24"
                    cx="30"
                    cy="30"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
          )}
        </div>
        <Link
          to={course.type === 'journey' ? `/jornada/${course.id}` : `/curso/${course.id}`}
          className="course-link"
        >
          {course.type === 'journey' ? 'Ver Jornada →' : 'Ver Curso →'}
        </Link>
      </div>
    </div>
  )
}

export default CourseCard
