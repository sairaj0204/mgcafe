"use client"
import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableParam = searchParams.get('table')

  const [step, setStep] = useState("phone") 
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  // 1. Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', phone, name })
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        // SHOW OTP IN ALERT (Simulation)
        alert(`Your Login OTP is: ${data.debug_code}`);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  }

  // 2. Verify OTP
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
        localStorage.setItem("mg_user", JSON.stringify(data.user));
        if (tableParam) {
            router.push(`/menu?table=${tableParam}`);
        } else {
            router.push("/");
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Verification Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar isLoggedIn={false} current="Login" />

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              {tableParam ? `Table ${tableParam}` : "Welcome"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {step === "phone" ? "Enter details to continue" : `Enter the code sent to ${phone}`}
            </p>
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Name</label>
                <input 
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-lg font-medium outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Phone</label>
                <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-bold text-lg">+91</span>
                    <input 
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setPhone(val);
                      }}
                      className="w-full p-4 pl-14 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-lg font-bold tracking-widest outline-none focus:border-amber-500"
                      required
                    />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || phone.length < 10}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Processing..." : "Get OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-center">One Time Password</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-amber-500 text-slate-800 dark:text-white"
                  required
                  maxLength={4}
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.length < 4}
                className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              
              <div className="mt-4">
                <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); setStep("phone"); setOtp(""); }}
                    className="w-full text-sm text-slate-400 font-medium hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    Change Number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}