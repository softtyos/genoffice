'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function FaqSection() {
  const { t } = useApp()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0e1322] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-[#06b6d4] uppercase">
            {t.faq.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.faq.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.faq.desc}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {t.faq.items.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-xs dark:shadow-none transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-slate-900 dark:text-white pr-4">
                    {item.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-[#06b6d4]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
