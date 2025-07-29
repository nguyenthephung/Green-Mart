export type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit?: string;
  [key: string]: any;
};
