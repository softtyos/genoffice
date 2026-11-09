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
      if (found.length > 0 && !selectedPeer) {
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
    if (!selectedPeer) {
      Alert.alert(t.common.error, t.drop.selectPeer)
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
      setProgress(0.1)

      const result = await SofttyDropService.sendFileToDesktop(
        selectedPeer,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        (p) => setProgress(p),
      )

      if (result.success) {
        Alert.alert(t.common.success, t.drop.sendSuccess)
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{t.drop.selectPeer}</Text>
          <TouchableOpacity onPress={scan} disabled={scanning}>
            <Text style={[styles.refreshText, { color: theme.primary }]}>
              {scanning ? t.common.loading : t.drop.refresh}
            </Text>
          </TouchableOpacity>
        </View>

        {scanning ? (
          <ActivityIndicator color={theme.cyan} style={{ marginVertical: 30 }} />
        ) : peers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>{t.drop.noPeers}</Text>
            <Text style={[styles.emptySubText, { color: theme.textMuted }]}>{t.drop.noPeersSub}</Text>
            <TouchableOpacity onPress={scan} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.retryBtnText}>{t.drop.refresh}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={peers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedPeer?.id === item.id
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
                    <Text style={[styles.peerName, { color: theme.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.peerMeta, { color: theme.textMuted }]}>
                      {item.ip}:{item.port} • Sẵn sàng kết nối
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
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              (!selectedPeer || transferring) && { opacity: 0.5 },
            ]}
            onPress={handlePickAndSend}
            disabled={!selectedPeer || transferring}
            activeOpacity={0.8}
          >
            {transferring ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>🚀 {t.drop.pickAndSend}</Text>
            )}
          </TouchableOpacity>

          {transferring && (
            <Text style={[styles.progressText, { color: theme.cyan }]}>
              {t.drop.sending} {Math.round(progress * 100)}%
            </Text>
          )}

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
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 12,
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
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerIconText: {
    fontSize: 20,
  },
  peerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  peerMeta: {
    fontSize: 11,
    marginTop: 2,
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
    paddingTop: 16,
    gap: 12,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  infoBannerIcon: {
    fontSize: 14,
  },
  infoBannerText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
})
