import api from './http';

export const send = (payload) => api.post('/contact/send', payload);
