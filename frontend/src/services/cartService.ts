import { apiClient } from './api';

export async function fetchCart() {
  return apiClient('/cart');
}

export async function addToCart(productId: string, quantity?: number, unit?: string, weight?: number, type?: 'count' | 'weight') {
  return apiClient('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity, unit, weight, type }) });
}

export async function updateCartItem(productId: string, quantity?: number, unit?: string, weight?: number, type?: 'count' | 'weight') {
  return apiClient('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity, unit, weight, type }) });
}

export async function removeCartItem(productId: string, unit?: string, type?: 'count' | 'weight') {
  return apiClient(`/cart/remove`, {
    method: 'DELETE',
    body: JSON.stringify({ productId, unit, type })
  });
}

export async function clearCart() {
  return apiClient('/cart/clear', { method: 'DELETE' });
}