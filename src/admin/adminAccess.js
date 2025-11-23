const normalizeEmail = (value) => value?.trim().toLowerCase()

const envEmails = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAILS

const parsedEnvEmails = envEmails
  ? envEmails
      .split(',')
      .map(normalizeEmail)
      .filter(Boolean)
  : []

const defaultEmails = ['nelsonmarquesj55@gmail.com']

export const ADMIN_EMAILS = [...new Set([...parsedEnvEmails, ...defaultEmails.map(normalizeEmail)].filter(Boolean))]

export const hasAdminAccess = (user) => {
  const email = normalizeEmail(user?.email)
  if (!email) {
    return false
  }

  if (ADMIN_EMAILS.length === 0) {
    console.warn(
      '[adminAccess] Nenhum email administrador configurado. ' +
        'Adicione um email em src/admin/adminAccess.js ou defina VITE_ADMIN_EMAILS no arquivo .env.'
    )
    return false
  }

  return ADMIN_EMAILS.includes(email)
}

