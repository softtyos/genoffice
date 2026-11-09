'use client'

import React from 'react'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { SofttyMark } from './SofttyMark'

export function Footer() {
  const { t } = useApp()

  return (
    <footer className="py-12 bg-slate-100 dark:bg-[#090d18] border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Brand & Ecosystem Links */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="space-y-1.5 max-w-md">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <SofttyMark size={28} className="rounded-lg shadow-sm" />
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Softty <span className="text-[#06b6d4]">Office</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              {t.footer.brandDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-600 dark:text-slate-300 font-medium">
            <a
              href="https://accounts.softty.net"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {t.footer.accountLink}
            </a>
            <a
              href="https://my.softty.net"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {t.footer.portalLink}
            </a>
            <a
              href="https://www.softty.net"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 dark:hover:text-[#06b6d4] transition-colors"
            >
              {t.footer.website}
            </a>
            <Link
              href="/terms"
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {t.footer.termsLink}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              {t.footer.privacyLink}
            </Link>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-500">
          <p className="font-medium">{t.footer.copyright}</p>
          <div className="flex items-center gap-2">
            <span>{t.footer.builtBy}</span>
            <span>•</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              {t.footer.company}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
