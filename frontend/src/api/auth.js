import api from './http';

export const sendRegistrationOTP = (payload) => api.post('/auth/register/send-otp', payload);
export const verifyRegistrationOTP = (payload) => api.post('/auth/register/verify-otp', payload);
export const register = (payload) => api.post('/auth/register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const me = () => api.get('/auth/me');
export const update = (payload) => api.patch('/auth/me', payload);
export const toggleLenderRole = (enable) => api.patch('/auth/toggle-lender', { enable });
export const deleteAccount = () => api.delete('/auth/delete-account');
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const verifyOTP = (payload) => api.post('/auth/verify-otp', payload);
export const resetPassword = (payload) => api.post('/auth/reset-password', payload);
