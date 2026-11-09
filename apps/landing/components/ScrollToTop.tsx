'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all"
      title="Cuộn lên đầu trang"
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp className="w-5 h-5 text-blue-600 dark:text-[#06b6d4]" />
    </button>
  )
}
