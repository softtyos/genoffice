'use client'

import React, { useEffect, useState } from 'react'
import { Apple, Monitor, Smartphone, ArrowRight, Zap, Shield, FileText } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function Hero() {
  const { t, resolvedTheme } = useApp()
  const [os, setOs] = useState<'mac' | 'win' | 'linux'>('mac')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.includes('win')) setOs('win')
      else if (ua.includes('linux')) setOs('linux')
      else setOs('mac')
    }
  }, [])

  const getOsLabel = () => {
    if (os === 'mac') return t.hero.btnDownloadMac
    if (os === 'win') return t.hero.btnDownloadWin
    return t.hero.btnDownloadLinux
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden transition-colors duration-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none -z-10 dark:opacity-100 opacity-60" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium mb-8 shadow-xs">
          <Zap className="w-4 h-4 text-[#06b6d4]" />
          <span>{t.hero.tag}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          {t.hero.headline1}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-cyan-500 dark:to-cyan-300">
            {t.hero.headlineGradient}
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {t.hero.subhead}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#2563eb] to-[#06b6d4] hover:from-[#1d4ed8] hover:to-[#0891b2] shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all text-base transform hover:-translate-y-0.5"
          >
            {os === 'mac' && <Apple className="w-5 h-5" />}
            {os === 'win' && <Monitor className="w-5 h-5" />}
            {os === 'linux' && <Monitor className="w-5 h-5" />}
            <span>
              {t.hero.btnDownloadPrefix} {getOsLabel()}
            </span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>

          <a
            href="#softty-drop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1e293b]/80 hover:bg-slate-100 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-700/60 shadow-xs dark:shadow-none transition-all text-base"
          >
            <Smartphone className="w-4 h-4 text-[#06b6d4]" />
            <span>{t.hero.btnDropMobile}</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>{t.hero.badgeOffline}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#06b6d4]" />
            <span>{t.hero.badgeRust}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>{t.hero.badgeAi}</span>
          </div>
        </div>

        {/* Hero Interactive Mockup */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/20 shadow-2xl border border-slate-200 dark:border-slate-700/60">
          <div className="rounded-xl overflow-hidden bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 text-left shadow-inner">
            {/* Window Title Bar */}
            <div className="h-10 bg-slate-100 dark:bg-[#0e1322] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Softty Office
              </div>
              <div className="w-12" />
            </div>

            {/* App Preview Grid */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-blue-900/40 hover:border-blue-500/50 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  DOCS
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.showcase.apps.docs.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.showcase.apps.docs.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-cyan-900/40 hover:border-cyan-500/50 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-[#06b6d4]">
                  SHEETS
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.showcase.apps.sheets.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.showcase.apps.sheets.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-amber-900/40 hover:border-amber-500/50 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  SLIDES
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.showcase.apps.slides.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.showcase.apps.slides.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-rose-900/40 hover:border-rose-500/50 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400">
                  PDF
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.showcase.apps.pdf.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.showcase.apps.pdf.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  MARKDOWN
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.showcase.apps.markdown.name}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.showcase.apps.markdown.desc}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-emerald-900/40 hover:border-emerald-500/50 transition-colors shadow-xs dark:shadow-none">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  SOFTTY DROP
                </span>
                <h4 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {t.nav.softtyDrop}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {t.softtyDrop.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
