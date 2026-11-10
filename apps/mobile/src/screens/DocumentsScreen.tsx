import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { OfficeDocument, OfficeDocType } from '../types'

export function DocumentsScreen() {
  const {
    theme,
    t,
    documents,
    activeDocument,
    openDocument,
    closeDocument,
    pickAndOpenDocument,
    createNewDocument,
    deleteDocument,
    beamDocumentToDesktop,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | OfficeDocType>('all')

  // Filter documents by type and search query
  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter
    const matchesQuery =
      searchQuery.trim() === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesQuery
  })

  const getDocBadgeColor = (type: OfficeDocType) => {
    switch (type) {
      case 'docs':
        return theme.primary
      case 'sheets':
        return theme.emerald
      case 'slides':
        return theme.amber
      case 'pdf':
        return theme.rose
      case 'markdown':
        return theme.purple
      default:
        return theme.cyan
    }
  }

  const renderDocIcon = (type: OfficeDocType, color: string) => {
    switch (type) {
      case 'docs':
        return <Ionicons name="document-text-outline" size={20} color={color} />
      case 'sheets':
        return <Ionicons name="grid-outline" size={20} color={color} />
      case 'slides':
        return <Ionicons name="easel-outline" size={20} color={color} />
      case 'pdf':
        return <Ionicons name="reader-outline" size={20} color={color} />
      case 'markdown':
        return <Ionicons name="code-slash-outline" size={20} color={color} />
      default:
        return <Ionicons name="document-outline" size={20} color={color} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleCreateNew = (type: OfficeDocType) => {
    Alert.prompt
      ? Alert.prompt(
          'Tên tài liệu mới',
          'Nhập tên cho tài liệu:',
          async (name) => {
            if (name) {
              const ext = type === 'docs' ? '.docx' : type === 'sheets' ? '.xlsx' : type === 'slides' ? '.pptx' : type === 'pdf' ? '.pdf' : '.md'
              const finalName = name.endsWith(ext) ? name : `${name}${ext}`
              await createNewDocument(type, finalName)
            }
          },
          'plain-text',
          `Tai_lieu_moi_${Date.now()}`
        )
      : createNewDocument(type)
  }

  const handleDocOptions = (doc: OfficeDocument) => {
    Alert.alert(
      doc.name,
      'Chọn tác vụ cho tài liệu này:',
      [
        {
          text: t.common.view,
          onPress: () => openDocument(doc),
        },
        {
          text: t.common.beamToDesktop,
          onPress: () => beamDocumentToDesktop(doc),
        },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => deleteDocument(doc.id),
        },
        {
          text: t.common.cancel,
          style: 'cancel',
        },
      ]
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.brandLogoImage}
          />
          <View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>Softty Office</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>{t.home.subtitle}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={17} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t.common.search}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Quick Open & Create Ribbon */}
        <View style={styles.quickRibbon}>
          {/* Main Open Local File Card */}
          <TouchableOpacity
            onPress={pickAndOpenDocument}
            style={[
              styles.openFileCard,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
            activeOpacity={0.8}
          >
            <View style={[styles.openFileIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
              <Ionicons name="folder-open-outline" size={22} color={theme.primary} />
            </View>
            <View style={styles.openFileTextBox}>
              <Text style={[styles.openFileTitle, { color: theme.textPrimary }]}>{t.home.openFile}</Text>
              <Text style={[styles.openFileDesc, { color: theme.textMuted }]}>{t.home.openFileDesc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          {/* New Document Quick Action Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newActionsScroll}>
            <TouchableOpacity
              onPress={() => handleCreateNew('docs')}
              style={[styles.quickCreateBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
            >
              <View style={[styles.quickCreateIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.quickCreateLabel, { color: theme.textPrimary }]}>{t.home.newDoc}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCreateNew('sheets')}
              style={[styles.quickCreateBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
            >
              <View style={[styles.quickCreateIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="grid-outline" size={20} color={theme.emerald} />
              </View>
              <Text style={[styles.quickCreateLabel, { color: theme.textPrimary }]}>{t.home.newSheet}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCreateNew('slides')}
              style={[styles.quickCreateBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
            >
              <View style={[styles.quickCreateIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="easel-outline" size={20} color={theme.amber} />
              </View>
              <Text style={[styles.quickCreateLabel, { color: theme.textPrimary }]}>{t.home.newSlide}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCreateNew('markdown')}
              style={[styles.quickCreateBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
            >
              <View style={[styles.quickCreateIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
                <Ionicons name="code-slash-outline" size={20} color={theme.purple} />
              </View>
              <Text style={[styles.quickCreateLabel, { color: theme.textPrimary }]}>{t.home.newMd}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filter Chips Bar */}
        <View style={styles.filterSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t.home.recentFiles}</Text>
            <Text style={[styles.sectionCount, { color: theme.textMuted }]}>{t.home.filesCount(filteredDocs.length)}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {(
              [
                { key: 'all', label: t.home.filterAll },
                { key: 'docs', label: t.home.filterDocs },
                { key: 'sheets', label: t.home.filterSheets },
                { key: 'slides', label: t.home.filterSlides },
                { key: 'pdf', label: t.home.filterPdf },
                { key: 'markdown', label: t.home.filterMd },
              ] as const
            ).map((chip) => {
              const active = selectedFilter === chip.key
              return (
                <TouchableOpacity
                  key={chip.key}
                  onPress={() => setSelectedFilter(chip.key)}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: active ? theme.primary : theme.bgSurface,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: active ? '#ffffff' : theme.textSecondary },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
            <Ionicons name="folder-outline" size={44} color={theme.textMuted} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t.common.emptyDocs}</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>{t.common.emptyDocsSub}</Text>
            <TouchableOpacity
              onPress={pickAndOpenDocument}
              style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.emptyActionBtnText}>{t.home.openFile}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.docsList}>
            {filteredDocs.map((item) => {
              const badgeColor = getDocBadgeColor(item.type)
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openDocument(item)}
                  onLongPress={() => handleDocOptions(item)}
                  style={[
                    styles.docCard,
                    { backgroundColor: theme.bgSurface, borderColor: theme.border },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={[styles.docCardIconBox, { backgroundColor: theme.bgElevated, borderColor: theme.border, borderWidth: 1 }]}>
                    {renderDocIcon(item.type, badgeColor)}
                  </View>

                  <View style={styles.docCardDetails}>
                    <Text style={[styles.docCardName, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.docCardMetaRow}>
                      <View style={[styles.smallBadge, { backgroundColor: `${badgeColor}20` }]}>
                        <Text style={[styles.smallBadgeText, { color: badgeColor }]}>
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.docCardMetaText, { color: theme.textMuted }]}>
                        {formatFileSize(item.size)} • {new Date(item.modifiedAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDocOptions(item)}
                    style={styles.moreBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="ellipsis-vertical" size={17} color={theme.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  brandLogoImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 14,
    padding: 4,
  },
  scrollArea: {
    flex: 1,
  },
  quickRibbon: {
    padding: 16,
    gap: 12,
  },
  openFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  openFileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openFileIcon: {
    fontSize: 24,
  },
  openFileTextBox: {
    flex: 1,
  },
  openFileTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  openFileDesc: {
    fontSize: 12,
    marginTop: 3,
  },
  arrowRight: {
    fontSize: 16,
  },
  newActionsScroll: {
    flexDirection: 'row',
  },
  quickCreateBtn: {
    width: 105,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
    gap: 8,
  },
  quickCreateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCreateIcon: {
    fontSize: 18,
  },
  quickCreateLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  docsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  docCardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCardIcon: {
    fontSize: 20,
  },
  docCardDetails: {
    flex: 1,
  },
  docCardName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  docCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  smallBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  docCardMetaText: {
    fontSize: 11,
  },
  moreBtn: {
    padding: 8,
  },
  moreBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyBox: {
    margin: 16,
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyActionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
})
