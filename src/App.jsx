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
import './App.css'

function AppContent() {
  const location = useLocation()
  const isCoursePage = location.pathname.startsWith('/curso/')
  
  return (
    <div className="App">
      {!isCoursePage && <Navbar />}
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
        </Route>
      </Routes>
      {!isCoursePage && <Footer />}
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
