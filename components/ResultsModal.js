// ResultsModal-simple.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { styles } from '../styles';

export function ResultsModal({ 
  visible, 
  onClose, 
  detectedApps = [], 
  isDarkMode 
}) {
  console.log('ResultsModal props:', { 
    visible, 
    detectedApps, 
    detectedAppsLength: detectedApps ? detectedApps.length : 'undefined' 
  });
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)' 
      }}>
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 10,
          width: '80%'
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Результаты сканирования
          </Text>
          
          {!detectedApps || detectedApps.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={{ marginTop: 10 }}>Нет результатов для отображения</Text>
            </View>
          ) : (
            <View>
              <Text>Найдено приложений: {detectedApps.length}</Text>
              {detectedApps.map((app, index) => (
                <Text key={index} style={{ marginVertical: 5 }}>
                  {index + 1}. {app.name || 'Неизвестное приложение'}
                </Text>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={{ 
              backgroundColor: '#007AFF', 
              padding: 12, 
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 20
            }}
            onPress={onClose}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default HistoryModal;