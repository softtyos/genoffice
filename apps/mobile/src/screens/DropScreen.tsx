import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { DesktopPeer } from '../types'
import { SofttyDropService } from '../services/softtyDrop'
import { useApp } from '../context/AppContext'

export function DropScreen() {
  const { theme, t } = useApp()
  const [peers, setPeers] = useState<DesktopPeer[]>([])
  const [scanning, setScanning] = useState(false)
  const [selectedPeer, setSelectedPeer] = useState<DesktopPeer | null>(null)
  const [transferring, setTransferring] = useState(false)
  const [progress, setProgress] = useState(0)

  const scan = async () => {
    setScanning(true)
    try {
      const found = await SofttyDropService.scanNearbyDesktops()
      setPeers(found)
      if (found.length > 0) {
        setSelectedPeer(found[0])
      }
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    scan()
  }, [])

  const handlePickAndSend = async () => {
    const target = selectedPeer || (peers.length > 0 ? peers[0] : null)
    if (!target) {
      Alert.alert(t.common.error, 'Chưa tìm thấy máy tính trong mạng Wi-Fi.')
      return
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return
      }

      const file = res.assets[0]
      setTransferring(true)
      setProgress(0.15)

      const result = await SofttyDropService.sendFileToDesktop(
        target,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        (p) => setProgress(p),
      )

      if (result.success) {
        Alert.alert(t.common.success, result.message || 'Đã bắn tệp sang máy tính thành công!')
      } else {
        Alert.alert(t.common.error, result.message)
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Không thể chọn hoặc gửi file.')
    } finally {
      setTransferring(false)
      setProgress(0)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.dropLogo, { backgroundColor: `${theme.cyan}20` }]}>
            <Text style={styles.dropLogoIcon}>📡</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t.drop.title}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t.drop.subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* AirDrop Style Radar Animation Card */}
        <View style={[styles.radarCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <View style={[styles.radarOuterRing, { borderColor: `${theme.cyan}25` }]}>
            <View style={[styles.radarMiddleRing, { borderColor: `${theme.cyan}45` }]}>
              <View style={[styles.radarCenterCircle, { backgroundColor: theme.cyan }]}>
                <Text style={styles.radarIcon}>📡</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.radarHeadline, { color: theme.textPrimary }]}>
            {scanning ? 'Đang tự động dò tìm máy tính...' : 'Đã kết nối tự động (Zero-Config)'}
          </Text>
          <Text style={[styles.radarDescription, { color: theme.textMuted }]}>
            Giao thức P2P Wi-Fi cục bộ • Không qua máy chủ trung gian
          </Text>

          <TouchableOpacity
            onPress={scan}
            disabled={scanning}
            style={[styles.rescanPill, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
          >
            <Text style={[styles.rescanText, { color: theme.primary }]}>
              {scanning ? '🔄 Đang quét mạng...' : '🔄 Quét lại mạng'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>MÁY TÍNH TIẾP NHẬN (P2P)</Text>
          <Text style={[styles.autoBadge, { color: theme.emerald }]}>● Tự động ghép đôi</Text>
        </View>

        {/* Peers List */}
        <FlatList
          data={peers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedPeer?.id === item.id || (!selectedPeer && peers[0]?.id === item.id)
            return (
              <TouchableOpacity
                style={[
                  styles.peerCard,
                  {
                    backgroundColor: theme.bgSurface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                  isSelected && { borderWidth: 2 },
                ]}
                onPress={() => setSelectedPeer(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.peerIcon, { backgroundColor: isSelected ? `${theme.primary}20` : theme.bgElevated }]}>
                  <Text style={styles.peerIconText}>💻</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.peerTitleRow}>
                    <Text style={[styles.peerName, { color: theme.textPrimary }]}>{item.name}</Text>
                    <View style={[styles.onlineBadge, { backgroundColor: `${theme.emerald}20` }]}>
                      <Text style={[styles.onlineText, { color: theme.emerald }]}>Sẵn sàng</Text>
                    </View>
                  </View>
                  <Text style={[styles.peerMeta, { color: theme.textMuted }]}>
                    Mạng Wi-Fi nội bộ • Cổng {item.port} • Tốc độ tối đa
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />

        {/* Action Bottom Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              transferring && { opacity: 0.7 },
            ]}
            onPress={handlePickAndSend}
            disabled={transferring}
            activeOpacity={0.8}
          >
            {transferring ? (
              <View style={styles.transferringRow}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.sendButtonText}>
                  Đang bắn tệp... {Math.round(progress * 100)}%
                </Text>
              </View>
            ) : (
              <Text style={styles.sendButtonText}>
                🚀 Bắn Tệp Sang {selectedPeer?.name?.replace(/\s*\(.*\)/, '') || 'Máy Tính'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={[styles.infoBanner, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
            <Text style={styles.infoBannerIcon}>🔒</Text>
            <Text style={[styles.infoBannerText, { color: theme.textMuted }]}>
              {t.drop.listening}
            </Text>
          </View>
        </View>
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
  dropLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropLogoIcon: {
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
    padding: 16,
  },
  radarCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  radarOuterRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  radarMiddleRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCenterCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  radarIcon: {
    fontSize: 22,
  },
  radarHeadline: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  radarDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  rescanPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  rescanText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  autoBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  peerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerIconText: {
    fontSize: 22,
  },
  peerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peerName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  onlineBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '800',
  },
  peerMeta: {
    fontSize: 11,
    marginTop: 3,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  actionSection: {
    marginTop: 'auto',
    paddingTop: 12,
    gap: 10,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  infoBannerIcon: {
    fontSize: 13,
  },
  infoBannerText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
})
