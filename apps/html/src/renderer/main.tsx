import { createRoot } from 'react-dom/client'
import { htmlDir, htmlLang, type Lang } from '@softty/i18n'
import App from './App'
import { PresentView } from './PresentView'
import { LocaleProvider } from './i18n/locale'
import type { UiTheme } from '../shared/ipc'
import { applyAiPanelPrefs, installScreenTips } from '@softty/ui'
import '@softty/ui/tokens.css'
import '@softty/ui/screentip.css'
import '@softty/ui/ai-model-picker.css'
import '@softty/ui/ai-queue-strip.css'
import '@softty/ui/ai-usage.css'
import '@softty/ui/ai-skills.css'
import '@softty/ui/dropdown.css'
import '@softty/ui/find-panel.css'
import '@softty/ui/color-picker.css'
import '@softty/ui/ribbon-collapse.css'
import '@softty/ui/ai-panel-prefs.css'
import '@softty/ui/ai-scope-quote.css'
import '@softty/ui/image-dialogs.css'
import './styles.css'

installScreenTips()

function applyTheme(theme: UiTheme): void {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', theme)
}

void (async () => {
  const [lang, theme] = await Promise.all([
    window.htmlApi.getLanguage().catch(() => 'zh' as const),
    window.htmlApi.getTheme().catch(() => 'system' as const),
  ])
  document.documentElement.lang = htmlLang(lang as Lang)
  document.documentElement.dir = htmlDir(lang)
  applyTheme(theme)
  window.htmlApi.onThemeChanged(applyTheme)
  await window.htmlApi
    ?.getAiPanelPrefs?.()
    .then(applyAiPanelPrefs)
    .catch(() => {})
  window.htmlApi?.onAiPanelPrefsChanged?.(applyAiPanelPrefs)
  // a present tab/window (opened by Present → New tab) renders only its owner's preview
  const params = new URLSearchParams(location.search)
  const present = params.has('present')
  createRoot(document.getElementById('root')!).render(
    <LocaleProvider initial={lang}>
      {present ? <PresentView title={params.get('title') ?? ''} /> : <App />}
    </LocaleProvider>,
  )
})()
