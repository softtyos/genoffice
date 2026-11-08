import React, { useState } from 'react'
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import { DropScreen } from './src/screens/DropScreen'
import { ScannerScreen } from './src/screens/ScannerScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'

type TabKey = 'drop' | 'scanner' | 'profile'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('drop')

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0e1322" />

      {/* Screen Body */}
      <View style={styles.content}>
        {activeTab === 'drop' && <DropScreen />}
        {activeTab === 'scanner' && <ScannerScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('drop')}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === 'drop' && styles.tabLabelActive]}>
            Softty Drop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('scanner')}
        >
          <Text style={styles.tabIcon}>📄</Text>
          <Text style={[styles.tabLabel, activeTab === 'scanner' && styles.tabLabelActive]}>
            Quét PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Tài Khoản
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1322',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#0e1322',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#06b6d4',
  },
})
