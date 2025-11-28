"use client"
import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar' // Reusing Navbar for consistency

export default function AdminDashboard() {
  // --- 1. MOCK DATA: LIVE ORDERS ---
  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      table: 4,
      items: [{ name: "Cappuccino", qty: 2 }, { name: "Brownie", qty: 1 }],
      total: 400,
      status: "pending", // pending -> preparing -> ready -> completed
      time: "10:30 AM"
    },
    {
      id: "ORD-002",
      table: 1,
      items: [{ name: "Masala Chai", qty: 4 }, { name: "Bun Maska", qty: 2 }],
      total: 240,
      status: "preparing",
      time: "10:32 AM"
    },
    {
      id: "ORD-003",
      table: 6,
      items: [{ name: "Club Sandwich", qty: 1 }],
      total: 180,
      status: "ready",
      time: "10:45 AM"
    }
  ])

  // --- 2. MOCK DATA: TABLE STATUS ---
  // (We use the same IDs as the Customer Home Page)
  const [tables, setTables] = useState([
    { id: 1, label: "01", status: "occupied" },
    { id: 2, label: "02", status: "available" },
    { id: 3, label: "03", status: "available" },
    { id: 4, label: "04", status: "occupied" },
    { id: 5, label: "05", status: "available" },
    { id: 6, label: "06", status: "occupied" },
  ])

  // --- ACTIONS ---
  
  // Advance Order Status (Pending -> Preparing -> Ready -> Completed)
  const advanceOrder = (orderId) => {
    setOrders(prev => prev.map(order => {
        if (order.id !== orderId) return order;
        
        if (order.status === "pending") return { ...order, status: "preparing" };
        if (order.status === "preparing") return { ...order, status: "ready" };
        if (order.status === "ready") return { ...order, status: "completed" };
        return order;
    }).filter(o => o.status !== "completed")) // Remove completed orders from view
  }

  // Toggle Table Status Manually (If customer leaves)
  const toggleTable = (tableId) => {
    setTables(prev => prev.map(t => 
        t.id === tableId 
            ? { ...t, status: t.status === "available" ? "occupied" : "available" } 
            : t
    ))
  }

  // Calculate Stats
  const pendingCount = orders.filter(o => o.status === "pending").length
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar isLoggedIn={true} current="Admin" />

      <div className="p-6 grid lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
        
        {/* === LEFT COL: LIVE ORDERS (Takes up 2/3 space) === */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Stats Header */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Pending</p>
                    <h3 className="text-2xl font-bold text-amber-600">{pendingCount} Orders</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Active Tables</p>
                    <h3 className="text-2xl font-bold text-blue-600">{tables.filter(t => t.status === "occupied").length} / 6</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase">Revenue (Session)</p>
                    <h3 className="text-2xl font-bold text-green-600">₹{revenue}</h3>
                </div>
            </div>

            {/* ORDER FEED */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">Incoming Orders</h2>
                
                {orders.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">No active orders</div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-start animate-fade-in-up">
                            
                            {/* Order Details */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded">
                                        #{order.id}
                                    </span>
                                    <span className="text-slate-400 text-xs font-mono">{order.time}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                                    Table {order.table}
                                </h3>
                                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    {order.items.map((item, i) => (
                                        <li key={i}>• {item.qty}x <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span></li>
                                    ))}
                                </ul>
                                <p className="mt-3 font-bold text-slate-800 dark:text-white">Total: ₹{order.total}</p>
                            </div>

                            {/* Action Button */}
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={order.status} />
                                <button 
                                    onClick={() => advanceOrder(order.id)}
                                    className={`
                                        mt-4 px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95
                                        ${order.status === "pending" ? "bg-amber-500 hover:bg-amber-600 text-white" : 
                                          order.status === "preparing" ? "bg-blue-600 hover:bg-blue-700 text-white" : 
                                          "bg-green-600 hover:bg-green-700 text-white"}
                                    `}
                                >
                                    {order.status === "pending" ? "Accept Order" : 
                                     order.status === "preparing" ? "Mark Ready" : 
                                     "Complete"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* === RIGHT COL: TABLE MAP (Takes up 1/3 space) === */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-6">Live Floor Plan</h2>
            
            <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {tables.map(table => (
                    <div 
                        key={table.id}
                        onClick={() => toggleTable(table.id)}
                        className={`
                            relative rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all border-2
                            ${table.status === "occupied" 
                                ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800" 
                                : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 hover:scale-105"
                            }
                        `}
                    >
                        <span className={`text-2xl font-bold ${table.status === "occupied" ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                            {table.label}
                        </span>
                        <span className={`text-[10px] uppercase font-bold mt-1 ${table.status === "occupied" ? "text-red-500" : "text-green-500"}`}>
                            {table.status === "occupied" ? "Occupied" : "Free"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-6 text-center">
                 <p className="text-xs text-slate-400">Tap a table to force-free/occupy it.</p>
            </div>
        </div>

      </div>
    </div>
  )
}

// Small Helper Component for the Badge
function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        preparing: "bg-blue-100 text-blue-700 border-blue-200",
        ready: "bg-green-100 text-green-700 border-green-200",
    }
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    )
}