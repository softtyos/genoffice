'use client'

import React from 'react'
import { ShieldCheck, HardDrive, KeyRound, Cpu } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function PrivacySecurity() {
  const { t } = useApp()

  const icons = [HardDrive, KeyRound, ShieldCheck, Cpu]

  return (
    <section id="security" className="py-24 bg-slate-100/70 dark:bg-[#0a0f1d] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            {t.security.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.security.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.security.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.security.points.map((pt, idx) => {
            const Icon = icons[idx] || ShieldCheck
            return (
              <div
                key={idx}
                className="flex gap-5 p-8 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-slate-700 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{pt.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{pt.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
