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
          if (file.uri) {
            textContent = await FileSystem.readAsStringAsync(file.uri, {
              encoding: 'utf8',
            })
          }
        } catch {
          textContent = `Nội dung tệp: ${file.name}\nKích thước: ${(file.size || 0) / 1024} KB`
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
                sheetNames: ['Sheet1'],
                activeSheet: 'Sheet1',
                headers: ['Cột A', 'Cột B', 'Cột C', 'Cột D'],
                rows: [
                  ['Dòng 1', '100', '200', '300'],
                  ['Dòng 2', '400', '500', '600'],
                ],
                totalRows: 2,
                totalCols: 4,
              }
            : undefined,
        slideData:
          detectedType === 'slides'
            ? {
                deckTitle: file.name.replace(/\.[^/.]+$/, ''),
                slides: [
                  {
                    id: 1,
                    title: file.name,
                    bullets: ['Nội dung trang trình chiếu đã nhập', 'Đồng bộ từ thiết bị di động'],
                  },
                ],
              }
            : undefined,
        pdfData:
          detectedType === 'pdf'
            ? {
                totalPages: 2,
                signed: false,
                contentSummary: [`Tệp PDF nhập từ thiết bị: ${file.name}`],
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
