import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasAdminAccess } from './adminAccess'
import { useNavigate } from 'react-router-dom'
import {
  PAYMENT_STATUS,
  getAllPaymentOrders,
  approvePaymentOrder,
  rejectPaymentOrder,
  deletePaymentOrder,
  updateCoursePaymentSettings,
  getFreeModeSettings,
  updateFreeModeSettings
} from '../services/paymentService'
import './AdminPayments.css'

// Inicialização única para configurar pagamentos dos cursos
const initializePayments = async () => {
  const initialized = localStorage.getItem('payments_initialized_v4')
  if (!initialized) {
    try {
      // Portugol Studio: 500 Kz
      await updateCoursePaymentSettings('portugol-studio', {
        paymentEnabled: true,
        price: 500
      })

      // HTML: 1000 Kz
      await updateCoursePaymentSettings('html', {
        paymentEnabled: true,
        price: 1000
      })

      // CSS: 900 Kz
      await updateCoursePaymentSettings('css', {
        paymentEnabled: true,
        price: 900
      })

      // JavaScript: 1500 Kz
      await updateCoursePaymentSettings('javascript', {
        paymentEnabled: true,
        price: 1500
      })

      localStorage.setItem('payments_initialized_v4', 'true')
      console.log('✅ Todos os pagamentos configurados!')
    } catch (error) {
      console.error('Erro ao inicializar pagamentos:', error)
    }
  }
}

