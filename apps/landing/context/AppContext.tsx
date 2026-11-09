'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations, Language } from '../i18n/translations'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface AppContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (typeof translations)['vi']
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')
  const [language, setLanguageState] = useState<Language>('vi')
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage or OS on client mount
  useEffect(() => {
    // 1. Language init
    const savedLang = localStorage.getItem('softty_office_landing_lang') as Language | null
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLanguageState(savedLang)
      document.documentElement.lang = savedLang
    } else {
      const browserLang = navigator.language?.toLowerCase() || ''
      const defaultLang: Language = browserLang.startsWith('vi') ? 'vi' : 'en'
      setLanguageState(defaultLang)
      document.documentElement.lang = defaultLang
    }

    // 2. Theme init
    const savedTheme = localStorage.getItem('softty_office_landing_theme') as Theme | null
    const initialTheme: Theme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme) ? savedTheme : 'dark'
    setThemeState(initialTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const resolve = (th: Theme): ResolvedTheme => {
      if (th === 'system') {
        return mediaQuery.matches ? 'dark' : 'light'
      }
      return th
    }

    const res = resolve(initialTheme)
    setResolvedTheme(res)
    applyThemeDOM(res, initialTheme)

    // Listener for system preference change
    const listener = (e: MediaQueryListEvent) => {
      setThemeState((currentTheme) => {
        if (currentTheme === 'system') {
          const newRes: ResolvedTheme = e.matches ? 'dark' : 'light'
          setResolvedTheme(newRes)
          applyThemeDOM(newRes, 'system')
        }
        return currentTheme
      })
    }

    mediaQuery.addEventListener('change', listener)
    setMounted(true)

    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const applyThemeDOM = (resolved: ResolvedTheme, current: Theme) => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('softty_office_landing_theme', newTheme)

    let res: ResolvedTheme = 'dark'
    if (newTheme === 'system') {
      res = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      res = newTheme
    }

    setResolvedTheme(res)
    applyThemeDOM(res, newTheme)
  }

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('softty_office_landing_lang', lang)
    document.documentElement.lang = lang
  }

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  const t = translations[language]

  return (
    <AppContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
