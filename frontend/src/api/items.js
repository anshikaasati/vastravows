import api from './http';

export const getAll = (params) => api.get('/items', { params });
export const getById = (id) => api.get(`/items/${id}`);
export const create = (formData) => api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const update = (id, formData) => api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const remove = (id) => api.delete(`/items/${id}`);
export const getRecommendations = (id) => api.get(`/items/${id}/recommendations`);
