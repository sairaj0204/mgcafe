"use client"
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import { useCart } from '@/context/CartContext'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableNumber = searchParams.get('table') || "?"
  
  // 1. Get Global Cart & Actions
  const { cart, clearCart } = useCart() 

  const [note, setNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // --- MOCK MENU DATA (Must match Menu Page) ---
  const MENU_ITEMS = [
    { id: 1, name: "Cappuccino", price: 140 },
    { id: 2, name: "Masala Chai", price: 40 },
    { id: 3, name: "Club Sandwich", price: 180 },
    { id: 4, name: "Chocolate Brownie", price: 120 },
    { id: 5, name: "Iced Latte", price: 160 },
    { id: 6, name: "French Fries", price: 90 },
  ]

  // 2. Process Cart Items
  const cartItems = Object.keys(cart).map(id => {
    const item = MENU_ITEMS.find(i => i.id === parseInt(id))
    if (!item) return null
    return { ...item, qty: cart[id] }
  }).filter(item => item !== null)

  // 3. Calculate Totals
  const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = "Included"
  const grandTotal = itemTotal

  // 4. Handle Payment Logic
  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulate API Call to Razorpay/Backend
    setTimeout(() => {
        // Success!
        alert(`Payment of ₹${grandTotal} Successful!\nOrder placed for Table ${tableNumber}.`)
        
        // CRITICAL: Clear the cart from memory
        clearCart()
        
        setIsProcessing(false)
        
        // Redirect to Home (or an Order Success page)
        router.push("/") 
    }, 2000)
  }

  // 5. Empty Cart View
  if (cartItems.length === 0) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Navbar isLoggedIn={false} current="Menu" />
            <div className="text-center mt-20">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Cart is Empty</h1>
                <p className="text-slate-500 mb-6">Looks like you haven't ordered anything yet.</p>
                <button 
                    onClick={() => router.push(`/menu?table=${tableNumber}`)} 
                    className="px-6 py-3 bg-amber-600 text-white rounded-full font-bold shadow-lg hover:bg-amber-700 transition-all"
                >
                    Go back to Menu
                </button>
            </div>
        </div>
    )
  }

  // 6. Main Checkout View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-40">
      <Navbar isLoggedIn={false} current="Menu" />

      <div className="max-w-md mx-auto p-6 pt-2">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Checkout</h1>
        <p className="text-sm text-slate-500 mb-6 font-medium">Ordering for Table {tableNumber}</p>

        {/* ORDER SUMMARY CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Order Summary</h3>
            </div>
            
            <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                        <div className="flex gap-3 items-start">
                            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded mt-0.5">
                                {item.qty}x
                            </div>
                            <div>
                                <p className="text-slate-800 dark:text-slate-200 font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-slate-400">₹{item.price} each</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white text-sm">₹{item.price * item.qty}</span>
                    </div>
                ))}
            </div>

            {/* Kitchen Note Input */}
            <div className="p-4 pt-0 border-t border-dashed border-slate-100 dark:border-slate-800 mt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block mt-4">Cooking Instructions</label>
                <input 
                    type="text" 
                    placeholder="e.g. Less sugar, extra spicy..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 focus:outline-none focus:border-amber-500 transition-colors dark:text-white"
                />
            </div>
        </div>

        {/* BILL DETAILS */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                <span>Item Total</span>
                <span>₹{itemTotal}</span>
             </div>
             <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
                <span>GST (5%)</span>
                <span>{tax}</span>
             </div>
             <div className="border-t border-dashed border-slate-200 dark:border-slate-700 my-3"></div>
             <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
             </div>
        </div>
      </div>

      {/* STICKY PAYMENT BAR */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up">
        <div className="max-w-md mx-auto">
            <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className={`
                    w-full text-white text-lg font-bold py-4 rounded-xl shadow-lg flex justify-between px-6 transition-all active:scale-95
                    ${isProcessing 
                        ? "bg-slate-400 cursor-wait" 
                        : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                    }
                `}
            >
                <span>{isProcessing ? "Processing..." : "Pay Now"}</span>
                <span>₹{grandTotal}</span>
            </button>
        </div>
      </div>

    </div>
  )
}