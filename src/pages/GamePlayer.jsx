import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGameById } from '../services/gamesApi'
import './GamePlayer.css'

function GamePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true)
        const gameData = await getGameById(id)
        if (gameData) {
          // Os dados já vêm no formato correto
          setGame(gameData)
        } else {
          setError('Jogo não encontrado')
        }
      } catch (err) {
        console.error('Erro ao carregar jogo:', err)
        setError('Erro ao carregar o jogo. Verifique a configuração.')
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [id])

  if (loading) {
    return (
      <div className="game-player-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando jogo...</p>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="game-player-page">
        <div className="error-container">
          <h2>Jogo não encontrado</h2>
          <p>{error || 'O jogo que você está procurando não existe.'}</p>
          <Link to="/" className="btn btn-primary">
            Voltar para Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="game-player-page">
      <div className="game-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Voltar
        </button>
        <div className="game-info-header">
          <h1>{game.title}</h1>
          <div className="game-meta-header">
            <span className="game-category">{game.category}</span>
            {game.difficulty && (
              <span className="game-difficulty">Dificuldade: {game.difficulty}</span>
            )}
            {game.playTime && (
              <span className="game-time">⏱️ {game.playTime}</span>
            )}
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="game-instructions">
          <h3>📖 Como Jogar</h3>
          <p>{game.instructions}</p>
        </div>

        <div className="game-container">
          {game.type === 'iframe' && game.gameUrl ? (
            <div className="game-embed">
              <iframe
                src={game.gameUrl}
                title={game.title}
                className="game-iframe"
                allow="gamepad; fullscreen; autoplay; microphone; camera"
                allowFullScreen
                scrolling="no"
                frameBorder="0"
                style={{ width: '100%', height: '100%' }}
              ></iframe>
            </div>
          ) : game.type === 'embed' && game.gameUrl ? (
            <div className="game-embed">
              <iframe
                src={game.gameUrl}
                title={game.title}
                className="game-iframe"
                allow="gamepad; fullscreen"
                allowFullScreen
              ></iframe>
            </div>
          ) : game.type === 'external' && game.gameUrl ? (
            <div className="game-external">
              <a
                href={game.gameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary external-link"
              >
                Jogar em Nova Aba →
              </a>
            </div>
          ) : (
            <div className="game-placeholder" style={{ backgroundColor: game.color || '#667eea' }}>
              <div className="game-placeholder-icon" style={{ fontSize: '8rem' }}>
                {game.thumbnail || '🎮'}
              </div>
              <h2>{game.title}</h2>
              <p>Jogo não disponível para embed</p>
              {game.gameUrl && (
                <a
                  href={game.gameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Jogar em Nova Aba →
                </a>
              )}
            </div>
          )}
        </div>

        <div className="game-description-section">
          <h3>ℹ️ Sobre o Jogo</h3>
          <p>{game.description}</p>
          {game.developer && (
            <p style={{ marginTop: '1rem', opacity: 0.8 }}>
              <strong>Desenvolvedor:</strong> {game.developer}
            </p>
          )}
          {game.rating && (
            <p style={{ opacity: 0.8 }}>
              <strong>Avaliação:</strong> ⭐ {game.rating}/5
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePlayer
