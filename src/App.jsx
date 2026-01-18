import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import CoursePlayer from './pages/CoursePlayer'
import JourneyView from './pages/JourneyView'
import Professores from './pages/Professores'
import BrioLink from './pages/BrioLink'
import Certificados from './pages/Certificados'
import AdminRoute from './admin/AdminRoute'
import ManageCourse from './admin/ManageCourse'
import AdminPayments from './admin/AdminPayments'
import AdminCertificates from './admin/AdminCertificates'
import AdminStats from './admin/AdminStats'
import { updateCoursePaymentSettings } from './services/paymentService'
import './App.css'

// Inicializar pagamentos de cursos (executa uma vez)
const initPayments = async () => {
  const key = 'gameaxl_payments_init_v4'
  if (!localStorage.getItem(key)) {
    try {
      // Portugol Studio - 500 Kz
      await updateCoursePaymentSettings('portugol-studio', {
        paymentEnabled: true,
        price: 500
      })

      // HTML - 1000 Kz
      await updateCoursePaymentSettings('html', {
        paymentEnabled: true,
        price: 1000
      })

      // CSS - 900 Kz
      await updateCoursePaymentSettings('css', {
        paymentEnabled: true,
        price: 900
      })

      // JavaScript - 1500 Kz
      await updateCoursePaymentSettings('javascript', {
        paymentEnabled: true,
        price: 1500
      })

      localStorage.setItem(key, Date.now().toString())
      console.log('✅ Pagamentos inicializados!')
    } catch (e) {
      console.error('Erro ao inicializar pagamentos:', e)
    }
  }
}

function AppContent() {
  const location = useLocation()
  const isCoursePage = location.pathname.startsWith('/curso/')
  const isJourneyPage = location.pathname.startsWith('/jornada/')
  const hideNavbar = isCoursePage || isJourneyPage

  // Inicializar pagamentos na primeira carga
  useEffect(() => {
    initPayments()
  }, [])

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/professores" element={<Professores />} />
        <Route path="/briolink" element={<BrioLink />} />
        <Route path="/certificados" element={<Certificados />} />
        <Route path="/jornada/:id" element={<JourneyView />} />
        <Route path="/curso/:id" element={<CoursePlayer />} />
        <Route element={<AdminRoute />}>
          <Route path="/curso/:id/gerenciar" element={<ManageCourse />} />
          <Route path="/admin/pagamentos" element={<AdminPayments />} />
          <Route path="/admin/certificados" element={<AdminCertificates />} />
          <Route path="/admin/estatisticas" element={<AdminStats />} />
        </Route>
      </Routes>
      {!hideNavbar && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
