'use client'

import React from 'react'
import { FileText, Table, Presentation, FileCode, CheckCircle2, Code2, LayoutDashboard } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export function ShowcaseSection() {
  const { t } = useApp()

  const apps = [
    {
      id: 'docs',
      name: t.showcase.apps.docs.name,
      badge: t.showcase.apps.docs.badge,
      color: 'from-blue-600 to-blue-400',
      icon: FileText,
      desc: t.showcase.apps.docs.desc,
      features: t.showcase.apps.docs.features,
    },
    {
      id: 'sheets',
      name: t.showcase.apps.sheets.name,
      badge: t.showcase.apps.sheets.badge,
      color: 'from-cyan-600 to-teal-400',
      icon: Table,
      desc: t.showcase.apps.sheets.desc,
      features: t.showcase.apps.sheets.features,
    },
    {
      id: 'slides',
      name: t.showcase.apps.slides.name,
      badge: t.showcase.apps.slides.badge,
      color: 'from-amber-600 to-orange-400',
      icon: Presentation,
      desc: t.showcase.apps.slides.desc,
      features: t.showcase.apps.slides.features,
    },
    {
      id: 'pdf',
      name: t.showcase.apps.pdf.name,
      badge: t.showcase.apps.pdf.badge,
      color: 'from-rose-600 to-red-400',
      icon: FileCode,
      desc: t.showcase.apps.pdf.desc,
      features: t.showcase.apps.pdf.features,
    },
    {
      id: 'markdown',
      name: t.showcase.apps.markdown.name,
      badge: t.showcase.apps.markdown.badge,
      color: 'from-purple-600 to-indigo-400',
      icon: Code2,
      desc: t.showcase.apps.markdown.desc,
      features: t.showcase.apps.markdown.features,
    },
    {
      id: 'html',
      name: t.showcase.apps.html.name,
      badge: t.showcase.apps.html.badge,
      color: 'from-emerald-600 to-teal-400',
      icon: LayoutDashboard,
      desc: t.showcase.apps.html.desc,
      features: t.showcase.apps.html.features,
    },
  ]

  return (
    <section id="apps" className="py-20 bg-slate-50 dark:bg-[#0e1322] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-[#06b6d4] uppercase">
            {t.showcase.tag}
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.showcase.title}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t.showcase.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.id}
                className="relative rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800/80 p-7 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-blue-900/10 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {app.badge}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-[#06b6d4] transition-colors">
                        {app.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {app.desc}
                  </p>
                </div>

                <ul className="space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                  {app.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
