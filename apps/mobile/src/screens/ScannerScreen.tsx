import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Print from 'expo-print'
import { ScannedPage, OfficeDocument } from '../types'
import { SofttyDropService } from '../services/softtyDrop'
import { useApp } from '../context/AppContext'

export function ScannerScreen() {
  const { theme, t, saveActiveDocument, openDocument } = useApp()
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [processing, setProcessing] = useState(false)

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
    }
    setPages((prev) => [...prev, newPage])
  }

  const handleCapturePage = async () => {
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
        quality: 0.85,
        allowsEditing: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        const newPage: ScannedPage = {
          id: `page_${Date.now()}`,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }
        setPages((prev) => [...prev, newPage])
      }
    } catch (err: any) {
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
        quality: 0.85,
        allowsMultipleSelection: true,
      })

      if (!result.canceled && result.assets) {
        const newPages: ScannedPage[] = result.assets.map((asset, i) => ({
          id: `page_${Date.now()}_${i}`,
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        }))
        setPages((prev) => [...prev, ...newPages])
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Không thể chọn ảnh từ thư viện.')
    }
  }

  const generateRealPdfFromPages = async (scannedPages: ScannedPage[]): Promise<string> => {
    const pagesHtml = scannedPages
      .map(
        (p, idx) => `
        <div style="page-break-after: ${idx === scannedPages.length - 1 ? 'avoid' : 'always'}; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; padding: 20px; position: relative;">
          <img src="${p.uri}" style="max-width: 95%; max-height: 90vh; object-fit: contain; box-shadow: 0 4px 14px rgba(0,0,0,0.12); border-radius: 4px;" />
          <div style="position: absolute; bottom: 15px; right: 25px; font-family: -apple-system, sans-serif; font-size: 11px; color: #64748b;">
            Trang ${idx + 1} / ${scannedPages.length} • Softty PDF Scanner
          </div>
        </div>
      `
      )
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

      // Generate real multi-page PDF from all scanned pages!
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
          contentSummary: pages.map(
            (_, idx) => `Trang ${idx + 1}: Hình ảnh tài liệu quét chất lượng cao (${idx + 1}/${pages.length}).`
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
          `Tài liệu ${pages.length} trang đã được chuyển sang ${desktop.name} và mở sẵn trong Softty PDF.`,
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.scannerLogo, { backgroundColor: `${theme.rose}20` }]}>
            <Text style={styles.scannerLogoIcon}>📸</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Quét PDF</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Chụp ảnh & Xuất tài liệu PDF đa trang</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={handleCapturePage}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>📸</Text>
            <Text style={styles.actionBtnText}>{t.scanner.takePhoto}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.bgSurface, borderColor: theme.border, borderWidth: 1 },
            ]}
            onPress={handlePickFromGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>🖼️</Text>
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>{t.scanner.fromGallery}</Text>
          </TouchableOpacity>
        </View>

        {/* Scanned Pages Section */}
        <View style={styles.previewSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {t.scanner.scannedPages(pages.length).toUpperCase()}
            </Text>
            {pages.length > 0 && (
              <TouchableOpacity onPress={() => setPages([])}>
                <Text style={[styles.clearText, { color: theme.rose }]}>{t.common.delete} {t.common.all}</Text>
              </TouchableOpacity>
            )}
          </View>

          {pages.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>{t.scanner.emptyPages}</Text>
              <Text style={[styles.emptySubText, { color: theme.textMuted }]}>{t.scanner.emptySub}</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageList}>
              {pages.map((p, index) => (
                <View key={p.id} style={[styles.pageThumbWrapper, { borderColor: theme.border }]}>
                  <Image source={{ uri: p.uri }} style={styles.pageThumb} />
                  <View style={[styles.pageBadge, { backgroundColor: `${theme.primary}ee` }]}>
                    <Text style={styles.pageBadgeText}>Trang {index + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Actions if pages exist */}
        {pages.length > 0 && (
          <View style={styles.footerAction}>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: theme.emerald }]}
              onPress={handleExportAndOpen}
              activeOpacity={0.8}
            >
              <Text style={styles.exportBtnText}>📄 {t.scanner.exportPdf} & {t.common.view}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.desktopSendBtn, { backgroundColor: theme.primary }, processing && { opacity: 0.5 }]}
              onPress={handleSendToDesktop}
              disabled={processing}
              activeOpacity={0.8}
            >
              {processing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.desktopSendBtnText}>
                  ⚡ {t.scanner.beamDirect} ({pages.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  scannerLogoIcon: {
    fontSize: 22,
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
  content: {
    flex: 1,
    padding: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  previewSection: {
    flex: 1,
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
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  pageList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  pageThumbWrapper: {
    width: 140,
    height: 190,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 14,
    position: 'relative',
  },
  pageThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pageBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  footerAction: {
    marginTop: 'auto',
    paddingTop: 16,
    gap: 10,
  },
  exportBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  desktopSendBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopSendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
})
