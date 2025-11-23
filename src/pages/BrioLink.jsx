import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './BrioLink.css'

function BrioLink() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)

  // Simular posts iniciais
  useEffect(() => {
    const initialPosts = [
      {
        id: 1,
        autor: 'João Silva',
        conteudo: 'Acabei de completar o curso de HTML! Muito bom! 🎉',
        data: '2024-01-15',
        likes: 5
      },
      {
        id: 2,
        autor: 'Maria Santos',
        conteudo: 'Alguém pode me ajudar com JavaScript? Estou com dúvidas em arrays.',
        data: '2024-01-14',
        likes: 3
      }
    ]
    setPosts(initialPosts)
  }, [])

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    if (!newPost.trim()) return

    setLoading(true)
    
    // Simular criação de post
    setTimeout(() => {
      const post = {
        id: Date.now(),
        autor: user.displayName || user.email || 'Usuário',
        conteudo: newPost,
        data: new Date().toISOString().split('T')[0],
        likes: 0
      }
      setPosts([post, ...posts])
      setNewPost('')
      setLoading(false)
    }, 500)
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ))
  }

  return (
    <div className="briolink-page">
      <div className="container">
        <div className="briolink-header">
          <h1 className="page-title">🔗 BrioLink</h1>
          <p className="page-subtitle">
            Rede social da BrioCursos - Conecte-se com outros alunos e compartilhe seu aprendizado!
          </p>
        </div>

        <div className="briolink-content">
          <div className="briolink-main">
            {user ? (
              <div className="create-post-card">
                <h3>Compartilhe algo</h3>
                <form onSubmit={handlePostSubmit} className="post-form">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="O que você está aprendendo? Compartilhe com a comunidade!"
                    className="post-input"
                    rows="4"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !newPost.trim()}
                  >
                    {loading ? 'Publicando...' : 'Publicar'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="login-prompt">
                <p>Faça login para participar da comunidade BrioLink!</p>
                <button 
                  onClick={() => navigate('/login')}
                  className="btn btn-primary"
                >
                  Entrar
                </button>
              </div>
            )}

            <div className="posts-section">
              <h3>Feed da Comunidade</h3>
              {posts.length === 0 ? (
                <div className="no-posts">
                  <p>Nenhum post ainda. Seja o primeiro a compartilhar!</p>
                </div>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <div className="post-author">
                          <span className="author-avatar">👤</span>
                          <span className="author-name">{post.autor}</span>
                        </div>
                        <span className="post-date">{post.data}</span>
                      </div>
                      <div className="post-content">
                        <p>{post.conteudo}</p>
                      </div>
                      <div className="post-actions">
                        <button 
                          className="like-button"
                          onClick={() => handleLike(post.id)}
                        >
                          ❤️ {post.likes}
                        </button>
                        <button className="comment-button">
                          💬 Comentar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="briolink-sidebar">
            <div className="sidebar-card">
              <h4>📊 Estatísticas</h4>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">150+</span>
                  <span className="stat-label">Membros</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h4>💡 Dicas</h4>
              <ul className="tips-list">
                <li>Compartilhe suas conquistas!</li>
                <li>Faça perguntas à comunidade</li>
                <li>Ajuda outros alunos</li>
                <li>Compartilhe recursos úteis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrioLink

