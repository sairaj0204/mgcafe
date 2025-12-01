"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CafePayment = ({ amount, orderId, onVerify }) => {
  // --- CONFIGURATION ---
  const upiID = "ibkPOS.EP176726@icici";
  const payeeName = "M/S.M G CAFE AND MOCKTAILS";
  const merchantCode = "5812";
  
  // FIX: Use the EXACT static reference from your physical QR.
  // No suffixes, no random numbers. This ensures the Soundbox matches the ID.
  const staticRef = "EPYSSQREP176726"; 

  // --- QR CODE LINK ---
  // 1. pa (Address)
  // 2. pn (Name)
  // 3. mc (Merchant Code - 5812 for Restaurants)
  // 4. tr (Static Ref - EPYSSQREP176726)
  // 5. am (Amount)
  // 6. cu (INR)
  // 7. mode (01 - QR Scan)
  const qrLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&mc=${merchantCode}&tr=${staticRef}&am=${amount}&cu=INR&mode=01`;

  const [utrInput, setUtrInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Manual Submit Handler
  const handleSubmit = () => {
    setErrorMessage(""); 
    const cleanUTR = utrInput.trim();
    
    // UPDATED VALIDATION: Allows 12 to 18 digits (Flexible)
    if (!cleanUTR || cleanUTR.length < 12) {
      setErrorMessage("Please enter a valid Reference/UTR number (min 12 digits).");
      return;
    }

    triggerVerification(cleanUTR);
  };

  // Verification Logic
  const triggerVerification = (utr) => {
    if (isVerifying) return; // Prevent double submission
    
    setIsVerifying(true);
    // This calls the parent page to update status to "paid" in DB
    onVerify(utr).finally(() => setIsVerifying(false));
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      
      <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payable</p>
        <h2 className="text-4xl font-extrabold text-slate-800">₹{amount}</h2>
        <p className="text-xs text-slate-400 mt-2 font-mono">Order #{orderId?.slice(-6).toUpperCase()}</p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* QR CODE SECTION */}
        <div className="flex justify-center">
          <div className="p-4 bg-white border-2 border-slate-800 rounded-xl shadow-lg relative">
             {/* Corner Accents */}
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-800 rounded-tl-lg -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-800 rounded-tr-lg -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-800 rounded-bl-lg -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-800 rounded-br-lg -mb-1 -mr-1"></div>

             <QRCodeSVG 
                value={qrLink} 
                size={220}
                level={"M"} 
                includeMargin={false}
              />
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
            <p className="text-orange-800 font-bold text-sm mb-2 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                Scan to Pay
            </p>
            <p className="text-xs text-orange-700 leading-relaxed">
                Scan using <strong>another phone</strong> or take a <strong>Screenshot</strong> to upload in your UPI app.
            </p>
        </div>

        {/* VERIFICATION INPUT SECTION */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Enter UTR / Ref No.
          </label>
          <div className="space-y-3">
            <input 
              type="text" 
              inputMode="numeric" 
              pattern="[0-9]*"
              value={utrInput}
              disabled={isVerifying}
              onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); 
                  setUtrInput(val);
                  setErrorMessage(""); 
              }}
              placeholder="Enter 12-digit UTR"
              className={`w-full border-2 rounded-xl px-4 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-4 transition-all ${errorMessage ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50"} ${isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            
            {errorMessage && (
                <p className="text-xs text-red-600 font-bold animate-pulse">{errorMessage}</p>
            )}

            <button 
              onClick={handleSubmit}
              disabled={isVerifying || utrInput.length < 1}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Verifying...</span>
                  </>
              ) : (
                  "Confirm Payment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafePayment;