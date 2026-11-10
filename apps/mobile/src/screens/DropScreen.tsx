import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { DesktopPeer } from '../types'
import { SofttyDropService } from '../services/softtyDrop'
import { useApp } from '../context/AppContext'
import { getQrModules } from '../utils/qr'

export function DropScreen() {
  const { theme, t, importAndOpenUri, openDocument } = useApp()
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send')

  // Send State
  const [peers, setPeers] = useState<DesktopPeer[]>([])
  const [scanning, setScanning] = useState(false)
  const [selectedPeer, setSelectedPeer] = useState<DesktopPeer | null>(null)
  const [transferring, setTransferring] = useState(false)
  const [progress, setProgress] = useState(0)

  // PIN Send Modal
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [inputPin, setInputPin] = useState('')

  // Receive State
  const [myPin, setMyPin] = useState('749218')
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([])
  const [isListening, setIsListening] = useState(false)
  const [incomingStatus, setIncomingStatus] = useState<string>('')
  const pullIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Initial scan & Session setup
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

  const initReceiveSession = async () => {
    try {
      const session = await SofttyDropService.createReceiveSession()
      setMyPin(session.pin)
      const matrix = getQrModules(session.qrPayload)
      setQrMatrix(matrix)
      setIsListening(true)
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    scan()
    initReceiveSession()
    return () => {
      if (pullIntervalRef.current) clearInterval(pullIntervalRef.current)
    }
  }, [])

  // 2. Polling for incoming files when in Receive Mode
  useEffect(() => {
    if (activeTab === 'receive' && myPin) {
      setIsListening(true)
      pullIntervalRef.current = setInterval(async () => {
        try {
          const result = await SofttyDropService.pullIncomingFile(myPin)
          if (result && result.success && result.localUri) {
            setIncomingStatus(`Đã nhận: ${result.fileName}`)
            Alert.alert(
              'Đã nhận tệp mới',
              `Tài liệu "${result.fileName}" đã được chuyển sang điện thoại. Bạn có muốn mở xem ngay?`,
              [
                {
                  text: 'Để sau',
                  style: 'cancel',
                },
                {
                  text: 'Mở ngay',
                  onPress: async () => {
                    const doc = await importAndOpenUri(result.localUri!, result.fileName, result.size)
                    if (doc) openDocument(doc)
                  },
                },
              ],
            )
          }
        } catch {
          // ignore
        }
      }, 2500)
    } else {
      if (pullIntervalRef.current) {
        clearInterval(pullIntervalRef.current)
        pullIntervalRef.current = null
      }
    }
    return () => {
      if (pullIntervalRef.current) {
        clearInterval(pullIntervalRef.current)
        pullIntervalRef.current = null
      }
    }
  }, [activeTab, myPin])

  // 3. Send via Selected Peer
  const handlePickAndSendToPeer = async () => {
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

      if (res.canceled || !res.assets || res.assets.length === 0) return

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

  // 4. Send via PIN
  const handleSendByPin = async () => {
    const cleanPin = inputPin.replace(/\D/g, '').trim()
    if (cleanPin.length !== 6) {
      Alert.alert('Mã PIN không hợp lệ', 'Vui lòng nhập đủ 6 chữ số.')
      return
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (res.canceled || !res.assets || res.assets.length === 0) return

      const file = res.assets[0]
      setPinModalVisible(false)
      setTransferring(true)
      setProgress(0.2)

      const result = await SofttyDropService.sendFileByPin(
        cleanPin,
        file.uri,
        file.name,
        file.mimeType || 'application/octet-stream',
        (p) => setProgress(p),
      )

      if (result.success) {
        Alert.alert(t.common.success, result.message)
        setInputPin('')
      } else {
        Alert.alert(t.common.error, result.message)
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Lỗi khi gửi tệp.')
    } finally {
      setTransferring(false)
      setProgress(0)
    }
  }

  // 5. Scan QR via camera fallback
  const handleScanQrFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Quyền Camera', 'Ứng dụng cần quyền Camera để quét mã QR.')
        return
      }

      Alert.prompt
        ? Alert.prompt(
            'Nhập mã kết nối',
            'Nhập mã PIN 6 số hoặc chuỗi mã QR từ màn hình máy tính:',
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Kết nối',
                onPress: (text?: string) => {
                  if (text) {
                    setInputPin(text)
                    setPinModalVisible(true)
                  }
                },
              },
            ],
          )
        : setPinModalVisible(true)
    } catch {
      setPinModalVisible(true)
    }
  }

  // Render QR Grid via native React Native Views
  const renderQrView = () => {
    if (!qrMatrix || qrMatrix.length === 0) return null
    const matrixSize = qrMatrix.length
    const cellSize = Math.floor(180 / matrixSize)

    return (
      <View style={styles.qrContainer}>
        {qrMatrix.map((row, rIdx) => (
          <View key={`r-${rIdx}`} style={{ flexDirection: 'row' }}>
            {row.map((cell, cIdx) => (
              <View
                key={`c-${rIdx}-${cIdx}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell ? '#0f172a' : '#ffffff',
                }}
              />
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.dropLogo, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
            <Ionicons name="swap-horizontal-outline" size={22} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Chuyển file</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Chuyển tệp không dây trực tiếp giữa điện thoại và máy tính
            </Text>
          </View>
        </View>

        {/* Tab switch */}
        <View style={[styles.tabSegment, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'send' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('send')}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={16}
              color={activeTab === 'send' ? '#ffffff' : theme.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, { color: activeTab === 'send' ? '#fff' : theme.textMuted }]}>
              Gửi tệp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'receive' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('receive')}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={16}
              color={activeTab === 'receive' ? '#ffffff' : theme.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.segmentText, { color: activeTab === 'receive' ? '#fff' : theme.textMuted }]}>
              Nhận tệp
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ================= TAB 1: GỬI TỆP ================= */}
        {activeTab === 'send' && (
          <View style={styles.tabContent}>
            {/* 1-Touch Clean Device Action Card */}
            <View style={[styles.radarCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              <View style={[styles.deviceIconCircle, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                <Ionicons name="desktop-outline" size={36} color={theme.primary} />
              </View>

              <Text style={[styles.radarHeadline, { color: theme.textPrimary }]}>
                {scanning ? 'Đang dò tìm máy tính...' : (selectedPeer?.name || 'Máy tính của bạn')}
              </Text>
              <Text style={[styles.radarDescription, { color: '#10b981', fontWeight: '600' }]}>
                {scanning ? 'Đang quét mạng Wi-Fi...' : 'Đã kết nối tự động • Sẵn sàng chuyển tệp 1-Chạm'}
              </Text>

              {/* Big 1-Touch Button */}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: theme.primary, width: '100%', marginTop: 12 },
                  transferring && { opacity: 0.6 },
                ]}
                onPress={handlePickAndSendToPeer}
                disabled={transferring}
              >
                {transferring ? (
                  <View style={styles.sendingRow}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.sendButtonText}>
                      Đang chuyển tệp... {Math.round(progress * 100)}%
                    </Text>
                  </View>
                ) : (
                  <View style={styles.sendingRow}>
                    <Ionicons name="send" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.sendButtonText}>Chọn tệp & Gửi sang Máy tính (1-Chạm)</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Secondary Options */}
              <View style={[styles.actionButtonsRow, { marginTop: 14 }]}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  onPress={handleScanQrFromCamera}
                >
                  <Ionicons name="qr-code-outline" size={18} color={theme.textPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Quét mã QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  onPress={scan}
                  disabled={scanning}
                >
                  <Ionicons name="refresh-outline" size={18} color={theme.textPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Dò tìm lại Wi-Fi</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setPinModalVisible(true)}
                style={{ marginTop: 12 }}
              >
                <Text style={{ fontSize: 11, color: theme.textMuted, textDecorationLine: 'underline' }}>
                  Hoặc kết nối từ xa bằng mã PIN (nếu không cùng Wi-Fi)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= TAB 2: NHẬN TỆP ================= */}
        {activeTab === 'receive' && (
          <View style={styles.tabContent}>
            <View style={[styles.receiveCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
              <Text style={[styles.receiveTitle, { color: theme.textPrimary }]}>MÃ KẾT NỐI CỦA BẠN</Text>
              <Text style={[styles.receiveSub, { color: theme.textMuted }]}>
                Giữ màn hình này mở. Nhập mã PIN 6 số trên Máy tính hoặc quét mã QR dưới đây.
              </Text>

              {/* QR Code Container */}
              <View style={styles.qrWrapper}>{renderQrView()}</View>

              {/* Big 6-Digit PIN Display */}
              <View style={styles.pinDisplayRow}>
                {myPin.split('').map((digit, i) => (
                  <View
                    key={i}
                    style={[styles.pinDigitBox, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
                  >
                    <Text style={[styles.pinDigitText, { color: theme.primary }]}>{digit}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.refreshPinBtn, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}
                onPress={initReceiveSession}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="refresh-outline" size={14} color={theme.textPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.refreshPinText, { color: theme.textPrimary }]}>Đổi mã PIN mới</Text>
                </View>
              </TouchableOpacity>

              {/* Status Indicator */}
              <View style={styles.listeningBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.listeningText}>
                  {incomingStatus || 'Đang sẵn sàng nhận tài liệu...'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: NHẬP MÃ PIN ================= */}
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nhập mã PIN 6 số</Text>
            <Text style={[styles.modalSub, { color: theme.textMuted }]}>
              Nhập mã PIN hiển thị trên màn hình thiết bị bạn muốn gửi tệp tới:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { color: theme.textPrimary, borderColor: theme.primary, backgroundColor: theme.bgElevated },
              ]}
              placeholder="VD: 749218"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={inputPin}
              onChangeText={setInputPin}
              autoFocus
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: theme.border }]}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: theme.textMuted }]}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnSubmit, { backgroundColor: theme.primary }]}
                onPress={handleSendByPin}
              >
                <Text style={[styles.modalBtnText, { color: '#ffffff', fontWeight: '700' }]}>
                  Chọn tệp & Gửi
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabSegment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  tabContent: {
    gap: 16,
  },
  radarCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  deviceIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  radarHeadline: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  radarDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  peerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  peerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  peerIcon: {
    fontSize: 20,
  },
  peerInfo: {
    flex: 1,
  },
  peerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  peerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  sendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiveCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  receiveTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  receiveSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qrContainer: {
    backgroundColor: '#ffffff',
  },
  pinDisplayRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  pinDigitBox: {
    width: 44,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 28,
    fontWeight: '900',
  },
  refreshPinBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
  },
  refreshPinText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listeningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  listeningText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtnSubmit: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
  },
})
