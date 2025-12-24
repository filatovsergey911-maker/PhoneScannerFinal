// components/SettingsModal.js - УПРОЩЕННЫЙ
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const SettingsModal = ({
  visible,
  onClose,
  isDarkMode,
  useDarkTheme,
  useRealRecognition,
  autoSave,
  onToggleTheme,
  onToggleAutoSave,
  onToggleRecognitionMode,
  onClearHistory,
}) => {
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
            <Text style={[
              styles.modalTitle,
              { color: isDarkMode ? 'white' : '#1d1d1f' }
            ]}>
              Настройки
            </Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={isDarkMode ? "#aaa" : "#666"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsList} showsVerticalScrollIndicator={false}>
            {/* Тема */}
            <View style={[
              styles.settingItem,
              { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }
            ]}>
              <View style={styles.settingInfo}>
                <Ionicons 
                  name={useDarkTheme ? "moon" : "sunny"} 
                  size={22} 
                  color={isDarkMode ? "#007AFF" : "#0056CC"} 
                />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    { color: isDarkMode ? 'white' : '#1d1d1f' }
                  ]}>
                    Тёмная тема
                  </Text>
                  <Text style={[
                    styles.settingDescription,
                    { color: isDarkMode ? '#aaa' : '#666' }
                  ]}>
                    {useDarkTheme ? 'Тёмный интерфейс' : 'Светлый интерфейс'}
                  </Text>
                </View>
              </View>
              
              <Switch
                value={useDarkTheme}
                onValueChange={onToggleTheme}
                trackColor={{ false: '#767577', true: isDarkMode ? '#007AFF' : '#0056CC' }}
                thumbColor={useDarkTheme ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            {/* Автосохранение */}
            <View style={[
              styles.settingItem,
              { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }
            ]}>
              <View style={styles.settingInfo}>
                <Ionicons name="save" size={22} color={isDarkMode ? "#007AFF" : "#0056CC"} />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    { color: isDarkMode ? 'white' : '#1d1d1f' }
                  ]}>
                    Автосохранение
                  </Text>
                  <Text style={[
                    styles.settingDescription,
                    { color: isDarkMode ? '#aaa' : '#666' }
                  ]}>
                    Сохранять результаты в историю
                  </Text>
                </View>
              </View>
              
              <Switch
                value={autoSave}
                onValueChange={onToggleAutoSave}
                trackColor={{ false: '#767577', true: isDarkMode ? '#007AFF' : '#0056CC' }}
                thumbColor={autoSave ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            {/* Режим распознавания */}
            <View style={[
              styles.settingItem,
              { borderBottomColor: isDarkMode ? '#333' : '#f0f0f0' }
            ]}>
              <View style={styles.settingInfo}>
                <MaterialIcons 
                  name={useRealRecognition ? "text-fields" : "sim-card"} 
                  size={22} 
                  color={isDarkMode ? "#007AFF" : "#0056CC"} 
                />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    { color: isDarkMode ? 'white' : '#1d1d1f' }
                  ]}>
                    Режим распознавания
                  </Text>
                  <Text style={[
                    styles.settingDescription,
                    { color: isDarkMode ? '#aaa' : '#666' }
                  ]}>
                    {useRealRecognition ? 'Реальный анализ' : 'Симуляция'}
                  </Text>
                </View>
              </View>
              
              <Switch
                value={useRealRecognition}
                onValueChange={onToggleRecognitionMode}
                trackColor={{ false: '#767577', true: isDarkMode ? '#4CAF50' : '#2E7D32' }}
                thumbColor={useRealRecognition ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>

            {/* Очистка истории */}
            <TouchableOpacity
              style={[
                styles.dangerSetting,
                { backgroundColor: isDarkMode ? '#333' : '#f8f8f8' }
              ]}
              onPress={() => {
                Alert.alert(
                  'Очистить историю?',
                  'Все сохранённые результаты сканирования будут удалены. Это действие нельзя отменить.',
                  [
                    { text: 'Отмена', style: 'cancel' },
                    {
                      text: 'Очистить',
                      style: 'destructive',
                      onPress: onClearHistory,
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={[
                styles.dangerText,
                { color: '#FF3B30' }
              ]}>
                Очистить историю сканирований
              </Text>
            </TouchableOpacity>

            {/* Информация о приложении */}
            <View style={styles.infoSection}>
              <Text style={[
                styles.infoTitle,
                { color: isDarkMode ? '#aaa' : '#666' }
              ]}>
                О приложении
              </Text>
              
              <View style={[
                styles.infoCard,
                { backgroundColor: isDarkMode ? '#252525' : '#f8f8f8' }
              ]}>
                <Text style={[
                  styles.infoText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  📱 Phone Scanner
                </Text>
                <Text style={[
                  styles.infoText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  🔍 Распознавание приложений с экрана
                </Text>
                <Text style={[
                  styles.infoText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  🎯 Два режима: Симуляция / Реальный анализ
                </Text>
                <Text style={[
                  styles.infoText,
                  { color: isDarkMode ? '#999' : '#888' }
                ]}>
                  🤖 Использует анализ изображений
                </Text>
              </View>
              
              {/* Советы по использованию */}
              <View style={[
                styles.tipsCard,
                { backgroundColor: isDarkMode ? '#252525' : '#f8f8f8' }
              ]}>
                <Text style={[
                  styles.tipsTitle,
                  { color: isDarkMode ? '#4CAF50' : '#2E7D32' }
                ]}>
                  💡 Советы для лучших результатов:
                </Text>
                <Text style={[
                  styles.tipText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  1. Сохраняйте скриншоты как "screenshot_whatsapp.jpg"
                </Text>
                <Text style={[
                  styles.tipText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  2. Включите "Реальный анализ" для работы с изображениями
                </Text>
                <Text style={[
                  styles.tipText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  3. Используйте изображения с названиями приложений
                </Text>
                <Text style={[
                  styles.tipText,
                  { color: isDarkMode ? '#ccc' : '#666' }
                ]}>
                  4. Чем четче изображение, тем лучше результаты
                </Text>
              </View>
            </View>
          </ScrollView>
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
  closeButton: {
    padding: 5,
  },
  settingsList: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'System',
  },
  dangerSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    fontFamily: 'System',
  },
  infoSection: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: 'System',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'System',
  },
  tipText: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
    fontFamily: 'System',
  },
});

export default SettingsModal;