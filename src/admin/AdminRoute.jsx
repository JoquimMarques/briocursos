import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from './adminAccess'
import './ManageCourse.css'

const AdminRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="manage-course-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!hasAdminAccess(user)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute

