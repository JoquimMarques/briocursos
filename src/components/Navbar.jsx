import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from '../admin/adminAccess'
import { FaBook, FaChalkboardTeacher, FaLink, FaGraduationCap, FaUser, FaHome, FaInfoCircle, FaBars, FaTimes, FaCreditCard, FaCertificate, FaChartLine } from 'react-icons/fa'
import './Navbar.css'

function Navbar() {
  const { user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isAdmin = user && hasAdminAccess(user)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="navbar">
      {isMenuOpen && (
        <div
          className="menu-overlay"
          onClick={closeMenu}
        />
      )}
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img
            src="/assets/logo.png"
            alt="BrioCursos Logo"
            className="logo-image"
            style={{ borderRadius: '100%' }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <span className="logo-text">BrioCursos</span>
        </Link>

        <button
          className="hamburger-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'navbar-menu-open' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              <FaHome className="navbar-icon" />
              <span>Início</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/professores" className="navbar-link" onClick={closeMenu}>
              <FaChalkboardTeacher className="navbar-icon" />
              <span>Professores</span>
            </Link>
          </li>
          <li className="navbar-item">
            <a
              href="https://briolinke.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-link"
              onClick={closeMenu}
            >
              <FaLink className="navbar-icon" />
              <span>Briolink</span>
            </a>
          </li>
          {!isAdmin && (
            <li className="navbar-item">
              <Link to="/certificados" className="navbar-link" onClick={closeMenu}>
                <FaGraduationCap className="navbar-icon" />
                <span>Certificados</span>
              </Link>
            </li>
          )}
          {isAdmin && (
            <>
              <li className="navbar-item">
                <Link to="/admin/pagamentos" className="navbar-link navbar-link-admin" onClick={closeMenu}>
                  <FaCreditCard className="navbar-icon" />
                  <span>Pagamentos</span>
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/certificados" className="navbar-link navbar-link-admin" onClick={closeMenu}>
                  <FaCertificate className="navbar-icon" />
                  <span>Certificados</span>
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/admin/estatisticas" className="navbar-link navbar-link-admin" onClick={closeMenu}>
                  <FaChartLine className="navbar-icon" />
                  <span>Estatísticas</span>
                </Link>
              </li>
            </>
          )}
          {!isAdmin && (
            <li className="navbar-item">
              <Link to="/sobre" className="navbar-link" onClick={closeMenu}>
                <FaInfoCircle className="navbar-icon" />
                <span>Sobre</span>
              </Link>
            </li>
          )}
          {loading ? (
            <li className="navbar-item">
              <span className="navbar-link" style={{ opacity: 0.6 }}>Carregando...</span>
            </li>
          ) : user ? (
            <li className="navbar-item">
              <Link to="/perfil" className="navbar-link navbar-link-profile" onClick={closeMenu}>
                <FaUser className="navbar-icon" />
                <span>Perfil</span>
              </Link>
            </li>
          ) : (
            <li className="navbar-item">
              <Link to="/login" className="navbar-link navbar-link-login" onClick={closeMenu}>
                <span>Entrar</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
