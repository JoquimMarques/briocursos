import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'

// IBAN fixo para pagamentos
export const PAYMENT_IBAN = '005500006717018310113'

// Status dos pagamentos
export const PAYMENT_STATUS = {
  PENDING: 'pending',           // Aguardando pagamento
  AWAITING_VERIFICATION: 'awaiting_verification', // Usuário clicou "Já paguei"
  APPROVED: 'approved',         // Pagamento aprovado pelo admin
  REJECTED: 'rejected'          // Pagamento rejeitado pelo admin
}

/**
 * Busca as configurações de pagamento de um curso
 */
export const getCoursePaymentSettings = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)

    if (courseSnap.exists()) {
      const data = courseSnap.data()
      return {
        paymentEnabled: data.paymentEnabled || false,
        price: data.price || 0,
        error: null
      }
    }

    return { paymentEnabled: false, price: 0, error: null }
  } catch (error) {
    console.error('Erro ao buscar configurações de pagamento:', error)
    return { paymentEnabled: false, price: 0, error: error.message }
  }
}

/**
 * Atualiza as configurações de pagamento de um curso (apenas admin)
 */
export const updateCoursePaymentSettings = async (courseId, { paymentEnabled, price }) => {
  try {
    const courseRef = doc(db, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)

    const updateData = {
      paymentEnabled: paymentEnabled,
      price: price || 0,
      updatedAt: new Date().toISOString()
    }

    if (courseSnap.exists()) {
      await updateDoc(courseRef, updateData)
    } else {
      await setDoc(courseRef, updateData, { merge: true })
    }

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar configurações de pagamento:', error)
    return { error: error.message }
  }
}

/**
 * Cria um pedido de pagamento quando o usuário clica em "Já paguei"
 */
export const createPaymentOrder = async (userId, userEmail, userName, courseId, courseTitle, amount) => {
  try {
    const orderId = `${userId}_${courseId}_${Date.now()}`
    const orderRef = doc(db, 'paymentOrders', orderId)

    await setDoc(orderRef, {
      orderId,
      userId,
      userEmail,
      userName: userName || 'Usuário',
      courseId,
      courseTitle,
      amount,
      status: PAYMENT_STATUS.AWAITING_VERIFICATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { orderId, error: null }
  } catch (error) {
    console.error('Erro ao criar pedido de pagamento:', error)
    return { orderId: null, error: error.message }
  }
}

/**
 * Verifica se o usuário tem um pagamento aprovado para o curso
 */
export const hasApprovedPayment = async (userId, courseId) => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('status', '==', PAYMENT_STATUS.APPROVED)
    )

    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Erro ao verificar pagamento aprovado:', error)
    return false
  }
}

/**
 * Verifica o status do pagamento do usuário para um curso
 */
export const getUserPaymentStatus = async (userId, courseId) => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return { status: null, order: null, error: null }
    }

    // Retornar o pedido mais recente
    let latestOrder = null
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (!latestOrder || new Date(data.createdAt) > new Date(latestOrder.createdAt)) {
        latestOrder = { id: doc.id, ...data }
      }
    })

    return { status: latestOrder?.status, order: latestOrder, error: null }
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error)
    return { status: null, order: null, error: error.message }
  }
}

/**
 * Busca todos os pedidos de pagamento (para admin)
 */
export const getAllPaymentOrders = async () => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(ordersRef, orderBy('createdAt', 'desc'))

    const snapshot = await getDocs(q)
    const orders = []

    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() })
    })

    return { orders, error: null }
  } catch (error) {
    console.error('Erro ao buscar pedidos de pagamento:', error)
    return { orders: [], error: error.message }
  }
}

/**
 * Busca pedidos pendentes de verificação (para admin)
 */
export const getPendingPaymentOrders = async () => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(
      ordersRef,
      where('status', '==', PAYMENT_STATUS.AWAITING_VERIFICATION),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const orders = []

    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() })
    })

    return { orders, error: null }
  } catch (error) {
    // Se o índice não existe, tentar sem orderBy
    if (error.code === 'failed-precondition') {
      try {
        const ordersRef = collection(db, 'paymentOrders')
        const q = query(
          ordersRef,
          where('status', '==', PAYMENT_STATUS.AWAITING_VERIFICATION)
        )

        const snapshot = await getDocs(q)
        const orders = []

        snapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() })
        })

        // Ordenar manualmente
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        return { orders, error: null }
      } catch (fallbackError) {
        console.error('Erro ao buscar pedidos pendentes:', fallbackError)
        return { orders: [], error: fallbackError.message }
      }
    }

    console.error('Erro ao buscar pedidos pendentes:', error)
    return { orders: [], error: error.message }
  }
}

/**
 * Aprova um pedido de pagamento (admin)
 */
