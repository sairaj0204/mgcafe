"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'

export default function ReportsPage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Data Fetching
  const fetchReport = async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) setStats(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userStr = localStorage.getItem("mg_user")
    if (!userStr) { router.push("/login"); return }
    const user = JSON.parse(userStr)
    if (user.role !== "admin") { router.push("/"); return }

    fetchReport()
  }, [router])

  // 2. Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if(!expenseForm.title || !expenseForm.amount) return;

    setIsSubmitting(true);
    try {
        await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: expenseForm.title,
                amount: Number(expenseForm.amount),
                date: new Date()
            })
        });
        setExpenseForm({ title: "", amount: "" });
        fetchReport();
    } catch (e) {
        alert("Failed to add expense");
    } finally {
        setIsSubmitting(false);
    }
  }

  // 3. Delete Expense
  const handleDeleteExpense = async (id) => {
    if(!confirm("Are you sure you want to delete this expense?")) return;

    try {
        await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
        fetchReport(); 
    } catch (e) {
        alert("Failed to delete");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Analytics...</div>

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <Navbar isLoggedIn={true} current="Reports" />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6">Business Report</h1>

        {/* === STATS CARDS (Responsive Grid) === */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1">Today's Revenue</p>
                <h3 className="text-xl md:text-3xl font-bold text-green-600">₹{stats.todayRevenue}</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">{stats.todayOrdersCount} orders</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1">Monthly Rev</p>
                <h3 className="text-xl md:text-3xl font-bold text-blue-600">₹{stats.monthRevenue}</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">Gross Sales</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1">Expenses</p>
                <h3 className="text-xl md:text-3xl font-bold text-red-500">₹{stats.totalExpenses}</h3>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1 md:mt-2">Bills</p>
            </div>
             <div className="bg-slate-800 dark:bg-slate-100 p-4 md:p-6 rounded-2xl shadow-lg">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-1">Net Profit</p>
                <h3 className={`text-xl md:text-3xl font-bold ${stats.netProfit >= 0 ? "text-amber-400 dark:text-amber-600" : "text-red-400"}`}>
                    ₹{stats.netProfit}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 md:mt-2">Profit</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            
            {/* === LEFT: EXPENSE MANAGER === */}
            <div className="space-y-6">
                
                {/* Add Expense Form */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Add Expense</h3>
                    <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-3">
                        <input 
                            type="text" 
                            placeholder="Expense Name (e.g. Milk)"
                            value={expenseForm.title}
                            onChange={e => setExpenseForm({...expenseForm, title: e.target.value})}
                            className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
                            required
                        />
                        <div className="flex gap-3">
                             <input 
                                type="number" 
                                placeholder="₹ Amount"
                                value={expenseForm.amount}
                                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                                className="flex-1 md:w-32 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
                                required
                            />
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 rounded-xl font-bold transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>

                {/* Expense List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[400px] flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200">Expense History</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {stats.expenses.length === 0 ? (
                            <p className="p-8 text-center text-slate-400">No expenses recorded.</p>
                        ) : (
                            stats.expenses.map(exp => (
                                <div key={exp._id} className="p-3 mb-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{exp.title}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-red-500 text-sm">- ₹{exp.amount}</span>
                                        <button 
                                            onClick={() => handleDeleteExpense(exp._id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* === RIGHT: SALES DETAILS === */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[500px] md:h-[600px] flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Recent Sales</h3>
                </div>
                <div className="overflow-y-auto flex-1">
                     {stats.recentSales.map(order => (
                        <div key={order._id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                             <div className="flex justify-between items-start mb-1">
                                 <div className="flex flex-col">
                                     <span className="font-bold text-slate-800 dark:text-white text-sm">
                                         {order.userId?.name || "Guest"}
                                     </span>
                                     <span className="text-[10px] text-slate-400 font-mono">
                                         {order.userId?.phone || ""}
                                     </span>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-green-600 font-bold block text-sm">+ ₹{order.totalAmount}</span>
                                     <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase font-bold">
                                         {order.paymentMethod}
                                     </span>
                                 </div>
                             </div>
                             
                             <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                                <span>Table {order.tableNo}</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                        </div>
                     ))}
                     {stats.recentSales.length === 0 && (
                        <p className="p-10 text-center text-slate-400">No sales yet.</p>
                     )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}