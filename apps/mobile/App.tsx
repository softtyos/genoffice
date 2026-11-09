import React, { useState } from 'react'
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { AppProvider, useApp } from './src/context/AppContext'
import { DocumentsScreen } from './src/screens/DocumentsScreen'
import { DropScreen } from './src/screens/DropScreen'
import { ScannerScreen } from './src/screens/ScannerScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'

type TabKey = 'documents' | 'drop' | 'scanner' | 'profile'

function MainTabs() {
  const { theme, t } = useApp()
  const [activeTab, setActiveTab] = useState<TabKey>('documents')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      {/* Screen Body */}
      <View style={styles.content}>
        {activeTab === 'documents' && <DocumentsScreen />}
        {activeTab === 'drop' && <DropScreen />}
        {activeTab === 'scanner' && <ScannerScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.tabBarBg,
            borderTopColor: theme.tabBarBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('documents')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📂</Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'documents' ? theme.primary : theme.textMuted },
            ]}
          >
            {t.tabs.documents}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('drop')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'drop' ? theme.cyan : theme.textMuted },
            ]}
          >
            {t.tabs.drop}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('scanner')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📄</Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'scanner' ? theme.rose : theme.textMuted },
            ]}
          >
            {t.tabs.scanner}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'profile' ? theme.primary : theme.textMuted },
            ]}
          >
            {t.tabs.profile}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainTabs />
      </AppProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
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
    fontWeight: '700',
  },
})
