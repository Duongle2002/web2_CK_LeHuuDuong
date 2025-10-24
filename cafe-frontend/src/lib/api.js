// Tiny fetch wrapper for our backend API with JWT support.
export function createApi(getToken) {
  const base = '' // using Vite proxy: requests to /api go to backend

  const request = async (path, { method = 'GET', body, headers } = {}) => {
    const token = getToken?.()
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try {
        const data = await res.json()
        msg = data?.message || data?.error || JSON.stringify(data)
      } catch (_) {
        try { msg = await res.text() } catch (_) {}
      }
      throw new Error(msg)
    }
    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
  }

  return {
    request,
    // Auth
    login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),

    // Products (admin)
    listProducts: () => request('/api/admin/products'),
    // Public products list (available only)
    listPublicProducts: () => request('/api/products'),
    createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: payload }),
    updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),

    // Tables
  listTables: () => request('/api/tables'),
  listMyTables: () => request('/api/tables/my'),
    adminListTables: () => request('/api/admin/tables'),
    createTable: (payload) => request('/api/admin/tables', { method: 'POST', body: payload }),
    updateTableStatus: (id, status) => request(`/api/admin/tables/${id}/status/${status}`, { method: 'PUT' }),
  adminReleaseTable: (id) => request(`/api/admin/tables/${id}/release`, { method: 'POST' }),
    reserveTable: (id, payload) => request(`/api/tables/${id}/reserve`, { method: 'POST', body: payload }),

    // Orders
    createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
    getOrder: (id) => request(`/api/orders/${id}`),
  // Admin order lists
  listAllOrders: (onlyOpen = true) => request(`/api/orders?onlyOpen=${onlyOpen ? 'true' : 'false'}`),
    serveOrder: (id) => request(`/api/orders/${id}/serve`, { method: 'PUT' }),
    payOrder: (id) => request(`/api/orders/${id}/pay`, { method: 'PUT' }),
    // Request payment (frontend-only action: mark served if needed then pay)
    requestPayment: async (id) => {
      try { await request(`/api/orders/${id}/serve`, { method: 'PUT' }) } catch (_) {}
      return request(`/api/orders/${id}/pay`, { method: 'PUT' })
    },

    // New flow endpoints
    confirmOrder: (id) => request(`/api/orders/${id}/confirm`, { method: 'PUT' }),
    preparingOrder: (id) => request(`/api/orders/${id}/preparing`, { method: 'PUT' }),
    readyOrder: (id) => request(`/api/orders/${id}/ready`, { method: 'PUT' }),
    servedOrder: (id) => request(`/api/orders/${id}/served`, { method: 'PUT' }),
    cancelOrder: (id) => request(`/api/orders/${id}/cancel`, { method: 'PUT' }),

    // Reports
  dailyReport: (date, zone) => request(`/api/admin/reports/daily?date=${date}${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`),
  rangeReport: (start, end, zone) => request(`/api/admin/reports/range?start=${start}&end=${end}${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`),
  topProducts: (start, end, limit = 10, zone) => request(`/api/admin/reports/top-products?start=${start}&end=${end}&limit=${limit}${zone ? `&zone=${encodeURIComponent(zone)}` : ''}`),
  backfillPaidAt: () => request('/api/admin/reports/maintenance/backfill-paidAt', { method: 'POST' }),
  }
}
