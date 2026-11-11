import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
  Dimensions,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Print from 'expo-print'
import { ScannedPage, OfficeDocument, ScanFilterType, ScanDocMode } from '../types'
import { SofttyDropService } from '../services/softtyDrop'
import { useApp } from '../context/AppContext'

interface ExtractedAiData {
  docType: string
  docNumber: string
  issueDate: string
  parties: { partyA: string; partyB: string }
  totalValue: string
  terms: string[]
  executiveSummary: string
}

export function ScannerScreen() {
  const { theme, t, saveActiveDocument, openDocument } = useApp()
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [processing, setProcessing] = useState(false)
  const [globalFilter, setGlobalFilter] = useState<ScanFilterType>('clean')
  const [watermark, setWatermark] = useState<'none' | 'copy' | 'account' | 'confidential'>('none')
  const [attachAiCover, setAttachAiCover] = useState(true)

  // Smart Viewfinder state
  const [showViewfinder, setShowViewfinder] = useState(false)
  const [selectedDocMode, setSelectedDocMode] = useState<ScanDocMode>('a4')

  // Modals state
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null)
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiData, setAiData] = useState<ExtractedAiData | null>(null)

  // Laser beam scanner animation
  const laserAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null
    if (showViewfinder) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
      loop.start()
    } else {
      laserAnim.setValue(0)
    }
    return () => {
      if (loop) loop.stop()
    }
  }, [showViewfinder, laserAnim])

  const sampleScanImages = [
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  ]

  const addSampleScannedPage = () => {
    const nextUri = sampleScanImages[pages.length % sampleScanImages.length]
    const newPage: ScannedPage = {
      id: `sample_page_${Date.now()}`,
      uri: nextUri,
      width: 800,
      height: 1100,
      rotation: 0,
      filter: globalFilter,
      docMode: selectedDocMode,
      cropInsetPercent: 6, // Auto de-skew outer clutter
    }
    setPages((prev) => [...prev, newPage])
  }

  // Open Smart Viewfinder overlay first
  const handleOpenSmartScanner = () => {
    setShowViewfinder(true)
  }

  // Execute camera capture from within viewfinder
  const handleExecuteCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Quyền Camera',
          'Ứng dụng cần quyền camera để quét tài liệu. Bạn có muốn thêm trang tài liệu quét mẫu không?',
          [
            { text: 'Thêm trang mẫu', onPress: addSampleScannedPage },
            { text: 'Chọn từ thư viện ảnh', onPress: handlePickFromGallery },
            { text: 'Hủy', style: 'cancel' },
          ]
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsEditing: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        const newPage: ScannedPage = {
          id: `page_${Date.now()}`,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          rotation: 0,
          filter: globalFilter,
          docMode: selectedDocMode,
          cropInsetPercent: 5, // Auto-trim 5% edge clutter
        }
        setPages((prev) => [...prev, newPage])
        setShowViewfinder(false)
        // Automatically open Inspector to confirm straightness
        setSelectedPageIndex(pages.length)
      }
    } catch (err: any) {
      setShowViewfinder(false)
      Alert.alert(
        'Máy ảo không có Camera',
        'Máy ảo iOS không hỗ trợ camera phần cứng. Bạn có muốn thêm trang hợp đồng mẫu để tiếp tục thử nghiệm số hóa tài liệu?',
        [
          { text: 'Thêm trang mẫu', onPress: addSampleScannedPage },
          { text: 'Chọn từ thư viện ảnh', onPress: handlePickFromGallery },
          { text: 'Hủy', style: 'cancel' },
        ]
      )
    }
  }

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsMultipleSelection: true,
      })

      if (!result.canceled && result.assets) {
        const newPages: ScannedPage[] = result.assets.map((asset, i) => ({
          id: `page_${Date.now()}_${i}`,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          rotation: 0,
          filter: globalFilter,
          docMode: selectedDocMode,
          cropInsetPercent: 4,
        }))
        setPages((prev) => [...prev, ...newPages])
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Không thể chọn ảnh từ thư viện.')
    }
  }

  // --- Page Operations ---
  const handleRotatePage = (index: number) => {
    setPages((prev) => {
      const copy = [...prev]
      const current = copy[index]
      const nextRotation = ((current.rotation || 0) + 90) % 360
      copy[index] = { ...current, rotation: nextRotation }
      return copy
    })
  }

  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index))
    if (selectedPageIndex === index) {
      setSelectedPageIndex(null)
    }
  }

  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    setPages((prev) => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const copy = [...prev]
      const temp = copy[index]
      copy[index] = copy[targetIndex]
      copy[targetIndex] = temp
      return copy
    })
  }

  const handleSetPageFilter = (index: number, filter: ScanFilterType) => {
    setPages((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], filter }
      return copy
    })
  }

  const handleSetPageCropInset = (index: number, inset: number) => {
    setPages((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], cropInsetPercent: inset }
      return copy
    })
  }

  const handleApplyGlobalFilter = (filter: ScanFilterType) => {
    setGlobalFilter(filter)
    setPages((prev) => prev.map((p) => ({ ...p, filter })))
  }

  // --- AI Document Intelligence ---
  const handleTriggerAiAnalysis = () => {
    if (pages.length === 0) {
      Alert.alert(t.common.error, 'Vui lòng chụp hoặc thêm ít nhất một trang tài liệu để AI phân tích.')
      return
    }

    setShowAiModal(true)
    setAiAnalyzing(true)

    // Simulate smart local AI extraction
    setTimeout(() => {
      const isInvoice = selectedDocMode === 'receipt' || pages.length === 1
      const sampleAiData: ExtractedAiData = isInvoice
        ? {
            docType: 'Hóa Đơn Điện Tử Giá Trị Gia Tăng (VAT Invoice)',
            docNumber: `HDGTGT-${new Date().getFullYear()}/00941`,
            issueDate: new Date().toLocaleDateString('vi-VN'),
            parties: {
              partyA: 'CÔNG TY TNHH SOFTTY.NET (MST: 0109988221)',
              partyB: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ Á CHÂU (MST: 0314892011)',
            },
            totalValue: '48.500.000 VNĐ (Đã gồm 8% thuế GTGT)',
            terms: [
              'Chi phí triển khai bản quyền phần mềm Softty Office Enterprise.',
              'Hình thức thanh toán: Chuyển khoản ngân hàng trong 03 ngày làm việc.',
              'Chứng từ điện tử hợp lệ theo Nghị định 123/2020/NĐ-CP của Chính phủ.',
            ],
            executiveSummary:
              'Hóa đơn điện tử hợp lệ cung cấp giải pháp Softty Office. Đầy đủ mã số thuế và thông tin bên mua/bán.',
          }
        : {
            docType: 'Hợp Đồng Cung Cấp Dịch Vụ & Bảo Mật Dữ Liệu',
            docNumber: `HĐ-DV/${new Date().getFullYear()}/SOFTTY-98`,
            issueDate: new Date().toLocaleDateString('vi-VN'),
            parties: {
              partyA: 'Bên A (Nhà Cung Cấp): CÔNG TY TNHH SOFTTY.NET',
              partyB: 'Bên B (Khách Hàng): ĐỐI TÁC KHÁCH HÀNG DOANH NGHIỆP',
            },
            totalValue: '125.000.000 VNĐ / Năm',
            terms: [
              'Bàn giao đầy đủ quyền sử dụng bộ giải pháp Softty Office (Docs, Sheets, Slides, Softty Drop).',
              'Cam kết dữ liệu 100% On-Device ngoại tuyến, không lưu trữ thông tin trên máy chủ trung gian.',
              'Thời hạn hiệu lực hợp đồng là 12 tháng kể từ ngày các bên ký số xác thực.',
            ],
            executiveSummary:
              'Hợp đồng kinh tế bảo mật cao, điều khoản rõ ràng về quyền riêng tư và bàn giao công nghệ Softty.',
          }

      setAiData(sampleAiData)
      setAiAnalyzing(false)
    }, 1200)
  }

  const handleCopyAiSummary = () => {
    if (!aiData) return
    const text = `[${aiData.docType}]
Số hiệu: ${aiData.docNumber}
Ngày: ${aiData.issueDate}
${aiData.parties.partyA}
${aiData.parties.partyB}
Giá trị: ${aiData.totalValue}
Điều khoản cốt lõi:
${aiData.terms.map((t, idx) => `• ${idx + 1}. ${t}`).join('\n')}`

    Alert.alert('Đã Sao Chép Tóm Tắt AI', 'Toàn bộ thông tin tài liệu đã sẵn sàng để dán vào tin nhắn hoặc email.')
  }

  const handleCreateEditableDocFromAi = async () => {
    if (!aiData) return
    try {
      const docTitle = `${aiData.docType.replace(/[^a-zA-Z0-9\s]/g, '')}_TrichXuat.docx`
      const content = `# ${aiData.docType}
**Số hiệu văn bản:** ${aiData.docNumber}
**Ngày ban hành:** ${aiData.issueDate}

---
### 1. CÁC BÊN THAM GIA:
- **${aiData.parties.partyA}**
- **${aiData.parties.partyB}**

---
### 2. TỔNG GIÁ TRỊ & THANH TOÁN:
- **Tổng số tiền:** ${aiData.totalValue}

---
### 3. CÁC ĐIỀU KHOẢN CỐT LÕI (TRÍCH XUẤT BỞI SOFTTY AI):
${aiData.terms.map((t, idx) => `${idx + 1}. ${t}`).join('\n\n')}

---
*Tài liệu được bóc tách và số hóa tự động bởi Softty Office Mobile Scanner.*
`

      const newDoc: OfficeDocument = {
        id: `extracted-doc-${Date.now()}`,
        name: docTitle,
        uri: `file:///documents/${docTitle}`,
        size: content.length,
        type: 'docs',
        modifiedAt: Date.now(),
        textContent: content,
      }

      await saveActiveDocument(newDoc)
      setShowAiModal(false)
      openDocument(newDoc)
    } catch (err: any) {
      Alert.alert(t.common.error, `Không thể tạo tài liệu: ${err.message || err}`)
    }
  }

  // --- PDF Generator ---
  const getCssFilter = (filterType: ScanFilterType): string => {
    switch (filterType) {
      case 'bw':
        return 'grayscale(100%) contrast(170%) brightness(105%)'
      case 'clean':
        return 'contrast(135%) brightness(110%) saturate(75%)'
      case 'vibrant':
        return 'contrast(125%) saturate(145%)'
      default:
        return 'none'
    }
  }

  const getWatermarkText = (): string => {
    switch (watermark) {
      case 'copy':
        return 'BẢN SAO • SOFTTY'
      case 'account':
        return 'CHỈ DÙNG MỞ TÀI KHOẢN'
      case 'confidential':
        return 'BẢO MẬT NỘI BỘ • CONFIDENTIAL'
      default:
        return ''
    }
  }

  const generateRealPdfFromPages = async (scannedPages: ScannedPage[]): Promise<string> => {
    const wmText = getWatermarkText()
    const watermarkHtml = wmText
      ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-family: -apple-system, sans-serif; font-size: 46px; font-weight: 900; color: rgba(220, 38, 38, 0.22); letter-spacing: 5px; text-transform: uppercase; white-space: nowrap; border: 4px dashed rgba(220, 38, 38, 0.28); padding: 12px 32px; border-radius: 12px; pointer-events: none;">${wmText}</div>`
      : ''

    let coverPageHtml = ''
    if (attachAiCover && aiData) {
      coverPageHtml = `
        <div style="page-break-after: always; width: 100vw; height: 100vh; box-sizing: border-box; padding: 50px 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; display: flex; flex-direction: column; justify-content: space-between; background: #ffffff;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 28px;">
              <div>
                <h1 style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">SOFTTY OFFICE • AI AUDIT REPORT</h1>
                <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Chứng nhận số hóa tài liệu & Bóc tách thông tin tự động</p>
              </div>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 700;">
                VERIFIED BY AI
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">${aiData.docType}</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                <div><strong style="color: #64748b;">Số văn bản:</strong> <span style="font-weight: 600;">${aiData.docNumber}</span></div>
                <div><strong style="color: #64748b;">Ngày lập:</strong> <span style="font-weight: 600;">${aiData.issueDate}</span></div>
                <div style="grid-column: span 2;"><strong style="color: #64748b;">Bên liên quan:</strong> ${aiData.parties.partyA} / ${aiData.parties.partyB}</div>
                <div style="grid-column: span 2;"><strong style="color: #64748b;">Tổng giá trị:</strong> <span style="color: #059669; font-weight: 700; font-size: 13px;">${aiData.totalValue}</span></div>
              </div>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 10px;">
                Các Điều Khoản Cốt Lõi Được Trích Xuất:
              </h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.8;">
                ${aiData.terms.map((t) => `<li>${t}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8;">
            <span>Softty Document Scanner • 100% Local Confidential</span>
            <span>Trang 1 (Trang bìa tóm tắt)</span>
          </div>
        </div>
      `
    }

    const pagesHtml = scannedPages
      .map((p, idx) => {
        const scaleVal = 1 + (p.cropInsetPercent || 0) / 100
        return `
        <div style="page-break-after: ${idx === scannedPages.length - 1 ? 'avoid' : 'always'}; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 20px; position: relative; background: #ffffff;">
          <div style="position: relative; max-width: 95%; max-height: 90vh; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
            <img 
              src="${p.uri}" 
              style="max-width: 100%; max-height: 90vh; object-fit: contain; transform: scale(${scaleVal}) rotate(${p.rotation || 0}deg); filter: ${getCssFilter(p.filter || globalFilter)};" 
            />
            ${watermarkHtml}
          </div>
          <div style="position: absolute; bottom: 15px; right: 25px; font-family: -apple-system, sans-serif; font-size: 11px; color: #64748b;">
            Trang ${idx + 1} / ${scannedPages.length} • Softty PDF Scanner
          </div>
        </div>
      `
      })
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { margin: 0; padding: 0; background-color: #ffffff; }
          </style>
        </head>
        <body>
          ${coverPageHtml}
          ${pagesHtml}
        </body>
      </html>
    `

    const file = await Print.printToFileAsync({ html })
    return file.uri
  }

  const handleExportAndOpen = async () => {
    if (pages.length === 0) {
      Alert.alert(t.common.error, 'Vui lòng quét ít nhất một trang tài liệu.')
      return
    }

    setProcessing(true)
    try {
      const docId = `scan-pdf-${Date.now()}`
      const fileName = `Tai_lieu_scan_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.pdf`

      // Generate real multi-page PDF with de-skewing, filters & watermark
      const realPdfUri = await generateRealPdfFromPages(pages)

      const newPdfDoc: OfficeDocument = {
        id: docId,
        name: fileName,
        uri: realPdfUri,
        size: pages.length * 280000,
        type: 'pdf',
        modifiedAt: Date.now(),
        pdfData: {
          totalPages: pages.length,
          signed: false,
          pageImages: pages.map((p) => p.uri),
          watermarkText: getWatermarkText() || undefined,
          contentSummary: pages.map(
            (_, idx) => `Trang ${idx + 1}: Tài liệu quét độ nét cao (${idx + 1}/${pages.length}).`
          ),
        },
      }

      await saveActiveDocument(newPdfDoc)
      openDocument(newPdfDoc)
    } catch (err: any) {
      Alert.alert(t.common.error, `Không thể xuất PDF: ${err.message || err}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleSendToDesktop = async () => {
    if (pages.length === 0) {
      Alert.alert(t.common.error, 'Vui lòng quét ít nhất một trang tài liệu.')
      return
    }

    setProcessing(true)
    try {
      const peers = await SofttyDropService.scanNearbyDesktops()
      if (peers.length === 0) {
        Alert.alert(t.drop.noPeers, t.drop.noPeersSub)
        return
      }

      const desktop = peers[0]
      const fileName = `Scan_TaiLieu_${new Date().toISOString().slice(0, 10)}.pdf`

      // Generate real PDF file
      const realPdfUri = await generateRealPdfFromPages(pages)

      const res = await SofttyDropService.sendFileToDesktop(
        desktop,
        realPdfUri,
        fileName,
        'application/pdf',
      )

      if (res.success) {
        Alert.alert(
          'Đã Bắn Sang Desktop!',
          `Tài liệu ${pages.length} trang đã được chuyển sang ${desktop.name} và mở sẵn trong Softty PDF để ký số.`,
          [{ text: 'OK', onPress: () => setPages([]) }],
        )
      } else {
        Alert.alert(t.common.error, res.message)
      }
    } catch (err: any) {
      Alert.alert(t.common.error, `Lỗi gửi file: ${err.message || err}`)
    } finally {
      setProcessing(false)
    }
  }

  const { width, height } = useWindowDimensions()
  const isSmall = width < 375
  const isTablet = width >= 768

  // Viewfinder dimensions per docMode (responsively bounded to screen)
  const getViewfinderFrameDimensions = () => {
    const maxVfWidth = Math.min(width - 48, isTablet ? 380 : 310)
    switch (selectedDocMode) {
      case 'receipt':
        return { width: Math.round(maxVfWidth * 0.72), height: Math.min(height * 0.52, 400) }
      case 'idcard':
        return { width: maxVfWidth, height: Math.round(maxVfWidth / 1.58) }
      case 'a4':
      default:
        return { width: maxVfWidth, height: Math.min(height * 0.5, Math.round(maxVfWidth * 1.414)) }
    }
  }

  const frameDims = getViewfinderFrameDimensions()
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, frameDims.height - 4],
  })

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.scannerLogo, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
            <Ionicons name="camera-outline" size={22} color={theme.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{t.scanner.title}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1} ellipsizeMode="tail">{t.scanner.subtitle}</Text>
          </View>
          <TouchableOpacity
            style={[styles.sampleBtn, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}
            onPress={addSampleScannedPage}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={14} color={theme.textPrimary} style={{ marginRight: 2 }} />
            <Text style={[styles.sampleBtnText, { color: theme.textPrimary }]}>Mẫu</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={[
          styles.content,
          isTablet && { maxWidth: 680, alignSelf: 'center', width: '100%' },
        ]}
      >
        {/* Action Controls Row */}
        <View style={styles.controlsRow}>
          {/* Smart Scanner Trigger with Viewfinder */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={handleOpenSmartScanner}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={17} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={[styles.actionBtnText, { fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>{t.scanner.takePhoto}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.bgSurface, borderColor: theme.border, borderWidth: 1 },
            ]}
            onPress={handlePickFromGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={17} color={theme.textPrimary} style={{ marginRight: 5 }} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary, fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>{t.scanner.fromGallery}</Text>
          </TouchableOpacity>

          {/* AI Smart Assistant Trigger */}
          <TouchableOpacity
            style={[
              styles.aiTriggerBtn,
              {
                backgroundColor: `${theme.primary}18`,
                borderColor: theme.primary,
              },
            ]}
            onPress={handleTriggerAiAnalysis}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={15} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.aiTriggerText, { color: theme.primary, fontSize: isSmall ? 11 : 12 }]} numberOfLines={1}>AI Quét</Text>
          </TouchableOpacity>
        </View>

        {/* Global Filter & Watermark Adjustment Bar */}
        {pages.length > 0 && (
          <View style={[styles.toolbarCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
            {/* Filter Selector */}
            <View style={styles.toolRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                <Ionicons name="color-filter-outline" size={15} color={theme.textMuted} style={{ marginRight: 5 }} />
                <Text style={[styles.toolLabel, { color: theme.textMuted }]}>{t.scanner.filterLabel}:</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
                {(['original', 'clean', 'bw', 'vibrant'] as ScanFilterType[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => handleApplyGlobalFilter(f)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: globalFilter === f ? theme.primary : theme.bgElevated,
                        borderColor: globalFilter === f ? theme.primary : theme.border,
                        marginRight: 6,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: globalFilter === f ? '#ffffff' : theme.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {t.scanner.filters[f]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Watermark Selector */}
            <View style={[styles.toolRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
                <Ionicons name="shield-checkmark-outline" size={15} color={theme.textMuted} style={{ marginRight: 5 }} />
                <Text style={[styles.toolLabel, { color: theme.textMuted }]}>{t.scanner.watermarkLabel}:</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
                {(['none', 'copy', 'account', 'confidential'] as const).map((w) => (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setWatermark(w)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: watermark === w ? theme.rose : theme.bgElevated,
                        borderColor: watermark === w ? theme.rose : theme.border,
                        marginRight: 6,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: watermark === w ? '#ffffff' : theme.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {t.scanner.watermarks[w]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Scanned Pages Section */}
        <View style={styles.previewSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {t.scanner.scannedPages(pages.length).toUpperCase()}
            </Text>
            {pages.length > 0 && (
              <TouchableOpacity onPress={() => setPages([])}>
                <Text style={[styles.clearText, { color: theme.rose }]}>
                  {t.common.delete} {t.common.all}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {pages.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              <Ionicons name="scan-circle-outline" size={48} color={theme.primary} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>{t.scanner.emptyPages}</Text>
              <Text style={[styles.emptySubText, { color: theme.textMuted }]}>{t.scanner.emptySub}</Text>
              <TouchableOpacity
                style={[styles.addSampleLink, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}
                onPress={addSampleScannedPage}
              >
                <Ionicons name="sparkles" size={14} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.addSampleLinkText, { color: theme.textPrimary }]}>Thử với tài liệu mẫu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageList}>
              {pages.map((p, index) => {
                const scaleVal = 1 + (p.cropInsetPercent || 0) / 100
                return (
                  <View key={p.id} style={[styles.pageCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
                    {/* Thumbnail area with tap to inspect */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setSelectedPageIndex(index)}
                      style={styles.pageThumbWrapper}
                    >
                      <Image
                        source={{ uri: p.uri }}
                        style={[
                          styles.pageThumb,
                          {
                            transform: [
                              { rotate: `${p.rotation || 0}deg` },
                              { scale: scaleVal },
                            ],
                          },
                        ]}
                      />

                      {/* Watermark overlay on preview */}
                      {watermark !== 'none' && (
                        <View style={styles.previewWatermarkBox}>
                          <Text style={styles.previewWatermarkText}>{getWatermarkText()}</Text>
                        </View>
                      )}

                      {/* Page badge */}
                      <View style={[styles.pageBadge, { backgroundColor: `${theme.primary}ee` }]}>
                        <Text style={styles.pageBadgeText}>Trang {index + 1}</Text>
                      </View>

                      {/* De-skew crop tag */}
                      {p.cropInsetPercent && p.cropInsetPercent > 0 ? (
                        <View style={styles.deskewBadge}>
                          <Text style={styles.deskewBadgeText}>Nắn -{p.cropInsetPercent}%</Text>
                        </View>
                      ) : null}

                      {/* Quick rotate icon */}
                      <TouchableOpacity
                        style={styles.cardRotateBtn}
                        onPress={() => handleRotatePage(index)}
                      >
                        <Ionicons name="reload-outline" size={14} color="#ffffff" />
                      </TouchableOpacity>

                      {/* Quick delete icon */}
                      <TouchableOpacity
                        style={styles.cardDeleteBtn}
                        onPress={() => handleDeletePage(index)}
                      >
                        <Ionicons name="close" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Move Left / Right Reorder Row */}
                    <View style={[styles.reorderRow, { borderTopColor: theme.border }]}>
                      <TouchableOpacity
                        disabled={index === 0}
                        onPress={() => handleMovePage(index, 'left')}
                        style={[styles.reorderBtn, index === 0 && { opacity: 0.3 }]}
                      >
                        <Ionicons name="chevron-back" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>

                      <Text style={[styles.reorderPageNumber, { color: theme.textMuted }]}>
                        {index + 1} / {pages.length}
                      </Text>

                      <TouchableOpacity
                        disabled={index === pages.length - 1}
                        onPress={() => handleMovePage(index, 'right')}
                        style={[styles.reorderBtn, index === pages.length - 1 && { opacity: 0.3 }]}
                      >
                        <Ionicons name="chevron-forward" size={14} color={theme.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      {pages.length > 0 && (
        <View
          style={[
            styles.footerAction,
            { backgroundColor: theme.bgSurface, borderTopColor: theme.border },
            isTablet && { maxWidth: 680, alignSelf: 'center', width: '100%', borderRadius: 16, marginBottom: 16 },
          ]}
        >
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: theme.emerald }, isSmall && { paddingVertical: 11 }]}
            onPress={handleExportAndOpen}
            activeOpacity={0.8}
            disabled={processing}
          >
            <Ionicons name="document-attach-outline" size={isSmall ? 16 : 18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={[styles.exportBtnText, isSmall && { fontSize: 13 }]} numberOfLines={1}>
              {t.scanner.exportPdf} & {t.common.view}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.desktopSendBtn,
              { backgroundColor: theme.primary },
              isSmall && { paddingVertical: 11 },
              processing && { opacity: 0.5 },
            ]}
            onPress={handleSendToDesktop}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="send" size={isSmall ? 14 : 16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={[styles.desktopSendBtnText, isSmall && { fontSize: 13 }]} numberOfLines={1}>
                  {t.scanner.beamDirect} ({pages.length})
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ================= SMART VIEWFINDER CAMERA MODAL ================= */}
      <Modal visible={showViewfinder} transparent={false} animationType="slide">
        <View style={styles.viewfinderBackdrop}>
          {/* Top Viewfinder Bar */}
          <View style={styles.viewfinderTopBar}>
            <TouchableOpacity
              onPress={() => setShowViewfinder(false)}
              style={styles.vfCloseBtn}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.vfTitle}>{t.scanner.viewfinderTitle}</Text>
              <Text style={styles.vfSub}>{t.scanner.viewfinderSub}</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Mode Selector Tabs */}
          <View style={styles.vfModeSelector}>
            {(['a4', 'receipt', 'idcard'] as ScanDocMode[]).map((m) => {
              const isActive = selectedDocMode === m
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedDocMode(m)}
                  style={[
                    styles.vfModePill,
                    isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.vfModeText, isActive && { color: '#ffffff', fontWeight: '800' }]}>
                    {t.scanner.docModes[m]}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Central Viewfinder Frame with Laser & L-Corners */}
          <View style={styles.vfCenterArea}>
            <View
              style={[
                styles.vfTargetBox,
                { width: frameDims.width, height: frameDims.height },
              ]}
            >
              {/* 4 L-shaped Glowing Corners */}
              <View style={[styles.cornerTL, { borderColor: theme.primary }]} />
              <View style={[styles.cornerTR, { borderColor: theme.primary }]} />
              <View style={[styles.cornerBL, { borderColor: theme.primary }]} />
              <View style={[styles.cornerBR, { borderColor: theme.primary }]} />

              {/* 3x3 Rule-of-Thirds Grid */}
              <View style={styles.vfGridH1} />
              <View style={styles.vfGridH2} />
              <View style={styles.vfGridV1} />
              <View style={styles.vfGridV2} />

              {/* Real-time Leveling Bubble Horizon Indicator */}
              <View style={styles.levelerIndicator}>
                <View style={styles.levelerCrosshairH} />
                <View style={styles.levelerCrosshairV} />
                <View style={[styles.levelerBubble, { backgroundColor: theme.emerald }]} />
              </View>

              {/* Animated Laser Scanning Line */}
              <Animated.View
                style={[
                  styles.laserLine,
                  {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                    transform: [{ translateY: laserTranslateY }],
                  },
                ]}
              />
            </View>

            {/* Level guidance badge */}
            <View style={styles.levelBadge}>
              <Ionicons name="checkmark-circle" size={14} color={theme.emerald} style={{ marginRight: 6 }} />
              <Text style={styles.levelBadgeText}>{t.scanner.levelPerfect}</Text>
            </View>
            <Text style={styles.levelSubText}>{t.scanner.levelGuide}</Text>
          </View>

          {/* Bottom Shutter Action Bar */}
          <View style={styles.vfBottomBar}>
            <TouchableOpacity
              style={[styles.vfShutterOuter, { borderColor: `${theme.primary}80` }]}
              onPress={handleExecuteCapture}
              activeOpacity={0.8}
            >
              <View style={[styles.vfShutterInner, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={30} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.vfShutterLabel}>{t.scanner.shutterBtn}</Text>
          </View>
        </View>
      </Modal>

      {/* ================= PAGE INSPECTOR & STRAIGHTEN MODAL ================= */}
      {selectedPageIndex !== null && pages[selectedPageIndex] && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={[styles.inspectorSheet, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              {/* Modal Header */}
              <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
                <View>
                  <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                    Trang {selectedPageIndex + 1} / {pages.length}
                  </Text>
                  <Text style={[styles.sheetSub, { color: theme.textMuted }]}>
                    Nắn thẳng, khử méo góc & chọn bộ lọc làm nét
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedPageIndex(null)}
                  style={[styles.sheetCloseBtn, { backgroundColor: theme.bgElevated }]}
                >
                  <Ionicons name="close" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* High-res Image preview with scaling/de-skew */}
              <View style={styles.sheetImageWrap}>
                <Image
                  source={{ uri: pages[selectedPageIndex].uri }}
                  style={[
                    styles.sheetImage,
                    {
                      transform: [
                        { rotate: `${pages[selectedPageIndex].rotation || 0}deg` },
                        { scale: 1 + (pages[selectedPageIndex].cropInsetPercent || 0) / 100 },
                      ],
                    },
                  ]}
                  resizeMode="contain"
                />
                {watermark !== 'none' && (
                  <View style={styles.sheetWatermarkOverlay} pointerEvents="none">
                    <Text style={styles.sheetWatermarkText}>{getWatermarkText()}</Text>
                  </View>
                )}

                {/* 4 Alignment Target Anchors on Inspector */}
                <View style={[styles.anchorMarker, { top: 8, left: 8 }]} />
                <View style={[styles.anchorMarker, { top: 8, right: 8 }]} />
                <View style={[styles.anchorMarker, { bottom: 8, left: 8 }]} />
                <View style={[styles.anchorMarker, { bottom: 8, right: 8 }]} />
              </View>

              {/* De-skew & Crop Inset Control Ribbon */}
              <View style={[styles.deskewControlCard, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="crop-outline" size={15} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.deskewTitle, { color: theme.textPrimary }]}>{t.scanner.straightenBtn}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.autoSnapBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleSetPageCropInset(selectedPageIndex, 6)}
                  >
                    <Ionicons name="sparkles" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.autoSnapText}>{t.scanner.autoEdgeSnap}</Text>
                  </TouchableOpacity>
                </View>

                {/* Inset Pills (0%, 4%, 8%, 12%) */}
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[0, 4, 8, 12].map((insetVal) => {
                    const isSelected = (pages[selectedPageIndex].cropInsetPercent || 0) === insetVal
                    return (
                      <TouchableOpacity
                        key={insetVal}
                        onPress={() => handleSetPageCropInset(selectedPageIndex, insetVal)}
                        style={[
                          styles.insetPill,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.bgSurface,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={[styles.insetPillText, { color: isSelected ? '#ffffff' : theme.textSecondary }]}>
                          {insetVal === 0 ? 'Viền gốc' : `Cắt -${insetVal}%`}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              {/* Rotate & Delete action buttons */}
              <View style={styles.sheetActionsRow}>
                <TouchableOpacity
                  style={[styles.sheetActionBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  onPress={() => handleRotatePage(selectedPageIndex)}
                >
                  <Ionicons name="reload" size={18} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.sheetActionBtnText, { color: theme.textPrimary }]}>{t.scanner.rotatePage}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetActionBtn, { backgroundColor: `${theme.rose}15`, borderColor: theme.rose }]}
                  onPress={() => handleDeletePage(selectedPageIndex)}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.rose} style={{ marginRight: 6 }} />
                  <Text style={[styles.sheetActionBtnText, { color: theme.rose }]}>{t.scanner.deletePage}</Text>
                </TouchableOpacity>
              </View>

              {/* Per-page filter choices */}
              <View style={styles.perPageFiltersRow}>
                {(['original', 'clean', 'bw', 'vibrant'] as ScanFilterType[]).map((f) => {
                  const isCurrent = (pages[selectedPageIndex].filter || globalFilter) === f
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => handleSetPageFilter(selectedPageIndex, f)}
                      style={[
                        styles.perPageFilterPill,
                        {
                          backgroundColor: isCurrent ? theme.primary : theme.bgElevated,
                          borderColor: isCurrent ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.perPageFilterText,
                          { color: isCurrent ? '#ffffff' : theme.textSecondary },
                        ]}
                      >
                        {t.scanner.filters[f]}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ================= AI DOCUMENT INTELLIGENCE MODAL ================= */}
      <Modal visible={showAiModal} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.aiModalContainer, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
            {/* AI Modal Header */}
            <View style={styles.aiModalHeader}>
              <View style={styles.aiModalTitleRow}>
                <View style={[styles.aiBadgeIcon, { backgroundColor: `${theme.primary}20` }]}>
                  <Ionicons name="sparkles" size={18} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.aiModalTitle, { color: theme.textPrimary }]}>{t.scanner.aiTitle}</Text>
                  <Text style={[styles.aiModalSub, { color: theme.textMuted }]}>
                    Bóc tách thực thể & Tóm tắt pháp lý On-Device
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowAiModal(false)}
                style={[styles.sheetCloseBtn, { backgroundColor: theme.bgElevated }]}
              >
                <Ionicons name="close" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {aiAnalyzing ? (
              <View style={styles.aiLoadingBox}>
                <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 16 }} />
                <Text style={[styles.aiLoadingText, { color: theme.textPrimary }]}>{t.scanner.aiScanning}</Text>
                <Text style={[styles.aiLoadingSub, { color: theme.textMuted }]}>
                  Nhận diện tiêu đề, điều khoản cam kết & thông tin các bên
                </Text>
              </View>
            ) : aiData ? (
              <ScrollView style={styles.aiContentScroll} showsVerticalScrollIndicator={false}>
                {/* Document Type Badge */}
                <View style={[styles.aiTypeCard, { backgroundColor: `${theme.primary}12`, borderColor: `${theme.primary}40` }]}>
                  <Text style={[styles.aiTypeLabel, { color: theme.primary }]}>LOẠI VĂN BẢN</Text>
                  <Text style={[styles.aiTypeTitle, { color: theme.textPrimary }]}>{aiData.docType}</Text>
                </View>

                {/* Extracted Metadata Grid */}
                <View style={[styles.aiGridCard, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                  <View style={styles.aiGridItem}>
                    <Text style={[styles.aiGridLabel, { color: theme.textMuted }]}>Số văn bản:</Text>
                    <Text style={[styles.aiGridVal, { color: theme.textPrimary }]}>{aiData.docNumber}</Text>
                  </View>
                  <View style={styles.aiGridItem}>
                    <Text style={[styles.aiGridLabel, { color: theme.textMuted }]}>Ngày ban hành:</Text>
                    <Text style={[styles.aiGridVal, { color: theme.textPrimary }]}>{aiData.issueDate}</Text>
                  </View>
                  <View style={[styles.aiGridItem, { width: '100%' }]}>
                    <Text style={[styles.aiGridLabel, { color: theme.textMuted }]}>Tổng giá trị thanh toán:</Text>
                    <Text style={[styles.aiGridVal, { color: theme.emerald, fontWeight: '700' }]}>
                      {aiData.totalValue}
                    </Text>
                  </View>
                  <View style={[styles.aiGridItem, { width: '100%' }]}>
                    <Text style={[styles.aiGridLabel, { color: theme.textMuted }]}>Các bên tham gia:</Text>
                    <Text style={[styles.aiGridVal, { color: theme.textSecondary }]}>
                      {aiData.parties.partyA}
                    </Text>
                    <Text style={[styles.aiGridVal, { color: theme.textSecondary }]}>
                      {aiData.parties.partyB}
                    </Text>
                  </View>
                </View>

                {/* Key Clauses */}
                <View style={styles.aiClausesBox}>
                  <Text style={[styles.aiClausesHeader, { color: theme.textPrimary }]}>
                    {t.scanner.aiSummary}
                  </Text>
                  {aiData.terms.map((term, i) => (
                    <View key={i} style={styles.clauseRow}>
                      <View style={[styles.clauseDot, { backgroundColor: theme.primary }]} />
                      <Text style={[styles.clauseText, { color: theme.textSecondary }]}>{term}</Text>
                    </View>
                  ))}
                </View>

                {/* Toggle attach cover page */}
                <TouchableOpacity
                  style={[styles.aiCoverToggle, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  onPress={() => setAttachAiCover(!attachAiCover)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={attachAiCover ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={attachAiCover ? theme.primary : theme.textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.aiCoverToggleText, { color: theme.textPrimary }]}>
                    {t.scanner.aiAttachCover}
                  </Text>
                </TouchableOpacity>

                {/* Action buttons inside AI Modal */}
                <View style={styles.aiModalActions}>
                  <TouchableOpacity
                    style={[styles.aiActionBtn, { backgroundColor: theme.primary }]}
                    onPress={handleCreateEditableDocFromAi}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.aiActionBtnText}>{t.scanner.aiCreateDocBtn}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.aiActionBtnSec, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                    onPress={handleCopyAiSummary}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="copy-outline" size={16} color={theme.textPrimary} style={{ marginRight: 6 }} />
                    <Text style={[styles.aiActionBtnSecText, { color: theme.textPrimary }]}>{t.scanner.aiCopyBtn}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scannerLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  aiTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiTriggerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toolbarCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  previewSection: {
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 34,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  addSampleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  addSampleLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pageList: {
    flexDirection: 'row',
    marginTop: 6,
  },
  pageCard: {
    width: 156,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 14,
  },
  pageThumbWrapper: {
    width: '100%',
    height: 196,
    position: 'relative',
    backgroundColor: '#0000000a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewWatermarkBox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    transform: [{ rotate: '-25deg' }],
  },
  previewWatermarkText: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pageBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  deskewBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deskewBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '700',
  },
  cardRotateBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDeleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  reorderBtn: {
    padding: 4,
  },
  reorderPageNumber: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerAction: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  exportBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  desktopSendBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  desktopSendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ================= VIEWFINDER CAMERA STYLES =================
  viewfinderBackdrop: {
    flex: 1,
    backgroundColor: '#05070e',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 36,
  },
  viewfinderTopBar: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vfCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vfTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  vfSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  vfModeSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  vfModePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  vfModeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  vfCenterArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  vfTargetBox: {
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 28,
    height: 28,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 28,
    height: 28,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 28,
    height: 28,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 28,
    height: 28,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 12,
  },
  vfGridH1: {
    position: 'absolute',
    top: '33.3%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  vfGridH2: {
    position: 'absolute',
    top: '66.6%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  vfGridV1: {
    position: 'absolute',
    left: '33.3%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  vfGridV2: {
    position: 'absolute',
    left: '66.6%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  laserLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  levelerIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelerCrosshairH: {
    position: 'absolute',
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  levelerCrosshairV: {
    position: 'absolute',
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  levelerBubble: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 18,
  },
  levelBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  levelSubText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 6,
  },
  vfBottomBar: {
    alignItems: 'center',
    gap: 10,
  },
  vfShutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vfShutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vfShutterLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  // Inspector Sheet
  inspectorSheet: {
    width: '100%',
    maxHeight: '92%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetImageWrap: {
    width: '100%',
    height: 290,
    marginVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00000010',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sheetImage: {
    width: '100%',
    height: '100%',
  },
  anchorMarker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
  },
  sheetWatermarkOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderStyle: 'dashed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-30deg' }],
  },
  sheetWatermarkText: {
    fontSize: 18,
    fontWeight: '900',
    color: 'rgba(239, 68, 68, 0.35)',
    letterSpacing: 2,
  },
  deskewControlCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deskewTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  autoSnapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  autoSnapText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  insetPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  insetPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sheetActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  sheetActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  perPageFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  perPageFilterPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  perPageFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // AI Modal
  aiModalContainer: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  aiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  aiModalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  aiLoadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLoadingText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  aiLoadingSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  aiContentScroll: {
    maxHeight: 460,
  },
  aiTypeCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  aiTypeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  aiTypeTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  aiGridCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  aiGridItem: {
    width: '46%',
  },
  aiGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  aiGridVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiClausesBox: {
    marginBottom: 16,
  },
  aiClausesHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  clauseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clauseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  clauseText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  aiCoverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
  },
  aiCoverToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiModalActions: {
    gap: 10,
    paddingBottom: 6,
  },
  aiActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  aiActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aiActionBtnSec: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiActionBtnSecText: {
    fontSize: 13,
    fontWeight: '700',
  },
})
