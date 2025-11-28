"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from './components/Navbar'

export default function Home() {
  const router = useRouter()
  const [selectedTable, setSelectedTable] = useState(null)

  // Based on your sketch: 6 Tables
  // Tables 1,2,3 are Left Column. Tables 4,5,6 are Right Column.
  const tables = [
    { id: 1, label: "01", status: "available" },
    { id: 4, label: "04", status: "occupied" }, // Top Right
    { id: 2, label: "02", status: "available" },
    { id: 5, label: "05", status: "available" }, // Middle Right
    { id: 3, label: "03", status: "available" },
    { id: 6, label: "06", status: "available" }, // Bottom Right
  ]

  const handleTableClick = (table) => {
    if (table.status === "occupied") {
        alert("Table is occupied.");
        return;
    }
    setSelectedTable(selectedTable === table.id ? null : table.id);
  }

  const handleProceed = () => {
    if (selectedTable) {
        router.push(`/menu?table=${selectedTable}`);
    }
  }

  // Helper to render the "Chair-Table-Chair" shape
  const renderTableUnit = (table) => {
    const isOccupied = table.status === "occupied";
    const isSelected = selectedTable === table.id;

    // Dynamic Colors based on status
    const tableColor = isOccupied 
        ? "bg-slate-200 border-slate-300 opacity-60" // Occupied (Gray)
        : isSelected 
            ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/40" // Selected (Gold)
            : "bg-white border-slate-800 hover:border-amber-400"; // Available (White with dark border like sketch)

    const chairColor = isOccupied 
        ? "bg-slate-200 border-slate-300" 
        : isSelected 
            ? "bg-amber-600 border-amber-700" 
            : "bg-white border-slate-800";
    
    // Text Color
    const textColor = isSelected ? "text-white" : "text-slate-800";

    return (
      <div 
        key={table.id} 
        onClick={() => handleTableClick(table)}
        className="flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95"
      >
        {/* Left Chair */}
        <div className={`w-3 h-12 border-2 rounded-sm ${chairColor}`}></div>

        {/* The Table Surface */}
        <div className={`w-28 h-28 border-2 rounded-lg flex flex-col items-center justify-center relative shadow-sm transition-all duration-300 ${tableColor}`}>
            <span className={`text-2xl font-bold ${textColor}`}>{table.label}</span>
            
            {/* Status Text (Small) */}
            <span className={`text-[9px] uppercase font-bold mt-1 tracking-wider ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                {isOccupied ? "Busy" : "Free"}
            </span>
        </div>

        {/* Right Chair */}
        <div className={`w-3 h-12 border-2 rounded-sm ${chairColor}`}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
      <Navbar isLoggedIn={false} current="Home" />

      {/* Hero Text */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Select Your Table</h1>
        <p className="text-slate-500 text-sm">Tap a table to view the menu</p>
      </div>

      {/* THE FLOOR PLAN CONTAINER */}
      <div className="max-w-md mx-auto px-6 py-6">
        
        {/* 1. THE COUNTER (Top of sketch) */}
        <div className="w-full h-16 border-2 border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center mb-12 shadow-sm">
            <span className="text-slate-500 font-bold tracking-widest uppercase text-sm">
                Counter & Kitchen
            </span>
        </div>

        {/* 2. THE TABLES (Grid Layout like sketch) */}
        {/* grid-cols-2 creates the Left/Right split */}
        <div className="grid grid-cols-2 gap-y-12 gap-x-4 justify-items-center">
            {tables.map(table => renderTableUnit(table))}
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