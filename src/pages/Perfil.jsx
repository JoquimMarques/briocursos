import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  updateUserFullName, 
  logoutUser, 
  updateUserProfile,
  saveProfileToLocalStorage,
  loadProfileFromLocalStorage,
  imageToBase64
} from '../services/authService'
import './Perfil.css'

function Perfil() {
  const { user, userData, setUserData } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Carregar dados do Firestore
    if (userData) {
      setFullName(userData.fullName || user.displayName || '')
      setBirthDate(userData.birthDate || '')
    }

    // Carregar dados do localStorage (foto de perfil)
    const { data: localData } = loadProfileFromLocalStorage(user.uid)
    if (localData) {
      if (localData.profilePhoto) {
        setProfilePhoto(localData.profilePhoto)
      }
      if (localData.birthDate && !birthDate) {
        setBirthDate(localData.birthDate)
      }
    }
  }, [user, userData, navigate])

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 2MB')
      return
    }

    try {
      const base64 = await imageToBase64(file)
      setProfilePhoto(base64)
      setError('')
      
      // Salvar no localStorage imediatamente
      saveProfileToLocalStorage(user.uid, {
        profilePhoto: base64,
        birthDate: birthDate,
        fullName: fullName
      })
    } catch (err) {
      setError('Erro ao processar a imagem')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validar nome completo
    const nameParts = fullName.trim().split(/\s+/)
    if (nameParts.length < 2) {
      setError('Por favor, informe seu nome completo (nome e sobrenome)')
      return
    }

    // Validar data de nascimento
    if (birthDate) {
      const birth = new Date(birthDate)
      const today = new Date()
      const age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (age < 13 || (age === 13 && monthDiff < 0)) {
        setError('Você deve ter pelo menos 13 anos para usar esta plataforma')
        return
      }

      if (birth > today) {
        setError('A data de nascimento não pode ser no futuro')
        return
      }
    }

    setLoading(true)

    try {
      // Atualizar nome completo no Firestore
      const { error: updateError } = await updateUserFullName(user.uid, fullName.trim())
      
      if (updateError) {
        setError(updateError)
        setLoading(false)
        return
      }

      // Atualizar outros dados do perfil no Firestore
      const profileData = {}
      if (birthDate) {
        profileData.birthDate = birthDate
      }

      if (Object.keys(profileData).length > 0) {
        await updateUserProfile(user.uid, profileData)
      }

      // Salvar tudo no localStorage
      saveProfileToLocalStorage(user.uid, {
        fullName: fullName.trim(),
        birthDate: birthDate,
        profilePhoto: profilePhoto
      })

      // Atualizar o contexto
      setUserData({
        ...userData,
        fullName: fullName.trim(),
        birthDate: birthDate
      })

      setSuccess('Perfil atualizado com sucesso!')
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao atualizar o perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await logoutUser()
      navigate('/')
    }
  }

  const handleRemovePhoto = () => {
    setProfilePhoto('')
    saveProfileToLocalStorage(user.uid, {
      fullName: fullName,
      birthDate: birthDate,
      profilePhoto: ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="perfil-page">
      <div className="container">
        <h1 className="page-title">Meu Perfil</h1>

        <div className="perfil-content">
          <div className="perfil-card">
            <div className="perfil-header">
              <div className="avatar-container">
                <div className="avatar" style={profilePhoto ? { backgroundImage: `url(${profilePhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                  {!profilePhoto && (
                    <span>
                      {userData?.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-change-photo"
                  title="Alterar foto"
                >
                  📷
                </button>
                {profilePhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-remove-photo"
                    title="Remover foto"
                  >
                    ✕
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="perfil-info">
                <h2>{userData?.fullName || user.displayName || 'Usuário'}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="perfil-section">
              <h3>Informações Pessoais</h3>
              <p className="section-description">
                Atualize suas informações pessoais. O nome completo será usado no certificado.
              </p>

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

              <form onSubmit={handleSubmit} className="perfil-form">
                <div className="form-group">
                  <label htmlFor="fullName">Nome Completo *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Nome e Sobrenome"
                    required
                    pattern="[A-Za-zÀ-ÿ\s]{2,}"
                    title="Informe seu nome completo (nome e sobrenome)"
                  />
                  <small className="form-hint">
                    Este nome aparecerá no seu certificado. Certifique-se de que está completo.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="birthDate">Data de Nascimento</label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <small className="form-hint">
                    Opcional. Deve ter pelo menos 13 anos.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="disabled-input"
                  />
                  <small className="form-hint">O e-mail não pode ser alterado</small>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>

            <div className="perfil-actions">
              <button onClick={handleLogout} className="btn btn-logout">
                Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
