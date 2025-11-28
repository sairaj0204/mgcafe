"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { useCart } from '@/context/CartContext'

export default function MenuPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 1. Get Table Number from URL (default to 0 if missing)
  const tableNumber = searchParams.get('table') || "?"

  // 2. Mock Data (We will replace this with MongoDB later)
  const CATEGORIES = ["All", "Coffee", "Tea", "Snacks", "Desserts", "Cold Drinks"]
  
  const MENU_ITEMS = [
    { id: 1, name: "Cappuccino", price: 140, category: "Coffee", desc: "Rich espresso with steamed milk foam", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80" },
    { id: 2, name: "Masala Chai", price: 40, category: "Tea", desc: "Traditional spiced tea with ginger", image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=80" },
    { id: 3, name: "Club Sandwich", price: 180, category: "Snacks", desc: "Triple layer grilled veggie sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
    { id: 4, name: "Chocolate Brownie", price: 120, category: "Desserts", desc: "Served warm with vanilla ice cream", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?w=800&q=80" },
    { id: 5, name: "Iced Latte", price: 160, category: "Coffee", desc: "Chilled espresso with milk and ice", image: "https://images.unsplash.com/photo-1517701604599-bb29b5c7fa8f?w=800&q=80" },
    { id: 6, name: "French Fries", price: 90, category: "Snacks", desc: "Crispy salted fries with dip", image: "https://images.unsplash.com/photo-1518013431117-e5952c874f94?w=800&q=80" },
  ]

  // 3. State Management
  const [activeCategory, setActiveCategory] = useState("All")
  const { cart, addToCart } = useCart()// Object for fast lookups: { "itemId": quantity }

  // Filter Items
  const filteredItems = activeCategory === "All" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory)

  // Cart Logic
  const updateQuantity = (itemId, change) => {
    addToCart(itemId, change)
}

  // Calculate Totals
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.keys(cart).reduce((sum, itemId) => {
    const item = MENU_ITEMS.find(i => i.id === parseInt(itemId))
    return sum + (item.price * cart[itemId])
  }, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <Navbar isLoggedIn={false} current="Menu" />

      {/* 1. Header with Table Info */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 sticky top-[72px] z-30 shadow-sm border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Menu</h1>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                    Ordering for Table {tableNumber}
                </p>
            </div>
            {/* Back Button (Just in case) */}
            <button onClick={() => router.back()} className="text-xs text-slate-400 underline">
                Change Table
            </button>
        </div>

        {/* 2. Category Filter (Horizontal Scroll) */}
        <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                        px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all
                        ${activeCategory === cat 
                            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }
                    `}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* 3. Menu Grid */}
      <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => {
            const qty = cart[item.id] || 0;

            return (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                    
                    {/* Item Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.desc}</p>
                        <div className="flex justify-between items-end mt-3">
                            <span className="font-bold text-slate-900 dark:text-amber-400">₹{item.price}</span>
                            
                            {/* ADD BUTTON / COUNTER */}
                            {qty === 0 ? (
                                <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="px-6 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors"
                                >
                                    ADD
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-5 text-lg font-bold">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-5 text-lg font-bold">+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* 4. Sticky Cart Footer */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up">
            <div className="max-w-2xl mx-auto flex justify-between items-center bg-slate-900 dark:bg-amber-500 text-white dark:text-black p-4 rounded-xl shadow-xl">
                <div className="flex flex-col pl-2">
                    <span className="text-xs opacity-80 uppercase tracking-wider font-semibold">{totalItems} Items selected</span>
                    <span className="text-xl font-bold">₹{totalPrice}</span>
                </div>
                <button 
                    onClick={() => router.push(`/checkout?table=${tableNumber}`)}
                    className="flex items-center gap-2 pr-2 font-bold hover:opacity-80 transition-opacity"
                >
                    View Cart <span className="text-xl">→</span>
                </button>
            </div>
        </div>
      )}
    </div>
  )
}