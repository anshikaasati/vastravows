import api from './http';

export const listByItem = (itemId) => api.get(`/reviews/${itemId}`);
export const create = (payload) => api.post('/reviews', payload);
