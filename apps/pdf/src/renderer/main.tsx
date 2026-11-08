import { createRoot } from 'react-dom/client'
import { htmlDir, htmlLang, type Lang } from '@softty/i18n'
import App from './App'
import { LocaleProvider } from './i18n/locale'
import type { UiTheme } from '../shared/ipc'
import '@softty/ui/tokens.css'
import '@softty/ui/screentip.css'
import '@softty/ui/ai-model-picker.css'
import '@softty/ui/ai-queue-strip.css'
import '@softty/ui/ai-usage.css'
import '@softty/ui/ai-skills.css'
import '@softty/ui/color-picker.css'
import '@softty/ui/dropdown.css'
import '@softty/ui/ribbon-collapse.css'
import '@softty/ui/markdown.css'
import '@softty/ui/ai-panel-prefs.css'
import '@softty/ui/ai-scope-quote.css'
import './styles.css'
import { applyAiPanelPrefs, installScreenTips } from '@softty/ui'

installScreenTips()

function applyTheme(theme: UiTheme): void {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', theme)
}

void (async () => {
  const [lang, theme] = await Promise.all([
    window.pdfApi.getLanguage().catch(() => 'zh' as const),
    window.pdfApi.getTheme().catch(() => 'system' as const),
  ])
  document.documentElement.lang = htmlLang(lang as Lang)
  document.documentElement.dir = htmlDir(lang)
  applyTheme(theme)
  window.pdfApi.onThemeChanged(applyTheme)
  await window.pdfApi
    ?.getAiPanelPrefs?.()
    .then(applyAiPanelPrefs)
    .catch(() => {})
  window.pdfApi?.onAiPanelPrefsChanged?.(applyAiPanelPrefs)
  createRoot(document.getElementById('root')!).render(
    <LocaleProvider initial={lang}>
      <App />
    </LocaleProvider>,
  )
})()
