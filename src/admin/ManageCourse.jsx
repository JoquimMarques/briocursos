import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from './adminAccess'
import { db, storage } from '../services/firebase'
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import './ManageCourse.css'

function ManageCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0, // em minutos
    videoType: 'youtube', // 'youtube', 'url' ou 'custom'
    file: null, // arquivo de vídeo para upload
    comment: '', // comentário/descrição do vídeo
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!hasAdminAccess(user)) {
      navigate('/')
      return
    }

    loadCourseData()
  }, [id, user, navigate])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      const courseRef = doc(db, 'courses', id)
      let courseSnap
      try {
        courseSnap = await getDoc(courseRef)
      } catch (err) {
        // Silenciar erros de permissão - as regras do Firestore precisam ser configuradas
        if (err.code !== 'permission-denied') {
          throw err
        }
        courseSnap = { exists: () => false }
      }

      if (courseSnap.exists()) {
        const data = courseSnap.data()
        setCourse(data)
        setVideos(data.videos || [])
      } else {
        const { getCourseById } = await import('../services/coursesApi')
        const localCourse = await getCourseById(id)

        if (localCourse) {
          const courseData = {
            id: id,
            title: localCourse.title,
            description: localCourse.description,
            category: localCourse.category,
            videos: [],
            totalDuration: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          await setDoc(courseRef, courseData)
          setCourse(courseData)
          setVideos([])
        } else {
          setError('Curso não encontrado')
        }
      }
    } catch (err) {
      console.error('Erro ao carregar curso:', err)
      setError('Erro ao carregar dados do curso')
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getYouTubeVideoDuration = async (videoId) => {
    try {
      return null
    } catch (error) {
      console.error('Erro ao obter duração:', error)
      return null
    }
  }

  const parseDurationToMinutes = (duration) => {
    if (!duration) return 0

    const parts = duration.split(':').map(Number)
    if (parts.length === 3) {
      return parts[0] * 60 + parts[1] + parts[2] / 60
    } else if (parts.length === 2) {
      return parts[0] + parts[1] / 60
    }
    return 0
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
      if (!validTypes.includes(file.type)) {
        setError('Por favor, selecione um arquivo de vídeo válido (MP4, WebM, OGG)')
        return
      }

      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        setError('Arquivo muito grande. Tamanho máximo: 500MB')
        return
      }

      setNewVideo({ ...newVideo, file })
      setError('')
    }
  }

  const uploadVideoFile = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        if (!user) {
          const error = new Error('Usuário não autenticado')
          error.code = 'auth/user-not-authenticated'
          reject(error)
          return
        }

        const fileName = `${id}/${Date.now()}_${file.name}`
        const storageRef = ref(storage, `course-videos/${fileName}`)

        console.log('Iniciando upload do arquivo:', file.name, 'Tamanho:', file.size, 'bytes')
        console.log('Caminho no Storage:', `course-videos/${fileName}`)
        console.log('Usuário autenticado:', user.uid)

        const uploadTask = uploadBytesResumable(storageRef, file)

        setUploadProgress(0)

        const initialState = uploadTask.snapshot.state
        console.log('Estado inicial do upload:', initialState)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0
            const roundedProgress = Math.round(progress)

            setUploadProgress(roundedProgress)

            console.log(`Upload progress: ${roundedProgress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`)
            console.log('Estado do snapshot:', snapshot.state)
          },
          (error) => {
            console.error('Erro no upload:', error)
            console.error('Código do erro:', error.code)
            console.error('Mensagem do erro:', error.message)

            let errorMessage = 'Erro ao fazer upload do vídeo'
            if (error.code === 'storage/unauthorized') {
              errorMessage = 'Você não tem permissão para fazer upload. Verifique as regras de segurança do Firebase Storage.'
            } else if (error.code === 'storage/canceled') {
              errorMessage = 'Upload cancelado'
            } else if (error.code === 'storage/unknown') {
              errorMessage = 'Erro desconhecido no upload. Verifique sua conexão e as regras de segurança do Firebase Storage.'
            } else if (error.message?.includes('CORS')) {
              errorMessage = 'Erro de CORS: Verifique as regras de segurança do Firebase Storage. Elas devem permitir uploads autenticados.'
            }

            setError(errorMessage)
            setUploadProgress(0)
            setIsUploading(false)
            reject(error)
          },
          async () => {
            try {
              setUploadProgress(100)
              console.log('Upload concluído com sucesso!')
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              console.log('URL do download:', downloadURL)
              resolve(downloadURL)
            } catch (error) {
              console.error('Erro ao obter URL do download:', error)
              setUploadProgress(0)
              setIsUploading(false)
              reject(error)
            }
          }
        )
      } catch (error) {
        console.error('Erro ao criar task de upload:', error)
        setUploadProgress(0)
        setIsUploading(false)
        reject(error)
      }
    })
  }

  const handleAddVideo = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newVideo.title) {
      setError('Preencha o título do vídeo')
      return
    }

    if (newVideo.videoType === 'youtube') {
      if (!newVideo.url) {
        setError('Preencha a URL do YouTube')
        return
      }
    } else if (newVideo.videoType === 'url') {
      if (!newVideo.url) {
        setError('Preencha a URL direta do vídeo')
        return
      }
      try {
        new URL(newVideo.url)
      } catch {
        setError('Por favor, insira uma URL válida')
        return
      }
    } else {
      if (!newVideo.file) {
        setError('Selecione um arquivo de vídeo')
        return
      }
    }

    try {
      let duration = newVideo.duration || 0
      let videoId = null
      let videoUrl = newVideo.url

      if (newVideo.videoType === 'youtube') {
        videoId = extractYouTubeVideoId(newVideo.url)

        if (!videoId) {
          setError('URL do YouTube inválida. Verifique a URL e tente novamente.')
          return
        }

        if (videoId && !duration) {
          const autoDuration = await getYouTubeVideoDuration(videoId)
          if (autoDuration) {
            duration = parseDurationToMinutes(autoDuration)
          }
        }
      } else if (newVideo.videoType === 'url') {
        videoUrl = newVideo.url
      } else {
        setIsUploading(true)
        setUploadProgress(0)

        await new Promise((resolve) => setTimeout(resolve, 100))

        try {
          videoUrl = await uploadVideoFile(newVideo.file)
          setSuccess('Upload concluído! Salvando vídeo...')
          setIsUploading(false)
        } catch (uploadError) {
          console.error('Erro detalhado no upload:', uploadError)

          let errorMessage = 'Erro ao fazer upload do vídeo para Firebase Storage. '
          let suggestion = ''

          if (uploadError.code === 'storage/unauthorized' || uploadError.message?.includes('CORS')) {
            errorMessage += 'O Firebase Storage requer configuração de regras ou plano pago. '
            suggestion = 'Solução: Use a opção "URL Direta" abaixo. Faça upload do vídeo em um serviço gratuito (Vimeo, Google Drive, etc.) e cole o link aqui.'
          } else if (uploadError.code === 'storage/quota-exceeded' || uploadError.message?.includes('quota')) {
            errorMessage += 'Limite de armazenamento do Firebase Storage excedido. '
            suggestion = 'Solução: Use a opção "URL Direta". Faça upload em Vimeo (gratuito) e cole o link.'
          } else if (uploadError.message) {
            errorMessage += `Erro: ${uploadError.message}. `
            suggestion = 'Solução: Use a opção "URL Direta" e hospede o vídeo em um serviço gratuito como Vimeo.'
          } else {
            suggestion =
              'Solução: Use a opção "URL Direta" e hospede o vídeo em um serviço gratuito como Vimeo, Google Drive ou seu próprio servidor.'
          }

          setError(errorMessage + suggestion)
          setIsUploading(false)
          setUploadProgress(0)

          setTimeout(() => {
            if (
              confirm(
                'Deseja mudar para a opção "URL Direta"? Você pode fazer upload do vídeo em Vimeo (gratuito) e colar o link aqui.'
              )
            ) {
              setNewVideo({
                ...newVideo,
                videoType: 'url',
                url: '',
                file: null,
                comment: newVideo.comment,
              })
              setError('')
            }
          }, 2000)

          return
        }
      }

      if (!duration || duration <= 0) {
        setError('Por favor, informe a duração do vídeo em minutos')
        setIsUploading(false)
        return
      }

      const videoData = {
        id: Date.now().toString(),
        title: newVideo.title,
        url: videoUrl,
        videoId: newVideo.videoType === 'youtube' ? videoId : null,
        videoType: newVideo.videoType, // 'youtube', 'url' ou 'custom'
        duration: duration, // em minutos
        comment: newVideo.comment?.trim() || '', // comentário/descrição do vídeo
        order: videos.length + 1,
        createdAt: new Date().toISOString(),
      }

      const courseRef = doc(db, 'courses', id)
      await updateDoc(courseRef, {
        videos: arrayUnion(videoData),
        totalDuration: (course?.totalDuration || 0) + duration,
        updatedAt: new Date().toISOString(),
      })

      setVideos([...videos, videoData])
      setSuccess('Vídeo adicionado com sucesso!')
      setNewVideo({ title: '', url: '', duration: 0, videoType: 'youtube', file: null, comment: '' })
      setUploadProgress(0)
      setIsUploading(false)
    } catch (err) {
      console.error('Erro ao adicionar vídeo:', err)
      setError('Erro ao adicionar vídeo')
      setIsUploading(false)
    }
  }

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm('Tem certeza que deseja remover este vídeo?')) {
      return
    }

    try {
      const videoToRemove = videos.find((v) => v.id === videoId)
      if (!videoToRemove) return

      const courseRef = doc(db, 'courses', id)
      await updateDoc(courseRef, {
        videos: arrayRemove(videoToRemove),
        totalDuration: (course?.totalDuration || 0) - (videoToRemove.duration || 0),
        updatedAt: new Date().toISOString(),
      })

      setVideos(videos.filter((v) => v.id !== videoId))
      setSuccess('Vídeo removido com sucesso!')
    } catch (err) {
      console.error('Erro ao remover vídeo:', err)
      setError('Erro ao remover vídeo')
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  if (loading) {
    return (
      <div className="manage-course-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="manage-course-page">
        <div className="error-container">
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0)

  return (
    <div className="manage-course-page">
      <div className="container">
        <div className="manage-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Voltar
          </button>
          <h1 className="page-title">Gerenciar Vídeos do Curso</h1>
          {course && (
            <div className="course-info">
              <h2>{course.title || id}</h2>
              <div className="course-stats-manage">
                <span>📝 {videos.length} vídeos</span>
                <span>⏱️ {formatDuration(totalDuration)}</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="manage-content">
          <div className="add-video-section">
            <h3>Adicionar Novo Vídeo</h3>
            <form onSubmit={handleAddVideo} className="add-video-form">
              <div className="form-group">
                <label htmlFor="video-title">Nome do Vídeo *</label>
                <input
                  type="text"
                  id="video-title"
                  value={newVideo.title || ''}
                  onChange={(e) => {
                    setNewVideo({ ...newVideo, title: e.target.value || '' })
                    setError('')
                  }}
                  placeholder="Ex: Introdução ao Portugol Studio"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="video-type">Tipo de Vídeo *</label>
                <div className="video-type-options">
                  <label className="video-type-option">
                    <input
                      type="radio"
                      name="video-type"
                      value="youtube"
                      checked={newVideo.videoType === 'youtube'}
                      onChange={(e) => {
                        setNewVideo({ ...newVideo, videoType: e.target.value || 'youtube', url: '', file: null, comment: newVideo.comment })
                        setError('')
                      }}
                    />
                    <span>YouTube</span>
                  </label>
                  <label className="video-type-option">
                    <input
                      type="radio"
                      name="video-type"
                      value="url"
                      checked={newVideo.videoType === 'url'}
                      onChange={(e) => {
                        setNewVideo({ ...newVideo, videoType: e.target.value || 'url', url: '', file: null })
                        setError('')
                      }}
                    />
                    <span>URL Direta</span>
                  </label>
                  <label className="video-type-option">
                    <input
                      type="radio"
                      name="video-type"
                      value="custom"
                      checked={newVideo.videoType === 'custom'}
                      onChange={(e) => {
                        setNewVideo({ ...newVideo, videoType: e.target.value || 'custom', url: '', file: null })
                        setError('')
                      }}
                    />
                    <span>Upload (Firebase)</span>
                  </label>
                </div>
              </div>

              {newVideo.videoType === 'youtube' ? (
                <div className="form-group">
                  <label htmlFor="video-url">URL do Vídeo (YouTube) *</label>
                  <input
                    type="url"
                    id="video-url"
                    value={newVideo.url || ''}
                    onChange={(e) => {
                      setNewVideo({ ...newVideo, url: e.target.value || '' })
                      setError('')
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <small className="form-hint">
                    Cole a URL completa do YouTube
                  </small>
                </div>
              ) : newVideo.videoType === 'url' ? (
                <div className="form-group">
                  <label htmlFor="video-url-direct">URL Direta do Vídeo *</label>
                  <input
                    type="url"
                    id="video-url-direct"
                    value={newVideo.url || ''}
                    onChange={(e) => {
                      setNewVideo({ ...newVideo, url: e.target.value || '' })
                      setError('')
                    }}
                    placeholder="https://exemplo.com/video.mp4 ou https://vimeo.com/..."
                    required
                  />
                  <small className="form-hint">
                    Cole a URL direta do vídeo (MP4, WebM, OGG ou serviços como Vimeo). 
                    <br />
                    <strong>Dica:</strong> Você pode hospedar vídeos gratuitamente em serviços como Vimeo, Google Drive (compartilhado), ou seu próprio servidor.
                  </small>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="video-file">Selecione o Vídeo *</label>
                  <input
                    type="file"
                    id="video-file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleFileChange}
                    required
                  />
                  <small className="form-hint">
                    <strong>⚠️ Importante:</strong> O vídeo será convertido em um link (URL) e armazenado no Firebase Storage. 
                    Se o Firebase Storage não estiver configurado ou tiver problemas, use a opção <strong>"URL Direta"</strong> acima.
                    <br />
                    <br />
                    <strong>Alternativa Gratuita:</strong> Se o upload falhar, faça upload do vídeo em <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer">Vimeo</a> (gratuito) 
                    e use a opção "URL Direta" para colar o link.
                    <br />
                    <br />
                    Formatos aceitos: MP4, WebM, OGG - máximo 500MB
                  </small>
                  {newVideo.file && (
                    <div className="file-info">
                      <span>📁 {newVideo.file.name}</span>
                      <span>{(newVideo.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="video-duration">Duração (minutos) *</label>
                <input
                  type="number"
                  id="video-duration"
                  min="0"
                  step="0.1"
                  value={
                    newVideo.duration !== undefined && newVideo.duration !== null && newVideo.duration !== 0
                      ? String(newVideo.duration)
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value === '' ? 0 : parseFloat(value) || 0
                    setNewVideo({ ...newVideo, duration: numValue })
                    setError('')
                  }}
                  placeholder="Ex: 15.5"
                  required
                />
                <small className="form-hint">
                  Informe a duração do vídeo em minutos (ex: 15.5 para 15 minutos e 30 segundos)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="video-comment">Comentário/Descrição da Aula</label>
                <textarea
                  id="video-comment"
                  value={newVideo.comment || ''}
                  onChange={(e) => {
                    setNewVideo({ ...newVideo, comment: e.target.value })
                    setError('')
                  }}
                  placeholder="Adicione um comentário ou descrição sobre esta aula (opcional)"
                  rows="4"
                />
                <small className="form-hint">
                  Adicione informações adicionais sobre o conteúdo desta aula, tópicos abordados ou observações importantes.
                </small>
              </div>

              <button type="submit" className="btn btn-primary">
                Adicionar Vídeo
              </button>
            </form>
          </div>

          <div className="videos-list-section">
            <h3>Vídeos do Curso ({videos.length})</h3>
            {videos.length === 0 ? (
              <div className="no-videos">
                <p>Nenhum vídeo adicionado ainda.</p>
                <p>Adicione o primeiro vídeo usando o formulário acima.</p>
              </div>
            ) : (
              <div className="videos-list">
                {videos.map((video, index) => (
                  <div key={video.id} className="video-item">
                    <div className="video-number">{index + 1}</div>
                    <div className="video-details">
                      <h4>{video.title}</h4>
                      <div className="video-meta">
                        <span className="video-url">{video.url}</span>
                        <span className="video-duration">⏱️ {formatDuration(video.duration)}</span>
                      </div>
                      {video.comment && (
                        <div className="video-comment">
                          <p className="video-comment-text">{video.comment}</p>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleRemoveVideo(video.id)} className="btn-remove-video" title="Remover vídeo">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageCourse

