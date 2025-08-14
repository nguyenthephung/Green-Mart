import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import FlashSale from '../models/FlashSale';

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

      // Kiểm tra sản phẩm trong giỏ hàng có còn tồn tại không và loại bỏ sản phẩm flash sale đã hết hạn
      const validItems = [];
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        // Nếu là sản phẩm flash sale, kiểm tra thời gian kết thúc
        if (item.flashSale && item.flashSale.isFlashSale && item.flashSale.flashSaleId) {
          const flashSaleDoc = await FlashSale.findById(item.flashSale.flashSaleId);
          if (!flashSaleDoc || !flashSaleDoc.endTime) continue;
          const endTime = new Date(flashSaleDoc.endTime).getTime();
          const now = Date.now();
          if (endTime <= now) continue; // Đã hết hạn flash sale, loại khỏi giỏ hàng
        }
        validItems.push(item);
      }
      // Nếu có sản phẩm đã bị xóa hoặc hết hạn flash sale, cập nhật lại cart.items
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
      
      const { productId, quantity, weight, unit, flashSale } = req.body;
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm', data: null });
        return;
      }
      // Tìm item trùng theo loại sản phẩm, productId, unit và flash sale
      let itemIndex = -1;
      if (product.type === 'weight') {
        itemIndex = cart.items.findIndex((item: any) => 
          item.productId.toString() === productId && 
          item.unit === unit && 
          item.type === 'weight' &&
          item.flashSale?.isFlashSale === (flashSale?.isFlashSale || false)
        );
      } else {
        itemIndex = cart.items.findIndex((item: any) => 
          item.productId.toString() === productId && 
          item.unit === unit && 
          item.type === 'count' &&
          item.flashSale?.isFlashSale === (flashSale?.isFlashSale || false)
        );
      }

      // Xác định giá sản phẩm (flash sale hoặc giá gốc)
      let itemPrice = product.price;
      if (flashSale?.isFlashSale && flashSale.originalPrice) {
        // Tính giá flash sale từ originalPrice và discountPercentage
        const discountPercent = flashSale.discountPercentage || flashSale.discountPercent || 0;
        itemPrice = Math.round(flashSale.originalPrice * (1 - discountPercent / 100));
      }

      // Validate Flash Sale stock if this is a Flash Sale item
      if (flashSale?.isFlashSale && flashSale.flashSaleId) {
        const flashSaleDoc = await FlashSale.findById(flashSale.flashSaleId);
        if (!flashSaleDoc) {
          res.status(400).json({ success: false, message: 'Flash Sale không tồn tại', data: null });
          return;
        }

        const flashSaleProduct = flashSaleDoc.products.find(p => p.productId === productId);
        if (!flashSaleProduct) {
          res.status(400).json({ success: false, message: 'Sản phẩm không có trong Flash Sale này', data: null });
          return;
        }

        // Calculate current cart quantity for this Flash Sale product
        const currentCartQuantity = itemIndex > -1 ? 
          (product.type === 'weight' ? (cart.items[itemIndex].weight || 0) : (cart.items[itemIndex].quantity || 0)) : 0;
        
        const requestedQuantity = product.type === 'weight' ? (weight || 0) : (quantity || 1);
        const totalQuantity = currentCartQuantity + requestedQuantity;
        const availableQuantity = flashSaleProduct.quantity - flashSaleProduct.sold;

        if (totalQuantity > availableQuantity) {
          res.status(400).json({ 
            success: false, 
            message: `Chỉ còn ${availableQuantity} sản phẩm trong Flash Sale. Bạn đã có ${currentCartQuantity} trong giỏ hàng.`, 
            data: { 
              available: availableQuantity,
              currentInCart: currentCartQuantity,
              requested: requestedQuantity
            } 
          });
          return;
        }
      }

      if (itemIndex > -1) {
        if (product.type === 'weight') {
          cart.items[itemIndex].weight = (cart.items[itemIndex].weight || 0) + (weight || 0);
        } else {
          // Cho phép flash sale quantity > 1
          cart.items[itemIndex].quantity = (cart.items[itemIndex].quantity || 0) + (quantity || 0);
        }
      } else {
        if (product.type === 'weight') {
          cart.items.push({
            productId,
            name: product.name,
            price: itemPrice,
            image: product.image,
            type: 'weight',
            weight: weight || 0,
            unit,
            flashSale: flashSale || { isFlashSale: false }
          });
        } else {
          cart.items.push({
            productId,
            name: product.name,
            price: itemPrice,
            image: product.image,
            type: 'count',
            quantity: quantity || 1,
            unit,
            flashSale: flashSale || { isFlashSale: false }
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
  console.log('[CartController] Nhận request updateCartItem:', req.body);
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
      
      const { productId, quantity, weight, unit, type, flashSale } = req.body;
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
        return;
      }
      // Match by productId, unit, type, and flashSaleId (if present)
      const item = cart.items.find((item: any) => {
        const isSameProduct = item.productId.toString() === productId && item.unit === unit && item.type === type;
        const isFlashSale = !!item.flashSale?.isFlashSale;
        const reqIsFlashSale = !!flashSale?.isFlashSale;
        if (isFlashSale || reqIsFlashSale) {
          // Both must be flash sale and flashSaleId must match
          return isSameProduct && isFlashSale && reqIsFlashSale && String(item.flashSale?.flashSaleId) === String(flashSale?.flashSaleId);
        } else {
          // Both are not flash sale
          return isSameProduct && !isFlashSale && !reqIsFlashSale;
        }
      });
      if (!item) {
        // Log chi tiết các item trong cart để debug
        console.error('[CartController][updateCartItem] KHÔNG TÌM THẤY SẢN PHẨM TRONG GIỎ HÀNG');
        console.error('INPUT:', { productId, unit, type, flashSale });
        console.error('CART ITEMS:', cart.items.map((i: any) => ({
          productId: i.productId?.toString(),
          unit: i.unit,
          type: i.type,
          flashSale: i.flashSale
        })));
        res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng', data: null });
        return;
      }

      // Validate Flash Sale stock if this is a Flash Sale item
      if (flashSale?.isFlashSale && flashSale.flashSaleId) {
        const flashSaleDoc = await FlashSale.findById(flashSale.flashSaleId);
        if (!flashSaleDoc) {
          res.status(400).json({ success: false, message: 'Flash Sale không tồn tại', data: null });
          return;
        }

        const flashSaleProduct = flashSaleDoc.products.find(p => p.productId === productId);
        if (!flashSaleProduct) {
          res.status(400).json({ success: false, message: 'Sản phẩm không có trong Flash Sale này', data: null });
          return;
        }

        const requestedQuantity = type === 'weight' ? (weight || 0) : (quantity || 0);
        const availableQuantity = flashSaleProduct.quantity - flashSaleProduct.sold;

        if (requestedQuantity > availableQuantity) {
          res.status(400).json({ 
            success: false, 
            message: `Chỉ còn ${availableQuantity} sản phẩm trong Flash Sale.`, 
            data: { 
              available: availableQuantity,
              requested: requestedQuantity
            } 
          });
          return;
        }
      }

      if (type === 'weight') {
        item.weight = weight;
      } else {
        // Cho phép flash sale quantity > 1
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
  console.log('[CartController] Nhận request removeFromCart:', req.body);
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
      
      const { productId, unit, type, flashSale } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        res.status(404).json({ success: false, message: 'Không tìm thấy giỏ hàng', data: null });
        return;
      }
      console.log('[CartController] removeFromCart - INPUT:', { productId, unit, type, flashSale });
      console.log('[CartController] removeFromCart - BEFORE:', cart.items.map(i => ({
        productId: i.productId.toString(), unit: i.unit, type: i.type, flashSale: i.flashSale
      })));
      const beforeCount = cart.items.length;
      let found = false;
      cart.items = cart.items.filter((item) => {
        const isSameProduct = item.productId.toString() === productId && item.unit === unit && item.type === type;
        const isFlashSale = !!item.flashSale?.isFlashSale;
        const reqIsFlashSale = !!flashSale?.isFlashSale;
        let match = false;
        if (isFlashSale || reqIsFlashSale) {
          match = isSameProduct && isFlashSale && reqIsFlashSale && String(item.flashSale?.flashSaleId) === String(flashSale?.flashSaleId);
        } else {
          match = isSameProduct && !isFlashSale && !reqIsFlashSale;
        }
        if (match) {
          found = true;
          console.log('[CartController] removeFromCart - REMOVING:', {
            productId: item.productId.toString(), unit: item.unit, type: item.type, flashSale: item.flashSale
          });
        }
        return !match;
      });
      if (!found) {
        console.error('[CartController][removeFromCart] KHÔNG TÌM THẤY SẢN PHẨM ĐỂ XÓA');
        console.error('INPUT:', { productId, unit, type, flashSale });
        console.error('CART ITEMS:', cart.items.map((i: any) => ({
          productId: i.productId?.toString(),
          unit: i.unit,
          type: i.type,
          flashSale: i.flashSale
        })));
      }
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
      // Lấy userId trực tiếp từ query hoặc body (không dùng token)
      const userId = req.body.userId || req.query.userId;
      // ...existing code không log chi tiết cart...
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
      const cartAfter = await Cart.findOne({ userId });
      res.json({ success: true, message: 'Xóa toàn bộ giỏ hàng thành công', data: cartAfter });
    } catch (err) {
      console.error('[DEBUG][CartController] clearCart error:', err);
      res.status(500).json({ success: false, message: 'Không xóa được giỏ hàng', data: null });
    }
  },
};

export default CartController;