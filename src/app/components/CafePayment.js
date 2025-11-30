"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const CafePayment = ({ amount, orderId, onVerify }) => {
  // --- CONFIGURATION ---
  const upiID = "ibkPOS.EP176726@icici";
  const payeeName = "M/S.M G CAFE AND MOCKTAILS";
  const merchantCode = "5812";
  const staticRefPrefix = "EPYSSQREP176726";

  const [transactionRef, setTransactionRef] = useState("");

  useEffect(() => {
    // Generate unique TR for the QR Code (so Soundbox works on Scan)
    const uniqueSuffix = orderId ? orderId.slice(-4).toUpperCase() : Math.floor(Math.random() * 1000);
    setTransactionRef(`${staticRefPrefix}-${uniqueSuffix}`);
  }, [orderId]);

  // --- 1. QR CODE LINK (Rich Link) ---
  // Keeps 'tr', 'mc', 'mode' so scanning triggers the Soundbox
  const qrLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&mc=${merchantCode}&tr=${transactionRef}&am=${amount}&cu=INR&mode=01`;

  // --- 2. DEEP LINK / BUTTON (Bare Minimum Link) ---
  // REMOVED: tr, mc, mode, tn
  // KEPT: pa, pn, am, cu
  // This is a standard P2P-style link.
  const deepLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  const [copied, setCopied] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const copyUPI = () => {
    navigator.clipboard.writeText(upiID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    setErrorMessage(""); 
    const cleanUTR = utrInput.trim();
    
    if (!cleanUTR || !/^\d{12}$/.test(cleanUTR)) {
      setErrorMessage("Please enter the valid 12-digit UTR.");
      return;
    }

    setIsVerifying(true);
    onVerify(cleanUTR).finally(() => setIsVerifying(false));
  };

  // Prevent hydration mismatch
  if (!transactionRef) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      
      <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payable</p>
        <h2 className="text-3xl font-extrabold text-slate-800">₹{amount}</h2>
        <p className="text-xs text-slate-400 mt-2 font-mono">Order #{orderId?.slice(-6).toUpperCase()}</p>
      </div>

      <div className="p-6 space-y-6">
        
        {/* QR CODE SECTION */}
        <div className="flex justify-center">
          <div className="p-3 bg-white border-2 border-dashed border-orange-300 rounded-2xl shadow-sm relative">
             <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500 rounded-tl-lg -mt-1 -ml-1"></div>
             <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500 rounded-tr-lg -mt-1 -mr-1"></div>
             <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500 rounded-bl-lg -mb-1 -ml-1"></div>
             <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500 rounded-br-lg -mb-1 -mr-1"></div>
             
             <QRCodeSVG 
                value={qrLink} 
                size={180}
                level={"M"} 
                includeMargin={false}
              />
          </div>
        </div>

        {/* TAP TO PAY BUTTON */}
        <a 
          href={deepLink}
          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-center shadow-lg shadow-blue-600/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>Tap to Pay via UPI App</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>

        {/* MANUAL COPY SECTION */}
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold">UPI ID</p>
                <p className="text-sm font-mono font-medium text-slate-700 truncate">{upiID}</p>
            </div>
            <button 
                onClick={copyUPI}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${copied ? "bg-green-100 text-green-700" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
                {copied ? "Copied" : "Copy"}
            </button>
        </div>

        {/* VERIFICATION INPUT SECTION */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Confirm Payment
          </label>
          <div className="space-y-3">
            <input 
              type="text" 
              inputMode="numeric" 
              pattern="[0-9]*"
              value={utrInput}
              onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); 
                  setUtrInput(val);
                  setErrorMessage(""); 
              }}
              placeholder="e.g. 324512345678"
              className={`w-full border-2 rounded-xl px-4 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-4 transition-all ${errorMessage ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50" : "border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 bg-slate-50"}`}
            />
            
            {errorMessage && (
                <p className="text-xs text-red-600 font-medium animate-pulse flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    {errorMessage}
                </p>
            )}

            <button 
              onClick={handleSubmit}
              disabled={isVerifying}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Verifying...</span>
                  </>
              ) : (
                  "Verify & Complete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafePayment;