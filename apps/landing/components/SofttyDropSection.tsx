'use client'

import React from 'react'
import { Wifi, Send, CheckCircle2, Laptop, Smartphone, ShieldCheck, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function SofttyDropSection() {
  const { t } = useApp()

  return (
    <section id="softty-drop" className="py-24 bg-slate-100/70 dark:bg-[#0a0f1d] border-t border-slate-200 dark:border-slate-800 relative overflow-hidden transition-colors duration-200">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none -z-10 dark:opacity-100 opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Descriptions */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-cyan-700 dark:text-[#06b6d4] text-xs font-semibold mb-4 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.softtyDrop.tag}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t.softtyDrop.title}
            </h2>

            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.softtyDrop.desc}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none">
                <Wifi className="w-5 h-5 text-cyan-600 dark:text-[#06b6d4] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.softtyDrop.f1Title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.softtyDrop.f1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.softtyDrop.f2Title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.softtyDrop.f2Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.softtyDrop.f3Title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.softtyDrop.f3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="relative">
            <div className="rounded-2xl p-6 bg-white dark:bg-gradient-to-b dark:from-[#131b2e] dark:to-[#0e1322] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl relative">
              {/* Transfer Simulation Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.softtyDrop.simReady}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {t.softtyDrop.simScanning}
                  </span>
                </div>

                {/* Device 1: Mobile */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-slate-200 dark:border-slate-800 shadow-xs dark:shadow-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">iPhone 16 Pro</h5>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{t.softtyDrop.simSenderSub}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">
                    {t.softtyDrop.simSenderBadge}
                  </span>
                </div>

                {/* Animated Transfer Beam */}
                <div className="flex items-center justify-center py-2 text-xs font-mono text-cyan-700 dark:text-[#06b6d4] font-medium gap-2">
                  <span>{t.softtyDrop.simFile}</span>
                  <Send className="w-4 h-4 animate-bounce" />
                </div>

                {/* Device 2: Desktop */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0e1322] border border-emerald-300 dark:border-emerald-500/30 shadow-xs dark:shadow-lg dark:shadow-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">MacBook Pro (Bonglv)</h5>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.softtyDrop.simReceiverSub}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-medium">
                    {t.softtyDrop.simReceiverBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