export const approvePaymentOrder = async (orderId, adminId) => {
  try {
    const orderRef = doc(db, 'paymentOrders', orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      return { error: 'Pedido não encontrado' }
    }

    await updateDoc(orderRef, {
      status: PAYMENT_STATUS.APPROVED,
      approvedBy: adminId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao aprovar pagamento:', error)
    return { error: error.message }
  }
}

/**
 * Rejeita um pedido de pagamento (admin)
 */
export const rejectPaymentOrder = async (orderId, adminId, reason = '') => {
  try {
    const orderRef = doc(db, 'paymentOrders', orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      return { error: 'Pedido não encontrado' }
    }

    await updateDoc(orderRef, {
      status: PAYMENT_STATUS.REJECTED,
      rejectedBy: adminId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    })

    return { error: null }
  } catch (error) {
    console.error('Erro ao rejeitar pagamento:', error)
    return { error: error.message }
  }
}

/**
 * Deleta um pedido de pagamento (admin)
 */
export const deletePaymentOrder = async (orderId) => {
  try {
    const orderRef = doc(db, 'paymentOrders', orderId)
    await deleteDoc(orderRef)
    return { error: null }
  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    return { error: error.message }
  }
}

// ========== FUNÇÕES PARA PAGAMENTO DE CERTIFICADOS ==========

// Preço fixo para certificados (em Kz)
export const CERTIFICATE_PRICE = 1000

/**
 * Cria um pedido de pagamento para certificado
 */
export const createCertificatePaymentOrder = async (userId, userEmail, userName, courseId, courseTitle) => {
  try {
    const orderId = `cert_${userId}_${courseId}_${Date.now()}`
    const orderRef = doc(db, 'paymentOrders', orderId)

    await setDoc(orderRef, {
      orderId,
      userId,
      userEmail,
      userName: userName || 'Usuário',
      courseId,
      courseTitle,
      amount: CERTIFICATE_PRICE,
      paymentType: 'certificate', // Identifica que é pagamento de certificado
      status: PAYMENT_STATUS.AWAITING_VERIFICATION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { orderId, error: null }
  } catch (error) {
    console.error('Erro ao criar pedido de pagamento de certificado:', error)
    return { orderId: null, error: error.message }
  }
}

/**
 * Verifica se o usuário tem um pagamento de certificado aprovado para o curso
 */
export const hasApprovedCertificatePayment = async (userId, courseId) => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('paymentType', '==', 'certificate'),
      where('status', '==', PAYMENT_STATUS.APPROVED)
    )

    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Erro ao verificar pagamento de certificado aprovado:', error)
    return false
  }
}

/**
 * Verifica o status do pagamento de certificado do usuário para um curso
 */
export const getUserCertificatePaymentStatus = async (userId, courseId) => {
  try {
    const ordersRef = collection(db, 'paymentOrders')
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('paymentType', '==', 'certificate')
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return { status: null, order: null, error: null }
    }

    // Retornar o pedido mais recente
    let latestOrder = null
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (!latestOrder || new Date(data.createdAt) > new Date(latestOrder.createdAt)) {
        latestOrder = { id: doc.id, ...data }
      }
    })

    return { status: latestOrder?.status, order: latestOrder, error: null }
  } catch (error) {
    console.error('Erro ao buscar status do pagamento de certificado:', error)
    return { status: null, order: null, error: error.message }
  }
}


// ========== CONFIGURAÇÕES DE MODO GRATUITO (FREE MODE) ==========

/**
 * Busca as configurações do modo gratuito global
 */
export const getFreeModeSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'freeMode')
    const settingsSnap = await getDoc(settingsRef)

    if (settingsSnap.exists()) {
      return {
        ...settingsSnap.data(),
        error: null
      }
    }

    return {
      isEnabled: false,
      startAt: null,
      endAt: null,
      error: null
    }
  } catch (error) {
    console.error('Erro ao buscar configurações do modo gratuito:', error)
    return { isEnabled: false, startAt: null, endAt: null, error: error.message }
  }
}

/**
 * Atualiza as configurações do modo gratuito global (admin)
 */
export const updateFreeModeSettings = async ({ isEnabled, startAt, endAt }) => {
  try {
    const settingsRef = doc(db, 'settings', 'freeMode')

    const updateData = {
      isEnabled,
      startAt: startAt || null,
      endAt: endAt || null,
      updatedAt: new Date().toISOString()
    }

    await setDoc(settingsRef, updateData, { merge: true })

    return { error: null }
  } catch (error) {
    console.error('Erro ao atualizar configurações do modo gratuito:', error)
    return { error: error.message }
  }
}


export default {
  PAYMENT_IBAN,
  PAYMENT_STATUS,
  CERTIFICATE_PRICE,
  getCoursePaymentSettings,
  updateCoursePaymentSettings,
  createPaymentOrder,
  hasApprovedPayment,
  getUserPaymentStatus,
  getAllPaymentOrders,
  getPendingPaymentOrders,
  approvePaymentOrder,
  rejectPaymentOrder,
  deletePaymentOrder,
  createCertificatePaymentOrder,
  hasApprovedCertificatePayment,
  getUserCertificatePaymentStatus,
  getFreeModeSettings,
  updateFreeModeSettings
}
