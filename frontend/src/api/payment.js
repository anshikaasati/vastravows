import api from './http';

export const onboardLender = (payload) => api.post('/payments/onboard-lender', payload);
export const createOrder = (payload) => api.post('/payments/create-order', payload);
export const verifyPayment = (payload) => api.post('/payments/verify-payment', payload);
export const createSubscription = (payload) => api.post('/payments/create-subscription', payload);
export const verifySubscription = (payload) => api.post('/payments/verify-subscription', payload);
