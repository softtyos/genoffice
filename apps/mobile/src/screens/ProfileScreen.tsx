import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Modal,
} from 'react-native'
import { SofttyAuthService } from '../services/auth'
import { useApp, ThemeMode } from '../context/AppContext'
import { Language } from '../i18n'

export function ProfileScreen() {
  const { theme, themeMode, setThemeMode, language, setLanguage, t, refreshDocuments } = useApp()
  const [user, setUser] = useState(SofttyAuthService.getCurrentUser())
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)

  useEffect(() => {
    SofttyAuthService.init().then((u) => {
      if (u) setUser(u)
    })

    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (url.startsWith('softty-office://auth/callback')) {
        const loggedInUser = await SofttyAuthService.handleDeepLink(url)
        if (loggedInUser) {
          setUser(loggedInUser)
          Alert.alert(t.common.success, `Chào mừng ${loggedInUser.name} đã đăng nhập!`)
        }
      }
    })

    Linking.getInitialURL().then(async (url) => {
      if (url && url.startsWith('softty-office://auth/callback')) {
        const loggedInUser = await SofttyAuthService.handleDeepLink(url)
        if (loggedInUser) setUser(loggedInUser)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const handleLogout = () => {
    Alert.alert(t.profile.logoutBtn, 'Bạn có chắc chắn muốn đăng xuất Softty Account?', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.profile.logoutBtn,
        style: 'destructive',
        onPress: async () => {
          await SofttyAuthService.logout()
          setUser(null)
        },
      },
    ])
  }

  const handleLogin = async () => {
    try {
      await SofttyAuthService.startBrowserLogin()
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Không thể mở trình duyệt đăng nhập.')
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t.profile.title}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Softty Account Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.cyan }]}>
            {t.profile.accountSection.toUpperCase()}
          </Text>

          {user ? (
            <View style={styles.userInfoBox}>
              <View style={[styles.avatarCircle, { backgroundColor: `${theme.primary}25` }]}>
                <Text style={[styles.avatarLetter, { color: theme.primary }]}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <View style={styles.userNameRow}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>{user.name}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: `${theme.emerald}20` }]}>
                    <Text style={[styles.tierBadgeText, { color: theme.emerald }]}>{t.profile.tierBadge}</Text>
                  </View>
                </View>
                <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user.email}</Text>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.logoutBtnText, { color: theme.rose }]}>{t.profile.logoutBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loggedOutBox}>
              <Text style={[styles.loggedOutSub, { color: theme.textSecondary }]}>
                {t.profile.loginSub}
              </Text>
              <TouchableOpacity
                onPress={handleLogin}
                style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.loginBtnText}>{t.profile.loginBtn}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Theme Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.textMuted }]}>
            {t.profile.themeTitle.toUpperCase()}
          </Text>

          <View style={styles.pillGroup}>
            {(
              [
                { mode: 'dark', label: t.profile.themeDark, icon: '🌙' },
                { mode: 'light', label: t.profile.themeLight, icon: '☀️' },
                { mode: 'system', label: t.profile.themeSystem, icon: '⚙️' },
              ] as { mode: ThemeMode; label: string; icon: string }[]
            ).map((item) => {
              const active = themeMode === item.mode
              return (
                <TouchableOpacity
                  key={item.mode}
                  onPress={() => setThemeMode(item.mode)}
                  style={[
                    styles.pillItem,
                    {
                      backgroundColor: active ? theme.primary : theme.bgElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.pillIcon}>{item.icon}</Text>
                  <Text style={[styles.pillText, { color: active ? '#ffffff' : theme.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Language Preferences */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.textMuted }]}>
            {t.profile.languageTitle.toUpperCase()}
          </Text>

          <View style={styles.pillGroup}>
            {(
              [
                { lang: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
                { lang: 'en', label: 'English', flag: '🇬🇧' },
              ] as { lang: Language; label: string; flag: string }[]
            ).map((item) => {
              const active = language === item.lang
              return (
                <TouchableOpacity
                  key={item.lang}
                  onPress={() => setLanguage(item.lang)}
                  style={[
                    styles.pillItem,
                    {
                      backgroundColor: active ? theme.primary : theme.bgElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.pillIcon}>{item.flag}</Text>
                  <Text style={[styles.pillText, { color: active ? '#ffffff' : theme.textPrimary }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Local Storage & Cache */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.textMuted }]}>
            {t.profile.storageTitle.toUpperCase()}
          </Text>
          <Text style={[styles.storageDesc, { color: theme.textSecondary }]}>
            {t.profile.storageDesc}
          </Text>
          <TouchableOpacity
            onPress={() => {
              refreshDocuments()
              Alert.alert(t.common.success, 'Đã đồng bộ lại danh mục tài liệu cục bộ.')
            }}
            style={[styles.cacheBtn, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}
          >
            <Text style={[styles.cacheBtnText, { color: theme.textPrimary }]}>
              🔄 {t.profile.clearCache}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Privacy Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
          <Text style={[styles.sectionCardTitle, { color: theme.textMuted }]}>
            {t.profile.legalSection.toUpperCase()}
          </Text>

          <TouchableOpacity
            onPress={() => setLegalModal('terms')}
            style={[styles.legalRow, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.legalRowText, { color: theme.textPrimary }]}>📜 {t.profile.termsBtn}</Text>
            <Text style={[styles.legalRowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLegalModal('privacy')}
            style={[styles.legalRow, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.legalRowText, { color: theme.textPrimary }]}>🔒 {t.profile.privacyBtn}</Text>
            <Text style={[styles.legalRowArrow, { color: theme.textMuted }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.softty.net')}
            style={[styles.legalRow, { borderBottomColor: theme.border }]}
          >
            <Text style={[styles.legalRowText, { color: theme.primary }]}>🌐 {t.profile.websiteBtn}</Text>
            <Text style={[styles.legalRowArrow, { color: theme.textMuted }]}>↗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://my.softty.net')}
            style={[styles.legalRow, { borderBottomWidth: 0 }]}
          >
            <Text style={[styles.legalRowText, { color: theme.primary }]}>💼 {t.profile.portalBtn}</Text>
            <Text style={[styles.legalRowArrow, { color: theme.textMuted }]}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* About Info */}
        <View style={styles.aboutBox}>
          <Text style={[styles.aboutTitle, { color: theme.textMuted }]}>{t.profile.version}</Text>
          <Text style={[styles.aboutSubtitle, { color: theme.textMuted }]}>{t.profile.offlineGuaranteed}</Text>
          <Text style={[styles.copyright, { color: theme.textMuted }]}>{t.profile.copyright}</Text>
          <Text style={[styles.aboutSubtitle, { color: theme.textMuted, fontSize: 11, marginTop: 2 }]}>
            {t.profile.company}
          </Text>
        </View>
      </ScrollView>

      {/* Legal & Privacy Modal */}
      <Modal
        visible={legalModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLegalModal(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {legalModal === 'terms' ? t.profile.termsBtn : t.profile.privacyBtn}
            </Text>
            <TouchableOpacity
              onPress={() => setLegalModal(null)}
              style={[styles.modalCloseBtn, { backgroundColor: theme.bgElevated }]}
            >
              <Text style={[styles.modalCloseText, { color: theme.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {legalModal === 'terms' ? (
              <View style={styles.legalContentBox}>
                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  1. Quyền sở hữu dữ liệu cá nhân
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Softty Office hoạt động 100% ngoại tuyến (Offline-First). Mọi tài liệu Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Markdown và PDF của bạn được lưu an toàn trực tiếp trên bộ nhớ thiết bị.
                </Text>

                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  2. Chuyển tệp Softty Drop
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Quá trình bắn tệp qua mạng Wi-Fi cục bộ (LAN) diễn ra trực tiếp ngang hàng (P2P), không lưu trữ qua bất kỳ máy chủ đám mây trung gian nào.
                </Text>

                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  3. Đơn vị chủ quản
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Bản quyền phần mềm thuộc về {t.profile.company}.
                </Text>
              </View>
            ) : (
              <View style={styles.legalContentBox}>
                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  1. Cam kết không thu thập nội dung tệp
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Chúng tôi không bao giờ đọc, quét, phân tích hay huấn luyện AI trên nội dung tài liệu của bạn.
                </Text>

                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  2. Không quảng cáo & Không theo dõi
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Softty Office không chứa mã theo dõi quảng cáo bên thứ ba và không bán dữ liệu hành vi.
                </Text>

                <Text style={[styles.legalSectionHeading, { color: theme.textPrimary }]}>
                  3. Tài khoản Softty Account
                </Text>
                <Text style={[styles.legalParagraph, { color: theme.textSecondary }]}>
                  Đăng nhập qua chuẩn quốc tế OAuth 2.0 PKCE. Mọi thông tin xác thực đều được mã hóa bằng SecureStore trên thiết bị.
                </Text>
              </View>
            )}
          </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  userInfoBox: {
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loggedOutBox: {
    gap: 12,
  },
  loggedOutSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  loginBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  pillItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  storageDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  cacheBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cacheBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aboutBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    gap: 4,
  },
  aboutTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  aboutSubtitle: {
    fontSize: 11,
  },
  copyright: {
    fontSize: 10,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  legalRowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legalRowArrow: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  legalContentBox: {
    gap: 12,
  },
  legalSectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  legalParagraph: {
    fontSize: 13,
    lineHeight: 20,
  },
})
