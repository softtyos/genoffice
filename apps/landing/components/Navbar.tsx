'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Download, Sun, Moon, Laptop, Globe, Menu, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SofttyMark } from './SofttyMark'

export function Navbar() {
  const { theme, resolvedTheme, setTheme, toggleTheme, language, setLanguage, toggleLanguage, t } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0e1322]/85 backdrop-blur-md border-b border-slate-200 dark:border-[#1e293b] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="group-hover:scale-105 transition-transform flex items-center justify-center">
            <SofttyMark size={36} className="shadow-lg shadow-blue-500/20 rounded-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Softty <span className="text-[#06b6d4]">Office</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/#apps" className="hover:text-[#2563eb] dark:hover:text-white transition-colors">
            {t.nav.apps}
          </Link>
          <Link href="/#softty-drop" className="hover:text-[#2563eb] dark:hover:text-white transition-colors">
            {t.nav.softtyDrop}
          </Link>
          <Link href="/#scanner" className="hover:text-[#2563eb] dark:hover:text-white transition-colors">
            {t.nav.scanner}
          </Link>
          <Link href="/#security" className="hover:text-[#2563eb] dark:hover:text-white transition-colors">
            {t.nav.security}
          </Link>
          <Link href="/#download" className="hover:text-[#2563eb] dark:hover:text-white transition-colors">
            {t.nav.download}
          </Link>
        </nav>

        {/* Right Controls: Language, Theme & Download CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguage('vi')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'vi'
                  ? 'bg-white dark:bg-[#2563eb] text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tiếng Việt"
              aria-label="Chuyển sang Tiếng Việt"
            >
              VI
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-[#2563eb] text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="English"
              aria-label="Switch to English"
            >
              EN
            </button>
          </div>

          {/* Theme Mode Toggle Button */}
          <div className="relative">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              title={resolvedTheme === 'dark' ? t.nav.themeLight : t.nav.themeDark}
              aria-label="Chuyển đổi giao diện sáng/tối"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>

          {/* CTA Download Button */}
          <Link
            href="/#download"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-600/40"
          >
            <Download className="w-4 h-4" />
            <span>{t.nav.ctaDownload}</span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0e1322]/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Link
              href="/#apps"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.apps}
            </Link>
            <Link
              href="/#softty-drop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.softtyDrop}
            </Link>
            <Link
              href="/#scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.scanner}
            </Link>
            <Link
              href="/#security"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.security}
            </Link>
            <Link
              href="/#download"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.nav.download}
            </Link>
          </nav>

          <div className="pt-2">
            <Link
              href="/#download"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t.nav.ctaDownload}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
