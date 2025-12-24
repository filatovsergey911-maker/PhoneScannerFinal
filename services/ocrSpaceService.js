// services/OCRSpaceService.js
import { Platform } from 'react-native';

// API ключ для OCR.space (бесплатный, ограничение 100 запросов в день)
const OCR_API_KEY = 'K87439088688957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

/**
 * Сервис для распознавания текста через OCR.space API
 * и поиска приложений в распознанном тексте
 */
class OCRSpaceService {
  
  /**
   * Распознает текст с изображения
   * @param {string} imageUri - URI изображения (локальный файл или URL)
   * @returns {Promise<Object>} - Результат распознавания
   */
  static async recognizeText(imageUri) {
    console.log('🔍 Отправка запроса к OCR.space API...');
    console.log('📁 Изображение:', imageUri.substring(0, 50) + '...');
    
    try {
      // Проверяем, является ли URI локальным файлом
      const isLocalFile = imageUri.startsWith('file://') || 
                          imageUri.startsWith('content://') ||
                          !imageUri.includes('http');
      
      let formData = new FormData();
      
      if (isLocalFile) {
        // Для локальных файлов в React Native
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const fileType = this.getFileType(filename);
        
        formData.append('file', {
          uri: imageUri,
          type: fileType,
          name: filename,
        });
      } else {
        // Для URL изображений
        formData.append('url', imageUri);
      }
      
      // Параметры запроса
      formData.append('apikey', OCR_API_KEY);
      formData.append('language', 'eng+rus'); // Английский и русский
      formData.append('isOverlayRequired', 'false');
      formData.append('isTable', 'false');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // Engine 2 лучше для мобильных
      
      console.log('📤 Отправка запроса к API...');
      
      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.ok) {
        console.error('❌ Ошибка HTTP:', response.status, response.statusText);
        throw new Error(`HTTP ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Ответ от API получен');
      
      // Проверяем успешность распознавания
      if (data.IsErroredOnProcessing) {
        console.error('❌ Ошибка обработки OCR:', data.ErrorMessage);
        throw new Error(data.ErrorMessage || 'Ошибка обработки изображения');
      }
      
      // Извлекаем текст из результатов
      const parsedText = this.extractTextFromOCRResult(data);
      
      if (!parsedText || parsedText.trim() === '') {
        console.log('⚠️ Текст не распознан');
        return {
          text: '',
          rawData: data,
          success: false,
          error: 'Текст не распознан'
        };
      }
      
      console.log('📝 Распознанный текст (первые 200 символов):', 
                  parsedText.substring(0, 200) + '...');
      
      return {
        text: parsedText,
        rawData: data,
        success: true,
        remainingRequests: data.RemainingRequests || 0,
        processingTime: data.ProcessingTimeInMilliseconds || 0
      };
      
    } catch (error) {
      console.error('❌ Ошибка OCR.space API:', error);
      
      // Проверяем тип ошибки
      if (error.message.includes('network') || error.message.includes('Network')) {
        throw new Error('Проблемы с сетью. Проверьте подключение к интернету.');
      } else if (error.message.includes('API') || error.message.includes('key')) {
        throw new Error('Проблемы с сервисом распознавания. Попробуйте позже.');
      } else {
        throw new Error(`Ошибка распознавания: ${error.message}`);
      }
    }
  }
  
  /**
   * Извлекает текст из ответа OCR.space
   * @param {Object} ocrData - Данные от API
   * @returns {string} - Извлеченный текст
   */
  static extractTextFromOCRResult(ocrData) {
    if (!ocrData || !ocrData.ParsedResults || !ocrData.ParsedResults.length) {
      return '';
    }
    
    // Объединяем текст из всех распознанных областей
    let fullText = '';
    
    ocrData.ParsedResults.forEach((result, index) => {
      if (result.ParsedText) {
        fullText += result.ParsedText + '\n';
      }
      
      // Также проверяем TextOverlay если есть
      if (result.TextOverlay && result.TextOverlay.Lines) {
        result.TextOverlay.Lines.forEach(line => {
          if (line.LineText) {
            fullText += line.LineText + '\n';
          }
        });
      }
    });
    
    return fullText.trim();
  }
  
  /**
   * Определяет тип файла по расширению
   * @param {string} filename - Имя файла
   * @returns {string} - MIME-тип
   */
  static getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'heif': 'image/heif',
    };
    
    return typeMap[extension] || 'image/jpeg';
  }
  
  /**
   * Ищет приложения в распознанном тексте
   * @param {string} text - Распознанный текст
   * @param {Array} appDatabase - База данных приложений
   * @returns {Array} - Найденные приложения
   */
  static findAppsInText(text, appDatabase) {
    if (!text || text.trim() === '') {
      return [];
    }
    
    console.log('🔍 Поиск приложений в тексте...');
    const lowerText = text.toLowerCase();
    
    // Словарь для сопоставления ключевых слов с приложениями
    const keywordMap = this.createKeywordMap(appDatabase);
    
    const foundApps = [];
    const usedAppIds = new Set();
    
    // Ищем приложения по ключевым словам
    Object.entries(keywordMap).forEach(([keyword, appInfo]) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        const app = appDatabase.find(a => a.name === appInfo.name);
        
        if (app && !usedAppIds.has(app.name)) {
          // Вычисляем уверенность на основе частоты и позиции
          const confidence = this.calculateConfidence(lowerText, keyword, appInfo);
          
          foundApps.push({
            ...app,
            id: `${Date.now()}-ocr-${foundApps.length}`,
            confidence: confidence,
            detectionMethod: 'ocr_text_analysis',
            description: this.generateDescription(app, keyword, confidence),
            analysisDetails: {
              keyword: keyword,
              foundInText: this.extractContext(lowerText, keyword),
              confidence: `${confidence}%`,
              detectionMethod: 'keyword_matching'
            }
          });
          
          usedAppIds.add(app.name);
        }
      }
    });
    
    // Если нашли приложения, сортируем по уверенности
    if (foundApps.length > 0) {
      foundApps.sort((a, b) => b.confidence - a.confidence);
      console.log(`✅ Найдено ${foundApps.length} приложений через OCR`);
      return foundApps;
    }
    
    // Если по ключевым словам ничего не нашли, ищем по частичным совпадениям
    console.log('🔍 Поиск по частичным совпадениям...');
    return this.findAppsByPartialMatch(lowerText, appDatabase, usedAppIds);
  }
  
  /**
   * Создает карту ключевых слов для поиска приложений
   * @param {Array} appDatabase - База данных приложений
   * @returns {Object} - Карта ключевых слов
   */
  static createKeywordMap(appDatabase) {
    const keywordMap = {};
    
    appDatabase.forEach(app => {
      // Основное имя приложения
      keywordMap[app.name.toLowerCase()] = {
        name: app.name,
        weight: 100
      };
      
      // Альтернативные названия и ключевые слова
      const aliases = this.getAppAliases(app.name);
      aliases.forEach(alias => {
        if (alias && alias.trim() !== '') {
          keywordMap[alias.toLowerCase()] = {
            name: app.name,
            weight: 80
          };
        }
      });
      
      // Package name (без com., android. и т.д.)
      if (app.packageName) {
        const simplePackage = app.packageName
          .replace(/^com\./, '')
          .replace(/^android\./, '')
          .replace(/\./g, ' ');
        
        keywordMap[simplePackage.toLowerCase()] = {
          name: app.name,
          weight: 90
        };
      }
    });
    
    return keywordMap;
  }
  
  /**
   * Получает альтернативные названия приложения
   * @param {string} appName - Имя приложения
   * @returns {Array} - Список алиасов
   */
  static getAppAliases(appName) {
    const aliasMap = {
      'WhatsApp': ['whatsapp', 'вацап', 'ватсап', 'whats', 'WA'],
      'YouTube': ['youtube', 'ютуб', 'you tube', 'YT'],
      'Instagram': ['instagram', 'инстаграм', 'инста', 'insta', 'IG'],
      'Telegram': ['telegram', 'телеграм', 'телега', 'TG'],
      'Facebook': ['facebook', 'фейсбук', 'fb', 'face book'],
      'TikTok': ['tiktok', 'тикток', 'тик-ток'],
      'Spotify': ['spotify', 'спотифай'],
      'Netflix': ['netflix', 'нетфликс'],
      'Chrome': ['chrome', 'хром', 'google chrome'],
      'Gmail': ['gmail', 'джимейл', 'google mail'],
      'Google Maps': ['google maps', 'гугл карты', 'maps', 'карты'],
      'Discord': ['discord', 'дискорд'],
      'Twitter': ['twitter', 'твиттер', 'X'],
      'Zoom': ['zoom', 'зум'],
      'Viber': ['viber', 'вайбер'],
      'Messenger': ['messenger', 'мессенджер', 'facebook messenger'],
      'Snapchat': ['snapchat', 'снапчат'],
      'Reddit': ['reddit', 'реддит'],
      'Pinterest': ['pinterest', 'пинтерест'],
      'LinkedIn': ['linkedin', 'линкедин'],
      'Amazon': ['amazon', 'амазон'],
      'eBay': ['ebay', 'и-бэй'],
      'PayPal': ['paypal', 'пейпал'],
      'Skype': ['skype', 'скайп'],
      'Google Photos': ['google photos', 'гугл фото'],
      'Google Drive': ['google drive', 'гугл драйв'],
      'Dropbox': ['dropbox', 'дропбокс'],
    };
    
    return aliasMap[appName] || [];
  }
  
  /**
   * Вычисляет уверенность обнаружения
   * @param {string} text - Текст
   * @param {string} keyword - Найденное ключевое слово
   * @param {Object} appInfo - Информация о приложении
   * @returns {number} - Уверенность в процентах
   */
  static calculateConfidence(text, keyword, appInfo) {
    let confidence = appInfo.weight || 70;
    
    // Увеличиваем уверенность, если слово встречается несколько раз
    const occurrences = (text.match(new RegExp(keyword, 'gi')) || []).length;
    confidence += Math.min(occurrences * 5, 15);
    
    // Увеличиваем уверенность, если слово находится в начале текста
    const position = text.indexOf(keyword);
    const textLength = text.length;
    if (position < textLength * 0.3) {
      confidence += 10;
    }
    
    // Увеличиваем уверенность для полных совпадений
    if (keyword.length >= 4) {
      confidence += 5;
    }
    
    // Ограничиваем до 95%, чтобы оставить место для ошибки
    return Math.min(confidence, 95);
  }
  
  /**
   * Генерирует описание для найденного приложения
   * @param {Object} app - Приложение
   * @param {string} keyword - Найденное ключевое слово
   * @param {number} confidence - Уверенность
   * @returns {string} - Описание
   */
  static generateDescription(app, keyword, confidence) {
    const keywordType = this.getKeywordType(keyword, app.name);
    
    const descriptions = [
      `Найдено по ${keywordType} "${keyword}" (${confidence}% уверенности)`,
      `Обнаружено в тексте по ключевому слову "${keyword}"`,
      `Приложение распознано через анализ текста`,
      `Определено при сканировании экрана`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  /**
   * Определяет тип ключевого слова
   * @param {string} keyword - Ключевое слово
   * @param {string} appName - Имя приложения
   * @returns {string} - Тип ключевого слова
   */
  static getKeywordType(keyword, appName) {
    if (keyword.toLowerCase() === appName.toLowerCase()) {
      return 'названию';
    }
    
    const isAlias = this.getAppAliases(appName).some(
      alias => alias.toLowerCase() === keyword.toLowerCase()
    );
    
    if (isAlias) {
      return 'альтернативному названию';
    }
    
    if (keyword.includes(' ')) {
      return 'фразе';
    }
    
    return 'ключевому слову';
  }
  
  /**
   * Извлекает контекст вокруг найденного ключевого слова
   * @param {string} text - Текст
   * @param {string} keyword - Ключевое слово
   * @returns {string} - Контекст
   */
  static extractContext(text, keyword) {
    const index = text.indexOf(keyword.toLowerCase());
    
    if (index === -1) {
      return '';
    }
    
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + keyword.length + 30);
    
    let context = text.substring(start, end);
    
    // Очищаем и форматируем
    context = context.replace(/\n/g, ' ');
    context = context.replace(/\s+/g, ' ');
    
    if (start > 0) {
      context = '...' + context;
    }
    
    if (end < text.length) {
      context = context + '...';
    }
    
    return context.trim();
  }
  
  /**
   * Ищет приложения по частичным совпадениям
   * @param {string} text - Текст
   * @param {Array} appDatabase - База данных приложений
   * @param {Set} usedAppIds - Уже использованные приложения
   * @returns {Array} - Найденные приложения
   */
  static findAppsByPartialMatch(text, appDatabase, usedAppIds) {
    const foundApps = [];
    
    appDatabase.forEach(app => {
      if (usedAppIds.has(app.name)) {
        return;
      }
      
      // Проверяем частичные совпадения в имени
      const appNameWords = app.name.toLowerCase().split(' ');
      
      let matchScore = 0;
      let matchedWords = [];
      
      appNameWords.forEach(word => {
        if (word.length > 3 && text.includes(word)) {
          matchScore += 20;
          matchedWords.push(word);
        }
      });
      
      // Проверяем частичные совпадения в package name
      if (app.packageName) {
        const packageWords = app.packageName
          .replace(/\./g, ' ')
          .toLowerCase()
          .split(' ');
        
        packageWords.forEach(word => {
          if (word.length > 3 && text.includes(word)) {
            matchScore += 15;
            matchedWords.push(word);
          }
        });
      }
      
      // Если набрали достаточный балл, добавляем приложение
      if (matchScore >= 25 && matchedWords.length > 0) {
        const confidence = Math.min(60 + matchScore, 85);
        
        foundApps.push({
          ...app,
          id: `${Date.now()}-partial-${foundApps.length}`,
          confidence: confidence,
          detectionMethod: 'partial_match',
          description: `Частичное совпадение по словам: ${matchedWords.join(', ')}`,
          analysisDetails: {
            matchedWords: matchedWords,
            matchScore: matchScore,
            confidence: `${confidence}%`,
            detectionMethod: 'partial_word_matching'
          }
        });
        
        usedAppIds.add(app.name);
      }
    });
    
    if (foundApps.length > 0) {
      foundApps.sort((a, b) => b.confidence - a.confidence);
      console.log(`✅ Найдено ${foundApps.length} приложений по частичным совпадениям`);
    }
    
    return foundApps;
  }
  
  /**
   * Проверяет доступность API
   * @returns {Promise<Object>} - Статус API
   */
  static async checkAPIStatus() {
    try {
      // Простой тестовый запрос
      const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Google_Logo.svg/1280px-Google_Logo.svg.png';
      
      const formData = new FormData();
      formData.append('url', testImageUrl);
      formData.append('apikey', OCR_API_KEY);
      formData.append('language', 'eng');
      
      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        body: formData,
        timeout: 5000, // 5 секунд таймаут
      });
      
      const data = await response.json();
      
      return {
        available: !data.IsErroredOnProcessing,
        lastCheck: new Date(),
        remainingRequests: data.RemainingRequests || 100,
        errorMessage: data.ErrorMessage || null
      };
      
    } catch (error) {
      console.error('❌ Ошибка проверки API:', error);
      
      return {
        available: false,
        lastCheck: new Date(),
        remainingRequests: 0,
        errorMessage: error.message
      };
    }
  }
  
  /**
   * Получает информацию о лимитах API
   * @returns {Object} - Информация о лимитах
   */
  static getAPILimits() {
    return {
      dailyLimit: 100,
      requestTimeout: 30000, // 30 секунд
      supportedLanguages: ['eng', 'rus', 'spa', 'fre', 'ger', 'ita'],
      maxFileSize: 1024 * 1024, // 1MB
      supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf', 'tiff']
    };
  }
  
  /**
   * Оптимизирует изображение для отправки в API
   * @param {string} imageUri - URI изображения
   * @returns {Promise<string>} - Оптимизированный URI
   */
  static async optimizeImageForOCR(imageUri) {
    // В реальном приложении здесь можно добавить сжатие изображения
    // Для React Native можно использовать библиотеку react-native-image-resizer
    return imageUri;
  }
}

export default OCRSpaceService;