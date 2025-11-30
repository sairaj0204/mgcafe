"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"
import { useCart } from '@/context/CartContext'

function Navbar({ isLoggedIn, current }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { clearCart } = useCart()
  
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState("user") // Default to user

  // 1. Hydration & Role Check
  useEffect(() => {
    setMounted(true)
    
    // Check role from LocalStorage
    const userStr = localStorage.getItem("mg_user")
    if (userStr) {
        const user = JSON.parse(userStr)
        setUserRole(user.role || "user")
    }
  }, [])

  // Lock body scroll logic
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // 2. Define Links based on Role
  const navLinks = userRole === "admin" 
    ? ["Home", "Menu", "Admin", "admin/Reports"]
    : ["Home", "Menu", "myorders"];

  // 3. Logout Logic
  const handleLogout = () => {
    if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("mg_user");
        clearCart();
        router.replace("/login");
    }
  }

  // Helper styles
  const getNavItemClass = (name) => {
    const isActive = current === name;
    return `
      relative px-5 py-2 rounded-full text-sm font-semibold tracking-wide
      transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
      cursor-pointer overflow-hidden group
      ${isActive 
        ? "text-amber-700 bg-amber-50 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-700" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
      }
    `;
  };

  const getMobileNavItemClass = (name) => {
    const isActive = current === name;
    return `
      text-2xl font-bold py-4 border-b border-slate-100 dark:border-slate-800 w-full text-center
      transition-colors duration-300
      ${isActive 
        ? "text-amber-600 dark:text-amber-400" 
        : "text-slate-800 dark:text-slate-200"
      }
    `;
  };

  const handleNavClick = (item) => {
    // Handle special path logic if needed, otherwise default
    const path = item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "")}`;
    router.push(path);
  }

  const handleMobileNav = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center px-6 py-5 bg-white/70 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
        
        {/* Logo */}
        <h1 
          className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter cursor-pointer z-50"
          onClick={() => router.push("/")}
        >
          MG<span className="text-amber-600 italic font-serif">Cafe.</span>
        </h1>

        {/* DESKTOP LINKS (Dynamic based on Role) */}
        <ul className="hidden md:flex gap-2 bg-white/50 dark:bg-slate-900/50 p-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          {navLinks.map((item) => (
             <li 
                key={item} 
                onClick={() => handleNavClick(item)} 
                className={getNavItemClass(item)}
             >
                {item}
             </li>
          ))}
        </ul>

        {/* RIGHT SECTION */}
        <div className="flex gap-4 items-center z-50">
          
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}

          {/* DESKTOP AUTH BUTTON (Replaces Image) */}
          <div className="hidden md:block">
            {isLoggedIn ? (
               <button 
                 onClick={handleLogout}
                 className="bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 px-5 py-2 rounded-full text-sm font-bold hover:bg-red-100 transition-colors"
               >
                 Logout
               </button>
            ) : (
               <button 
                 onClick={() => router.push('/login')}
                 className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all"
               >
                 Login
               </button>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button 
            className="md:hidden p-2 text-slate-800 dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`
        fixed inset-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-transform duration-500 ease-in-out md:hidden flex flex-col items-center justify-center gap-8
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <ul className="flex flex-col items-center w-full px-10">
          {navLinks.map((item) => (
             <li 
                key={item} 
                onClick={() => handleMobileNav(item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "")}`)} 
                className={getMobileNavItemClass(item)}
             >
                {item}
             </li>
          ))}
        </ul>

        {/* MOBILE AUTH BUTTON */}
        {isLoggedIn ? (
           <button 
             onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
             className="text-red-500 font-bold text-xl px-10 py-4 border-2 border-red-100 rounded-full"
           >
             Log Out
           </button>
        ) : (
           <button 
             onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
             className="bg-amber-500 text-white px-10 py-4 rounded-full text-xl font-bold shadow-xl shadow-amber-500/20"
           >
             Login / Sign Up
           </button>
        )}
      </div>
    </>
  )
}

export default Navbar