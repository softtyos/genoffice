'use client'

import React from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SofttyMark } from './SofttyMark'

export function ComparisonSection() {
  const { t } = useApp()

  return (
    <section className="py-24 bg-white dark:bg-[#0a0f1d] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-[#06b6d4] uppercase">
            {t.comparison.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.comparison.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.comparison.desc}
          </p>
        </div>

        {/* Comparison Table / Card */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl dark:shadow-2xl bg-white dark:bg-[#131b2e]">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200 dark:border-slate-800">
            {/* Traditional Office Header */}
            <div className="p-6 bg-slate-50 dark:bg-[#0e1322] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lựa Chọn Cũ
              </span>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">
                {t.comparison.colTraditional}
              </h3>
            </div>

            {/* Softty Office Header */}
            <div className="p-6 bg-blue-50/60 dark:bg-blue-950/30 text-center relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#06b6d4] text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thế Hệ Mới</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <SofttyMark size={28} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Softty <span className="text-[#06b6d4]">Office</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {t.comparison.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2">
                {/* Traditional Side */}
                <div className="p-5 md:p-6 bg-slate-50/50 dark:bg-[#0e1322]/50 md:border-r border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {item.label}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.traditional}
                    </p>
                  </div>
                </div>

                {/* Softty Side */}
                <div className="p-5 md:p-6 bg-white dark:bg-[#131b2e] flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-[#06b6d4] uppercase tracking-wider block mb-1">
                      {item.label}
                    </span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                      {item.softty}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
