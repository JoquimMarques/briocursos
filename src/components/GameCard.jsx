import { Link } from 'react-router-dom'
import './GameCard.css'

function GameCard({ game }) {
  if (!game) return null

  return (
    <div className="game-card">
      <div className="game-image-container">
        {game.thumbnail && game.thumbnail.startsWith('http') ? (
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className="game-image"
            onError={(e) => {
              // Fallback para emoji se a imagem não carregar
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `
                <div class="game-thumbnail" style="background-color: ${game.color || '#667eea'}; font-size: 5rem; display: flex; align-items: center; justify-content: center;">
                  🕹️
                </div>
              `
            }}
          />
        ) : (
          <div 
            className="game-thumbnail"
            style={{ 
              backgroundColor: game.color || '#667eea',
              fontSize: '5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {game.thumbnail || '🕹️'}
          </div>
        )}
        {game.category && (
          <span className="game-genre">{game.category}</span>
        )}
      </div>
      <div className="game-info">
        <h3 className="game-title">{game.title}</h3>
        <p className="game-description">
          {game.description || 'Descrição não disponível'}
        </p>
        <div className="game-meta">
          {game.difficulty && (
            <span className="game-difficulty">
              ⭐ {game.difficulty}
            </span>
          )}
          {game.playTime && (
            <span className="game-time">
              ⏱️ {game.playTime}
            </span>
          )}
        </div>
        <Link
          to={`/jogar/${game.id}`}
          className="game-link"
        >
          Jogar Agora →
        </Link>
      </div>
    </div>
  )
}

export default GameCard
