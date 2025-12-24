// services/SimpleOCRService.js
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

class SimpleOCRService {
  /**
   * Основной метод распознавания
   * Пока использует fallback, но готов к интеграции с любым OCR
   */
  static async recognizeAppsFromImage(imageUri) {
    console.log('[OCR] Начинаем анализ изображения...');
    
    try {
      // 1. Оптимизируем изображение
      const optimizedUri = await this.optimizeImage(imageUri);
      
      // 2. Здесь будет реальное распознавание
      // Пока используем заглушку
      const detectedText = await this.mockOCR(optimizedUri);
      
      // 3. Ищем приложения в тексте
      const foundApps = this.findAppsInText(detectedText);
      
      console.log('[OCR] Найдено приложений:', foundApps.length);
      return foundApps;
      
    } catch (error) {
      console.error('[OCR] Ошибка:', error);
      return this.fallbackFromFilename(imageUri);
    }
  }
  
  /**
   * Оптимизация изображения
   */
  static async optimizeImage(imageUri) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 800 } },
          { contrast: 1.2 },
          { compress: 0.7 }
        ],
        { format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error) {
      return imageUri;
    }
  }
  
  /**
   * Заглушка для OCR
   * В будущем замените на вызов реальной OCR-библиотеки
   */
  static async mockOCR(imageUri) {
    console.log('[OCR] Заглушка: анализируем изображение...');
    
    // Эмуляция работы OCR
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Возвращаем тестовый текст
    const demoTexts = [
      "WhatsApp Telegram YouTube Instagram Spotify",
      "Facebook Messenger TikTok Netflix Google Maps",
      "Viber Twitter Snapchat Zoom Chrome Gmail",
      "Discord Pinterest Reddit LinkedIn"
    ];
    
    return demoTexts[Math.floor(Math.random() * demoTexts.length)];
  }
  
  /**
   * Поиск приложений в тексте
   */
  static findAppsInText(text) {
    const appData = require('../appData.js');
    const foundApps = [];
    const lowerText = text.toLowerCase();
    
    appData.forEach(app => {
      const searchPatterns = [
        app.name.toLowerCase(),
        app.nameEn.toLowerCase(),
        app.packageName ? app.packageName.toLowerCase().replace('com.', '') : ''
      ];
      
      for (const pattern of searchPatterns) {
        if (pattern && lowerText.includes(pattern)) {
          let confidence = 75 + Math.floor(Math.random() * 20);
          
          foundApps.push({
            ...app,
            confidence,
            detectionMethod: 'ocr_mock',
            matchedPattern: pattern
          });
          break;
        }
      }
    });
    
    return foundApps.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Fallback: анализ по имени файла
   */
  static fallbackFromFilename(imageUri) {
    const fileName = imageUri.split('/').pop().toLowerCase();
    const appData = require('../appData.js');
    const foundApps = [];
    
    // Ключевые слова для поиска
    const keywordMap = {
      'whatsapp': ['whatsapp', 'вацап', 'ватсап'],
      'telegram': ['telegram', 'телеграм', 'тг'],
      'youtube': ['youtube', 'ютуб', 'ютьюб'],
      'instagram': ['instagram', 'инстаграм', 'инста'],
      'spotify': ['spotify', 'спотифай'],
      'chrome': ['chrome', 'хром'],
      'facebook': ['facebook', 'фейсбук', 'fb'],
      'tiktok': ['tiktok', 'тикток']
    };
    
    Object.entries(keywordMap).forEach(([appKey, keywords]) => {
      keywords.forEach(keyword => {
        if (fileName.includes(keyword)) {
          const app = appData.find(a => 
            a.name.toLowerCase().includes(appKey) || 
            a.nameEn.toLowerCase().includes(appKey)
          );
          
          if (app && !foundApps.find(a => a.id === app.id)) {
            foundApps.push({
              ...app,
              confidence: 70,
              detectionMethod: 'filename_analysis'
            });
          }
        }
      });
    });
    
    return foundApps;
  }
  
  /**
   * Тестовая функция для проверки
   */
  static async test() {
    console.log('[OCR] Тестируем сервис...');
    const testImage = 'file:///test.png';
    const results = await this.recognizeAppsFromImage(testImage);
    console.log('[OCR] Тест завершен:', results);
    return results.length > 0;
  }
}

export default SimpleOCRService;