import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import { getAllJourneys, getAllCourses } from '../services/coursesApi'
import { FaSearch, FaTimes } from 'react-icons/fa'
import './Home.css'

// Palavras-chave populares para ajudar na pesquisa
const popularKeywords = [
  { label: 'Programação', icon: '💻' },
  { label: 'Python', icon: '🐍' },
  { label: 'JavaScript', icon: '⚡' },
  { label: 'HTML', icon: '🌐' },
  { label: 'CSS', icon: '🎨' },
  { label: 'Excel', icon: '📊' },
  { label: 'Matemática', icon: '🔢' },
  { label: 'Design', icon: '✨' },
  { label: 'Cibersegurança', icon: '🛡️' },
  { label: 'Photoshop', icon: '🖼️' },
]

function Home() {
  const [journeys, setJourneys] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [journeysData, coursesData] = await Promise.all([
          getAllJourneys(),
          getAllCourses()
        ])
        setJourneys(journeysData)
        setAllCourses(coursesData)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Função para pesquisar cursos
  const searchCourses = (term) => {
    if (!term.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const lowerTerm = term.toLowerCase()

    // Pesquisar em todos os cursos (de todas as jornadas)
    const results = allCourses.filter(course =>
      course.title?.toLowerCase().includes(lowerTerm) ||
      course.description?.toLowerCase().includes(lowerTerm) ||
      course.category?.toLowerCase().includes(lowerTerm) ||
      course.subtitle?.toLowerCase().includes(lowerTerm)
    )

    setSearchResults(results)
  }

  // Atualizar pesquisa quando o termo mudar
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchCourses(searchTerm)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm, allCourses])

  // Limpar pesquisa
  const clearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setIsSearching(false)
  }

  // Aplicar palavra-chave
  const applyKeyword = (keyword) => {
    setSearchTerm(keyword)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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


  // ========== FREE MODE LOGIC ==========
  const [freeMode, setFreeMode] = useState({
    isEnabled: false,
    isActive: false, // is currently within the time window
    endTime: null,
    timeLeft: ''
  })

  // Verificar modo gratuito
  useEffect(() => {
    const checkFreeMode = async () => {
      try {
        const { getFreeModeSettings } = await import('../services/paymentService')
        const settings = await getFreeModeSettings()

        if (settings && settings.isEnabled) {
          const now = new Date()
          const start = settings.startAt ? new Date(settings.startAt) : null
          const end = settings.endAt ? new Date(settings.endAt) : null

          const isActive = start && end && now >= start && now <= end

          setFreeMode({
            isEnabled: true,
            isActive,
            endTime: isActive ? end : start, // Se ativo, conta até o fim. Se não, conta até o início (se futuro)
            // Se já passou, não mostra
            isFinished: end && now > end
          })
        }
      } catch (err) {
        console.error('Erro ao verificar modo grátis:', err)
      }
    }

    checkFreeMode()
    // Verificar periodicamente (a cada 1 min)
    const interval = setInterval(checkFreeMode, 60000)
    return () => clearInterval(interval)
  }, [])

  // Timer regressivo
  useEffect(() => {
    if (!freeMode.isEnabled || (!freeMode.isActive && !freeMode.endTime) || freeMode.isFinished) return

    const updateTimer = () => {
      const now = new Date()
      const target = new Date(freeMode.endTime)
      const diff = target - now

      if (diff <= 0) {
        setFreeMode(prev => ({ ...prev, timeLeft: '00:00:00' }))
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      let timeStr = ''
      if (days > 0) {
        timeStr = `${days}d `
      }
      timeStr += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

      setFreeMode(prev => ({
        ...prev,
        timeLeft: timeStr
      }))
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [freeMode.isEnabled, freeMode.isActive, freeMode.endTime, freeMode.isFinished])

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
            <p className="hero-stats">
              🎯 Meta: 100 pessoas • ✅ 150+ já iniciaram!
            </p>

            {/* COUNTDOWN TIMER FOR FREE MODE */}
            {freeMode.isEnabled && !freeMode.isFinished && freeMode.timeLeft && (
              <div className="free-mode-banner fade-in">
                <div className="free-mode-content">
                  <span className="free-mode-icon">🎁</span>
                  <div className="free-mode-text">
                    <span className="free-mode-label">
                      {freeMode.isActive ? 'TUDO LIBERADO! GRÁTIS POR:' : 'HORÁRIO GRÁTIS COMEÇA EM:'}
                    </span>
                    <span className="free-mode-timer">{freeMode.timeLeft}</span>
                  </div>
                </div>
              </div>
            )}

            <div
              className="scroll-indicator"
              aria-hidden="true"
              onClick={() => document.querySelector('.featured-section')?.scrollIntoView({ behavior: 'smooth' })}
              title="Ver cursos"
            >
              ↓
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/img/placeholder-hero.png"
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
          <h2 className="section-title">
            {isSearching ? 'Resultados da Pesquisa' : 'Nossas Jornadas'}
          </h2>

          {/* Campo de Pesquisa */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar cursos... (ex: Python, Excel, Design)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={clearSearch}
                  aria-label="Limpar pesquisa"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Palavras-chave sugeridas */}
            <div className="search-keywords">
              <span className="keywords-label">Pesquisas populares:</span>
              <div className="keywords-list">
                {popularKeywords.map((keyword) => (
                  <button
                    key={keyword.label}
                    className={`keyword-tag ${searchTerm.toLowerCase() === keyword.label.toLowerCase() ? 'active' : ''}`}
                    onClick={() => applyKeyword(keyword.label)}
                  >
                    <span className="keyword-icon">{keyword.icon}</span>
                    {keyword.label}
                  </button>
                ))}
              </div>
            </div>

            {isSearching && (
              <p className="search-results-count">
                {searchResults.length} curso(s) encontrado(s) para "{searchTerm}"
              </p>
            )}
          </div>

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando cursos...</p>
            </div>
          )}

          {/* Mostrar resultados da pesquisa */}
          {!loading && isSearching && (
            <>
              {searchResults.length > 0 ? (
                <div className="courses-grid">
                  {searchResults.map((course) => (
                    <CourseCard key={course.id} course={{
                      ...course,
                      title: course.title,
                      subtitle: course.description,
                      thumbnail: course.thumbnail,
                      category: course.category,
                      type: 'course'
                    }} />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>🔍 Nenhum curso encontrado para "{searchTerm}"</p>
                  <p className="no-results-hint">Tente pesquisar por: Programação, Python, Excel, Design...</p>
                  <button className="btn-clear-search" onClick={clearSearch}>
                    Ver todas as jornadas
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mostrar jornadas quando não está pesquisando */}
          {!loading && !isSearching && journeys.length > 0 && (
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

          {!loading && !isSearching && journeys.length === 0 && (
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
