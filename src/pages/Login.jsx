import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, loginUser, resetPassword } from '../services/authService'
import './Login.css'

function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const { user, error: loginError } = await loginUser(formData.email, formData.password)
        if (loginError) {
          setError(loginError)
        } else {
          navigate('/')
        }
      } else {
        // Cadastro
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem!')
          setLoading(false)
          return
        }

        // Validar nome completo
        const nameParts = formData.name.trim().split(/\s+/)
        if (nameParts.length < 2) {
          setError('Por favor, informe seu nome completo (nome e sobrenome)')
          setLoading(false)
          return
        }

        const { user, error: registerError } = await registerUser(
          formData.email,
          formData.password,
          formData.name.trim()
        )

        if (registerError) {
          setError(registerError)
        } else {
          // Cadastro bem-sucedido - redirecionar para a página inicial
          navigate('/')
        }
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setError('Por favor, informe seu e-mail para recuperação de senha')
      return
    }

    setLoading(true)
    setError('')
    
    const { error: resetError } = await resetPassword(formData.email)
    if (resetError) {
      setError(resetError)
    } else {
      alert('Email de recuperação enviado! Verifique sua caixa de entrada.')
      setShowForgotPassword(false)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>{isLogin ? 'Entrar' : 'Criar Conta'}</h1>
            <p>
              {isLogin 
                ? 'Bem-vindo de volta! Entre para continuar aprendendo.'
                : 'Comece sua jornada agora! Crie sua conta gratuitamente.'}
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail para recuperação</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Email'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)}
                className="btn btn-secondary btn-submit"
              >
                Voltar
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Nome Completo *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nome e Sobrenome"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    pattern="[A-Za-zÀ-ÿ\s]{2,}"
                    title="Informe seu nome completo (nome e sobrenome)"
                  />
                  <small className="form-hint">Este nome aparecerá no seu certificado</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Senha</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    minLength={6}
                  />
                </div>
              )}

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Lembrar-me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(true)}
                    className="forgot-password-btn"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </button>
            </form>
          )}

          {!showForgotPassword && (
            <div className="login-footer">
              <p>
                {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
                <button type="button" onClick={switchMode} className="switch-mode">
                  {isLogin ? 'Cadastre-se' : 'Fazer Login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
