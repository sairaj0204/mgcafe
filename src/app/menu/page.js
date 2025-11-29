"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import { useCart } from '@/context/CartContext'

function MenuContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // 1. Get Table Number
  const tableParam = searchParams.get('table')
  const tableNumber = tableParam && tableParam !== "?" ? tableParam : null

  const { cart, addToCart } = useCart()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [isAuthorized, setIsAuthorized] = useState(false)

  // 2. AUTH & DATA FETCHING
  useEffect(() => {
    // A. Check Login
    const user = localStorage.getItem("mg_user")
    if (!user) {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    // B. Fetch Real Menu
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu')
        if (res.ok) {
          const data = await res.json()
          setMenuItems(data)
        }
      } catch (error) {
        console.error("Failed to load menu")
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [router])

  // 3. Extract Categories Dynamically from Data
  const categories = ["All", ...new Set(menuItems.map(item => item.category))]

  // 4. Filter Items
  const filteredItems = activeCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory)

  // 5. Calculate Totals
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
  const totalPrice = Object.keys(cart).reduce((sum, itemId) => {
    // Find item in our real DB data
    const item = menuItems.find(i => i._id === itemId) // Note: MongoDB uses _id
    if (!item) return sum;
    return sum + (item.price * cart[itemId])
  }, 0)

  // Loading Screen
  if (!isAuthorized || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">Loading Menu...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <Navbar isLoggedIn={true} current="Menu" />

      {/* Header with Table Info */}
      <div className="bg-white dark:bg-slate-900 px-6 py-4 sticky top-[72px] z-30 shadow-sm border-b border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Menu</h1>
                {tableNumber ? (
                   <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
                      Ordering for Table {tableNumber}
                   </p>
                ) : (
                   <p className="text-xs text-red-500 font-bold uppercase tracking-wider animate-pulse">
                      No Table Selected
                   </p>
                )}
            </div>
            {/* If no table, clicking this takes them to Home to select one */}
            <button onClick={() => router.push("/")} className="text-xs text-slate-400 underline">
                {tableNumber ? "Change Table" : "Select Table"}
            </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
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

      {/* Menu Grid */}
      <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => {
            const qty = cart[item._id] || 0; // Using MongoDB _id

            return (
                <div key={item._id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 items-center">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-200">
                        {/* Use default placeholder if image fails or uses local path */}
                        <Image 
                           src={item.image} 
                           alt={item.name} 
                           fill 
                           className="object-cover"
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{item.name}</h3>
                           {item.category === "Pizza" || item.category === "Burger" ? (
                               <span className="text-[10px] border border-green-500 text-green-500 px-1 rounded">VEG</span>
                           ) : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                        
                        <div className="flex justify-between items-end mt-3">
                            <span className="font-bold text-slate-900 dark:text-amber-400">₹{item.price}</span>
                            
                            {qty === 0 ? (
                                <button 
                                    onClick={() => addToCart(item._id, 1)}
                                    className="px-6 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors"
                                >
                                    ADD
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg">
                                    <button onClick={() => addToCart(item._id, -1)} className="w-5 text-lg font-bold">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{qty}</span>
                                    <button onClick={() => addToCart(item._id, 1)} className="w-5 text-lg font-bold">+</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Sticky Cart Footer - HIDDEN IF NO TABLE SELECTED */}
      {totalItems > 0 && tableNumber && (
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
      
      {/* Alert if they try to order without a table */}
      {totalItems > 0 && !tableNumber && (
         <div className="fixed bottom-0 left-0 w-full p-4 bg-red-50 dark:bg-red-900/90 backdrop-blur-lg z-40 border-t border-red-200">
             <div className="max-w-2xl mx-auto flex justify-between items-center text-red-700 dark:text-red-100 font-bold">
                 <span>Please select a table to place order</span>
                 <button onClick={() => router.push("/")} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Select Table</button>
             </div>
         </div>
      )}
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  )
}