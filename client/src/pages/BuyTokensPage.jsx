import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import paymentService from '../services/paymentService';

const packages = [
  { id: 'starter', name: 'Starter', tokens: 5, price: 199, label: '₹199' },
  { id: 'pro', name: 'Pro', tokens: 15, price: 499, label: '₹499' },
  { id: 'power', name: 'Power', tokens: 40, price: 999, label: '₹999' },
];

export default function BuyTokensPage() {
  const { user, login } = useAuth(); // Assuming login might be used to refresh profile or we use getMe
  const [loadingPkg, setLoadingPkg] = useState(null);
  const navigate = useNavigate();

  const handleBuy = async (pkg) => {
    try {
      setLoadingPkg(pkg.id);

      // 1. Create order
      const orderRes = await paymentService.createOrder(pkg.id);
      const { orderId, amount, currency } = orderRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Should be exposed via env or backend
        amount: amount,
        currency: currency,
        name: 'AI Interview Platform',
        description: `Buy ${pkg.tokens} Tokens`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              alert(`Success! You bought ${pkg.tokens} tokens.`);
              // Ideally update tokenBalance in context here. Just reloading for simplicity.
              window.location.href = '/dashboard';
            }
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#1b1b1b',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed. ' + response.error.description);
      });
      rzp.open();
    } catch (err) {
      alert('Failed to initiate payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 border-b-[3px] border-[#1b1b1b] pb-4">
        <h1 className="text-4xl font-black font-space uppercase tracking-tight">Buy Tokens</h1>
        <p className="mt-2 font-mono text-sm text-[#4d4633] uppercase font-bold">
          {'>'} current balance: {user?.tokenBalance !== undefined ? user.tokenBalance : '?'} tokens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-[#ffffff] border-[3px] border-[#1b1b1b] p-6 flex flex-col items-center justify-between min-h-[300px] neo-shadow transition-transform hover:-translate-y-1"
          >
            <div className="text-center w-full">
              <h2 className="text-2xl font-black font-space uppercase border-b-[2px] border-dashed border-[#1b1b1b] pb-2 mb-4">
                {pkg.name}
              </h2>
              <p className="font-mono text-4xl font-black mb-2">{pkg.tokens}</p>
              <p className="font-mono text-sm font-bold text-[#4d4633] uppercase">Tokens</p>
            </div>

            <div className="text-center w-full mt-6">
              <p className="font-space text-3xl font-black mb-4">{pkg.label}</p>
              <Button
                onClick={() => handleBuy(pkg)}
                disabled={loadingPkg === pkg.id}
                className="w-full"
              >
                {loadingPkg === pkg.id ? 'PROCESSING...' : `BUY NOW`}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
