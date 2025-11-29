"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './components/Navbar'

export default function Home() {
  const router = useRouter()
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. AUTH & DATA FETCHING
  useEffect(() => {
    // A. Check Auth
    const user = localStorage.getItem("mg_user")
    if (!user) {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

    // B. Fetch Tables
    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables');
            if(res.ok) {
                const data = await res.json();
                setTables(data);
            }
        } catch(e) { console.error(e); } finally { setLoading(false); }
    }

    fetchTables();
    // Poll every 10s to see if tables free up
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, [router])

  const handleTableClick = (table) => {
    if (table.status === "occupied") {
        alert(`Table ${table.tableNo} is currently occupied.`);
        return;
    }
    setSelectedTable(selectedTable === table.tableNo ? null : table.tableNo);
  }

  const handleProceed = () => {
    if (selectedTable) {
        router.push(`/menu?table=${selectedTable}`);
    }
  }

  // Helper to render the specific "Chair-Table-Chair" layout
  const renderTableUnit = (table) => {
    const isOccupied = table.status === "occupied";
    const isSelected = selectedTable === table.tableNo;

    // Colors
    const tableColor = isOccupied 
        ? "bg-slate-200 border-slate-300 opacity-60 cursor-not-allowed" 
        : isSelected 
            ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/40" 
            : "bg-white border-slate-800 hover:border-amber-400";

    const chairColor = isOccupied 
        ? "bg-slate-200 border-slate-300" 
        : isSelected 
            ? "bg-amber-600 border-amber-700" 
            : "bg-white border-slate-800";
    
    const textColor = isSelected ? "text-white" : "text-slate-800";

    return (
      <div 
        key={table._id} 
        onClick={() => handleTableClick(table)}
        className="flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95"
      >
        <div className={`w-3 h-12 border-2 rounded-sm ${chairColor}`}></div>

        <div className={`w-28 h-28 border-2 rounded-lg flex flex-col items-center justify-center relative shadow-sm transition-all duration-300 ${tableColor}`}>
            <span className={`text-3xl font-bold ${textColor}`}>{table.tableNo}</span>
            <span className={`text-[9px] uppercase font-bold mt-1 tracking-wider ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                {isOccupied ? "Busy" : "Free"}
            </span>
        </div>

        <div className={`w-3 h-12 border-2 rounded-sm ${chairColor}`}></div>
      </div>
    )
  }

  if (!isAuthorized || loading) return <div className="min-h-screen flex items-center justify-center">Loading Cafe Map...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <Navbar isLoggedIn={true} current="Home" />

      {/* Hero Text */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Select Your Table</h1>
        <p className="text-slate-500 text-sm">Tap a table to view the menu</p>
      </div>

      {/* FLOOR PLAN CONTAINER */}
      <div className="max-w-md mx-auto px-6 py-6">
        
        {/* COUNTER */}
        <div className="w-full h-16 border-2 border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center mb-12 shadow-sm">
            <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">
                Counter & Kitchen
            </span>
        </div>

        {/* TABLE GRID */}
        {/* Sort tables by tableNo to ensure grid order is 1,2,3... */}
        <div className="grid grid-cols-2 gap-y-12 gap-x-4 justify-items-center">
            {tables
              .sort((a, b) => a.tableNo - b.tableNo)
              .map(table => renderTableUnit(table))
            }
        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="max-w-md mx-auto">
            <button 
                onClick={handleProceed}
                disabled={!selectedTable}
                className={`
                    w-full py-4 rounded-xl text-lg font-bold transition-all shadow-xl
                    ${selectedTable 
                        ? "bg-amber-600 hover:bg-amber-700 text-white translate-y-0" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }
                `}
            >
                {selectedTable ? `Confirm Table ${selectedTable}` : "Select a Table"}
            </button>
        </div>
      </div>
    </div>
  )
}