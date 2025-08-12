export type CartItem = {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  unit?: string;
  flashSale?: {
    flashSaleId: string;
    isFlashSale: boolean;
    originalPrice: number;
    discountPercentage: number;
  };
  [key: string]: any;
};
