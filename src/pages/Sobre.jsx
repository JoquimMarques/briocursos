import { useState } from 'react'
import './Sobre.css'

function Sobre() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você pode adicionar a lógica de cadastro
    console.log('Cadastro:', formData)
    alert('Cadastro realizado com sucesso!')
    setFormData({ name: '', email: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="sobre-page">
      <div className="container">
        <h1 className="page-title">Sobre a Plataforma</h1>
        <div className="sobre-content">
          <div className="sobre-card">
            <h2>📚 Nossa Missão</h2>
            <p>
              Nossa plataforma é dedicada a oferecer os melhores cursos de programação online.
              Nossa missão é democratizar o acesso à educação de programação de qualidade.
            </p>
          </div>
          <div className="sobre-card">
            <h2>✨ O Que Oferecemos</h2>
            <p>
              Cursos completos de programação ministrados por instrutores experientes.
              Aprenda desde o básico até conceitos avançados com projetos práticos.
            </p>
          </div>
          <div className="sobre-card">
            <h2>🚀 Tecnologias</h2>
            <p>
              Construído com React e Vue, utilizando as mais modernas tecnologias web
              para garantir performance e uma experiência fluida de aprendizado.
            </p>
          </div>
        </div>

        {/* <div className="signup-section-sobre">
          <div className="signup-card">
            <h2>Comece sua jornada agora!</h2>
            <p>Cadastre-se gratuitamente e tenha acesso a todos os cursos</p>
            <form onSubmit={handleSubmit} className="signup-form">
              <input
                type="text"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Seu melhor e-mail"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn btn-primary">
                Cadastrar Grátis
              </button>
            </form>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Sobre
