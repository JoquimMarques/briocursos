import { useState, useEffect, useRef, useCallback } from 'react'
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
import {
  getCoursePaymentSettings,
  getUserPaymentStatus,
  hasApprovedPayment,
  PAYMENT_STATUS,
  hasApprovedCertificatePayment,
  getUserCertificatePaymentStatus
} from '../services/paymentService'
import { requestCertificate, hasCertificateRequest, getCertificateRequestStatus, CERTIFICATE_REQUEST_STATUS } from '../services/certificateRequestService'
import PaymentModal from '../components/PaymentModal'
import CertificatePaymentModal from '../components/CertificatePaymentModal'
import './CoursePlayer.css'

function CoursePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userData } = useAuth()
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
  const [canMarkComplete, setCanMarkComplete] = useState(false) // Pode marcar como concluído
  const [paymentRequired, setPaymentRequired] = useState(false) // Pagamento necessário
  const [coursePrice, setCoursePrice] = useState(0) // Preço do curso
  const [paymentStatus, setPaymentStatus] = useState(null) // Status do pagamento do usuário
  const [showPaymentModal, setShowPaymentModal] = useState(false) // Modal de pagamento
  const [hasPaymentAccess, setHasPaymentAccess] = useState(false) // Tem acesso via pagamento
  const [courseFinished, setCourseFinished] = useState(false) // Curso finalizado
  const [certificateRequested, setCertificateRequested] = useState(false) // Certificado foi solicitado
  const [certificateRequestStatus, setCertificateRequestStatus] = useState(null) // Status da solicitação
  const [hasCertificatePayment, setHasCertificatePayment] = useState(false) // Tem pagamento de certificado aprovado
  const [certificatePaymentStatus, setCertificatePaymentStatus] = useState(null) // Status do pagamento de certificado
  const [showCertificatePaymentModal, setShowCertificatePaymentModal] = useState(false) // Modal de pagamento de certificado
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

              // Carregar status do curso (finalizado ou em andamento)
              setCourseFinished(firestoreData.finished || false)

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

          // Verificar configurações de pagamento
          await checkPaymentSettings()

          // Verificar se o usuário já avaliou
          if (user) {
            await checkUserRating()
            await checkEnrollment()
            await checkPaymentAccess()
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
      // Parâmetros para remover branding e recomendações do YouTube
      const params = new URLSearchParams({
        modestbranding: '1',    // Remove logo do YouTube
        rel: '0',               // Não mostra vídeos relacionados
        showinfo: '0',          // Remove informações do vídeo
        iv_load_policy: '3',    // Remove anotações
        fs: '1',                // Permite fullscreen
        playsinline: '1',       // Reproduz inline no mobile
        cc_load_policy: '0',    // Desativa legendas automáticas
        disablekb: '0',         // Mantém controles de teclado
        controls: '1',          // Mostra controles
        autohide: '1',          // Esconde controles automaticamente
        origin: window.location.origin
      })
      // Usar youtube-nocookie.com para mais privacidade e menos recomendações
      return `https://www.youtube-nocookie.com/embed/${videoId[1]}?${params.toString()}`
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
          // Parâmetros para visual limpo no Vimeo
          const params = new URLSearchParams({
            title: '0',           // Remove título
            byline: '0',          // Remove nome do autor
            portrait: '0',        // Remove avatar
            badge: '0',           // Remove badge
            autopause: '0',       // Não pausa quando sai de vista
            player_id: '0',
            app_id: '0'
          })
          return `https://player.vimeo.com/video/${videoId}?${params.toString()}`
        }
      }

      // Se nenhum padrão funcionou, tentar extrair manualmente
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/').filter(p => p)
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1]
        if (/^\d+$/.test(lastPart)) {
          const params = new URLSearchParams({
            title: '0',
            byline: '0',
            portrait: '0',
            badge: '0'
          })
          return `https://player.vimeo.com/video/${lastPart}?${params.toString()}`
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

        // Verificar se o certificado foi solicitado quando o curso está 100% concluído
        if (userProgress.progress === 100) {
          const hasRequest = await hasCertificateRequest(user.uid, id)
          setCertificateRequested(hasRequest)
          if (hasRequest) {
            const { status } = await getCertificateRequestStatus(user.uid, id)
            setCertificateRequestStatus(status)
          }
        }
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição:', err)
    }
  }

  const checkPaymentSettings = async () => {
    try {
      // Verificar modo gratuito global
      const { getFreeModeSettings } = await import('../services/paymentService')
      const freeMode = await getFreeModeSettings()

      const now = new Date()
      const start = freeMode.startAt ? new Date(freeMode.startAt) : null
      const end = freeMode.endAt ? new Date(freeMode.endAt) : null

      const isFreeModeActive = freeMode.isEnabled && start && end && now >= start && now <= end

      if (isFreeModeActive) {
        setPaymentRequired(false)
        setCoursePrice(0)
        return
      }

      const { paymentEnabled, price } = await getCoursePaymentSettings(id)
      setPaymentRequired(paymentEnabled)
      setCoursePrice(price)
    } catch (err) {
      console.error('Erro ao verificar configurações de pagamento:', err)
    }
  }

  const checkPaymentAccess = async () => {
    if (!user) return

    try {
      // Verificar se tem pagamento aprovado
      const approved = await hasApprovedPayment(user.uid, id)
      setHasPaymentAccess(approved)

      // Verificar status atual do pagamento
      const { status } = await getUserPaymentStatus(user.uid, id)
      setPaymentStatus(status)
    } catch (err) {
      console.error('Erro ao verificar acesso de pagamento:', err)
    }
  }

  const checkCertificatePayment = useCallback(async () => {
    if (!user) return

    try {
      // Verificar se tem pagamento de certificado aprovado
      const approved = await hasApprovedCertificatePayment(user.uid, id)
      setHasCertificatePayment(approved)

      // Verificar status atual do pagamento de certificado
      const { status } = await getUserCertificatePaymentStatus(user.uid, id)
      setCertificatePaymentStatus(status)
    } catch (err) {
      console.error('Erro ao verificar pagamento de certificado:', err)
    }
  }, [user, id])

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (isEnrolled) {
      return
    }

    // Se pagamento é necessário e não tem acesso aprovado, mostrar modal
    if (paymentRequired && !hasPaymentAccess) {
      setShowPaymentModal(true)
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

  const handlePaymentSubmitted = async () => {
    // Recarregar status do pagamento
    await checkPaymentAccess()
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

        // Verificar se o certificado foi solicitado quando chegar a 100%
        if (newProgress === 100 && user) {
          const hasRequest = await hasCertificateRequest(user.uid, id)
          setCertificateRequested(hasRequest)
          if (hasRequest) {
            const { status } = await getCertificateRequestStatus(user.uid, id)
            setCertificateRequestStatus(status)
          }
        }
      }
    } catch (err) {
      console.error('Erro ao marcar vídeo como concluído:', err)
    }
  }

  // Verificar status da solicitação de certificado e pagamento quando o curso for concluído (100%)
  useEffect(() => {
    const checkCertificateRequest = async () => {
      // Verificar se o curso foi concluído (progress = 100%)
      if (!user || !isEnrolled || progress !== 100 || videos.length === 0) {
        return
      }

      // Verificar se todos os vídeos foram concluídos
      if (completedVideos.length !== videos.length) {
        return
      }

      // Verificar pagamento de certificado
      await checkCertificatePayment()

      // Verificar se já existe solicitação
      try {
        const hasRequest = await hasCertificateRequest(user.uid, id)
        setCertificateRequested(hasRequest)

        if (hasRequest) {
          const { status } = await getCertificateRequestStatus(user.uid, id)
          setCertificateRequestStatus(status)
        }
      } catch (err) {
        console.error('❌ Erro ao verificar solicitação de certificado:', err)
      }
    }

    checkCertificateRequest()
  }, [user, isEnrolled, progress, completedVideos.length, videos.length, id, checkCertificatePayment])

  // Função para solicitar certificado
  const handleRequestCertificate = async () => {
    if (!user || !isEnrolled || progress !== 100) {
      return
    }

    // Verificar se tem pagamento de certificado aprovado
    if (!hasCertificatePayment) {
      setShowCertificatePaymentModal(true)
      return
    }

    try {
      const result = await requestCertificate(
        user.uid,
        id,
        course || {},
        {
          fullName: userData?.fullName || user.displayName || user.email?.split('@')[0] || 'Aluno',
          email: user.email || '',
          displayName: user.displayName || ''
        }
      )

      if (!result.error) {
        if (result.alreadyExists) {
          alert('Você já solicitou o certificado para este curso.')
        } else {
          alert('✅ Solicitação de certificado enviada com sucesso! Você receberá o certificado por email após a aprovação.')
        }
        setCertificateRequested(true)
        setCertificateRequestStatus(result.status)
      } else {
        alert('Erro ao solicitar certificado. Tente novamente.')
        console.error('Erro ao solicitar certificado:', result.error)
      }
    } catch (err) {
      console.error('Erro ao solicitar certificado:', err)
      alert('Erro ao solicitar certificado. Tente novamente.')
    }
  }

  const handleCertificatePaymentSubmitted = async () => {
    // Recarregar status do pagamento de certificado
    await checkCertificatePayment()
  }

  // Habilitar botão após tempo fixo (1 minuto)
  useEffect(() => {
    // Limpar timer anterior se houver
    if (watchTimerRef.current) {
      clearTimeout(watchTimerRef.current)
    }

    // Resetar estado quando mudar de vídeo
    setCanMarkComplete(false)

    if (!selectedVideo || !isEnrolled || completedVideos.includes(selectedVideo.id)) {
      return
    }

    // Timer de 1 minuto
    const WATCH_TIME_REQUIRED = 60000 // 1 minuto (60000 ms)

    watchTimerRef.current = setTimeout(() => {
      setCanMarkComplete(true)
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
      setCanMarkComplete(true)
      if (selectedVideo.id && !completedVideos.includes(selectedVideo.id)) {
        handleVideoComplete(selectedVideo.id)
      }
    }

    videoElement.addEventListener('ended', handleVideoEnd)
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <div className="admin-buttons">
            <Link to={`/curso/${id}/gerenciar`} className="manage-course-button">
              Gerenciar Vídeos
            </Link>
            <Link to="/admin/pagamentos" className="manage-payments-button">
              💳 Pagamentos
            </Link>
          </div>
        )}
      </div>

      <div className="course-content">
        <div className="course-main">
          <div className="course-video-container">
            {/* BLOQUEIO: Se pagamento é necessário e usuário não pagou, mostrar tela de bloqueio */}
            {paymentRequired && !hasPaymentAccess && !isEnrolled ? (
              <div className="course-video video-locked">
                <div className="video-locked-content">
                  <div className="lock-icon">🔒</div>
                  <h3>Conteúdo Bloqueado</h3>
                  <p>Este curso requer pagamento para acesso.</p>
                  <div className="locked-price">
                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(coursePrice).replace('AOA', 'Kz')}
                  </div>
                  {paymentStatus === PAYMENT_STATUS.AWAITING_VERIFICATION ? (
                    <div className="payment-awaiting-box">
                      <span className="awaiting-icon">⏳</span>
                      <p>Seu pagamento está aguardando verificação.</p>
                      <small>Você receberá acesso assim que o administrador confirmar.</small>
                    </div>
                  ) : (
                    <button
                      className="btn btn-unlock"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      💳 Pagar e Desbloquear
                    </button>
                  )}
                </div>
              </div>
            ) : selectedVideo ? (
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
                        onError={() => {
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
                          title={canMarkComplete ? "Marcar vídeo como concluído" : "Assista o vídeo por 1 minuto para marcar como concluído"}
                        >
                          ✓ Marcar como Concluído
                        </button>
                      )
                    })()}
                  </div>
                  {isEnrolled && selectedVideo.id && !completedVideos.includes(selectedVideo.id) && !canMarkComplete && (
                    <div className="video-progress-hint">
                      <small>Assista o vídeo por 1 minuto para marcar como concluído...</small>
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
                  {paymentRequired && coursePrice > 0 ? (
                    <div className="course-price-large">
                      {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(coursePrice).replace('AOA', 'Kz')}
                    </div>
                  ) : (
                    <div className="course-price-large">Grátis</div>
                  )}

                  {/* Mostrar status de pagamento se pendente */}
                  {paymentRequired && paymentStatus === PAYMENT_STATUS.AWAITING_VERIFICATION && (
                    <div className="payment-pending-notice">
                      <span className="pending-icon">⏳</span>
                      <span>Pagamento aguardando verificação</span>
                    </div>
                  )}

                  {paymentRequired && paymentStatus === PAYMENT_STATUS.REJECTED && (
                    <div className="payment-rejected-notice">
                      <span className="rejected-icon">❌</span>
                      <span>Pagamento rejeitado. Tente novamente.</span>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-enroll"
                    onClick={handleEnroll}
                    disabled={enrolling || (paymentRequired && paymentStatus === PAYMENT_STATUS.AWAITING_VERIFICATION)}
                  >
                    {enrolling ? 'Inscrevendo...' :
                      paymentRequired && !hasPaymentAccess ?
                        (paymentStatus === PAYMENT_STATUS.AWAITING_VERIFICATION ? '⏳ Aguardando Verificação' : '💳 Comprar Curso') :
                        'Inscrever-se Grátis'}
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

                  {/* Botão de Solicitar Certificado quando curso estiver 100% concluído */}
                  {progress === 100 && !certificateRequested && (
                    <>
                      {!hasCertificatePayment ? (
                        <button
                          onClick={() => setShowCertificatePaymentModal(true)}
                          className="btn btn-certificate"
                          style={{
                            marginTop: '1.5rem',
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            color: '#ffffff',
                            fontWeight: '600',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            justifyContent: 'center',
                            opacity: 0.9
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.opacity = '1'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.opacity = '0.9'
                          }}
                        >
                          🔒 Pagar para Solicitar Certificado
                        </button>
                      ) : (
                        <button
                          onClick={handleRequestCertificate}
                          className="btn btn-certificate"
                          style={{
                            marginTop: '1.5rem',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#1f2937',
                            fontWeight: '600',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)'
                            e.target.style.boxShadow = '0 5px 15px rgba(251, 191, 36, 0.4)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                          }}
                        >
                          🎓 Solicitar Certificado
                        </button>
                      )}
                      {certificatePaymentStatus === PAYMENT_STATUS.AWAITING_VERIFICATION && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          background: 'rgba(251, 191, 36, 0.2)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: '#fbbf24',
                          textAlign: 'center'
                        }}>
                          ⏳ Pagamento do certificado aguardando verificação
                        </div>
                      )}
                    </>
                  )}

                  {progress === 100 && certificateRequested && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.SENT
                        ? 'rgba(74, 222, 128, 0.2)'
                        : certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.APPROVED
                          ? 'rgba(59, 130, 246, 0.2)'
                          : certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.REJECTED
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(251, 191, 36, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.SENT
                        ? '#4ade80'
                        : certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.APPROVED
                          ? '#3b82f6'
                          : certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.REJECTED
                            ? '#ef4444'
                            : '#fbbf24',
                      textAlign: 'center'
                    }}>
                      {certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.SENT && '✅ Certificado enviado por email'}
                      {certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.APPROVED && '⏳ Certificado aprovado, aguardando envio'}
                      {certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.REJECTED && '❌ Solicitação rejeitada'}
                      {certificateRequestStatus === CERTIFICATE_REQUEST_STATUS.PENDING && '⏳ Solicitação pendente de aprovação'}
                      {!certificateRequestStatus && '⏳ Aguardando processamento...'}
                    </div>
                  )}
                </div>
              )}
              <div className="course-lessons-count">
                <span className="lessons-label">Aulas</span>
                <span className="lessons-value">{videos.length}</span>
              </div>
            </div>

            {/* Status do Curso - Visível para todos */}
            <div className={`course-status-badge ${courseFinished ? 'status-finished' : 'status-in-progress'}`}>
              {courseFinished ? (
                <>
                  <span className="status-icon">✅</span>
                  <span className="status-text">Curso Finalizado</span>
                </>
              ) : (
                <>
                  <span className="status-icon">🔄</span>
                  <span className="status-text">Curso em Andamento</span>
                  <span className="status-hint">Novas aulas em breve</span>
                </>
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
                  const isLocked = paymentRequired && !hasPaymentAccess && !isEnrolled
                  return (
                    <li
                      key={video.id}
                      className={`module-item ${selectedVideo?.id === video.id ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                      onClick={() => {
                        if (isLocked) {
                          setShowPaymentModal(true)
                        } else {
                          setSelectedVideo(video)
                        }
                      }}
                    >
                      <div className="module-header">
                        <span className="module-number">{isLocked ? '🔒' : index + 1}</span>
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={{ ...course, price: coursePrice }}
        onPaymentSubmitted={handlePaymentSubmitted}
      />

      {/* Certificate Payment Modal */}
      <CertificatePaymentModal
        isOpen={showCertificatePaymentModal}
        onClose={() => setShowCertificatePaymentModal(false)}
        course={course}
        onPaymentSubmitted={handleCertificatePaymentSubmitted}
      />
    </div>
  )
}

export default CoursePlayer

