import { useState } from 'react';
import paymentService from '../../services/paymentService';

const PaymentTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testPaymentGateway = async (
    method: 'vnpay' | 'momo' | 'zalopay' | 'bank_transfer' | 'credit_card'
  ) => {
    setLoading(true);
    setResult(null);

    try {
      const testOrderId = `TEST_${Date.now()}`;

      console.log(`Testing ${method} payment gateway...`);

      const response = await paymentService.createPayment({
        orderId: testOrderId,
        paymentMethod: method,
        amount: 50000, // Test amount 50,000 VND
        returnUrl: `${window.location.origin}/payment-result?method=${method}&test=true`,
        metadata: {
          test: true,
          note: `Test payment for ${method}`,
        },
      });

      console.log(`${method} response:`, response);
      setResult(response);

      if (response.success && response.data?.redirectUrl) {
        // Show result first, then allow manual redirect
        setTimeout(() => {
          if (
            response.data &&
            window.confirm(
              `Thanh toán ${method} được tạo thành công! Bạn có muốn chuyển đến trang thanh toán không?`
            )
          ) {
            window.open(response.data.redirectUrl, '_blank');
          }
        }, 2000);
      }
    } catch (error) {
      console.error(`${method} payment test failed:`, error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
        error: error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Gateway Testing</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Payment Methods</h2>
          <p className="text-gray-600 mb-6">
            Click the buttons below to test different payment gateways. Make sure your backend is
            running with proper environment variables.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* VNPay Test */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-blue-600 mb-2">VNPay</h3>
              <p className="text-sm text-gray-600 mb-4">
                Cổng thanh toán VNPay - Hỗ trợ ATM, Internet Banking, Visa/Master
              </p>
              <button
                onClick={() => testPaymentGateway('vnpay')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test VNPay'}
              </button>
            </div>

            {/* MoMo Test */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-pink-600 mb-2">MoMo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ví điện tử MoMo - Thanh toán qua app MoMo
              </p>
              <button
                onClick={() => testPaymentGateway('momo')}
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test MoMo'}
              </button>
            </div>

            {/* ZaloPay Test */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-blue-500 mb-2">ZaloPay</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ví điện tử ZaloPay - Thanh toán qua app ZaloPay
              </p>
              <button
                onClick={() => testPaymentGateway('zalopay')}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test ZaloPay'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>

            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-green-800 font-medium mb-2">✅ Success</h3>
                <div className="space-y-2 text-sm">
                  {result.message && (
                    <p>
                      <strong>Message:</strong> {result.message}
                    </p>
                  )}
                  {result.data?.paymentId && (
                    <p>
                      <strong>Payment ID:</strong> {result.data.paymentId}
                    </p>
                  )}
                  {result.data?.transactionId && (
                    <p>
                      <strong>Transaction ID:</strong> {result.data.transactionId}
                    </p>
                  )}
                  {result.data?.redirectUrl && (
                    <div>
                      <p>
                        <strong>Redirect URL:</strong>
                      </p>
                      <a
                        href={result.data.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {result.data.redirectUrl}
                      </a>
                    </div>
                  )}
                  {result.data?.qrCode && (
                    <div>
                      <p>
                        <strong>QR Code URL:</strong>
                      </p>
                      <a
                        href={result.data.qrCode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {result.data.qrCode}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">❌ Failed</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Message:</strong> {result.message}
                  </p>
                  {result.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-700">Show Error Details</summary>
                      <pre className="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 bg-gray-50 p-4 rounded">
              <details>
                <summary className="cursor-pointer font-medium">Show Full Response</summary>
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          </div>
        )}

        {/* Environment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">⚙️ Setup Instructions</h2>
          <div className="space-y-4 text-sm text-blue-700">
            <div>
              <h3 className="font-medium">Backend Environment Variables Required:</h3>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>
                  <code>VNPAY_TMN_CODE</code> - VNPay terminal code
                </li>
                <li>
                  <code>VNPAY_HASH_SECRET</code> - VNPay hash secret
                </li>
                <li>
                  <code>MOMO_PARTNER_CODE</code> - MoMo partner code
                </li>
                <li>
                  <code>MOMO_ACCESS_KEY</code> - MoMo access key
                </li>
                <li>
                  <code>MOMO_SECRET_KEY</code> - MoMo secret key
                </li>
                <li>
                  <code>ZALOPAY_APP_ID</code> - ZaloPay app ID
                </li>
                <li>
                  <code>ZALOPAY_KEY1</code> - ZaloPay key1
                </li>
                <li>
                  <code>ZALOPAY_KEY2</code> - ZaloPay key2
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Free Registration Links:</h3>
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>
                  <a
                    href="https://sandbox.vnpayment.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    VNPay Sandbox
                  </a>
                </li>
                <li>
                  <a
                    href="https://developers.momo.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    MoMo Developer
                  </a>
                </li>
                <li>
                  <a
                    href="https://developers.zalopay.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    ZaloPay Developer
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Demo Credentials (for testing):</h3>
              <p className="text-xs bg-blue-100 p-2 rounded mt-1">
                The services are configured with demo credentials that may work for testing, but for
                production use, you need to register and get your own credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTestPage;
