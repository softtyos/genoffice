'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { useApp } from '@/context/AppContext'

export default function TermsPage() {
  const { t } = useApp()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0e1322] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-[#06b6d4] hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.termsPage.backHome}
          </Link>

          {/* Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-8 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-[#06b6d4] text-xs font-semibold mb-4">
              <FileText className="w-3.5 h-3.5" />
              <span>{t.termsPage.tag}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.termsPage.title}
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t.termsPage.lastUpdated}
            </p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.termsPage.intro}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {t.termsPage.sections.map((section, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800/80"
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {section.heading}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Trust Badge */}
          <div className="mt-12 p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-[#06b6d4] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Bảo Vệ Người Dùng & Bản Quyền
              </p>
              Softty Office là sản phẩm thuộc SOFTTY.NET CO., LTD. Mọi quyền được bảo lưu theo quy định pháp luật.
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