function AdminPayments() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, awaiting, approved, rejected
  const [processing, setProcessing] = useState({})
  const [rejectModal, setRejectModal] = useState({ open: false, orderId: null })
  const [rejectReason, setRejectReason] = useState('')

  // Estados para o Modo Gratuito
  const [freeModeSettings, setFreeModeSettings] = useState({
    isEnabled: false,
    startAt: '',
    endAt: ''
  })
  const [savingFreeMode, setSavingFreeMode] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || !hasAdminAccess(user))) {
      navigate('/')
      return
    }

    if (user && hasAdminAccess(user)) {
      // Inicializar pagamento do Portugol Studio (500 Kz)
      initializePayments()
      loadOrders()
      loadFreeModeSettings()
    }
  }, [user, authLoading, navigate])

  const loadFreeModeSettings = async () => {
    try {
      const settings = await getFreeModeSettings()

      // Formatar datas para o input datetime-local (YYYY-MM-DDThh:mm)
      const formatForInput = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16)
      }

      setFreeModeSettings({
        isEnabled: settings.isEnabled || false,
        startAt: formatForInput(settings.startAt),
        endAt: formatForInput(settings.endAt)
      })
    } catch (err) {
      console.error('Erro ao carregar configurações do modo gratuito:', err)
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const { orders: fetchedOrders, error: fetchError } = await getAllPaymentOrders()

      if (fetchError) {
        setError(fetchError)
      } else {
        setOrders(fetchedOrders)
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos de pagamento')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFreeMode = async () => {
    setSavingFreeMode(true)
    try {
      // Converter inputs de volta para ISO string
      const startAtISO = freeModeSettings.startAt ? new Date(freeModeSettings.startAt).toISOString() : null
      const endAtISO = freeModeSettings.endAt ? new Date(freeModeSettings.endAt).toISOString() : null

      // Validar datas se estiver ativando
      if (freeModeSettings.isEnabled) {
        if (!startAtISO || !endAtISO) {
          alert('Por favor, defina data de início e fim para ativar.')
          setSavingFreeMode(false)
          return
        }
        if (new Date(endAtISO) <= new Date(startAtISO)) {
          alert('A data de fim deve ser posterior à data de início.')
          setSavingFreeMode(false)
          return
        }
      }

      const { error } = await updateFreeModeSettings({
        isEnabled: freeModeSettings.isEnabled,
        startAt: startAtISO,
        endAt: endAtISO
      })

      if (error) {
        alert('Erro ao salvar configurações do modo gratuito: ' + error)
      } else {
        alert('Configurações do modo gratuito atualizadas com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao salvar modo gratuito:', err)
      alert('Erro ao salvar configurações.')
    } finally {
      setSavingFreeMode(false)
    }
  }

  const handleApprove = async (orderId) => {
    setProcessing(prev => ({ ...prev, [orderId]: 'approving' }))

    try {
      const { error: approveError } = await approvePaymentOrder(orderId, user.uid)

      if (approveError) {
        setError(approveError)
      } else {
        // Atualizar lista local
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: PAYMENT_STATUS.APPROVED, approvedAt: new Date().toISOString() }
            : order
        ))
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err)
      setError('Erro ao aprovar pagamento')
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: null }))
    }
  }

  const handleReject = async () => {
    const { orderId } = rejectModal
    if (!orderId) return

    setProcessing(prev => ({ ...prev, [orderId]: 'rejecting' }))

    try {
      const { error: rejectError } = await rejectPaymentOrder(orderId, user.uid, rejectReason)

      if (rejectError) {
        setError(rejectError)
      } else {
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: PAYMENT_STATUS.REJECTED, rejectedAt: new Date().toISOString(), rejectionReason: rejectReason }
            : order
        ))
        setRejectModal({ open: false, orderId: null })
        setRejectReason('')
      }
    } catch (err) {
      console.error('Erro ao rejeitar:', err)
      setError('Erro ao rejeitar pagamento')
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: null }))
    }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return

    setProcessing(prev => ({ ...prev, [orderId]: 'deleting' }))

    try {
      const { error: deleteError } = await deletePaymentOrder(orderId)

      if (deleteError) {
        setError(deleteError)
      } else {
        setOrders(prev => prev.filter(order => order.id !== orderId))
      }
    } catch (err) {
      console.error('Erro ao excluir:', err)
      setError('Erro ao excluir pedido')
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: null }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Grátis'
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(price).replace('AOA', 'Kz')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case PAYMENT_STATUS.AWAITING_VERIFICATION:
        return <span className="status-badge awaiting">⏳ Aguardando Verificação</span>
      case PAYMENT_STATUS.APPROVED:
        return <span className="status-badge approved">✅ Aprovado</span>
      case PAYMENT_STATUS.REJECTED:
        return <span className="status-badge rejected">❌ Rejeitado</span>
      default:
        return <span className="status-badge pending">📝 Pendente</span>
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'awaiting') return order.status === PAYMENT_STATUS.AWAITING_VERIFICATION
    if (filter === 'approved') return order.status === PAYMENT_STATUS.APPROVED
    if (filter === 'rejected') return order.status === PAYMENT_STATUS.REJECTED
    return true
  })

  const stats = {
    total: orders.length,
    awaiting: orders.filter(o => o.status === PAYMENT_STATUS.AWAITING_VERIFICATION).length,
    approved: orders.filter(o => o.status === PAYMENT_STATUS.APPROVED).length,
    rejected: orders.filter(o => o.status === PAYMENT_STATUS.REJECTED).length
  }

  if (authLoading || loading) {
    return (
      <div className="admin-payments-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando pagamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-payments-page">
      <div className="admin-payments-container">
        <div className="admin-payments-header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Voltar
          </button>
          <h1>💳 Gestão de Pagamentos</h1>
          <button onClick={loadOrders} className="refresh-button">
            🔄 Atualizar
          </button>
        </div>

        {/* --- SECTION: CONFIGURAR HORÁRIO GRÁTIS --- */}
        <div className="free-mode-section">
          <h2>🎉 Configurar Horário Grátis</h2>
          <div className="free-mode-card">
            <div className="free-mode-controls">
              <div className="form-group">
                <label>Status:</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="freeModeToggle"
                    checked={freeModeSettings.isEnabled}
                    onChange={(e) => setFreeModeSettings({ ...freeModeSettings, isEnabled: e.target.checked })}
                  />
                  <label htmlFor="freeModeToggle" className="toggle-label">
                    {freeModeSettings.isEnabled ? 'ATIVADO' : 'DESATIVADO'}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Início:</label>
                <input
                  type="datetime-local"
                  value={freeModeSettings.startAt}
                  onChange={(e) => setFreeModeSettings({ ...freeModeSettings, startAt: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fim:</label>
                <input
                  type="datetime-local"
                  value={freeModeSettings.endAt}
                  onChange={(e) => setFreeModeSettings({ ...freeModeSettings, endAt: e.target.value })}
                />
              </div>

              <button
                className="btn-save-free-mode"
                onClick={handleSaveFreeMode}
                disabled={savingFreeMode}
              >
                {savingFreeMode ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
            <p className="free-mode-info">
              ⚠️ Quando ativado, <strong>TODOS</strong> os cursos ficarão gratuitos durante o período selecionado.
              Um contador regressivo aparecerá na página inicial.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="payments-stats">
          <div className="stat-card total" onClick={() => setFilter('all')}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card awaiting" onClick={() => setFilter('awaiting')}>
            <span className="stat-value">{stats.awaiting}</span>
            <span className="stat-label">Aguardando</span>
          </div>
          <div className="stat-card approved" onClick={() => setFilter('approved')}>
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Aprovados</span>
          </div>
          <div className="stat-card rejected" onClick={() => setFilter('rejected')}>
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejeitados</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-tab ${filter === 'awaiting' ? 'active' : ''}`}
            onClick={() => setFilter('awaiting')}
          >
            ⏳ Aguardando ({stats.awaiting})
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            ✅ Aprovados
          </button>
          <button
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            ❌ Rejeitados
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhum pedido encontrado.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className={`order-card ${order.status}`}>
                <div className="order-header">
                  <div className="order-user">
                    <span className="user-avatar">
                      {order.userName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <div className="user-info">
                      <span className="user-name">{order.userName || 'Usuário'}</span>
                      <span className="user-email">{order.userEmail}</span>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">📚 Curso:</span>
                    <span className="detail-value">{order.courseTitle}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">💰 Valor:</span>
                    <span className="detail-value price">{formatPrice(order.amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Data:</span>
                    <span className="detail-value">{formatDate(order.createdAt)}</span>
                  </div>
                  {order.approvedAt && (
                    <div className="detail-row">
                      <span className="detail-label">✅ Aprovado em:</span>
                      <span className="detail-value">{formatDate(order.approvedAt)}</span>
                    </div>
                  )}
                  {order.rejectedAt && (
                    <div className="detail-row">
                      <span className="detail-label">❌ Rejeitado em:</span>
                      <span className="detail-value">{formatDate(order.rejectedAt)}</span>
                    </div>
                  )}
                  {order.rejectionReason && (
                    <div className="detail-row">
                      <span className="detail-label">📝 Motivo:</span>
                      <span className="detail-value">{order.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  {order.status === PAYMENT_STATUS.AWAITING_VERIFICATION && (
                    <>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(order.id)}
                        disabled={processing[order.id]}
                      >
                        {processing[order.id] === 'approving' ? 'Aprovando...' : '✅ Aprovar'}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => setRejectModal({ open: true, orderId: order.id })}
                        disabled={processing[order.id]}
                      >
                        {processing[order.id] === 'rejecting' ? 'Rejeitando...' : '❌ Rejeitar'}
                      </button>
                    </>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(order.id)}
                    disabled={processing[order.id]}
                    title="Excluir pedido"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, orderId: null })}>
          <div className="reject-modal" onClick={e => e.stopPropagation()}>
            <h3>❌ Rejeitar Pagamento</h3>
            <p>Deseja rejeitar este pagamento? Informe o motivo (opcional):</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Pagamento não identificado, valor incorreto..."
              rows={3}
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setRejectModal({ open: false, orderId: null })
                  setRejectReason('')
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleReject}
                disabled={processing[rejectModal.orderId]}
              >
                {processing[rejectModal.orderId] ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayments

