import express from 'express';
import ProductController from '../controllers/ProductController';

const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/', ProductController.getAllProducts as express.RequestHandler);
// Kiểm tra category của sản phẩm
router.get('/:id/category-check', ProductController.checkProductCategory as express.RequestHandler);
// Thêm sản phẩm
router.post('/', ProductController.createProduct as express.RequestHandler);
// Sửa sản phẩm
router.put('/:id', ProductController.updateProduct as express.RequestHandler);
// Xóa sản phẩm
router.delete('/:id', ProductController.deleteProduct as express.RequestHandler);

export default router;
