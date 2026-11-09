export interface AppTheme {
  isDark: boolean
  bg: string
  bgSurface: string
  bgElevated: string
  bgSubtle: string
  border: string
  borderSubtle: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  primary: string
  primaryHover: string
  cyan: string
  emerald: string
  amber: string
  rose: string
  purple: string
  badgeBg: string
  badgeBorder: string
  cardBg: string
  tabBarBg: string
  tabBarBorder: string
  inputBg: string
  inputBorder: string
}

export const darkTheme: AppTheme = {
  isDark: true,
  bg: '#0e1322',
  bgSurface: '#131b2e',
  bgElevated: '#1a233b',
  bgSubtle: '#0a0f1d',
  border: '#1e293b',
  borderSubtle: '#192237',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#a855f7',
  badgeBg: '#1e293b',
  badgeBorder: '#334155',
  cardBg: '#131b2e',
  tabBarBg: '#0e1322',
  tabBarBorder: '#1e293b',
  inputBg: '#131b2e',
  inputBorder: '#1e293b',
}

export const lightTheme: AppTheme = {
  isDark: false,
  bg: '#f8fafc',
  bgSurface: '#ffffff',
  bgElevated: '#f1f5f9',
  bgSubtle: '#e2e8f0',
  border: '#e2e8f0',
  borderSubtle: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  cyan: '#0891b2',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  purple: '#9333ea',
  badgeBg: '#f1f5f9',
  badgeBorder: '#e2e8f0',
  cardBg: '#ffffff',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e2e8f0',
  inputBg: '#f1f5f9',
  inputBorder: '#e2e8f0',
}
