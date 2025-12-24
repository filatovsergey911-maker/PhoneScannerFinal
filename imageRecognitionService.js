// services/imageRecognitionService.js - ОБНОВЛЕННЫЙ
import { 
  recognizeAppNamesWithOCR,
  setOCRMethod,
  getCurrentMethod,
  getAvailableMethods,
  getMethodName,
  getMethodDescription,
  testOCRMethod,
  OCR_METHODS
} from './realOCRScanner';
import { APP_DATABASE } from './appData';

// Режим симуляции для сравнения
const getSimulationMode = () => {
  console.log('🎭 РЕЖИМ СИМУЛЯЦИИ');
  
  const count = Math.floor(Math.random() * 4) + 4;
  const shuffled = [...APP_DATABASE].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count).map((app, index) => ({
    ...app,
    confidence: Math.floor(Math.random() * 25) + 70,
    isRealDetection: false,
    detectionMethod: 'Симуляция',
    matchType: 'random',
    detectionDetails: 'Тестовый режим без реального OCR',
    ocrMethod: OCR_METHODS.SIMULATION
  }));
};

// Основная функция распознавания
export const recognizeAppsFromImage = async (imageUri, useRealRecognition = true) => {
  console.log('🔤 === РАСПОЗНАВАНИЕ ПРИЛОЖЕНИЙ ===');
  
  if (!useRealRecognition || !imageUri) {
    return getSimulationMode();
  }
  
  try {
    console.log('📸 Запускаем распознавание...');
    
    // Получаем текущий метод OCR
    const currentMethod = getCurrentMethod();
    console.log('🎯 Текущий метод OCR:', getMethodName(currentMethod));
    
    // Выполняем распознавание
    const results = await recognizeAppNamesWithOCR(imageUri);
    
    console.log(`✅ Распознавание завершено. Найдено: ${results.length} приложений`);
    
    // Фильтруем результаты с низкой уверенностью
    const filteredResults = results.filter(app => app.confidence >= 50);
    
    if (filteredResults.length === 0) {
      console.log('⚠️ Все результаты имеют низкую уверенность');
      return getSimulationMode();
    }
    
    console.log(`📊 После фильтрации: ${filteredResults.length} приложений`);
    
    // Добавляем статистику
    const avgConfidence = Math.round(
      filteredResults.reduce((sum, app) => sum + app.confidence, 0) / filteredResults.length
    );
    
    console.log('📈 Статистика:', {
      средняяУверенность: avgConfidence + '%',
      методы: [...new Set(filteredResults.map(r => r.detectionMethod))]
    });
    
    return filteredResults;
    
  } catch (error) {
    console.error('❌ Ошибка распознавания:', error.message);
    return getSimulationMode();
  }
};

// Функция для камеры
export const captureAndRecognize = async (cameraRef, setIsScanning) => {
  if (!cameraRef?.current) {
    console.error('📷 Камера недоступна');
    return getSimulationMode();
  }
  
  try {
    setIsScanning(true);
    console.log('📸 Делаем фото для распознавания...');
    
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: true,
      skipProcessing: false,
    });
    
    console.log('✅ Фото сделано, запускаем OCR...');
    const results = await recognizeAppsFromImage(photo.uri, true);
    
    setIsScanning(false);
    return results;
    
  } catch (error) {
    console.error('❌ Ошибка камеры:', error);
    setIsScanning(false);
    return getSimulationMode();
  }
};

// Экспорт функций управления OCR
export {
  setOCRMethod,
  getCurrentMethod,
  getAvailableMethods,
  getMethodName,
  getMethodDescription,
  testOCRMethod,
  OCR_METHODS
};

// Тестовая функция
export const testRecognition = async () => {
  console.log('🧪 Тестовая функция распознавания');
  return getSimulationMode();
};