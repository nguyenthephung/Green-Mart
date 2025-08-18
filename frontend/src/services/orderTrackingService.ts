export const updateOrderTracking = async (id: string, data: {
  lat: number;
  lng: number;
  address?: string;
  status: string;
}) => {
  return axios.put(`/api/order-tracking/${id}`, data);
};

export const deleteOrderTracking = async (id: string) => {
  return axios.delete(`/api/order-tracking/${id}`);
};
import axios from 'axios';

export const addOrderTracking = async (data: {
  orderId: string;
  lat: number;
  lng: number;
  address?: string;
  status: string;
}) => {
  return axios.post('/api/order-tracking', data);
};

export const getOrderTrackingHistory = async (orderId: string) => {
  return axios.get(`/api/order-tracking/${orderId}`);
};
