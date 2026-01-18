import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from './adminAccess'
import { getAllCourses } from '../services/coursesApi'
import { getCourseStudents } from '../services/coursesService'
import { FaSync, FaUsers, FaChartLine, FaChalkboardTeacher } from 'react-icons/fa'
import './AdminStats.css'

function AdminStats() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [coursesStats, setCoursesStats] = useState([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        if (!hasAdminAccess(user)) {
            navigate('/')
            return
        }

        fetchStats()
    }, [user, navigate])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const courses = await getAllCourses()

            const statsPromises = courses.map(async (course) => {
                const studentCount = await getCourseStudents(course.id)
                return {
                    ...course,
                    studentCount: studentCount || 0
                }
            })

            const stats = await Promise.all(statsPromises)

            // Sort by student count (descending)
            stats.sort((a, b) => b.studentCount - a.studentCount)

            const total = stats.reduce((acc, curr) => acc + curr.studentCount, 0)

            setCoursesStats(stats)
            setTotalStudents(total)
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (date) => {
        if (!date) return ''
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    if (loading && !coursesStats.length) {
        return (
            <div className="admin-stats-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando estatísticas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-stats-page">
            <div className="stats-container">
                <header className="stats-header">
                    <div>
                        <h1>Painel de Alunos</h1>
                        <p className="subtitle">Visão geral de inscritos nos cursos</p>
                    </div>
                    <div className="stats-actions">
                        {lastUpdated && (
                            <span className="last-updated">
                                Atualizado às {formatTime(lastUpdated)}
                            </span>
                        )}
                        <button
                            className="btn-refresh"
                            onClick={fetchStats}
                            disabled={loading}
                        >
                            <FaSync className={loading ? 'fa-spin' : ''} />
                            Atualizar
                        </button>
                    </div>
                </header>

                <div className="stats-overview">
                    <div className="stat-card">
                        <span className="stat-title"><FaUsers /> Total de Inscrições</span>
                        <span className="stat-value">{totalStudents}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title"><FaChalkboardTeacher /> Total de Cursos</span>
                        <span className="stat-value">{coursesStats.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title"><FaChartLine /> Média por Curso</span>
                        <span className="stat-value">
                            {coursesStats.length ? Math.round(totalStudents / coursesStats.length) : 0}
                        </span>
                    </div>
                </div>

                <div className="stats-grid">
                    {coursesStats.map((course) => (
                        <div key={course.id} className="course-stat-card">
                            <div className="course-stat-header">
                                <div className="course-icon">
                                    {course.icon || '📚'}
                                </div>
                                <div className="course-info">
                                    <h3>{course.title}</h3>
                                    <span className="course-category">{course.category}</span>
                                </div>
                            </div>
                            <div className="course-stat-body">
                                <span className="student-count">{course.studentCount}</span>
                                <span className="student-label">Alunos Inscritos</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminStats
