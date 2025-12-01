"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import { useCart } from '@/context/CartContext'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || "?"
  const { cart, clearCart } = useCart() 
  const [note, setNote] = useState("")
  
  const [paymentMethod, setPaymentMethod] = useState("cash") 
  const [isProcessing, setIsProcessing] = useState(false)
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(data => setMenuItems(data));
  }, []);

  const cartItems = Object.keys(cart).map(id => {
    const item = menuItems.find(i => i._id === id); 
    if (!item) return null
    return { ...item, qty: cart[id] }
  }).filter(item => item !== null)

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = "Included"
  const grandTotal = itemTotal 

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true);
    
    const userStr = localStorage.getItem("mg_user");
    if (!userStr) {
        alert("Please login first");
        router.push("/login");
        setIsProcessing(false); 
        return;
    }
    const user = JSON.parse(userStr);

    try {
        const orderData = {
            userId: user._id,
            tableNo: tableNumber,
            items: cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
            totalAmount: grandTotal,
            paymentMethod: paymentMethod, 
            paymentStatus: "pending", // ALWAYS Pending initially
            note: note
        };

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (res.ok) {
            // === ONLINE FLOW ===
            if (paymentMethod === "online") {
                const orderId = data._id || data.orderId; 
                // Do NOT clear cart yet (user might back out)
                // Do NOT mark as paid yet
                router.push(`/payment/${orderId}`);
            } 
            // === PAY AT COUNTER FLOW ===
            else {
                alert("Order Placed! Please pay at the counter.");
                clearCart();
                router.push("/");
            }
        } else {
            alert("Failed: " + (data.error || "Could not place order"));
        }

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    } finally {
        setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Navbar isLoggedIn={true} current="Menu" />
            <div className="text-center mt-20">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Cart is Empty</h1>
                <button onClick={() => router.push(`/menu?table=${tableNumber}`)} className="mt-4 px-6 py-3 bg-amber-600 text-white rounded-full font-bold shadow-lg">Go back to Menu</button>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-40">
      <Navbar isLoggedIn={true} current="Menu" />

      <div className="max-w-md mx-auto p-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Checkout</h1>
        <p className="text-sm text-slate-500 mb-6 font-medium">Ordering for Table {tableNumber}</p>

        {/* Order Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Order Summary</h3>
            </div>
            <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded mt-0.5">{item.qty}x</div>
                            <div><p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{item.name}</p><p className="text-xs text-slate-400">₹{item.price} each</p></div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">₹{item.price * item.qty}</span>
                    </div>
                ))}
            </div>
            <div className="p-4 pt-0 border-t border-dashed border-slate-100 dark:border-slate-800 mt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block mt-4">Cooking Note</label>
                <input type="text" placeholder="e.g. Less spicy..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-amber-500 transition-colors dark:text-white" />
            </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
                
                {/* 1. PAY AT COUNTER */}
                <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                        paymentMethod === "cash" 
                        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 shadow-md" 
                        : "border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-900 hover:border-green-200"
                    }`}
                >
                    <span className="text-2xl">💵</span>
                    <span className="text-sm">Pay at Counter</span>
                    {paymentMethod === "cash" && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                </button>

                {/* 2. ONLINE BUTTON (Re-enabled) */}
                <button
                    onClick={() => setPaymentMethod("online")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 relative overflow-hidden ${
                        paymentMethod === "online" 
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-md" 
                        : "border-slate-200 dark:border-slate-800 text-slate-400 bg-white dark:bg-slate-900 hover:border-blue-200"
                    }`}
                >
                    <span className="text-2xl">📱</span>
                    <span className="text-sm">UPI / QR</span>
                    {paymentMethod === "online" && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                </button>

            </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2"><span>Item Total</span><span>₹{itemTotal}</span></div>
             <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2"><span>GST (5%)</span><span>{tax}</span></div>
             <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-3"></div>
             <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white"><span>Grand Total</span><span>₹{grandTotal}</span></div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up">
        <div className="max-w-md mx-auto">
            <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className={`
                    w-full text-white text-lg font-bold py-4 rounded-xl shadow-lg flex justify-between px-6 transition-all active:scale-95
                    ${isProcessing 
                        ? "bg-slate-700 cursor-wait" 
                        : paymentMethod === 'online' 
                            ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" 
                            : "bg-green-600 hover:bg-green-700 shadow-green-600/30"
                    }
                `}
            >
                <span>
                    {isProcessing 
                        ? "Processing..." 
                        : paymentMethod === 'online' 
                            ? "Proceed to Pay" 
                            : "Place Order"
                    }
                </span>
                {!isProcessing && <span>₹{grandTotal}</span>}
            </button>
        </div>
      </div>

    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}