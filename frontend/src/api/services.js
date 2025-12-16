import api from './http';

export const authApi = {
  // Registration with 2FA
  sendRegistrationOTP: (payload) => api.post('/auth/register/send-otp', payload),
  verifyRegistrationOTP: (payload) => api.post('/auth/register/verify-otp', payload),
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  update: (payload) => api.patch('/auth/me', payload),
  toggleLenderRole: (enable) => api.patch('/auth/toggle-lender', { enable }),
  deleteAccount: () => api.delete('/auth/delete-account'),
  // Password reset
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  verifyOTP: (payload) => api.post('/auth/verify-otp', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload)
};

export const itemApi = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (formData) => api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/items/${id}`)
};

export const bookingApi = {
  check: (payload) => api.post('/bookings/check', payload),
  create: (payload) => api.post('/bookings', payload),
  listUser: () => api.get('/bookings/user'),
  listOwner: () => api.get('/bookings/owner'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

export const reviewApi = {
  listByItem: (itemId) => api.get(`/reviews/${itemId}`),
  create: (payload) => api.post('/reviews', payload)
};

export const wishlistApi = {
  list: () => api.get('/wishlist'),
  add: (itemId) => api.post(`/wishlist/${itemId}`),
  remove: (itemId) => api.delete(`/wishlist/${itemId}`)
};

export const paymentApi = {
  onboardLender: (payload) => api.post('/payments/onboard-lender', payload),
  createOrder: (payload) => api.post('/payments/create-order', payload),
  verifyPayment: (payload) => api.post('/payments/verify-payment', payload),
  createSubscription: (payload) => api.post('/payments/create-subscription', payload),
  verifySubscription: (payload) => api.post('/payments/verify-subscription', payload)
};

export const contactApi = {
  send: (payload) => api.post('/contact/send', payload)
};

