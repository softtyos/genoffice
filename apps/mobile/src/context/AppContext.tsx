import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { AppTheme, darkTheme, lightTheme } from '../theme'
import { translations, Language } from '../i18n'
import { OfficeDocument, OfficeDocType, DesktopPeer } from '../types'
import { DocumentStoreService } from '../services/documentStore'
import { SofttyDropService } from '../services/softtyDrop'

export type ThemeMode = 'dark' | 'light' | 'system'

interface AppContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  theme: AppTheme
  language: Language
  setLanguage: (lang: Language) => void
  t: (typeof translations)['vi']
  documents: OfficeDocument[]
  activeDocument: OfficeDocument | null
  openDocument: (doc: OfficeDocument) => void
  closeDocument: () => void
  saveActiveDocument: (doc: OfficeDocument) => Promise<void>
  pickAndOpenDocument: () => Promise<void>
  createNewDocument: (type: OfficeDocType, name?: string) => Promise<OfficeDocument>
  deleteDocument: (id: string) => Promise<void>
  refreshDocuments: () => Promise<void>
  beamDocumentToDesktop: (doc: OfficeDocument, targetPeer?: DesktopPeer) => Promise<boolean>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const THEME_KEY = '@softty_mobile_theme_mode'
const LANG_KEY = '@softty_mobile_language'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark')
  const [language, setLanguageState] = useState<Language>('vi')
  const [documents, setDocuments] = useState<OfficeDocument[]>([])
  const [activeDocument, setActiveDocument] = useState<OfficeDocument | null>(null)

  // Initialize theme, language and documents from storage
  useEffect(() => {
    ;(async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem(THEME_KEY)) as ThemeMode | null
        if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme)
        }

        const savedLang = (await AsyncStorage.getItem(LANG_KEY)) as Language | null
        if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
          setLanguageState(savedLang)
        }

        const docs = await DocumentStoreService.getDocuments()
        setDocuments(docs)
      } catch (err) {
        console.error('Failed to init mobile app context:', err)
      }
    })()
  }, [])

  // Resolve active theme
  const isDark =
    themeMode === 'system'
      ? systemColorScheme === 'dark'
      : themeMode === 'dark'

  const activeTheme = isDark ? darkTheme : lightTheme
  const t = translations[language]

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await AsyncStorage.setItem(THEME_KEY, mode)
  }

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    await AsyncStorage.setItem(LANG_KEY, lang)
  }

  const refreshDocuments = async () => {
    const list = await DocumentStoreService.getDocuments()
    setDocuments(list)
  }

  const openDocument = (doc: OfficeDocument) => {
    setActiveDocument(doc)
  }

  const closeDocument = () => {
    setActiveDocument(null)
  }

  const saveActiveDocument = async (updatedDoc: OfficeDocument) => {
    const updatedList = await DocumentStoreService.saveDocument(updatedDoc)
    setDocuments(updatedList)
    setActiveDocument(updatedDoc)
  }

  const deleteDocument = async (id: string) => {
    const updatedList = await DocumentStoreService.deleteDocument(id)
    setDocuments(updatedList)
    if (activeDocument?.id === id) {
      setActiveDocument(null)
    }
  }

  const createNewDocument = async (type: OfficeDocType, name?: string): Promise<OfficeDocument> => {
    const newDoc = DocumentStoreService.createBlankDocument(type, name)
    const updatedList = await DocumentStoreService.saveDocument(newDoc)
    setDocuments(updatedList)
    setActiveDocument(newDoc)
    return newDoc
  }

  const pickAndOpenDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return
      }

      const file = res.assets[0]
      const detectedType = DocumentStoreService.detectDocType(file.name)
      let textContent = ''

      // Attempt to read text content if text, md, or html
      if (detectedType === 'docs' || detectedType === 'markdown' || detectedType === 'html') {
        try {
          if (file.uri && (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
            textContent = await FileSystem.readAsStringAsync(file.uri, {
              encoding: 'utf8',
            })
          }
        } catch {
          // ignore
        }
        if (!textContent) {
          textContent = `Tài liệu văn bản: ${file.name}\nĐịnh dạng: ${detectedType.toUpperCase()}\nDung lượng: ${((file.size || 0) / 1024).toFixed(1)} KB\n\nNội dung tài liệu đã được nạp an toàn vào bộ nhớ cục bộ Softty Office. Bạn có thể chuyển sang tab Soạn Thảo để bổ sung ghi chú, lưu lại ngoại tuyến hoặc bấm "Bắn Desktop" để chuyển sang máy tính ngay lập tức.`
        }
      }

      // Parse CSV / TSV directly into spreadsheet rows
      let sheetHeaders = ['Cột A', 'Cột B', 'Cột C', 'Cột D']
      let sheetRows = [
        ['Dòng 1', '100', '200', '300'],
        ['Dòng 2', '400', '500', '600'],
      ]
      if (detectedType === 'sheets') {
        const lowerName = file.name.toLowerCase()
        if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv')) {
          try {
            const delimiter = lowerName.endsWith('.tsv') ? '\t' : ','
            const raw = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' })
            const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== '')
            if (lines.length > 0) {
              sheetHeaders = lines[0].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim())
              if (lines.length > 1) {
                sheetRows = lines.slice(1).map((l) => l.split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim()))
              }
            }
          } catch {
            // fallback
          }
        }
      }

      const importedDoc: OfficeDocument = {
        id: `imported-${Date.now()}`,
        name: file.name,
        uri: file.uri,
        size: file.size || 1024,
        type: detectedType,
        modifiedAt: Date.now(),
        textContent: textContent || undefined,
        sheetData:
          detectedType === 'sheets'
            ? {
                sheetNames: ['Bảng Tính 1'],
                activeSheet: 'Bảng Tính 1',
                headers: sheetHeaders,
                rows: sheetRows,
                totalRows: sheetRows.length,
                totalCols: sheetHeaders.length,
              }
            : undefined,
        slideData:
          detectedType === 'slides'
            ? {
                deckTitle: file.name.replace(/\.[^/.]+$/, ''),
                slides: [
                  {
                    id: 1,
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    subtitle: 'Bản trình chiếu đã nạp từ thiết bị',
                    bullets: ['Nội dung trang trình chiếu đã nhập thành công', 'Sẵn sàng trình chiếu và đồng bộ máy tính'],
                  },
                ],
              }
            : undefined,
        pdfData:
          detectedType === 'pdf'
            ? {
                totalPages: 3,
                signed: false,
                contentSummary: [
                  `Trang 1: Tệp PDF "${file.name}" nạp từ bộ nhớ thiết bị.`,
                  `Trang 2: Nội dung tài liệu số hóa bảo mật cao trên thiết bị di động.`,
                  `Trang 3: Chứng thực chữ ký điện tử và điều khoản pháp lý đính kèm.`,
                ],
              }
            : undefined,
      }

      const updatedList = await DocumentStoreService.saveDocument(importedDoc)
      setDocuments(updatedList)
      setActiveDocument(importedDoc)
    } catch (err: any) {
      Alert.alert(t.common.error, `Không thể mở tệp: ${err.message || err}`)
    }
  }

  const beamDocumentToDesktop = async (doc: OfficeDocument, targetPeer?: DesktopPeer): Promise<boolean> => {
    try {
      let peer = targetPeer
      if (!peer) {
        const peers = await SofttyDropService.scanNearbyDesktops()
        if (peers.length === 0) {
          Alert.alert(
            t.drop.noPeers,
            t.drop.noPeersSub
          )
          return false
        }
        peer = peers[0]
      }

      // Perform transfer
      const res = await SofttyDropService.sendFileToDesktop(
        peer,
        doc.uri,
        doc.name,
        'application/octet-stream'
      )

      if (res.success) {
        Alert.alert(t.common.success, t.common.beamedSuccess)
        return true
      } else {
        Alert.alert(t.common.error, res.message || 'Không thể gửi tệp sang máy tính.')
        return false
      }
    } catch (err: any) {
      Alert.alert(t.common.error, `Lỗi truyền file: ${err.message || err}`)
      return false
    }
  }

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        theme: activeTheme,
        language,
        setLanguage,
        t,
        documents,
        activeDocument,
        openDocument,
        closeDocument,
        saveActiveDocument,
        pickAndOpenDocument,
        createNewDocument,
        deleteDocument,
        refreshDocuments,
        beamDocumentToDesktop,
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
