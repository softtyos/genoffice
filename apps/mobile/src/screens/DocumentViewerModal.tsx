import React, { useState } from 'react'
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native'
import * as Sharing from 'expo-sharing'
import { useApp } from '../context/AppContext'
import { OfficeDocument } from '../types'

interface DocumentViewerModalProps {
  document: OfficeDocument | null
  visible: boolean
  onClose: () => void
}

export function DocumentViewerModal({ document, visible, onClose }: DocumentViewerModalProps) {
  const { theme, t, saveActiveDocument, beamDocumentToDesktop } = useApp()

  // Viewer States
  const [editorMode, setEditorMode] = useState<'view' | 'edit'>('view')
  const [editedText, setEditedText] = useState(document?.textContent || '')
  const [fontSize, setFontSize] = useState(15)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [activePdfPage, setActivePdfPage] = useState(1)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; val: string } | null>(null)
  const [isSigned, setIsSigned] = useState(document?.pdfData?.signed || false)
  const [sendingDrop, setSendingDrop] = useState(false)

  if (!document) return null

  // Ensure editedText syncs when document changes
  React.useEffect(() => {
    if (document) {
      setEditedText(document.textContent || '')
      setIsSigned(document.pdfData?.signed || false)
      setActiveSlideIndex(0)
      setActivePdfPage(1)
      setActiveSheetIndex(0)
      setSelectedCell(null)
      setEditorMode('view')
    }
  }, [document])

  const handleSaveText = async () => {
    if (!document) return
    const updated: OfficeDocument = {
      ...document,
      textContent: editedText,
      size: editedText.length,
      modifiedAt: Date.now(),
    }
    await saveActiveDocument(updated)
    setEditorMode('view')
    Alert.alert(t.common.success, t.common.saved)
  }

  const handleBeam = async () => {
    setSendingDrop(true)
    try {
      await beamDocumentToDesktop(document)
    } finally {
      setSendingDrop(false)
    }
  }

  const handleShare = async () => {
    if (!document) return
    try {
      const isAvailable = await Sharing.isAvailableAsync()
      if (isAvailable && document.uri) {
        await Sharing.shareAsync(document.uri, {
          mimeType: 'application/octet-stream',
          dialogTitle: `Chia sẻ ${document.name}`,
        })
      } else {
        Alert.alert(t.common.share, `Chia sẻ tệp: ${document.name}`)
      }
    } catch (err: any) {
      Alert.alert(t.common.error, `Không thể chia sẻ tệp: ${err.message || err}`)
    }
  }

  const handleSignPdf = () => {
    setIsSigned(true)
    if (document.pdfData) {
      document.pdfData.signed = true
      document.pdfData.signedAt = new Date().toLocaleString('vi-VN')
      document.pdfData.signatureName = 'Softty Verified Sign'
      saveActiveDocument({ ...document })
    }
    Alert.alert('Ký số thành công', 'Đã chèn chữ ký điện tử xác thực vào tài liệu PDF.')
  }

  // Type badge color
  const getBadgeColor = () => {
    switch (document.type) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Top App Bar */}
        <View style={[styles.appBar, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
          <View style={styles.appBarLeft}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={[styles.closeIcon, { color: theme.textPrimary }]}>←</Text>
            </TouchableOpacity>

            <View style={[styles.typeBadge, { backgroundColor: `${getBadgeColor()}25`, borderColor: getBadgeColor() }]}>
              <Text style={[styles.typeBadgeText, { color: getBadgeColor() }]}>
                {document.type.toUpperCase()}
              </Text>
            </View>

            <View style={styles.titleBox}>
              <Text style={[styles.docTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {document.name}
              </Text>
              <Text style={[styles.docMeta, { color: theme.textMuted }]}>
                {formatFileSize(document.size)} • {new Date(document.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.appBarRight}>
            <TouchableOpacity
              onPress={handleBeam}
              disabled={sendingDrop}
              style={[styles.beamBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.beamBtnIcon}>📡</Text>
              <Text style={styles.beamBtnText}>{sendingDrop ? '...' : 'Bắn Desktop'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={[styles.iconBtn, { backgroundColor: theme.bgElevated }]} activeOpacity={0.7}>
              <Text style={[styles.iconBtnText, { color: theme.textPrimary }]}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Mode Toolbar (for Docs / Markdown) */}
        {(document.type === 'docs' || document.type === 'markdown' || document.type === 'html') && (
          <View style={[styles.secondaryBar, { backgroundColor: theme.bgElevated, borderBottomColor: theme.border }]}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => setEditorMode('view')}
                style={[
                  styles.segmentBtn,
                  editorMode === 'view' && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: editorMode === 'view' ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  {t.viewer.readerMode}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditorMode('edit')}
                style={[
                  styles.segmentBtn,
                  editorMode === 'edit' && { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: editorMode === 'edit' ? '#ffffff' : theme.textSecondary },
                  ]}
                >
                  {t.viewer.editMode}
                </Text>
              </TouchableOpacity>
            </View>

            {editorMode === 'view' ? (
              <View style={styles.fontControls}>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.max(12, fontSize - 1))}
                  style={[styles.smallBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.textPrimary }]}>A-</Text>
                </TouchableOpacity>
                <Text style={[styles.fontSizeLabel, { color: theme.textMuted }]}>{fontSize}px</Text>
                <TouchableOpacity
                  onPress={() => setFontSize(Math.min(24, fontSize + 1))}
                  style={[styles.smallBtn, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}
                >
                  <Text style={[styles.smallBtnText, { color: theme.textPrimary }]}>A+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSaveText}
                style={[styles.saveBtn, { backgroundColor: theme.emerald }]}
              >
                <Text style={styles.saveBtnText}>{t.common.save}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ================= DOCUMENT BODY VIEWERS ================= */}

        {/* 1. DOCS & MARKDOWN VIEWER */}
        {(document.type === 'docs' || document.type === 'markdown' || document.type === 'html') && (
          <View style={styles.body}>
            {editorMode === 'view' ? (
              <ScrollView style={styles.readerScroll} contentContainerStyle={styles.readerContent}>
                <View style={[styles.documentPaper, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
                  <Text style={[styles.paperHeader, { color: theme.primary }]}>
                    {document.type === 'markdown' ? 'MARKDOWN DOCUMENT' : 'MICROSOFT WORD (DOCX)'}
                  </Text>
                  <Text
                    style={[
                      styles.paperBody,
                      { color: theme.textPrimary, fontSize, lineHeight: fontSize * 1.6 },
                    ]}
                  >
                    {editedText || document.textContent || 'Tài liệu không có nội dung văn bản thuần.'}
                  </Text>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.editorContainer}>
                <TextInput
                  style={[
                    styles.editorInput,
                    {
                      backgroundColor: theme.bgSurface,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                      fontSize,
                    },
                  ]}
                  multiline
                  value={editedText}
                  onChangeText={setEditedText}
                  placeholder="Nhập nội dung văn bản..."
                  placeholderTextColor={theme.textMuted}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>
        )}

        {/* 2. SHEETS VIEWER */}
        {document.type === 'sheets' && (
          <View style={styles.body}>
            {/* Sheet Tabs */}
            {document.sheetData && (
              <View style={[styles.sheetTabsBar, { backgroundColor: theme.bgElevated, borderBottomColor: theme.border }]}>
                <Text style={[styles.sheetTabsLabel, { color: theme.textMuted }]}>{t.viewer.sheetTabs}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {document.sheetData.sheetNames.map((name, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setActiveSheetIndex(idx)}
                      style={[
                        styles.sheetTabItem,
                        activeSheetIndex === idx && {
                          backgroundColor: theme.bgSurface,
                          borderBottomColor: theme.emerald,
                          borderBottomWidth: 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sheetTabItemText,
                          {
                            color: activeSheetIndex === idx ? theme.emerald : theme.textSecondary,
                            fontWeight: activeSheetIndex === idx ? '700' : '500',
                          },
                        ]}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Formula Bar */}
            <View style={[styles.formulaBar, { backgroundColor: theme.bgSurface, borderBottomColor: theme.border }]}>
              <Text style={[styles.fxLabel, { color: theme.emerald }]}>fx</Text>
              <Text style={[styles.fxValue, { color: theme.textPrimary }]} numberOfLines={1}>
                {selectedCell ? selectedCell.val : '=SUM(Doanh_Thu_Q1)'}
              </Text>
            </View>

            {/* Scrollable Spreadsheet Grid */}
            <ScrollView style={styles.gridVerticalScroll} horizontal={false}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={[styles.sheetGrid, { borderColor: theme.border }]}>
                  {/* Grid Header Row */}
                  <View style={[styles.gridRow, { backgroundColor: theme.bgElevated }]}>
                    <View style={[styles.cornerCell, { borderColor: theme.border }]}>
                      <Text style={[styles.headerCellText, { color: theme.textMuted }]}>#</Text>
                    </View>
                    {(document.sheetData?.headers || ['A', 'B', 'C', 'D', 'E']).map((col, cIdx) => (
                      <View key={cIdx} style={[styles.headerCell, { borderColor: theme.border }]}>
                        <Text style={[styles.headerCellText, { color: theme.textPrimary }]} numberOfLines={1}>
                          {col}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Grid Data Rows */}
                  {(document.sheetData?.rows || [
                    ['1', '100', '200', '300'],
                    ['2', '400', '500', '600'],
                  ]).map((row, rIdx) => (
                    <View key={rIdx} style={[styles.gridRow, { backgroundColor: theme.bgSurface }]}>
                      <View style={[styles.cornerCell, { borderColor: theme.border, backgroundColor: theme.bgElevated }]}>
                        <Text style={[styles.rowNumberText, { color: theme.textMuted }]}>{rIdx + 1}</Text>
                      </View>
                      {row.map((cell, cIdx) => {
                        const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx
                        return (
                          <TouchableOpacity
                            key={cIdx}
                            onPress={() => setSelectedCell({ row: rIdx, col: cIdx, val: String(cell) })}
                            style={[
                              styles.dataCell,
                              { borderColor: theme.border },
                              isSelected && {
                                borderColor: theme.emerald,
                                borderWidth: 2,
                                backgroundColor: `${theme.emerald}15`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cellText,
                                { color: theme.textPrimary },
                                String(cell).startsWith('+') && { color: theme.emerald, fontWeight: '700' },
                                String(cell) === 'TOTAL' && { fontWeight: '700' },
                              ]}
                              numberOfLines={1}
                            >
                              {String(cell)}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          </View>
        )}

        {/* 3. SLIDES VIEWER */}
        {document.type === 'slides' && (
          <View style={styles.body}>
            {document.slideData && (
              <View style={styles.slidesContainer}>
                {/* Slide Card Canvas */}
                <View style={[styles.slideCanvas, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
                  <View style={styles.slideHeader}>
                    <Text style={[styles.slideBrandTag, { color: theme.amber }]}>SOFTTY SLIDES PRESENTATION</Text>
                    <Text style={[styles.slideNumberBadge, { backgroundColor: theme.bgElevated, color: theme.textMuted }]}>
                      {t.viewer.slideOf(activeSlideIndex + 1, document.slideData.slides.length)}
                    </Text>
                  </View>

                  <Text style={[styles.slideTitle, { color: theme.textPrimary }]}>
                    {document.slideData.slides[activeSlideIndex]?.title || 'Tiêu Đề Slide'}
                  </Text>

                  {document.slideData.slides[activeSlideIndex]?.subtitle && (
                    <Text style={[styles.slideSubtitle, { color: theme.cyan }]}>
                      {document.slideData.slides[activeSlideIndex].subtitle}
                    </Text>
                  )}

                  <View style={styles.slideBulletsList}>
                    {document.slideData.slides[activeSlideIndex]?.bullets.map((bullet, bIdx) => (
                      <View key={bIdx} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: theme.amber }]} />
                        <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{bullet}</Text>
                      </View>
                    ))}
                  </View>

                  {document.slideData.slides[activeSlideIndex]?.notes && (
                    <View style={[styles.notesBox, { backgroundColor: theme.bgElevated, borderColor: theme.border }]}>
                      <Text style={[styles.notesTitle, { color: theme.textMuted }]}>Ghi chú người thuyết trình:</Text>
                      <Text style={[styles.notesContent, { color: theme.textSecondary }]}>
                        {document.slideData.slides[activeSlideIndex].notes}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Slide Controller */}
                <View style={[styles.slideControlsBar, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
                  <TouchableOpacity
                    disabled={activeSlideIndex === 0}
                    onPress={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                    style={[
                      styles.slideNavBtn,
                      { backgroundColor: theme.bgElevated },
                      activeSlideIndex === 0 && { opacity: 0.4 },
                    ]}
                  >
                    <Text style={[styles.slideNavText, { color: theme.textPrimary }]}>◀ {t.viewer.prevSlide}</Text>
                  </TouchableOpacity>

                  {/* Thumbnail Pills */}
                  <View style={styles.slidePills}>
                    {document.slideData.slides.map((_, pIdx) => (
                      <TouchableOpacity
                        key={pIdx}
                        onPress={() => setActiveSlideIndex(pIdx)}
                        style={[
                          styles.slidePill,
                          { backgroundColor: theme.border },
                          activeSlideIndex === pIdx && { backgroundColor: theme.amber, width: 22 },
                        ]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    disabled={!document.slideData || activeSlideIndex === (document.slideData.slides.length - 1)}
                    onPress={() => {
                      if (document.slideData) {
                        setActiveSlideIndex(Math.min(document.slideData.slides.length - 1, activeSlideIndex + 1))
                      }
                    }}
                    style={[
                      styles.slideNavBtn,
                      { backgroundColor: theme.bgElevated },
                      (!document.slideData || activeSlideIndex === document.slideData.slides.length - 1) && { opacity: 0.4 },
                    ]}
                  >
                    <Text style={[styles.slideNavText, { color: theme.textPrimary }]}>{t.viewer.nextSlide} ▶</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 4. PDF VIEWER */}
        {document.type === 'pdf' && (
          <View style={styles.body}>
            <ScrollView style={styles.readerScroll} contentContainerStyle={styles.readerContent}>
              <View style={[styles.pdfPaper, { backgroundColor: theme.bgSurface, borderColor: theme.border }]}>
                {/* PDF Stamp & Header */}
                <View style={styles.pdfHeaderRow}>
                  <View style={[styles.pdfFormatTag, { backgroundColor: `${theme.rose}20`, borderColor: theme.rose }]}>
                    <Text style={[styles.pdfFormatText, { color: theme.rose }]}>SECURE PDF DOCUMENT</Text>
                  </View>
                  <Text style={[styles.pdfPageCountText, { color: theme.textMuted }]}>
                    {t.viewer.pdfPage(activePdfPage, document.pdfData?.totalPages || 1)}
                  </Text>
                </View>

                {/* PDF Content simulation */}
                <Text style={[styles.pdfTitle, { color: theme.textPrimary }]}>{document.name}</Text>
                <View style={[styles.pdfDivider, { backgroundColor: theme.border }]} />

                {(document.pdfData?.contentSummary || [
                  'Tài liệu văn bản PDF số hóa chất lượng cao.',
                  'Hỗ trợ đọc đa trang, phóng to chữ và xác thực chữ ký điện tử doanh nghiệp.',
                ]).map((para, pIdx) => (
                  <Text key={pIdx} style={[styles.pdfParagraph, { color: theme.textSecondary }]}>
                    {para}
                  </Text>
                ))}

                {/* E-Signature Box */}
                {isSigned ? (
                  <View style={[styles.signedBox, { backgroundColor: `${theme.emerald}15`, borderColor: theme.emerald }]}>
                    <Text style={styles.signedCheckIcon}>✓</Text>
                    <View style={styles.signedTextBox}>
                      <Text style={[styles.signedTitle, { color: theme.emerald }]}>{t.viewer.signedBadge}</Text>
                      <Text style={[styles.signedSubtitle, { color: theme.textSecondary }]}>
                        Ký bởi: {document.pdfData?.signatureName || 'Softty Verified User'} ({document.pdfData?.signedAt || '08/11/2026'})
                      </Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleSignPdf}
                    style={[styles.signPdfBtn, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.signPdfBtnText}>✍️ {t.viewer.signPdf}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  titleBox: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  docMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  beamBtnIcon: {
    fontSize: 13,
  },
  beamBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 7,
    borderRadius: 8,
  },
  iconBtnText: {
    fontSize: 14,
  },
  secondaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    backgroundColor: '#00000020',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fontSizeLabel: {
    fontSize: 11,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  readerScroll: {
    flex: 1,
  },
  readerContent: {
    padding: 16,
  },
  documentPaper: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 400,
  },
  paperHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  paperBody: {
    letterSpacing: 0.2,
  },
  editorContainer: {
    flex: 1,
    padding: 16,
  },
  editorInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    lineHeight: 24,
  },
  sheetTabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    height: 40,
  },
  sheetTabsLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 8,
  },
  sheetTabItem: {
    paddingHorizontal: 14,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTabItemText: {
    fontSize: 12,
  },
  formulaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  fxLabel: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  fxValue: {
    fontSize: 13,
    fontFamily: 'monospace',
    flex: 1,
  },
  gridVerticalScroll: {
    flex: 1,
  },
  sheetGrid: {
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
    height: 36,
  },
  cornerCell: {
    width: 44,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCell: {
    width: 130,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dataCell: {
    width: 130,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
  },
  rowNumberText: {
    fontSize: 11,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  slideCanvas: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    justifyContent: 'flex-start',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  slideBrandTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  slideNumberBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  slideSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  slideBulletsList: {
    gap: 14,
    marginVertical: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  notesBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesContent: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  slideControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  slideNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  slideNavText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slidePills: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  slidePill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pdfPaper: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 500,
  },
  pdfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfFormatTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pdfFormatText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pdfPageCountText: {
    fontSize: 11,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  pdfDivider: {
    height: 1,
    marginBottom: 16,
  },
  pdfParagraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  signedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    gap: 12,
  },
  signedCheckIcon: {
    fontSize: 24,
    color: '#10b981',
    fontWeight: '900',
  },
  signedTextBox: {
    flex: 1,
  },
  signedTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  signedSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  signPdfBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  signPdfBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
})
