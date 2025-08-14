import express from 'express';
import paymentController from '../controllers/PaymentController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes for payment callbacks (no authentication required)
router.post('/momo/callback', async (req, res) => {
  try {
    await paymentController.handleMoMoCallback(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// PayPal routes
router.post('/paypal/capture', async (req, res) => {
  try {
    await paymentController.capturePayPalPayment(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

router.post('/paypal/webhook', async (req, res) => {
  try {
    await paymentController.handlePayPalWebhook(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get available payment methods (public)
router.get('/methods', async (req, res) => {
  try {
    await paymentController.getPaymentMethods(req, res);
  } catch (error) {
    console.error('Get payment methods error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Create a new payment (requires authentication)
router.post('/', authenticate, async (req, res) => {
  try {
    await paymentController.createPayment(req, res);
  } catch (error) {
    console.error('Create payment error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Admin routes for payment management
router.get('/', authenticate, async (req, res) => {
  try {
    await paymentController.getPayments(req, res);
  } catch (error) {
    console.error('Get payments error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

router.put('/bank-transfer/:paymentId/confirm', authenticate, async (req, res) => {
  try {
    await paymentController.confirmBankTransfer(req, res);
  } catch (error) {
    console.error('Confirm bank transfer error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Admin confirm COD payment
router.put('/cod/:paymentId/confirm', authenticate, async (req, res) => {
  try {
    await paymentController.confirmCOD(req, res);
  } catch (error) {
    console.error('Confirm COD error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get payment details by ID
router.get('/:paymentId', authenticate, async (req, res) => {
  try {
    await paymentController.getPayment(req, res);
  } catch (error) {
    console.error('Get payment error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

export default router;
