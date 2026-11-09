export interface DesktopPeer {
  id: string
  name: string
  ip: string
  port: number
  deviceType: 'mac' | 'windows' | 'linux'
  lastSeen: number
}

export interface TransferProgress {
  fileName: string
  fileSize: number
  progress: number // 0 to 1
  status: 'idle' | 'transferring' | 'success' | 'error'
  errorMessage?: string
}

export interface ScannedPage {
  id: string
  uri: string
  width: number
  height: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  tier: 'free' | 'pro' | 'enterprise'
}

export type OfficeDocType = 'docs' | 'sheets' | 'slides' | 'pdf' | 'markdown' | 'html'

export interface SheetStructure {
  sheetNames: string[]
  activeSheet: string
  headers: string[]
  rows: (string | number)[][]
  totalRows: number
  totalCols: number
}

export interface SlideItem {
  id: number
  title: string
  subtitle?: string
  bullets: string[]
  notes?: string
}

export interface SlideDeckStructure {
  deckTitle: string
  slides: SlideItem[]
}

export interface PdfDocumentStructure {
  totalPages: number
  signed: boolean
  signedAt?: string
  signatureName?: string
  contentSummary: string[]
}

export interface OfficeDocument {
  id: string
  name: string
  uri: string
  size: number
  type: OfficeDocType
  modifiedAt: number
  isSample?: boolean
  textContent?: string
  sheetData?: SheetStructure
  slideData?: SlideDeckStructure
  pdfData?: PdfDocumentStructure
}
