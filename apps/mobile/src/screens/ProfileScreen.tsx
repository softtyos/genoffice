import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { SofttyAuthService } from '../services/auth'

export function ProfileScreen() {
  const [user, setUser] = useState(SofttyAuthService.getCurrentUser())

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản Softty ID?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          SofttyAuthService.logout()
          setUser(null)
        },
      },
    ])
  }

  const handleLogin = async () => {
    const loggedInUser = await SofttyAuthService.loginWithDeviceCode('DEMO')
    setUser(loggedInUser)
    Alert.alert('Thành công', `Chào mừng ${loggedInUser.name} đã đăng nhập Softty ID!`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tài Khoản Softty</Text>
        <Text style={styles.subtitle}>Định danh tập trung toàn hệ sinh thái Softty.net</Text>
      </View>

      {user ? (
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>{user.tier.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã định danh Softty ID</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái Softty Drop</Text>
            <Text style={[styles.infoValue, { color: '#10b981' }]}>Đang kết nối Wi-Fi</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginCard}>
          <Text style={styles.loginCardTitle}>Chưa Đăng Nhập</Text>
          <Text style={styles.loginCardDesc}>
            Đăng nhập bằng tài khoản Softty.net để tự động chứng thực kết nối Softty Drop và đồng bộ tài liệu.
          </Text>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Đăng Nhập Bằng Softty.net</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.ecosystemCard}>
        <Text style={styles.ecosystemTitle}>HỆ SINH THÁI SOFTTY</Text>
        <Text style={styles.ecosystemItem}>• accounts.softty.net — Định danh & Bảo mật</Text>
        <Text style={styles.ecosystemItem}>• office.softty.net — Bộ ứng dụng văn phòng AI</Text>
        <Text style={styles.ecosystemItem}>• my.softty.net — Cổng quản trị khách hàng</Text>
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
  card: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  tierBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  tierText: {
    color: '#06b6d4',
    fontSize: 10,
    fontWeight: '800',
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  infoValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  loginCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  loginCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  loginCardDesc: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
    lineHeight: 19,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  ecosystemCard: {
    marginTop: 24,
    padding: 18,
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  ecosystemTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ecosystemItem: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
})
