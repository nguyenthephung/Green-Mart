import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

const CartController = {
  // Lấy giỏ hàng của user đang đăng nhập
  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      // Nếu user chưa đăng nhập, trả về giỏ hàng trống với hướng dẫn
      if (!userId) {
        res.json({ 
          success: true, 
          message: 'Giỏ hàng cho khách (chưa đăng nhập)', 
          data: { 
            items: [], 
            isGuest: true,
            note: 'Giỏ hàng sẽ được lưu tạm thời trên trình duyệt. Đăng nhập để đồng bộ giỏ hàng.'
          } 
        });
        return;
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.json({ success: true, message: 'Giỏ hàng trống', data: { items: [], isGuest: false } });
        return;
      }

      // Kiểm tra sản phẩm trong giỏ hàng có còn tồn tại không
      const validItems = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          validItems.push(item);
        }
      }
      // Nếu có sản phẩm đã bị xóa, cập nhật lại cart.items
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }

      res.json({ success: true, message: 'Lấy giỏ hàng thành công', data: { ...cart.toObject(), isGuest: false } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không lấy được giỏ hàng', data: null });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      // Nếu user chưa đăng nhập, hướng dẫn sử dụng local storage
      if (!userId) {
        res.json({ 
          success: false, 
          message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 
          data: null,
          isGuest: true,
          requireLogin: true
        });
        return;
      }
      
      const { productId, quantity, weight, unit } = req.body;
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
        return;
      }
      // Tìm item trùng theo loại sản phẩm, productId, unit
      let itemIndex = -1;
      if (product.type === 'weight') {
        itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId && item.unit === unit && item.type === 'weight');
      } else {
        itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId && item.unit === unit && item.type === 'count');
      }
      if (itemIndex > -1) {
        if (product.type === 'weight') {
          cart.items[itemIndex].weight = (cart.items[itemIndex].weight || 0) + (weight || 0);
        } else {
          cart.items[itemIndex].quantity = (cart.items[itemIndex].quantity || 0) + (quantity || 0);
        }
      } else {
        if (product.type === 'weight') {
          cart.items.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            type: 'weight',
            weight: weight || 0,
            unit
          });
        } else {
          cart.items.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            type: 'count',
            quantity: quantity || 1,
            unit
          });
        }
      }
      await cart.save();
      res.json({ success: true, message: 'Thêm sản phẩm thành công', data: cart });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không thêm được sản phẩm vào giỏ hàng', data: null });
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      // Nếu user chưa đăng nhập, hướng dẫn đăng nhập
      if (!userId) {
        res.json({ 
          success: false, 
          message: 'Vui lòng đăng nhập để cập nhật giỏ hàng', 
          data: null,
          isGuest: true,
          requireLogin: true
        });
        return;
      }
      
      const { productId, quantity, weight, unit, type } = req.body;
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
        return;
      }
      // Match by productId, unit, and type
      const item = cart.items.find((item: any) => item.productId.toString() === productId && item.unit === unit && item.type === type);
      if (!item) {
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng', data: null });
        return;
      }
      if (type === 'weight') {
        item.weight = weight;
      } else {
        item.quantity = quantity;
      }
      await cart.save();
      res.json({ success: true, message: 'Cập nhật số lượng thành công', data: cart });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không cập nhật được số lượng', data: null });
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      // Nếu user chưa đăng nhập, hướng dẫn đăng nhập
      if (!userId) {
        res.json({ 
          success: false, 
          message: 'Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng', 
          data: null,
          isGuest: true,
          requireLogin: true
        });
        return;
      }
      
      const { productId, unit, type } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
        return;
      }
      console.log('[CartController] removeFromCart - INPUT:', { productId, unit, type });
      console.log('[CartController] removeFromCart - BEFORE:', cart.items.map(i => ({
        productId: i.productId.toString(), unit: i.unit, type: i.type
      })));
      const beforeCount = cart.items.length;
      cart.items = cart.items.filter((item) => {
        const match = item.productId.toString() === productId && item.unit === unit && item.type === type;
        if (match) {
          console.log('[CartController] removeFromCart - REMOVING:', {
            productId: item.productId.toString(), unit: item.unit, type: item.type
          });
        }
        return !match;
      });
      const afterCount = cart.items.length;
      console.log('[CartController] removeFromCart - AFTER:', cart.items.map(i => ({
        productId: i.productId.toString(), unit: i.unit, type: i.type
      })), 'Removed:', beforeCount - afterCount);
      await cart.save();
      res.json({ success: true, message: 'Xóa sản phẩm thành công', data: cart });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không xóa được sản phẩm khỏi giỏ hàng', data: null });
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      
      // Nếu user chưa đăng nhập, trả về thành công nhưng không cần xử lý gì
      if (!userId) {
        res.json({ 
          success: true, 
          message: 'Giỏ hàng guest đã được xóa (local storage)', 
          data: { items: [] },
          isGuest: true
        });
        return;
      }
      
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.json({ success: true, message: 'Giỏ hàng đã trống', data: { items: [] } });
        return;
      }
      
      cart.items = [];
      await cart.save();
      res.json({ success: true, message: 'Xóa toàn bộ giỏ hàng thành công', data: cart });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Không xóa được giỏ hàng', data: null });
    }
  },
};

export default CartController;