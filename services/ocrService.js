// services/OCRSpaceService.js
import axios from 'axios';

// ВАЖНО: Замените 'YOUR_API_KEY_HERE' на ваш реальный ключ с сайта ocr.space
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.ocr.space/parse/image';

class OCRSpaceService {
  /**
   * Основная функция для распознавания текста с изображения
   * @param {string} imageUri - Локальный URI изображения (file://...)
   * @returns {Promise<string>} - Распознанный текст или пустая строка в случае ошибки
   */
  static async recognizeText(imageUri) {
    console.log('[OCR] Начинаю распознавание для:', imageUri);

    // 1. Подготавливаем данные для отправки
    const formData = new FormData();
    // Преобразуем локальный URI в файловый объект (Blob)
    // Для React Native можно использовать 'react-native-fs' или 'expo-file-system',
    // но для простоты в этом примере отправляем как base64.
    // Более надежный способ - преобразовать imageUri в base64 строку.

    // Вместо сложной логики с файлами, для теста можно использовать base64.
    // На практике вам нужно будет реализовать конвертацию imageUri в base64.
    // Например, с помощью expo-file-system: FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

    // ВАЖНО: Для реальной работы требуется доработка конвертации imageUri в base64
    // formData.append('base64Image', `data:image/jpeg;base64,${base64Data}`);
    // formData.append('apikey', API_KEY);
    // formData.append('language', 'rus'); // Указываем русский язык
    // formData.append('isOverlayRequired', 'false');

    try {
      // 2. Временно: Заглушка для демонстрации работы API
      // Замените этот блок на реальный запрос, когда настроите конвертацию в base64
      console.warn('[OCR] ВНИМАНИЕ: Используется демо-режим. Замените код на реальный запрос к API.');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Имитация задержки сети

      // Имитация ответа от реального API OCR.space
      const demoResponse = {
        data: {
          ParsedResults: [{
            ParsedText: "WhatsApp\nTelegram\nYouTube\nInstagram\nSpotify\nChrome\nGmail"
          }]
        }
      };
      const extractedText = demoResponse.data.ParsedResults[0].ParsedText;
      console.log('[OCR] Текст распознан (демо):', extractedText.substring(0, 50) + '...');
      return extractedText;

      // 3. РЕАЛЬНЫЙ ЗАПРОС (раскомментируйте, когда будете готовы)
      /*
      const response = await axios.post(API_URL, formData, {
        headers: { ...formData.getHeaders() },
      });

      if (response.data.IsErroredOnProcessing) {
        console.error('[OCR] Ошибка API:', response.data.ErrorMessage);
        return '';
      }

      const extractedText = response.data.ParsedResults[0].ParsedText;
      console.log('[OCR] Текст распознан:', extractedText.substring(0, 100) + '...');
      return extractedText;
      */

    } catch (error) {
      console.error('[OCR] Критическая ошибка:', error);
      return ''; // Возвращаем пустую строку при ошибке
    }
  }

  /**
   * Функция для поиска приложений в распознанном тексте
   * (Интегрируется с вашей существующей базой appData.js)
   * @param {string} text - Распознанный текст
   * @param {Array} appData - Массив всех приложений из appData.js
   * @returns {Array} - Найденные приложения с confidence
   */
  static findAppsInText(text, appData) {
    const foundApps = [];
    const lowerText = text.toLowerCase();

    appData.forEach(app => {
      // Проверяем русские и английские названия, а также ключевые слова
      const searchPatterns = [
        app.name.toLowerCase(),
        app.nameEn.toLowerCase(),
        app.packageName ? app.packageName.toLowerCase().replace('com.', '') : ''
      ];

      for (const pattern of searchPatterns) {
        if (pattern && pattern.length > 2 && lowerText.includes(pattern)) {
          // Рассчитываем уверенность (можно усложнить логику)
          let confidence = 75; // Базовая уверенность
          // Если название найдено целиком и с большой буквы в оригинальном тексте
          if (text.includes(app.name) || text.includes(app.nameEn)) {
            confidence = 90;
          }

          foundApps.push({
            ...app,
            confidence,
            detectionMethod: 'real_ocr', // Метка, что найдено через реальное OCR
            matchedBy: pattern
          });
          break; // Нашли по одному шаблону - переходим к следующему приложению
        }
      }
    });

    // Сортируем по уверенности (сначала самые вероятные)
    return foundApps.sort((a, b) => b.confidence - a.confidence);
  }
}

export default OCRSpaceService;