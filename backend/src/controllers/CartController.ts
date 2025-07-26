import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

const CartController = {
  // Lấy giỏ hàng của user đang đăng nhập
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng', data: null });
      }
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.json({ success: true, message: 'Giỏ hàng trống', data: { items: [] } });
      }
      return res.json({ success: true, message: 'Lấy giỏ hàng thành công', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Không lấy được giỏ hàng', data: null });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng', data: null });
      }
      const { productId, quantity } = req.body;
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
        }
        cart.items.push({ 
          productId, 
          name: product.name, 
          price: product.price, 
          image: product.image, 
          quantity 
        });
      }
      await cart.save();
      return res.json({ success: true, message: 'Thêm sản phẩm thành công', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Không thêm được sản phẩm vào giỏ hàng', data: null });
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng', data: null });
      }
      const { productId, quantity } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
      }
      const item = cart.items.find((item: any) => item.productId.toString() === productId);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng', data: null });
      }
      item.quantity = quantity;
      await cart.save();
      return res.json({ success: true, message: 'Cập nhật số lượng thành công', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Không cập nhật được số lượng', data: null });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng', data: null });
      }
      const { productId } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
      }
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId);
      await cart.save();
      return res.json({ success: true, message: 'Xóa sản phẩm thành công', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Không xóa được sản phẩm khỏi giỏ hàng', data: null });
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng', data: null });
      }
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
      }
      cart.items = [];
      await cart.save();
      return res.json({ success: true, message: 'Xóa toàn bộ giỏ hàng thành công', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Không xóa được giỏ hàng', data: null });
    }
  },
};

export default CartController;