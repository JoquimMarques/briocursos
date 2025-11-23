// Serviço para buscar jogos do GameDistribution
// O GameDistribution usa iframes com URLs específicas

const GAMEDISTRIBUTION_BASE_URL = 'https://html5.gamedistribution.com'
const GAMEDISTRIBUTION_REFERRER = 'https://gamedistribution.com/games'

/**
 * Constrói a URL do iframe para um jogo do GameDistribution
 * @param {string} gameId - ID único do jogo (ex: 'archery-ragdoll')
 * @param {string} gameHash - Hash do jogo (ex: '1ebba0a58564412f9a6be21511f86b48')
 */
export const buildGameDistributionUrl = (gameHash, gameId) => {
  const referrerUrl = `${GAMEDISTRIBUTION_REFERRER}/${gameId}/`
  return `${GAMEDISTRIBUTION_BASE_URL}/${gameHash}/?gd_sdk_referrer_url=${encodeURIComponent(referrerUrl)}`
}

/**
 * Lista de jogos populares do GameDistribution
 * Você pode adicionar mais jogos aqui com seus IDs e hashes
 */
export const gameDistributionGames = [
  {
    id: 'archery-ragdoll',
    title: 'Archery Ragdoll',
    description: 'Dispute uma competição de tiro com arco contra os melhores arqueiros do mundo!',
    category: 'Ação',
    difficulty: 'Médio',
    playTime: '5-10 min',
    thumbnail: 'https://html5.gamedistribution.com/1ebba0a58564412f9a6be21511f86b48/thumbnail.jpg',
    color: '#FF6B6B',
    gameHash: '1ebba0a58564412f9a6be21511f86b48',
    instructions: 'Use o mouse para mirar e atirar. Teste sua pontaria!',
  },
  // Adicione mais jogos aqui conforme necessário
  // Você pode encontrar mais jogos em https://gamedistribution.com/games
]

/**
 * Busca todos os jogos do GameDistribution
 */
export const getAllGameDistributionGames = async () => {
  // Por enquanto retorna a lista estática
  // Se o GameDistribution tiver uma API pública, pode ser implementada aqui
  return gameDistributionGames.map(game => ({
    ...game,
    type: 'iframe',
    gameUrl: buildGameDistributionUrl(game.gameHash, game.id),
  }))
}

/**
 * Busca um jogo específico por ID
 */
export const getGameDistributionGameById = async (gameId) => {
  const game = gameDistributionGames.find(g => g.id === gameId)
  if (!game) return null

  return {
    ...game,
    type: 'iframe',
    gameUrl: buildGameDistributionUrl(game.gameHash, game.id),
  }
}

/**
 * Busca jogos por categoria
 */
export const getGameDistributionGamesByCategory = async (category) => {
  if (category === 'all') {
    return getAllGameDistributionGames()
  }

  const filtered = gameDistributionGames.filter(
    game => game.category.toLowerCase() === category.toLowerCase()
  )

  return filtered.map(game => ({
    ...game,
    type: 'iframe',
    gameUrl: buildGameDistributionUrl(game.gameHash, game.id),
  }))
}

/**
 * Função para adicionar um novo jogo do GameDistribution manualmente
 * @param {Object} gameData - Dados do jogo { id, title, description, category, gameHash, ... }
 */
export const addGameDistributionGame = (gameData) => {
  gameDistributionGames.push(gameData)
}

/**
 * Transforma um jogo do GameDistribution no formato esperado pelo site
 */
export const transformGameDistributionData = (game) => {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    category: game.category || 'Geral',
    difficulty: game.difficulty || 'Médio',
    playTime: game.playTime || '10-15 min',
    thumbnail: game.thumbnail || '🎮',
    color: game.color || '#667eea',
    type: 'iframe',
    gameUrl: buildGameDistributionUrl(game.gameHash, game.id),
    instructions: game.instructions || 'Clique para jogar!',
    developer: game.developer,
    rating: game.rating,
  }
}

export default {
  getAllGameDistributionGames,
  getGameDistributionGameById,
  getGameDistributionGamesByCategory,
  addGameDistributionGame,
  transformGameDistributionData,
  buildGameDistributionUrl,
}

