"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // 1. Security Check
    const userStr = localStorage.getItem("mg_user")
    if (!userStr) { router.push("/login"); return }
    const user = JSON.parse(userStr)
    if (user.role !== "admin") { router.push("/"); return }
    setIsAuthorized(true)

    // 2. Data Fetching
    const fetchData = async () => {
        try {
            const [ordersRes, tablesRes] = await Promise.all([
                fetch('/api/orders?status=active'),
                fetch('/api/tables')
            ]);
            
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (tablesRes.ok) setTables(await tablesRes.json());
        } catch (error) {
            console.error("Error fetching admin data", error);
        } finally {
            setLoading(false);
        }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const updateStatus = async (orderId, newStatus) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));

    await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
    });
  }

  const markPaid = async (orderId) => {
    if(!confirm("Confirm cash received?")) return;
    
    // Optimistic Update
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: 'paid' } : o));
    
    await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus: 'paid' })
    });
  }

  const toggleTable = async (tableNo, currentStatus) => {
    const action = currentStatus === "available" ? "occupy" : "free";
    if(!confirm(`Mark Table ${tableNo} as ${action === "occupy" ? "Occupied" : "Free"}?`)) return;

    setTables(prev => prev.map(t => t.tableNo === tableNo ? { ...t, status: action === "occupy" ? "occupied" : "available" } : t));

    await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNo, action })
    });
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar isLoggedIn={true} current="Admin" />

      <div className="p-4 grid lg:grid-cols-3 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* === LEFT: KITCHEN FEED === */}
        <div className="lg:col-span-2 flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Live Kitchen Feed</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
                {orders.map(order => {
                    // CRITICAL LOGIC FIX:
                    // Check if paymentStatus is ANYTHING other than 'paid'
                    const isUnpaid = order.paymentStatus !== "paid";

                    return (
                        <div key={order._id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                            
                            {/* Order Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-800 text-white text-sm font-bold px-3 py-1 rounded-lg">
                                        Table {order.tableNo}
                                    </span>
                                    <span className="text-xs font-bold uppercase px-2 py-1 rounded border bg-slate-100 text-slate-600">
                                        {order.status}
                                    </span>
                                    {isUnpaid ? (
                                        <span className="text-red-600 text-xs font-bold animate-pulse">
                                            ⚠️ Unpaid ({order.paymentMethod})
                                        </span>
                                    ) : (
                                        <span className="text-green-500 text-xs font-bold">
                                            ✓ Paid
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mb-3 font-medium">
                                    {order.userId?.name} • +91 {order.userId?.phone}
                                </p>
                                <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-200">
                                            <span className="font-bold">{item.qty}x</span>
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                                {order.note && <p className="text-xs text-red-500 mt-2 font-bold bg-red-50 p-2 rounded">Note: {order.note}</p>}

                                {/* 👇 ADDED TOTAL AMOUNT HERE */}
                                <div className="mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">Total Bill:</span>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">₹{order.totalAmount}</span>
                                </div>
                            </div>

                            {/* BUTTONS COLUMN */}
                            <div className="flex flex-col gap-2 min-w-[160px] justify-center border-l pl-4 border-slate-100 dark:border-slate-800">
                                
                                {/* Step 1: Pending -> Preparing */}
                                {order.status === "pending" && (
                                    <button onClick={() => updateStatus(order._id, "preparing")} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold text-sm">
                                        Accept & Prepare
                                    </button>
                                )}

                                {/* Step 2: Preparing -> Served */}
                                {order.status === "preparing" && (
                                    <button onClick={() => updateStatus(order._id, "served")} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm">
                                        Mark Served
                                    </button>
                                )}

                                {/* Step 3: Served -> Completed (LOCKED IF UNPAID) */}
                                {order.status === "served" && (
                                    <button 
                                        onClick={() => updateStatus(order._id, "completed")} 
                                        disabled={isUnpaid} // Logic here
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all
                                            ${isUnpaid 
                                                ? "bg-slate-200 text-slate-400 cursor-not-allowed border-2 border-slate-300" 
                                                : "bg-green-600 hover:bg-green-700 text-white shadow-md"
                                            }
                                        `}
                                    >
                                        {isUnpaid ? "Wait: Collect Cash" : "Complete Order"}
                                    </button>
                                )}

                                {/* Cash Collection Button (Only visible if Unpaid) */}
                                {isUnpaid && (
                                    <button 
                                        onClick={() => markPaid(order._id)} 
                                        className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 py-2 rounded-lg font-bold text-sm mt-2"
                                    >
                                        💵 Received Cash
                                    </button>
                                )}

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* === RIGHT: TABLE MAP === */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Table Status</h3>
            <div className="grid grid-cols-2 gap-4">
                {tables.map(table => (
                    <div 
                        key={table._id}
                        onClick={() => toggleTable(table.tableNo, table.status)}
                        className={`p-6 rounded-xl border-2 text-center cursor-pointer ${
                            table.status === "occupied" ? "bg-red-50 border-red-200 text-red-600" : "bg-green-50 border-green-200 text-green-600"
                        }`}
                    >
                        <span className="text-3xl font-bold">{table.tableNo}</span>
                        <p className="text-[10px] uppercase font-bold mt-2">{table.status}</p>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}