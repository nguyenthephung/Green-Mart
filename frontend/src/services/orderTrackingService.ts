import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const updateOrderTracking = async (
  id: string,
  data: {
    lat: number;
    lng: number;
    address?: string;
    status: string;
  }
) => {
  return axios.put(`${API_BASE_URL}/order-tracking/${id}`, data);
};

export const deleteOrderTracking = async (id: string) => {
  return axios.delete(`${API_BASE_URL}/order-tracking/${id}`);
};

export const addOrderTracking = async (data: {
  orderId: string;
  lat: number;
  lng: number;
  address?: string;
  status: string;
}) => {
  return axios.post(`${API_BASE_URL}/order-tracking`, data);
};

export const getOrderTrackingHistory = async (orderId: string) => {
  return axios.get(`${API_BASE_URL}/order-tracking/${orderId}`);
};
