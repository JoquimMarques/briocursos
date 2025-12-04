import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCourseById } from '../services/coursesApi'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from '../admin/adminAccess'
import { db } from '../services/firebase'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { 
  enrollInCourse, 
  isEnrolledInCourse, 
  getUserProgress, 
  markVideoAsCompleted 
} from '../services/coursesService'
import './CoursePlayer.css'

function CoursePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)
  const [allRatings, setAllRatings] = useState([]) // Todas as avaliações individuais
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [completedVideos, setCompletedVideos] = useState([])
  const [progress, setProgress] = useState(0)
  const [enrolling, setEnrolling] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0) // Progresso do vídeo (0-100)
  const [videoDuration, setVideoDuration] = useState(0) // Duração total do vídeo
  const [canMarkComplete, setCanMarkComplete] = useState(false) // Pode marcar como concluído
  const videoRef = useRef(null)
  const iframeRef = useRef(null)
  const watchTimerRef = useRef(null)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const courseData = await getCourseById(id)
        if (courseData) {
          setCourse(courseData)
          
          // Buscar vídeos do Firestore
          try {
            const courseRef = doc(db, 'courses', id)
            const courseSnap = await getDoc(courseRef)
            if (courseSnap.exists()) {
              const firestoreData = courseSnap.data()
              const firestoreVideos = firestoreData.videos || []
              
              // Validar vídeos antes de definir e garantir que todos tenham ID
              const validVideos = firestoreVideos
                .filter(video => {
                  const hasRequiredFields = video && video.url && video.title
                  return hasRequiredFields
                })
                .map((video, index) => {
                  // Se o vídeo não tiver ID, criar um baseado no índice e timestamp
                  if (!video.id) {
                    console.warn('Vídeo sem ID encontrado, criando ID automático:', video.title)
                    return {
                      ...video,
                      id: `video-${Date.now()}-${index}`
                    }
                  }
                  return video
                })
              
              setVideos(validVideos)
              
              // Se houver vídeos válidos, selecionar o primeiro
              if (validVideos.length > 0) {
                setSelectedVideo(validVideos[0])
              }
            }
          } catch (firestoreErr) {
            // Erro ao carregar vídeos do Firestore - não é crítico
            // Não é um erro crítico, continua com os dados locais
          }
          
          // Buscar avaliações
          await loadRatings()
          
          // Verificar se o usuário já avaliou
          if (user) {
            await checkUserRating()
            await checkEnrollment()
          }
        } else {
          setError('Curso não encontrado')
        }
      } catch (err) {
        console.error('Erro ao carregar curso:', err)
        setError('Erro ao carregar o curso. Verifique a configuração.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])
  
  const convertYouTubeUrlToEmbed = (url) => {
    if (!url) return null
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}`
    }
    return url
  }

  const convertVimeoUrlToEmbed = (url) => {
    if (!url) return null
    // Suporta vários formatos de URL do Vimeo:
    // https://vimeo.com/123456789
    // https://vimeo.com/123456789?param=value
    // https://player.vimeo.com/video/123456789
    // https://vimeo.com/123456789?fl=ip&fe=ec
    try {
      // Tentar extrair o ID do vídeo de diferentes formatos
      const patterns = [
        /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/,  // Formato padrão
        /vimeo\.com\/(\d+)/,  // Formato alternativo
      ]
      
      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          const videoId = match[1]
          return `https://player.vimeo.com/video/${videoId}`
        }
      }
      
      // Se nenhum padrão funcionou, tentar extrair manualmente
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(p => p)
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        if (/^\d+$/.test(lastPart)) {
          return `https://player.vimeo.com/video/${lastPart}`
        }
      }
    } catch (error) {
      // Erro ao converter URL do Vimeo
    }
    
    return null
  }

  const getVideoEmbedUrl = (video) => {
    if (!video || !video.url) {
      return null
    }
    
    // Verificar se é YouTube
    if (video.videoType === 'youtube' || video.videoId || (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be')))) {
      const embedUrl = convertYouTubeUrlToEmbed(video.url)
      if (!embedUrl) {
        return null
      }
      return embedUrl
    }
    
    // Verificar se é Vimeo
    if (video.url && video.url.includes('vimeo.com')) {
      const embedUrl = convertVimeoUrlToEmbed(video.url)
      if (embedUrl) {
        return embedUrl
      }
    }
    
    // Para vídeos customizados (MP4, WebM, etc.), retornar a URL diretamente
    return video.url
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
    return `${mins}min`
  }

  const calculateTotalDuration = () => {
    return videos.reduce((sum, video) => sum + (video.duration || 0), 0)
  }

  const loadRatings = async () => {
    try {
      const ratingsRef = collection(db, 'courses', id, 'ratings')
      const ratingsSnapshot = await getDocs(ratingsRef)
      
      if (!ratingsSnapshot.empty) {
        let total = 0
        let count = 0
        const ratingsList = []
        
        // Buscar dados dos usuários para cada avaliação
        const { getUserData } = await import('../services/authService')
        
        for (const docSnap of ratingsSnapshot.docs) {
          const data = docSnap.data()
          const ratingValue = data.rating || 0
          total += ratingValue
          count++
          
          // Buscar dados do usuário
          let userName = 'Usuário Anônimo'
          if (data.userId) {
            try {
              const { data: userData } = await getUserData(data.userId)
              if (userData && userData.fullName) {
                userName = userData.fullName
              } else if (userData && userData.email) {
                userName = userData.email.split('@')[0]
              }
            } catch (err) {
              // Se não conseguir buscar, usar userId como fallback
              userName = `Usuário ${data.userId.substring(0, 8)}`
            }
          }
          
          ratingsList.push({
            id: docSnap.id,
            userId: data.userId,
            userName: userName,
            rating: ratingValue,
            createdAt: data.createdAt || ''
          })
        }
        
        // Ordenar por data (mais recentes primeiro)
        ratingsList.sort((a, b) => {
          if (!a.createdAt) return 1
          if (!b.createdAt) return -1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        
        setAllRatings(ratingsList)
        setAverageRating(total / count)
        setTotalRatings(count)
      } else {
        setAverageRating(0)
        setTotalRatings(0)
        setAllRatings([])
      }
    } catch (err) {
      // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
      if (err.code !== 'permission-denied') {
        console.error('Erro ao carregar avaliações:', err)
      }
      setAverageRating(0)
      setTotalRatings(0)
      setAllRatings([])
    }
  }

  const checkUserRating = async () => {
    if (!user) return
    
    try {
      const userRatingRef = doc(db, 'courses', id, 'ratings', user.uid)
      const userRatingSnap = await getDoc(userRatingRef)
      
      if (userRatingSnap.exists()) {
        const data = userRatingSnap.data()
        setUserRating(data.rating)
        setHasRated(true)
      } else {
        setHasRated(false)
      }
    } catch (err) {
      // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
      if (err.code !== 'permission-denied') {
        console.error('Erro ao verificar avaliação do usuário:', err)
      }
      setHasRated(false)
    }
  }

  const checkEnrollment = async () => {
    if (!user) return
    
    try {
      const enrolled = await isEnrolledInCourse(user.uid, id)
      setIsEnrolled(enrolled)
      
      if (enrolled) {
        const userProgress = await getUserProgress(user.uid, id)
        setCompletedVideos(userProgress.completedVideos || [])
        setProgress(userProgress.progress || 0)
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (isEnrolled) {
      return
    }

    setEnrolling(true)
    try {
      const { error } = await enrollInCourse(user.uid, id)
      if (error) {
        setError(error)
      } else {
        setIsEnrolled(true)
        setProgress(0)
        setCompletedVideos([])
        // Atualizar contador de alunos no curso
        const courseRef = doc(db, 'courses', id)
        const courseSnap = await getDoc(courseRef)
        if (courseSnap.exists()) {
          const courseData = courseSnap.data()
          setCourse({ ...course, students: (courseData.students || 0) + 1 })
        }
      }
    } catch (err) {
      console.error('Erro ao inscrever:', err)
      setError('Erro ao inscrever-se no curso. Tente novamente.')
    } finally {
      setEnrolling(false)
    }
  }

  const handleVideoComplete = async (videoId) => {
    if (!user || !isEnrolled) return
    
    if (!videoId) {
      console.error('ID do vídeo não encontrado')
      return
    }

    // Verificar se o vídeo já foi marcado como concluído
    if (completedVideos.includes(videoId)) {
      return
    }

    try {
      const { error, progress: newProgress } = await markVideoAsCompleted(
        user.uid,
        id,
        videoId,
        videos.length
      )

      if (!error) {
        setCompletedVideos([...completedVideos, videoId])
        setProgress(newProgress)
      }
    } catch (err) {
      console.error('Erro ao marcar vídeo como concluído:', err)
    }
  }

  // Habilitar botão após tempo fixo (2 minutos)
  useEffect(() => {
    // Limpar timer anterior se houver
    if (watchTimerRef.current) {
      clearTimeout(watchTimerRef.current)
    }

    // Resetar estado quando mudar de vídeo
    setCanMarkComplete(false)
    setVideoProgress(0)

    if (!selectedVideo || !isEnrolled || completedVideos.includes(selectedVideo.id)) {
      return
    }

    // Timer de 2 minutos
    const WATCH_TIME_REQUIRED = 120000 // 2 minutos (120000 ms)

    watchTimerRef.current = setTimeout(() => {
      setCanMarkComplete(true)
      setVideoProgress(90) // Simular 90% para mostrar no UI
    }, WATCH_TIME_REQUIRED)

    return () => {
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current)
      }
    }
  }, [selectedVideo, isEnrolled, completedVideos])

  // Rastrear progresso do vídeo (apenas para vídeos customizados - opcional)
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !selectedVideo || !isEnrolled) {
      return
    }
    
    // Apenas para vídeos customizados (não YouTube/Vimeo)
    const isCustomVideo = selectedVideo.videoType === 'custom' || 
                         selectedVideo.videoType === 'url' ||
                         (!selectedVideo.videoType && !selectedVideo.videoId && 
                          selectedVideo.url && 
                          !selectedVideo.url.includes('youtube.com') && 
                          !selectedVideo.url.includes('youtu.be') && 
                          !selectedVideo.url.includes('vimeo.com'))
    
    if (!isCustomVideo) return

    const handleVideoEnd = () => {
      setVideoProgress(100)
      setCanMarkComplete(true)
      if (selectedVideo.id && !completedVideos.includes(selectedVideo.id)) {
        handleVideoComplete(selectedVideo.id)
      }
    }

    videoElement.addEventListener('ended', handleVideoEnd)
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd)
    }
  }, [selectedVideo, isEnrolled, completedVideos])

  const handleRating = async (rating) => {
    if (!user) {
      navigate('/login')
      return
    }

    if (hasRated) {
      return // Usuário já avaliou, não pode alterar
    }

    try {
      const userRatingRef = doc(db, 'courses', id, 'ratings', user.uid)
      await setDoc(userRatingRef, {
        rating: rating,
        userId: user.uid,
        courseId: id,
        createdAt: new Date().toISOString(),
      })

      setUserRating(rating)
      setHasRated(true)
      
      // Recarregar avaliações para atualizar a média
      await loadRatings()
    } catch (err) {
      // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
      if (err.code !== 'permission-denied') {
        console.error('Erro ao salvar avaliação:', err)
      }
      setError('Erro ao salvar avaliação. Verifique as permissões do Firestore.')
    }
  }

  if (loading) {
    return (
      <div className="course-player-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando curso...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="course-player-page">
        <div className="error-container">
          <h2>Curso não encontrado</h2>
          <p>{error || 'O curso que você está procurando não existe.'}</p>
          <Link to="/" className="btn btn-primary">
            Voltar para Início
          </Link>
        </div>
      </div>
    )
  }

  const isAdmin = user && hasAdminAccess(user)

  return (
    <div className="course-player-page">
      <div className="course-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Voltar
        </button>
        <div className="course-info-header">
          <h1>{course.title}</h1>
          <div className="course-meta-header">
            <span className="course-category">{course.category}</span>
            {course.level && (
              <span className="course-level">Nível: {course.level}</span>
            )}
            <span className="course-duration">⏱️ {formatDuration(calculateTotalDuration())}</span>
          </div>
        </div>
        {isAdmin && (
          <Link to={`/curso/${id}/gerenciar`} className="manage-course-button">
            Gerenciar Vídeos
          </Link>
        )}
      </div>

      <div className="course-content">
        <div className="course-main">
          <div className="course-video-container">
            {selectedVideo ? (
              <div className="course-video">
                {(() => {
                  const embedUrl = getVideoEmbedUrl(selectedVideo)
                  const isYouTube = selectedVideo.videoType === 'youtube' || 
                                    selectedVideo.videoId || 
                                    (selectedVideo.url && (selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be')))
                  const isVimeo = selectedVideo.url && selectedVideo.url.includes('vimeo.com')
                  const isCustomVideo = selectedVideo.videoType === 'custom' || 
                                       selectedVideo.videoType === 'url' ||
                                       (!isYouTube && !isVimeo && selectedVideo.url && !selectedVideo.url.includes('youtube.com') && !selectedVideo.url.includes('youtu.be') && !selectedVideo.url.includes('vimeo.com'))
                  
                  // Renderizar iframe para YouTube ou Vimeo
                  if ((isYouTube || isVimeo) && embedUrl) {
                    return (
                      <div className="youtube-video-container">
                        <iframe
                          ref={iframeRef}
                          src={embedUrl}
                          title={selectedVideo.title}
                          className="course-iframe"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      </div>
                    )
                  } else if (isCustomVideo && selectedVideo.url) {
                    // Renderizar tag <video> para vídeos diretos (MP4, WebM, etc.)
                    return (
                      <video
                        ref={videoRef}
                        src={selectedVideo.url}
                        controls
                        className="course-video-player"
                        style={{ width: '100%', height: 'auto' }}
                        onError={(e) => {
                          setError('Erro ao carregar o vídeo. Verifique se a URL está correta e acessível.')
                        }}
                      >
                        Seu navegador não suporta o elemento de vídeo.
                      </video>
                    )
                  } else {
                    return (
                      <div className="video-error">
                        <p>❌ Erro: Não foi possível carregar o vídeo.</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>URL: {selectedVideo.url || 'Não disponível'}</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Tipo: {selectedVideo.videoType || 'Não especificado'}</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Video ID: {selectedVideo.videoId || 'Não disponível'}</p>
                        {selectedVideo.url && selectedVideo.url.includes('vimeo.com') && (
                          <p style={{ fontSize: '0.9rem', color: '#ff6b6b', marginTop: '1rem' }}>
                            💡 Dica: Certifique-se de que a URL do Vimeo está no formato correto: https://vimeo.com/123456789
                          </p>
                        )}
                      </div>
                    )
                  }
                })()}
                <div className="video-title-display">
                  <div className="video-title-with-button">
                    <h3>{selectedVideo.title}</h3>
                    {(() => {
                      // Debug: verificar se o vídeo tem ID
                      if (!selectedVideo.id) {
                        console.warn('⚠️ Vídeo sem ID:', selectedVideo)
                      }
                      
                      if (!isEnrolled) {
                        return (
                          <span className="video-enroll-hint">
                            Inscreva-se no curso para marcar vídeos como concluídos
                          </span>
                        )
                      }
                      
                      if (!selectedVideo.id) {
                        return (
                          <span className="video-enroll-hint" style={{ fontSize: '0.85rem', color: '#ff6b6b' }}>
                            ⚠️ Erro: Vídeo sem ID. Recarregue a página.
                          </span>
                        )
                      }
                      
                      if (completedVideos.includes(selectedVideo.id)) {
                        return (
                          <span className="video-completed-badge">✓ Concluído</span>
                        )
                      }
                      
                      return (
                        <button 
                          className={`mark-complete-button ${canMarkComplete ? 'enabled' : 'disabled'}`}
                          onClick={() => handleVideoComplete(selectedVideo.id)}
                          disabled={!canMarkComplete}
                          title={canMarkComplete ? "Marcar vídeo como concluído" : "Assista o vídeo por 2 minutos para marcar como concluído"}
                        >
                          ✓ Marcar como Concluído
                        </button>
                      )
                    })()}
                  </div>
                  {isEnrolled && selectedVideo.id && !completedVideos.includes(selectedVideo.id) && !canMarkComplete && (
                    <div className="video-progress-hint">
                      <small>Assista o vídeo por 2 minutos para marcar como concluído...</small>
                    </div>
                  )}
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="course-video" style={{ backgroundColor: '#000', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              </div>
            ) : course.videoUrl ? (
              <div className="course-video">
                <iframe
                  src={course.videoUrl}
                  title={course.title}
                  className="course-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                ></iframe>
              </div>
            ) : (
              <div className="course-placeholder" style={{ backgroundColor: course.color || '#667eea' }}>
                <div className="course-placeholder-icon" style={{ fontSize: '8rem' }}>
                  {course.thumbnail || '📚'}
                </div>
                <h2>{course.title}</h2>
                <p>Vídeo do curso em breve</p>
              </div>
            )}
          </div>

          <div className="course-description-section">
            <h3>ℹ️ Sobre o Curso</h3>
            <p>{course.description || 'Descrição não disponível'}</p>
            {course.instructor && (
              <p style={{ marginTop: '1rem', opacity: 0.8 }}>
                <strong>Instrutor:</strong> {course.instructor}
              </p>
            )}
            {selectedVideo && selectedVideo.comment && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(74, 222, 128, 0.2)' }}>
                <h4 style={{ color: '#4ade80', marginBottom: '0.5rem', fontSize: '1rem' }}>📝 Sobre esta aula:</h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  {selectedVideo.comment}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="course-sidebar">
          <div className="course-info-card">
            <div className="course-price-section">
              {!isEnrolled ? (
                <>
                  {course.price !== undefined && (
                    <div className="course-price-large">
                      {course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'Grátis'}
                    </div>
                  )}
                  <button 
                    className="btn btn-primary btn-enroll"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Inscrevendo...' : (course.price > 0 ? 'Comprar Agora' : 'Inscrever-se Grátis')}
                  </button>
                </>
              ) : (
                <div className="enrollment-progress-section">
                  <div className="circular-progress-large" style={{ '--progress': progress }}>
                    <svg className="progress-ring-large" width="120" height="120">
                      <circle
                        className="progress-ring-circle-bg"
                        stroke="#e0e0e0"
                        strokeWidth="8"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                      />
                      <circle
                        className="progress-ring-circle"
                        stroke="#4ade80"
                        strokeWidth="8"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="progress-text-large">{progress}%</span>
                  </div>
                  <p className="progress-label">Concluído</p>
                </div>
              )}
              <div className="course-lessons-count">
                <span className="lessons-label">Aulas</span>
                <span className="lessons-value">{videos.length}</span>
              </div>
            </div>

            <div className="course-stats">
              {course.students !== undefined && (
                <div className="stat-item">
                  <span className="stat-label">Alunos</span>
                  <span className="stat-value">{course.students.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="course-rating-section">
              <h4 className="rating-title">Avalie este curso</h4>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-button ${star <= userRating ? 'active' : ''} ${hasRated ? 'disabled' : ''}`}
                    onClick={() => handleRating(star)}
                    disabled={hasRated}
                    title={hasRated ? 'Você já avaliou este curso' : `Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {hasRated && (
                <p className="rating-message">Você avaliou com {userRating} estrela{userRating > 1 ? 's' : ''}</p>
              )}
              {averageRating > 0 && (
                <p className="rating-average">
                  Média: {averageRating.toFixed(1)} ⭐ ({totalRatings} avaliação{totalRatings > 1 ? 'ões' : ''})
                </p>
              )}
            </div>

            {/* Seção de Avaliações Individuais */}
            {allRatings.length > 0 && (
              <div className="course-reviews-section">
                <h4 className="reviews-title">Avaliações dos Alunos ({allRatings.length})</h4>
                <div className="reviews-list">
                  {allRatings.map((rating) => (
                    <div key={rating.id} className="review-item">
                      <div className="review-header">
                        <div className="review-user">
                          <span className="review-avatar">
                            {rating.userName.charAt(0).toUpperCase()}
                          </span>
                          <span className="review-name">{rating.userName}</span>
                        </div>
                        <div className="review-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`review-star ${star <= rating.rating ? 'filled' : 'empty'}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      {rating.createdAt && (
                        <div className="review-date">
                          {new Date(rating.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {videos.length > 0 && (
            <div className="course-modules">
              <h3>📚 Conteúdo do Curso</h3>
              <ul className="modules-list">
                {videos.map((video, index) => {
                  const isCompleted = completedVideos.includes(video.id)
                  return (
                    <li 
                      key={video.id} 
                      className={`module-item ${selectedVideo?.id === video.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="module-header">
                        <span className="module-number">{index + 1}</span>
                        <span className="module-title">{video.title}</span>
                        {isCompleted && (
                          <span className="completed-badge" title="Vídeo concluído">✓</span>
                        )}
                      </div>
                      {video.duration && (
                        <span className="module-lessons">⏱️ {Math.round(video.duration)} min</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursePlayer

