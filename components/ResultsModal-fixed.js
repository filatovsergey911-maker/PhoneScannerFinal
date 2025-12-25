// components/ResultsModal-fixed.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ResultsModalFixed = ({ 
  visible, 
  onClose, 
  detectedApps, 
  isDarkMode,
  openInStore,
  useRealRecognition 
}) => {
  const safeApps = Array.isArray(detectedApps) ? detectedApps : [];

  const handleOpenStore = (app) => {
    if (app.storeUrl) {
      Linking.openURL(app.storeUrl).catch(err => {
        Alert.alert('Ошибка', 'Не удалось открыть магазин приложений');
      });
    } else {
      Alert.alert('Ссылка отсутствует', 'Для этого приложения нет ссылки в магазин');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#4CAF50';
    if (confidence >= 70) return '#FF9800';
    return '#F44336';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }
      ]}>
        <View style={[
          styles.modalContent,
          { 
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            borderColor: isDarkMode ? '#333' : '#e5e5e7'
          }
        ]}>
          {/* Заголовок */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[
                styles.modalTitle,
                { color: isDarkMode ? 'white' : '#1d1d1f' }
              ]}>
                Результаты сканирования
              </Text>
              <Text style={[
                styles.modalSubtitle,
                { color: isDarkMode ? '#aaa' : '#666' }
              ]}>
                Найдено приложений: {safeApps.length} • (Режим: {useRealRecognition ? 'OCR' : 'Симуляция'})
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={isDarkMode ? "#aaa" : "#666"} />
            </TouchableOpacity>
          </View>

          {/* Список приложений */}
          <ScrollView 
            style={styles.appsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {safeApps.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="apps" size={64} color={isDarkMode ? "#444" : "#ccc"} />
                <Text style={[
                  styles.emptyText,
                  { color: isDarkMode ? '#aaa' : '#666' }
                ]}>
                  Приложения не найдены
                </Text>
              </View>
            ) : (
              safeApps.map((app, index) => (
                <View 
                  key={app.id || index} 
                  style={[
                    styles.appCard,
                    { 
                      backgroundColor: isDarkMode ? '#252525' : '#f8f8f8',
                      borderColor: isDarkMode ? '#333' : '#e0e0e0'
                    },
                    // Добавляем отступ для самой верхней карточки
                    index === 0 && styles.firstAppCard
                  ]}
                >
                  {/* Иконка и основная информация */}
                  <View style={styles.appInfo}>
                    {/* Контейнер для иконки с fallback */}
                    <View style={styles.iconContainer}>
                      {app.icon ? (
                        <Image 
                          source={{ uri: app.icon }} 
                          style={styles.appIcon}
                          onError={() => console.log(`Не удалось загрузить иконку для: ${app.name}`)}
                        />
                      ) : (
                        <View style={[
                          styles.appIcon, 
                          styles.fallbackIcon,
                          { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }
                        ]}>
                          <Ionicons 
                            name="apps" 
                            size={28} 
                            color={isDarkMode ? "#666" : "#999"} 
                          />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.appDetails}>
                      {/* Название приложения */}
                      <View style={styles.appNameRow}>
                        <Text style={[
                          styles.appName,
                          { color: isDarkMode ? 'white' : '#1d1d1f' }
                        ]}>
                          {app.name}
                        </Text>

                        <View style={styles.confidenceContainer}>
                          <View style={[
                            styles.confidenceBadge,
                            { backgroundColor: getConfidenceColor(app.confidence) + '20' }
                          ]}>
                            <View style={[
                              styles.confidenceDot,
                              { backgroundColor: getConfidenceColor(app.confidence) }
                            ]} />
                            <Text style={[
                              styles.confidenceText,
                              { color: getConfidenceColor(app.confidence) }
                            ]}>
                              Точность {app.confidence}%
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <Text style={[
                        styles.appPackage,
                        { color: isDarkMode ? '#aaa' : '#666' }
                      ]}>
                      </Text>
                    </View>
                  </View>

                  {/* Кнопка открытия в магазине */}
                  <TouchableOpacity
                    style={[
                      styles.storeButton,
                      { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' }
                    ]}
                    onPress={() => handleOpenStore(app)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome name="external-link" size={16} color="white" />
                    <Text style={styles.storeButtonText}>
                      Открыть в магазине
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Кнопки действий */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }
              ]}
              onPress={onClose}
            >
              <Text style={[
                styles.actionButtonText,
                { color: isDarkMode ? 'white' : '#1d1d1f' }
              ]}>
                Закрыть
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
  closeButton: {
    padding: 5,
  },
  appsList: {
    maxHeight: 400,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 5, // Небольшой отступ сверху для всех карточек
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'System',
  },
  appCard: {
    flexDirection: 'column',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  // Стиль для самой верхней карточки - добавляем отступ сверху
  firstAppCard: {
    marginTop: 10,
  },
  appInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconContainer: {
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  fallbackIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appDetails: {
    flex: 1,
    marginLeft: 16,
  },
  // Новый контейнер для строки с названием и точностью
  appNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    flex: 1,
    marginRight: 8, // Отступ между названием и блоком точности
  },
  // Контейнер для блока точности
  confidenceContainer: {
    flexShrink: 0,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  storeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default ResultsModalFixed;