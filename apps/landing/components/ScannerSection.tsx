'use client'

import React from 'react'
import { Camera, Sparkles, Layers } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function ScannerSection() {
  const { t } = useApp()

  return (
    <section id="scanner" className="py-24 bg-slate-50 dark:bg-[#0e1322] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            {t.scanner.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.scanner.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.scanner.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 flex flex-col items-start shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">{t.scanner.step1Tag}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{t.scanner.step1Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              {t.scanner.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 flex flex-col items-start shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-700 dark:text-[#06b6d4] mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-cyan-700 dark:text-[#06b6d4]">{t.scanner.step2Tag}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{t.scanner.step2Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              {t.scanner.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 flex flex-col items-start shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">{t.scanner.step3Tag}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{t.scanner.step3Title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              {t.scanner.step3Desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
