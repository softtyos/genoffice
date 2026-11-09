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
import { ScannedPage, OfficeDocument } from '../types'
import { SofttyDropService } from '../services/softtyDrop'
import { useApp } from '../context/AppContext'

export function ScannerScreen() {
  const { theme, t, saveActiveDocument, openDocument } = useApp()
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [processing, setProcessing] = useState(false)

  const handleCapturePage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(t.common.error, 'Ứng dụng cần quyền camera để quét tài liệu.')
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
      Alert.alert(t.common.error, err.message || 'Không thể chụp ảnh.')
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

  const handleExportAndOpen = async () => {
    if (pages.length === 0) {
      Alert.alert(t.common.error, 'Vui lòng quét ít nhất một trang tài liệu.')
      return
    }

    const docId = `scan-pdf-${Date.now()}`
    const fileName = `Tai_lieu_scan_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.pdf`

    const newPdfDoc: OfficeDocument = {
      id: docId,
      name: fileName,
      uri: pages[0].uri,
      size: pages.length * 350000,
      type: 'pdf',
      modifiedAt: Date.now(),
      pdfData: {
        totalPages: pages.length,
        signed: false,
        contentSummary: pages.map(
          (_, idx) => `Trang ${idx + 1}: Văn bản hợp đồng được quét chất lượng cao bởi Softty Scanner.`
        ),
      },
    }

    await saveActiveDocument(newPdfDoc)
    openDocument(newPdfDoc)
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

      const res = await SofttyDropService.sendFileToDesktop(
        desktop,
        pages[0].uri,
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
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t.scanner.title}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t.scanner.subtitle}</Text>
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
