// components/HistoryModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HistoryModal = ({ 
  visible, 
  onClose, 
  scanHistory = [], 
  isDarkMode,
  onClearHistory,
  onViewScanResult
}) => {
  const safeHistory = Array.isArray(scanHistory) ? scanHistory : [];
  
  // Динамические стили
  const dynamicStyles = {
    modalContent: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    },
    modalTitle: {
      color: isDarkMode ? 'white' : '#1d1d1f',
    },
    historyItem: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8',
    },
    historyTitle: {
      color: isDarkMode ? 'white' : '#1d1d1f',
    },
    historyDate: {
      color: isDarkMode ? '#aaa' : '#666',
    },
    emptyText: {
      color: isDarkMode ? '#aaa' : '#666',
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.modalContent, dynamicStyles.modalContent]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              📚 История сканирований
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={isDarkMode ? "#aaa" : "#666"} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.historyList}>
            {safeHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons 
                  name="time-outline" 
                  size={60} 
                  color={isDarkMode ? "#666" : "#999"} 
                />
                <Text style={[styles.emptyTitle, dynamicStyles.emptyText]}>
                  История пуста
                </Text>
                <Text style={[styles.emptySubtitle, dynamicStyles.emptyText]}>
                  Здесь будут сохраняться результаты сканирований
                </Text>
              </View>
            ) : (
              safeHistory.map((item, index) => (
                <TouchableOpacity 
                  key={item.id || index}
                  style={[styles.historyItem, dynamicStyles.historyItem]}
                  onPress={() => onViewScanResult && onViewScanResult(item.apps || [])}
                >
                  <View style={styles.historyItemHeader}>
                    <Ionicons 
                      name="phone-portrait-outline" 
                      size={24} 
                      color={isDarkMode ? "#007AFF" : "#0056CC"} 
                    />
                    <View style={styles.historyItemInfo}>
                      <Text style={[styles.historyTitle, dynamicStyles.historyTitle]}>
                        {item.deviceName || `Скан ${index + 1}`}
                      </Text>
                      <Text style={[styles.historyDate, dynamicStyles.historyDate]}>
                        {item.date || 'Дата неизвестна'}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={isDarkMode ? "#666" : "#999"} 
                    />
                  </View>
                  
                  <View style={styles.historyItemFooter}>
                    <View style={styles.historyBadge}>
                      <Text style={[styles.historyBadgeText, { color: isDarkMode ? '#007AFF' : '#0056CC' }]}>
                        {item.appsCount || 0} приложений
                      </Text>
                    </View>
                    {item.recognitionMethod && (
                      <Text style={[styles.historyMethod, { color: isDarkMode ? '#888' : '#999' }]}>
                        {item.recognitionMethod}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          {safeHistory.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: '#ff3b30' }]}
              onPress={onClearHistory}
            >
              <Ionicons name="trash-outline" size={18} color="white" />
              <Text style={styles.clearButtonText}>
                Очистить историю
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.closeButtonFull, { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>
              Закрыть
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    maxHeight: screenHeight * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: screenHeight * 0.5,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
  },
  historyItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyMethod: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButtonFull: {
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HistoryModal;