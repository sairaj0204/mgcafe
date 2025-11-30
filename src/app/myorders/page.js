"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check Login
    const userStr = localStorage.getItem("mg_user")
    if (!userStr) {
      router.push("/login")
      return
    }
    const user = JSON.parse(userStr)

    // 2. Fetch User's Orders from the new specific API route
    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/myorders?userId=${user._id}`)
            if (res.ok) {
                setOrders(await res.json())
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchOrders()
  }, [router])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading History...</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Navbar isLoggedIn={true} current="My Orders" />

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Your Order History</h1>

        {orders.length === 0 ? (
            <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="mb-4">You haven't placed any orders yet.</p>
                <button 
                    onClick={() => router.push("/")} 
                    className="px-6 py-2 bg-amber-600 text-white rounded-full font-bold shadow-md hover:bg-amber-700 transition-colors"
                >
                    Start Ordering
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        
                        {/* Header: Date & Status */}
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider mb-1">
                                    {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">
                                    Table {order.tableNo}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                order.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                order.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse"
                            }`}>
                                {order.status}
                            </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">
                                        <span className="font-bold text-slate-800 dark:text-white mr-2">{item.qty}x</span> 
                                        {item.name}
                                    </span>
                                    <span className="text-slate-500 text-xs">₹{item.price * item.qty}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer: Total & Payment */}
                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-400">
                                Payment: <span className="capitalize font-medium text-slate-600 dark:text-slate-300">{order.paymentMethod}</span>
                            </span>
                            <span className="text-lg font-bold text-slate-900 dark:text-amber-500">₹{order.totalAmount}</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}