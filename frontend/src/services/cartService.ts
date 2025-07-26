import { apiClient } from './api';

export async function fetchCart() {
  return apiClient('/cart');
}

export async function addToCart(productId: string, quantity: number) {
  return apiClient('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
}

export async function updateCartItem(productId: string, quantity: number) {
  return apiClient('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) });
}

export async function removeCartItem(productId: string) {
  return apiClient(`/cart/remove/${productId}`, { method: 'DELETE' });
}