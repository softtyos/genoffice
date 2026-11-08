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

export function DropScreen() {
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
      Alert.alert('Chưa chọn thiết bị', 'Vui lòng chọn một máy tính để gửi file.')
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
        Alert.alert('Thành công', `Đã bắn file "${file.name}" sang ${selectedPeer.name}!`)
      } else {
        Alert.alert('Thông báo', result.message)
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chọn hoặc gửi file.')
    } finally {
      setTransferring(false)
      setProgress(0)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Softty Drop</Text>
        <Text style={styles.subtitle}>Bắn file 1-chạm sang máy tính trong mạng Wi-Fi</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MÁY TÍNH LÂN CẬN</Text>
          <TouchableOpacity onPress={scan} disabled={scanning}>
            <Text style={styles.refreshText}>{scanning ? 'Đang quét...' : 'Làm mới'}</Text>
          </TouchableOpacity>
        </View>

        {scanning ? (
          <ActivityIndicator color="#06b6d4" style={{ marginVertical: 20 }} />
        ) : peers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa tìm thấy máy tính nào đang mở Softty Office.</Text>
            <Text style={styles.emptySubText}>Đảm bảo máy tính và điện thoại kết nối cùng mạng Wi-Fi.</Text>
          </View>
        ) : (
          <FlatList
            data={peers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedPeer?.id === item.id
              return (
                <TouchableOpacity
                  style={[styles.peerCard, isSelected && styles.peerCardActive]}
                  onPress={() => setSelectedPeer(item)}
                >
                  <View style={styles.peerIcon}>
                    <Text style={styles.peerIconText}>💻</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.peerName}>{item.name}</Text>
                    <Text style={styles.peerMeta}>{item.ip}:{item.port} • Sẵn sàng nhận</Text>
                  </View>
                  {isSelected && <Text style={styles.selectedBadge}>Đã chọn</Text>}
                </TouchableOpacity>
              )
            }}
          />
        )}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.sendButton, (!selectedPeer || transferring) && styles.sendButtonDisabled]}
          onPress={handlePickAndSend}
          disabled={!selectedPeer || transferring}
        >
          {transferring ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>🚀 Chọn File & Bắn Sang Máy Tính</Text>
          )}
        </TouchableOpacity>

        {transferring && (
          <Text style={styles.progressText}>Đang truyền dữ liệu: {Math.round(progress * 100)}%</Text>
        )}
      </View>
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
    marginBottom: 24,
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
  section: {
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
  refreshText: {
    fontSize: 13,
    color: '#06b6d4',
    fontWeight: '600',
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  peerCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#162238',
  },
  peerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  peerIconText: {
    fontSize: 22,
  },
  peerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  peerMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  selectedBadge: {
    fontSize: 11,
    color: '#06b6d4',
    fontWeight: '700',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyCard: {
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  actionSection: {
    paddingVertical: 16,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  progressText: {
    textAlign: 'center',
    color: '#06b6d4',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
})
