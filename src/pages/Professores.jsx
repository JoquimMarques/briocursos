import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from '../admin/adminAccess'
import { getProfessores, addProfessor } from '../services/professoresService'
import './Professores.css'

function Professores() {
  const { user } = useAuth()
  const [professores, setProfessores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [newProfessor, setNewProfessor] = useState({
    nome: '',
    profissao: '',
    descricao: '',
    briolink: '',
    portfolio: ''
  })

  const isAdmin = user && hasAdminAccess(user)

  useEffect(() => {
    loadProfessores()
  }, [])

  const loadProfessores = async () => {
    try {
      setLoading(true)
      const { data, error } = await getProfessores()
      if (error) {
        console.error('Erro ao carregar professores:', error)
        // Em caso de erro, manter lista vazia
        setProfessores([])
      } else {
        setProfessores(data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar professores:', err)
      setProfessores([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddProfessor = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newProfessor.nome.trim()) {
      setError('Por favor, preencha o nome do professor')
      return
    }

    if (!newProfessor.profissao.trim()) {
      setError('Por favor, preencha a profissão do professor')
      return
    }

    if (!newProfessor.descricao.trim()) {
      setError('Por favor, preencha a descrição do professor')
      return
    }

    try {
      setSubmitting(true)
      const { data, error } = await addProfessor({
        nome: newProfessor.nome.trim(),
        profissao: newProfessor.profissao.trim(),
        descricao: newProfessor.descricao.trim(),
        briolink: newProfessor.briolink.trim(),
        portfolio: newProfessor.portfolio.trim()
      })

      if (error) {
        setError(error)
        return
      }

      setSuccess('Professor adicionado com sucesso!')
      setNewProfessor({
        nome: '',
        profissao: '',
        descricao: '',
        briolink: '',
        portfolio: ''
      })
      setShowAddForm(false)
      
      // Recarregar lista de professores
      await loadProfessores()
    } catch (err) {
      console.error('Erro ao adicionar professor:', err)
      setError('Erro ao adicionar professor. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="professores-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando professores...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="professores-page">
      <div className="container">
        <div className="professores-header">
          <div>
            <h1 className="page-title">👨‍🏫 Nossos Professores</h1>
            <p className="page-subtitle">
              Conheça os profissionais que compartilham conhecimento na BrioCursos
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-add-professor"
            >
              {showAddForm ? '✕ Cancelar' : '+ Adicionar Professor'}
            </button>
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

        {isAdmin && showAddForm && (
          <div className="add-professor-form-container">
            <h2>Adicionar Novo Professor</h2>
            <form onSubmit={handleAddProfessor} className="add-professor-form">
              <div className="form-group">
                <label htmlFor="professor-nome">Nome *</label>
                <input
                  type="text"
                  id="professor-nome"
                  value={newProfessor.nome}
                  onChange={(e) => setNewProfessor({ ...newProfessor, nome: e.target.value })}
                  placeholder="Ex: Joaquim Cesar Francisco Marques"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="professor-profissao">Profissão *</label>
                <input
                  type="text"
                  id="professor-profissao"
                  value={newProfessor.profissao}
                  onChange={(e) => setNewProfessor({ ...newProfessor, profissao: e.target.value })}
                  placeholder="Ex: Desenvolvedor Front-end"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="professor-descricao">Descrição *</label>
                <textarea
                  id="professor-descricao"
                  value={newProfessor.descricao}
                  onChange={(e) => setNewProfessor({ ...newProfessor, descricao: e.target.value })}
                  placeholder="Ex: Desenvolvedor Front-end há 4 anos e estudante do IPIL. Apaixonado por criar experiências web incríveis."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="professor-briolink">BrioLink</label>
                <input
                  type="url"
                  id="professor-briolink"
                  value={newProfessor.briolink}
                  onChange={(e) => setNewProfessor({ ...newProfessor, briolink: e.target.value })}
                  placeholder="https://briolinke.vercel.app/"
                />
              </div>

              <div className="form-group">
                <label htmlFor="professor-portfolio">Portfólio</label>
                <input
                  type="url"
                  id="professor-portfolio"
                  value={newProfessor.portfolio}
                  onChange={(e) => setNewProfessor({ ...newProfessor, portfolio: e.target.value })}
                  placeholder="https://portifolio1dev.netlify.app"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Adicionar Professor'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                    setSuccess('')
                    setNewProfessor({
                      nome: '',
                      profissao: '',
                      descricao: '',
                      briolink: '',
                      portfolio: ''
                    })
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="professores-grid">
          {professores.map((professor) => (
            <div key={professor.id} className="professor-card">
              <div className="professor-avatar">
                {professor.foto ? (
                  <img 
                    src={professor.foto} 
                    alt={professor.nome}
                    className="professor-foto"
                  />
                ) : (
                  <div className="professor-foto-placeholder">
                    👨‍🏫
                  </div>
                )}
              </div>
              <div className="professor-info">
                <h3 className="professor-nome">{professor.nome}</h3>
                <p className="professor-especialidade">{professor.especialidade}</p>
                {professor.experiencia && (
                  <p className="professor-experiencia">
                    {professor.experiencia} de experiência
                  </p>
                )}
                {professor.instituicao && (
                  <p className="professor-instituicao">
                    📚 {professor.instituicao}
                  </p>
                )}
                <p className="professor-bio">{professor.bio}</p>
                <div className="professor-redes-sociais">
                  {professor.redesSociais.briolink ? (
                    <a 
                      href={professor.redesSociais.briolink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="rede-social-button briolink-button"
                      title="briolink"
                    >
                      🔗 briolink
                    </a>
                  ) : (
                    <button 
                      className="rede-social-button briolink-button disabled"
                      title="BrioLink (em breve)"
                      disabled
                    >
                      🔗 briolink
                    </button>
                  )}
                  {professor.redesSociais.portfolio ? (
                    <a 
                      href={professor.redesSociais.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="rede-social-button portfolio-button"
                      title="Portfólio"
                    >
                      💼 Portfólio
                    </a>
                  ) : (
                    <button 
                      className="rede-social-button portfolio-button disabled"
                      title="Portfólio (em breve)"
                      disabled
                    >
                      💼 Portfólio
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {professores.length === 0 && (
          <div className="no-professores">
            <p>Nenhum professor cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Professores

