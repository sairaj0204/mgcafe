"use client";
import React, { useEffect, useState, use } from 'react';
import CafePayment from '../../components/CafePayment';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function PaymentPage({ params }) {
  // 1. Unwrap Params
  const resolvedParams = use(params);
  const { orderId } = resolvedParams;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 2. Fetch Order Data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/payment-status/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // 3. Handle UTR Submission
  const handleVerifyPayment = async (utr) => {
    try {
      const res = await fetch(`/api/payment-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr })
      });

      const data = await res.json();

      if (res.ok) {
        // Update local state to show success screen immediately
        setOrder(prev => ({ ...prev, paymentStatus: 'paid' }));
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit UTR");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-300 rounded-full mb-4"></div>
            <div className="text-slate-500 font-medium">Loading Payment Details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center max-w-sm">
          <h2 className="text-lg font-bold mb-2">Order Not Found</h2>
          <p className="text-sm mb-4">We couldn't retrieve the details for Order #{orderId}.</p>
          <button onClick={() => router.push('/')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  // === 4. SUCCESS STATE (If already paid) ===
  if (order.paymentStatus === 'paid') {
    return (
        <div className="min-h-screen bg-green-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Navbar isLoggedIn={true} current="Payment" />
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900/30 text-center max-w-md w-full animate-scale-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Your order for <strong>Table {order.tableNo}</strong> has been confirmed. The kitchen is preparing your food.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Amount Paid</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white">₹{order.totalAmount}</p>
                </div>

                <button 
                    onClick={() => router.push('/')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-600/20"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
  }

  // === 5. PENDING STATE (Show QR) ===
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar isLoggedIn={true} current="Payment" />
      
      <div className="pt-4 pb-12 px-4 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="w-full max-w-md">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Complete Payment</h1>
                <p className="text-slate-500 text-sm">Scan the QR below to pay securely</p>
            </div>

            <CafePayment 
                amount={order.totalAmount} 
                orderId={order._id}
                onVerify={handleVerifyPayment} 
            />
            
            <div className="mt-8 text-center space-y-3">
                 <p className="text-xs text-slate-400">
                    Your table number is <strong>{order.tableNo}</strong>
                 </p>
                 <button onClick={() => router.push('/')} className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">Skip & Go to Home</button>
            </div>
        </div>
      </div>
    </div>
  );
}