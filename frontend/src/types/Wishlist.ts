export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  category: string;
  addedAt: Date;
}

export interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
  loadWishlist: () => Promise<void>;
}
