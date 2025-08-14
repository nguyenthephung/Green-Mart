import { useEffect, useState } from 'react';
import { flashSaleService } from '../services/flashSaleService';
import type { CartItem } from '../types/CartItem';

export function useFlashSaleValidity(cartItems: CartItem[]) {
  const [invalidFlashSaleIds, setInvalidFlashSaleIds] = useState<(string|number)[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAll() {
      setChecking(true);
      const invalidIds = [];
      for (const item of cartItems) {
        if (item.flashSale?.isFlashSale && item.id) {
          try {
            const info = await flashSaleService.checkProductInFlashSale(String(item.id));
            if (!info.inFlashSale || (info.flashSale && new Date(info.flashSale.endTime) < new Date())) {
              invalidIds.push(item.id);
            }
          } catch (e) {
            invalidIds.push(item.id);
          }
        }
      }
      if (isMounted) setInvalidFlashSaleIds(invalidIds);
      setChecking(false);
    }
    if (cartItems.some((i: CartItem) => i.flashSale?.isFlashSale)) {
      checkAll();
    } else {
      setInvalidFlashSaleIds([]);
    }
    return () => { isMounted = false; };
  }, [cartItems]);

  return { invalidFlashSaleIds, checking };
}
