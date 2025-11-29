"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import { useCart } from '@/context/CartContext'

// Helper to load Razorpay Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || "?"
  const { cart, clearCart } = useCart() 
  const [note, setNote] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("online") 
  const [isProcessing, setIsProcessing] = useState(false)
  const [menuItems, setMenuItems] = useState([]);

  // Fetch Menu Data
  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(data => setMenuItems(data));
  }, []);

  const cartItems = Object.keys(cart).map(id => {
    const item = menuItems.find(i => i._id === id); 
    if (!item) return null
    return { ...item, qty: cart[id] }
  }).filter(item => item !== null)

  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = Math.round(itemTotal * 0.05)
  const grandTotal = itemTotal + tax

  // --- THE CORE PAYMENT LOGIC ---
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);
    
    const userStr = localStorage.getItem("mg_user");
    if (!userStr) {
        alert("Please login first");
        router.push("/login");
        return;
    }
    const user = JSON.parse(userStr);

    try {
        // SCENARIO A: CASH PAYMENT
        if (paymentMethod === "cash") {
            await createOrderInDB(user, "pending", null);
            alert("Order Placed! Please pay cash at the counter.");
            clearCart();
            router.push("/");
            return;
        }

        // SCENARIO B: ONLINE PAYMENT (RAZORPAY)
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            alert("Failed to load payment gateway");
            setIsProcessing(false);
            return;
        }

        // 1. Create Order on Razorpay Server
        const orderRes = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: grandTotal }),
        });
        const orderData = await orderRes.json();

        // 2. Open Razorpay Options
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Environment Variable if possible, or string
            amount: orderData.amount,
            currency: orderData.currency,
            name: "MG Cafe",
            description: `Table ${tableNumber} Bill`,
            order_id: orderData.id,
            handler: async function (response) {
                // 3. Payment Success! Create Order in MongoDB
                await createOrderInDB(user, "paid", {
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                });
                alert("Payment Successful! Order Placed.");
                clearCart();
                router.push("/");
            },
            prefill: {
                name: user.name || "",
                contact: user.phone || "",
            },
            theme: { color: "#d97706" }, // Amber-600 color
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        
        // Handle closure without payment
        paymentObject.on('payment.failed', function (response){
            alert("Payment Failed. Please try again.");
            setIsProcessing(false);
        });

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
        setIsProcessing(false);
    }
  };

  // Helper to save to MongoDB
  const createOrderInDB = async (user, paymentStatus, razorpayDetails) => {
    const orderData = {
        userId: user._id,
        tableNo: tableNumber,
        items: cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
        totalAmount: grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        razorpay: razorpayDetails,
        note: note
    };

    await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    });
  }

  // ... (Keep your Empty Cart View logic here) ...
  if (cartItems.length === 0 && menuItems.length > 0) {
     // ... copy from previous code ...
     return <div>Cart Empty...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-40">
      <Navbar isLoggedIn={true} current="Menu" />

      <div className="max-w-md mx-auto p-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Checkout</h1>
        <p className="text-sm text-slate-500 mb-6 font-medium">Ordering for Table {tableNumber}</p>

        {/* ... (Keep your existing Order Summary Card) ... */}
        {/* ... (Keep your existing Payment Method Buttons) ... */}
        
        {/* TEMPLATE FOR SUMMARY (Copy paste your existing JSX here) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            {/* ... items map ... */}
            <div className="p-4 space-y-2">
               {cartItems.map(item => (
                   <div key={item._id} className="flex justify-between">
                       <span>{item.qty}x {item.name}</span>
                       <span>₹{item.price * item.qty}</span>
                   </div>
               ))}
            </div>
        </div>
        
        {/* Payment Buttons (Copy from previous code) */}
        <div className="mb-6 grid grid-cols-2 gap-4">
             <button onClick={() => setPaymentMethod("online")} className={`p-4 border-2 rounded-xl ${paymentMethod === "online" ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}>UPI/Online</button>
             <button onClick={() => setPaymentMethod("cash")} className={`p-4 border-2 rounded-xl ${paymentMethod === "cash" ? "border-green-500 bg-green-50" : "border-slate-200"}`}>Cash</button>
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
                        ? "bg-slate-400 cursor-wait" 
                        : paymentMethod === "cash" 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-amber-600 hover:bg-amber-700"
                    }
                `}
            >
                <span>{isProcessing ? "Processing..." : paymentMethod === "cash" ? "Place Order (Cash)" : "Pay Now"}</span>
                <span>₹{grandTotal}</span>
            </button>
        </div>
      </div>

    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}