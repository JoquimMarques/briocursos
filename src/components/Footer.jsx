import { Link } from 'react-router-dom'
import { FaLink } from 'react-icons/fa'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">BrioCursos</h3>
            <p className="footer-description">
              Plataforma de cursos online gratuitos para todos.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Links Rápidos</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Início</Link>
              </li>
              <li>
                <Link to="/professores" className="footer-link">Professores</Link>
              </li>
              <li>
                <Link to="/certificados" className="footer-link">Certificados</Link>
              </li>
              <li>
                <Link to="/sobre" className="footer-link">Sobre</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Redes Sociais</h4>
            <div className="footer-social">
              <a 
                href="https://briolinke.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <FaLink className="footer-social-icon" />
                <span>brioLink</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} BrioCursos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

