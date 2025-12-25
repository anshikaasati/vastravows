import api from './http';

export const list = () => api.get('/wishlist');
export const add = (itemId) => api.post(`/wishlist/${itemId}`);
export const remove = (itemId) => api.delete(`/wishlist/${itemId}`);
