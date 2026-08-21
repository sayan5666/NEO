import { api } from './api';

const paymentService = {
  createOrder: async (pkg) => {
    const res = await api.post('/payment/create-order', { package: pkg });
    return res.data;
  },
  verifyPayment: async (data) => {
    const res = await api.post('/payment/verify', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/payment/history');
    return res.data;
  }
};

export default paymentService;
