import { useState, useEffect } from 'react'
import CourseCard from '../components/CourseCard'
import { getAllJourneys } from '../services/coursesApi'
import { getTotalPlatformStudents } from '../services/coursesData'
import './Home.css'

function Home() {
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true)
        const data = await getAllJourneys()
        setJourneys(data)
      } catch (err) {
        console.error('Erro ao carregar jornadas:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchTotalStudents = async () => {
      try {
        const total = await getTotalPlatformStudents()
        setTotalStudents(total)
      } catch (err) {
        console.error('Erro ao carregar total de alunos:', err)
      }
    }

    fetchJourneys()
    fetchTotalStudents()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você pode adicionar a lógica de cadastro
    console.log('Cadastro:', formData)
    alert('Cadastro realizado com sucesso!')
    setFormData({ name: '', email: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Comece sua
              <span className="title-highlight"> Jornada</span>
            </h1>
            <p className="hero-description">
              Cursos gratuitos e completos em diversas áreas: Programação, Cibersegurança, Designer Gráfico, Matemática...
            </p>
            {totalStudents !== null && totalStudents > 0 && (
              <p className="hero-stats">
                {totalStudents >= 1000
                  ? `Mas de ${(totalStudents / 1000).toFixed(1).replace('.0', '')} mil devs já iniciaram a sua jornada!`
                  : `Vamos lá! ${totalStudents} devs já iniciaram a sua jornada!`}
              </p>
            )}

            <div className="scroll-indicator" aria-hidden="true">
              ⬇️
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/src/img/placeholder-hero.png" 
              alt="Programação" 
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<div class="hero-image-placeholder">💻</div>'
              }}
            />
          </div>
        </div>
      </section>

      {/* <section className="signup-section">
        <div className="container">
          <div className="signup-card">
            <h2>Comece sua jornada agora!</h2>
            <p>Cadastre-se gratuitamente e tenha acesso a todos os cursos</p>
            <form onSubmit={handleSubmit} className="signup-form">
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Seu melhor e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn btn-primary">
                Cadastrar Grátis
              </button>
            </form>
          </div>
        </div>
      </section> */}

      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Nossas Jornadas</h2>
          
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando cursos...</p>
            </div>
          )}

          {!loading && journeys.length > 0 && (
            <>
              <div className="courses-grid">
                {journeys.map((journey) => (
                  <CourseCard key={journey.id} course={{
                    ...journey,
                    title: journey.title,
                    subtitle: journey.description,
                    thumbnail: journey.icon,
                    category: journey.category,
                  }} />
                ))}
              </div>
            </>
          )}

          {!loading && journeys.length === 0 && (
            <div className="no-courses">
              <p>Nenhuma jornada disponível no momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
