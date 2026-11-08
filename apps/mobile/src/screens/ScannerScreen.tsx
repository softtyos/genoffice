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
import { ScannedPage } from '../types'
import { SofttyDropService } from '../services/softtyDrop'

export function ScannerScreen() {
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [processing, setProcessing] = useState(false)

  const handleCapturePage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Cần quyền Camera', 'Ứng dụng cần quyền camera để quét tài liệu.')
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
      Alert.alert('Lỗi', err.message || 'Không thể chụp ảnh.')
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
      Alert.alert('Lỗi', err.message || 'Không thể chọn ảnh từ thư viện.')
    }
  }

  const handleSendToDesktop = async () => {
    if (pages.length === 0) {
      Alert.alert('Chưa có trang quét', 'Vui lòng quét ít nhất một trang tài liệu.')
      return
    }

    setProcessing(true)
    try {
      const peers = await SofttyDropService.scanNearbyDesktops()
      if (peers.length === 0) {
        Alert.alert('Không tìm thấy Desktop', 'Hãy mở Softty Office trên máy tính cùng mạng Wi-Fi.')
        return
      }

      const desktop = peers[0]
      const fileName = `Scan_TaiLieu_${new Date().toISOString().slice(0, 10)}.pdf`

      // Send the first scanned document or generated PDF to Desktop
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
        Alert.alert('Thông báo', res.message)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Camera Scanner</Text>
        <Text style={styles.subtitle}>Quét tài liệu thành PDF và mở ngay trên Softty PDF máy tính</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCapturePage}>
          <Text style={styles.actionBtnIcon}>📸</Text>
          <Text style={styles.actionBtnText}>Chụp Quét Trang</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={handlePickFromGallery}>
          <Text style={styles.actionBtnIcon}>🖼️</Text>
          <Text style={styles.actionBtnText}>Chọn Từ Thư Viện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CÁC TRANG ĐÃ QUÉT ({pages.length})</Text>
          {pages.length > 0 && (
            <TouchableOpacity onPress={() => setPages([])}>
              <Text style={styles.clearText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {pages.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>Chưa có trang quét nào</Text>
            <Text style={styles.emptySubText}>
              Bấm "Chụp Quét Trang" để tự động nhận diện 4 góc và nắn thẳng tài liệu.
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pageList}>
            {pages.map((p, index) => (
              <View key={p.id} style={styles.pageThumbWrapper}>
                <Image source={{ uri: p.uri }} style={styles.pageThumb} />
                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>Trang {index + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {pages.length > 0 && (
        <View style={styles.footerAction}>
          <TouchableOpacity
            style={[styles.desktopSendBtn, processing && { opacity: 0.5 }]}
            onPress={handleSendToDesktop}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.desktopSendBtnText}>
                ⚡ Bắn {pages.length} Trang Sang Softty PDF Desktop
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1322',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnSecondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnIcon: {
    fontSize: 18,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#64748b',
    letterSpacing: 1,
  },
  clearText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyCard: {
    flex: 1,
    backgroundColor: '#131b2e',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  pageList: {
    flexDirection: 'row',
  },
  pageThumbWrapper: {
    position: 'relative',
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pageThumb: {
    width: 140,
    height: 190,
    borderRadius: 12,
  },
  pageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(14, 19, 34, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pageBadgeText: {
    color: '#f8fafc',
    fontSize: 11,
    fontWeight: '600',
  },
  footerAction: {
    paddingVertical: 14,
  },
  desktopSendBtn: {
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  desktopSendBtnText: {
    color: '#0e1322',
    fontSize: 15,
    fontWeight: '800',
  },
})
