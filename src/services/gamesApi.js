import axios from 'axios'
import { 
  getAllGameDistributionGames,
  getGameDistributionGameById,
  getGameDistributionGamesByCategory,
  getGamesByCompany,
  transformGameDistributionData,
} from './gameDistribution'

// Configuração da API de jogos
// Por padrão, usa GameDistribution
const USE_GAMEDISTRIBUTION = import.meta.env.VITE_USE_GAMEDISTRIBUTION !== 'false'
const GAMES_API_BASE_URL = import.meta.env.VITE_GAMES_API_URL || ''
const GAMES_API_KEY = import.meta.env.VITE_GAMES_API_KEY || null

// Cliente Axios configurável (para outras APIs)
const gamesApiClient = GAMES_API_BASE_URL ? axios.create({
  baseURL: GAMES_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    ...(GAMES_API_KEY && { 'Authorization': `Bearer ${GAMES_API_KEY}` }),
  },
}) : null

/**
 * Busca todos os jogos disponíveis
 * Usa GameDistribution por padrão, ou a API configurada
 */
export const getAllGames = async () => {
  try {
    if (USE_GAMEDISTRIBUTION) {
      const games = await getAllGameDistributionGames()
      return games.map(transformGameDistributionData)
    }

    if (!GAMES_API_BASE_URL || !gamesApiClient) {
      console.warn('Nenhuma API configurada. Configure VITE_GAMES_API_URL ou use GameDistribution.')
      return []
    }

    const response = await gamesApiClient.get('/games')
    return response.data.games || response.data || []
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
    throw error
  }
}

/**
 * Busca jogos por categoria
 */
export const getGamesByCategory = async (category) => {
  try {
    if (USE_GAMEDISTRIBUTION) {
      const games = await getGameDistributionGamesByCategory(category)
      return games.map(transformGameDistributionData)
    }

    if (!GAMES_API_BASE_URL || !gamesApiClient) {
      return []
    }

    const response = await gamesApiClient.get('/games', {
      params: {
        category: category === 'all' ? null : category,
      },
    })

    return response.data.games || response.data || []
  } catch (error) {
    console.error('Erro ao buscar jogos por categoria:', error)
    throw error
  }
}

/**
 * Busca um jogo específico por ID
 */
export const getGameById = async (gameId) => {
  try {
    if (USE_GAMEDISTRIBUTION) {
      const game = await getGameDistributionGameById(gameId)
      return game ? transformGameDistributionData(game) : null
    }

    if (!GAMES_API_BASE_URL || !gamesApiClient) {
      return null
    }

    const response = await gamesApiClient.get(`/games/${gameId}`)
    return response.data.game || response.data || null
  } catch (error) {
    console.error('Erro ao buscar jogo:', error)
    throw error
  }
}

/**
 * Busca jogos populares
 */
export const getPopularGames = async () => {
  try {
    if (USE_GAMEDISTRIBUTION) {
      // Retorna todos os jogos (pode ser filtrado por popularidade no futuro)
      const games = await getAllGameDistributionGames()
      return games.map(transformGameDistributionData)
    }

    if (!GAMES_API_BASE_URL || !gamesApiClient) {
      return []
    }

    const response = await gamesApiClient.get('/games/popular')
    return response.data.games || response.data || []
  } catch (error) {
    console.error('Erro ao buscar jogos populares:', error)
    throw error
  }
}

/**
 * Busca jogos novos
 */
export const getNewGames = async () => {
  try {
    if (USE_GAMEDISTRIBUTION) {
      // Retorna todos os jogos (pode ser ordenado por data no futuro)
      const games = await getAllGameDistributionGames()
      return games.map(transformGameDistributionData).reverse()
    }

    if (!GAMES_API_BASE_URL || !gamesApiClient) {
      return []
    }

    const response = await gamesApiClient.get('/games/new')
    return response.data.games || response.data || []
  } catch (error) {
    console.error('Erro ao buscar jogos novos:', error)
    throw error
  }
}

/**
 * Função helper para transformar dados da API no formato esperado pelo site
 * Usada quando não está usando GameDistribution
 */
export const transformGameData = (apiGame) => {
  return {
    id: apiGame.id || apiGame._id,
    title: apiGame.title || apiGame.name,
    description: apiGame.description || apiGame.short_description,
    category: apiGame.category || apiGame.genre || 'Geral',
    difficulty: apiGame.difficulty || 'Médio',
    playTime: apiGame.playTime || apiGame.duration || '10-15 min',
    thumbnail: apiGame.thumbnail || apiGame.image || apiGame.icon || '🎮',
    color: apiGame.color || '#667eea',
    type: apiGame.type || 'iframe',
    gameUrl: apiGame.gameUrl || apiGame.embed_url || apiGame.iframe_url || apiGame.url,
    instructions: apiGame.instructions || apiGame.how_to_play || 'Clique para jogar!',
    developer: apiGame.developer || apiGame.author,
    rating: apiGame.rating || apiGame.score,
    views: apiGame.views || apiGame.plays,
  }
}

export default {
  getAllGames,
  getGamesByCategory,
  getGameById,
  getPopularGames,
  getNewGames,
  transformGameData,
}
