"use client"
import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('table') // e.g. "5" from QR Code

  // State
  const [step, setStep] = useState("phone") // "phone" | "otp"
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("") // Optional Name
  const [loading, setLoading] = useState(false)

  // 1. Send OTP (Step 1)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call our API (Simulated or Real)
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', phone, name })
      });

      if (res.ok) {
        setStep("otp");
        // Dev Tip: Since it's static, no alert needed, but good for debugging
        console.log("OTP Sent (Use 123456)"); 
      } else {
        alert("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // 2. Verify OTP (Step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', phone, otp })
      });

      const data = await res.json();

      if (res.ok) {
        // Save User Session
        localStorage.setItem("mg_user", JSON.stringify(data.user));

        // --- 🚀 THE REDIRECT LOGIC ---
        if (tableParam) {
            // Scenario 2: QR Scan -> Go straight to Menu
            router.push(`/menu?table=${tableParam}`);
        } else {
            // Scenario 1: Manual Login -> Go to Home to pick table
            router.push("/");
        }
      } else {
        alert(data.error); // Show "Invalid OTP"
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Card Container */}
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in-up">
          
          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              {tableParam ? `Table ${tableParam}` : "Welcome"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {step === "phone" 
                ? "Enter your number to order" 
                : `Enter the code sent to +91 ${phone}`
              }
            </p>
          </div>

          {step === "phone" ? (
            /* --- STEP 1: PHONE INPUT --- */
            <form onSubmit={handleSendOtp} className="space-y-5">
              
              {/* Name Input (Optional but good for orders) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Your Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rahul"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-lg font-medium outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Mobile Number</label>
                <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">+91</span>
                    <input 
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); // Only numbers
                          if (val.length <= 10) setPhone(val);
                      }}
                      className="w-full p-4 pl-14 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-lg font-bold tracking-widest outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || phone.length < 10}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
              >
                {loading ? "Sending..." : "Continue"}
              </button>
            </form>
          ) : (
            /* --- STEP 2: OTP INPUT --- */
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">One Time Password</label>
                <input 
                  type="text" // numeric
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-amber-500 transition-colors text-slate-800 dark:text-white"
                  required
                  maxLength={6}
                  autoFocus
                />
                <p className="text-center text-xs text-slate-400 mt-3">
                   Use standard OTP: <span className="font-mono font-bold text-amber-600">123456</span>
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length < 6}
                className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
                <button 
                    type="button"
                    onClick={(e) => {
                    e.preventDefault(); // 🛑 Stops any form submission
                    setStep("phone");
                    setOtp("");
                    // setPhone(""); // Optional: Uncomment if you want to clear the typed number too
                    }}
                    className="w-full text-sm text-slate-400 font-medium hover:text-slate-600 dark:hover:text-slate-200 transition-colors py-2"
                >
                     Change Number
                </button> 
            </form>
            
          )}

        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-xs text-slate-400 text-center max-w-xs leading-relaxed">
            By continuing, you agree to MG Cafe's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

// Wrap in Suspense for the URL Search Params
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}