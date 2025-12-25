import api from './http';

export const check = (payload) => api.post('/bookings/check', payload);
export const create = (payload) => api.post('/bookings', payload);
export const listUser = () => api.get('/bookings/user');
export const listOwner = () => api.get('/bookings/owner');
export const cancel = (id) => api.put(`/bookings/${id}/cancel`);
