"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

export default function LogoutPage() {
  const router = useRouter()
  const { clearCart } = useCart() // Good practice to wipe cart on logout

  useEffect(() => {
    // 1. Remove User Session
    localStorage.removeItem("mg_user")

    // 2. Clear the Cart (Optional, but recommended for cafes)
    clearCart()

    // 3. Redirect to Login (Using 'replace' so they can't click Back)
    router.replace("/login")
  }, [router, clearCart])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-slate-500 animate-pulse">Logging out...</p>
    </div>
  )
}