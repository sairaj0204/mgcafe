"use client";
import React, { useState, useEffect } from 'react';
import CafePayment from '../components/CafePayment';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';

export default function TestPaymentPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  
  // FIX: Start with null so Server and Client match initially
  const [mockOrderId, setMockOrderId] = useState(null);

  // FIX: Generate the random ID ONLY on the client side
  useEffect(() => {
    setMockOrderId(`TEST-${Math.floor(Math.random() * 10000)}`);
  }, []);

  // Mock verification handler for testing
  const handleVerify = async (utr) => {
    console.log(`Verifying UTR: ${utr}`);
    
    // Simulate a network request delay (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulate success
    setPaymentStatus("paid");
  };

  // SUCCESS REDIRECT LOGIC (Simulated)
  useEffect(() => {
    if (paymentStatus === 'paid') {
        const timer = setTimeout(() => {
            // Using replace to prevent going back to payment page
            router.push('/orders'); 
        }, 3000); 
        return () => clearTimeout(timer);
    }
  }, [paymentStatus, router]);

  // Prevent rendering until we have the ID to ensure consistency
  if (!mockOrderId) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
            Initializing Test...
        </div>
    );
  }

  // === SUCCESS STATE ===
  if (paymentStatus === 'paid') {
    return (
        <div className="min-h-screen bg-green-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Navbar isLoggedIn={true} current="Test" />
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-green-100 dark:border-green-900/30 text-center max-w-md w-full animate-scale-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful!</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    This was a test transaction for <strong>₹1</strong>.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Amount Paid</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white">₹1.00</p>
                </div>

                <p className="text-sm text-slate-400 animate-pulse">Redirecting to your orders...</p>
            </div>
        </div>
    );
  }

  // === PENDING STATE ===
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar isLoggedIn={true} current="Test" />
      
      <div className="pt-4 pb-12 px-4 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="w-full max-w-md">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Test Payment</h1>
                <p className="text-slate-500 text-sm">Send ₹1 to verify Soundbox & Bank</p>
            </div>

            {/* Load component with the client-generated ID */}
            <CafePayment 
                amount={1} 
                orderId={mockOrderId} 
                onVerify={handleVerify} 
            />
            
            <div className="mt-8 text-center">
                 <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    <strong>Debug Mode:</strong> This page simulates the payment flow without updating the real order database. Payments of ₹1 will still be deducted from your bank.
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
}