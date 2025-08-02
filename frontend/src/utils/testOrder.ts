// Simple test for order creation
import orderService from '../services/orderService';

// Test function for debugging
export const testOrderCreation = async () => {
  console.log('Testing order creation...');
  
  try {
    // Test data
    const testOrderData = {
      items: [
        {
          productId: "test-product-1",
          quantity: 1,
          price: 100000,
          name: "Test Product",
          image: "test-image.jpg"
        }
      ],
      shippingAddress: {
        fullName: "Test User",
        phone: "0123456789",
        address: "123 Test Street",
        ward: "Test Ward",
        district: "Test District",
        province: "Test Province"
      },
      paymentMethod: "cod",
      notes: "Test order"
    };

    console.log('Creating order with data:', testOrderData);
    
    const result = await orderService.createOrder(testOrderData);
    console.log('Order creation result:', result);
    
    return result;
  } catch (error) {
    console.error('Order creation test failed:', error);
    throw error;
  }
};

// Test API connection
export const testAPIConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API connection status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error('API connection failed:', error);
    return { success: false, error: String(error) };
  }
};

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).testOrderCreation = testOrderCreation;
  (window as any).testAPIConnection = testAPIConnection;
}
