import { apiClient } from './api';

export async function fetchCart() {
  return apiClient('/cart');
}

export async function addToCart(
  productId: string, 
  quantity?: number, 
  unit?: string, 
  weight?: number, 
  type?: 'count' | 'weight',
  flashSale?: {
    flashSaleId: string;
    isFlashSale: boolean;
    originalPrice: number;
    discountPercentage: number;
  }
) {
  return apiClient('/cart/add', { 
    method: 'POST', 
    body: JSON.stringify({ 
      productId, 
      quantity, 
      unit, 
      weight, 
      type,
      ...(flashSale && { flashSale })
    }) 
  });
}

export async function updateCartItem(
  productId: string, 
  quantity?: number, 
  unit?: string, 
  weight?: number, 
  type?: 'count' | 'weight',
  flashSale?: any
) {
  return apiClient('/cart/update', { 
    method: 'PUT', 
    body: JSON.stringify({ 
      productId, 
      quantity, 
      unit, 
      weight, 
      type,
      ...(flashSale && { flashSale })
    }) 
  });
}

export async function removeCartItem(
  productId: string, 
  unit?: string, 
  type?: 'count' | 'weight',
  flashSale?: any
) {
  return apiClient(`/cart/remove`, {
    method: 'DELETE',
    body: JSON.stringify({ 
      productId, 
      unit, 
      type,
      ...(flashSale && { flashSale })
    })
  });
}

export async function clearCart(userId?: string) {
  return apiClient('/cart/clear', { 
    method: 'DELETE',
    body: JSON.stringify({ userId })
  });
}
