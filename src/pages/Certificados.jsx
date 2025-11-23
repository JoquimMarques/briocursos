import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaGraduationCap, FaScroll, FaDownload, FaShare, FaCheckCircle, FaInfoCircle, FaBriefcase } from 'react-icons/fa'
import './Certificados.css'

function Certificados() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certificados, setCertificados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Simular carregamento de certificados
    // Aqui você pode buscar do Firestore
    setTimeout(() => {
      // Por enquanto, nenhum certificado
      setCertificados([])
      setLoading(false)
    }, 500)
  }, [user, navigate])

  if (loading) {
    return (
      <div className="certificados-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando certificados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="certificados-page">
      <div className="container">
        <div className="certificados-header">
          <h1 className="page-title">
            <FaGraduationCap style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Meus Certificados
          </h1>
          <p className="page-subtitle">
            Visualize e baixe seus certificados de conclusão de curso
          </p>
        </div>

        {certificados.length === 0 ? (
          <div className="no-certificados">
            <div className="no-certificados-icon">
              <FaScroll />
            </div>
            <h2>Você ainda não possui certificados</h2>
            <p>
              Complete cursos para receber certificados de conclusão. 
              Cada curso concluído com 100% de progresso gera um certificado automaticamente.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="certificados-grid">
            {certificados.map((certificado) => (
              <div key={certificado.id} className="certificado-card">
                <div className="certificado-icon">
                  <FaGraduationCap />
                </div>
                <h3 className="certificado-curso">{certificado.curso}</h3>
                <p className="certificado-data">
                  Concluído em {certificado.dataConclusao}
                </p>
                <div className="certificado-actions">
                  <button className="btn btn-primary">
                    <FaDownload style={{ marginRight: '0.5rem' }} />
                    Baixar PDF
                  </button>
                  <button className="btn btn-secondary">
                    <FaShare style={{ marginRight: '0.5rem' }} />
                    Compartilhar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="certificados-info">
          <h3>
            <FaInfoCircle style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Sobre os Certificados
          </h3>
          <div className="info-cards">
            <div className="info-card">
              <h4>
                <FaCheckCircle style={{ marginRight: '0.5rem', color: '#4ade80' }} />
                Como obter
              </h4>
              <p>Complete 100% do curso assistindo todos os vídeos e concluindo as atividades.</p>
            </div>
            <div className="info-card">
              <h4>
                <FaScroll style={{ marginRight: '0.5rem', color: '#4ade80' }} />
                Validação
              </h4>
              <p>Certificados são verificáveis e incluem código único de autenticação.</p>
            </div>
            <div className="info-card">
              <h4>
                <FaBriefcase style={{ marginRight: '0.5rem', color: '#4ade80' }} />
                Profissional
              </h4>
              <p>Adicione seus certificados ao <a href='https://briolinke.vercel.app/' style={{ color: '#4ade80', textDecoration: 'none' }}>briolink</a> e portfólio profissional.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificados

