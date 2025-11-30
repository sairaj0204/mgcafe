"use client";
import React from 'react';
import CafePayment from '../components/CafePayment';
import Navbar from '../components/Navbar'; // Adjust path if needed

export default function TestPaymentPage() {
  // Mock verification handler for testing
  const handleVerify = async (utr) => {
    // Simulate a network request delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Alert success to confirm the component logic works
    alert(`TEST SUCCESS!\n\nUTR ${utr} was submitted.\n\nSince this is a test page, check your Bank App to confirm ₹1 was deducted.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar isLoggedIn={true} current="Test" />
      
      <div className="flex flex-col items-center justify-center min-h-[90vh] p-4">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Test Payment Mode</h1>
            <p className="text-slate-500">Sending ₹1 to verify UPI ID and Bank Account connection.</p>
        </div>

        {/* Load component with hardcoded ₹1 */}
        <CafePayment 
            amount={1} 
            orderId="TEST-TXN-001" 
            onVerify={handleVerify} 
        />
        
        <p className="mt-8 text-xs text-slate-400 max-w-xs text-center">
            Note: This is a debug page. Payments made here will go to your account but won't update any real orders in the database.
        </p>
      </div>
    </div>
  );
}