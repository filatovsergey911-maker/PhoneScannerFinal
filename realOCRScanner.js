// services/realOCRScanner.js
import { 
  recognizeTextFromImage,
  setOCRMethod,
  getCurrentMethod,
  getAvailableMethods,
  getMethodName,
  getMethodDescription,
  testOCRMethod,
  OCR_METHODS
} from './ocrService';
import { APP_DATABASE } from './appData';

// Основная функция OCR распознавания приложений
export const recognizeAppNamesWithOCR = async (screenshotUri) => {
  console.log('🔤 ЗАПУСК РАСПОЗНАВАНИЯ ПРИЛОЖЕНИЙ');
  
  try {
    // 1. Распознаем текст с изображения
    const ocrResult = await recognizeTextFromImage(screenshotUri);
    
    console.log('📊 Результат OCR:', {
      метод: ocrResult.methodName,
      уверенность: ocrResult.confidence,
      длинаТекста: ocrResult.text.length
    });
    
    // 2. Ищем совпадения с названиями приложений
    const matchedApps = findAppMatchesInText(ocrResult.text);
    
    console.log(`✅ Найдено совпадений: ${matchedApps.length}`);
    
    // 3. Форматируем результат
    const results = formatOCRResults(matchedApps, ocrResult);
    
    return results;
    
  } catch (error) {
    console.error('❌ Ошибка распознавания:', error.message);
    return getFallbackResults(error.message);
  }
};

// Поиск совпадений приложений в тексте
const findAppMatchesInText = (text) => {
  if (!text || text.trim().length === 0) {
    return [];
  }
  
  console.log('🔎 Ищем совпадения в тексте...');
  
  const matches = [];
  const normalizedText = text.toLowerCase()
    .replace(/[^\w\s\n@.,!?\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const lines = text.split('\n');
  const words = normalizedText.split(/\s+/);
  
  console.log(`📊 Анализируем ${lines.length} строк, ${words.length} слов`);
  
  // Для каждого приложения в базе
  for (const app of APP_DATABASE) {
    const appNameLower = app.name.toLowerCase();
    
    // 1. Полное совпадение в тексте
    if (normalizedText.includes(appNameLower)) {
      matches.push({
        app,
        matchType: 'full',
        confidence: 90,
        matchedText: app.name
      });
      continue;
    }
    
    // 2. Поиск по строкам (часто приложения на отдельных строкам)
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (lineLower.includes(appNameLower)) {
        matches.push({
          app,
          matchType: 'full_line',
          confidence: 85,
          matchedText: line.substring(0, 50)
        });
        break;
      }
    }
    
    // 3. Частичные совпадения для составных названий
    const appWords = appNameLower.split(' ');
    if (appWords.length > 1) {
      let foundWords = 0;
      for (const word of appWords) {
        if (normalizedText.includes(word) && word.length > 2) {
          foundWords++;
        }
      }
      
      if (foundWords >= appWords.length - 1) {
        matches.push({
          app,
          matchType: 'partial',
          confidence: 70 + (foundWords * 10),
          matchedWords: appWords.filter(w => normalizedText.includes(w))
        });
        continue;
      }
    }
    
    // 4. Совпадение по ключевым словам
    const keywords = getAppKeywords(app.name);
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        matches.push({
          app,
          matchType: 'keyword',
          confidence: 60 + (keyword.length * 3),
          matchedKeyword: keyword
        });
        break;
      }
    }
  }
  
  // Убираем дубликаты и сортируем
  const uniqueMatches = [];
  const seenIds = new Set();
  
  for (const match of matches) {
    if (!seenIds.has(match.app.id)) {
      uniqueMatches.push(match);
      seenIds.add(match.app.id);
    }
  }
  
  // Сортируем по уверенности
  uniqueMatches.sort((a, b) => b.confidence - a.confidence);
  
  console.log(`✅ Уникальных совпадений: ${uniqueMatches.length}`);
  
  return uniqueMatches;
};

// Ключевые слова для приложений
const getAppKeywords = (appName) => {
  const keywordMap = {
    'WhatsApp': ['whatsapp', 'whats', 'wa', 'whats app', 'ватсап'],
    'Instagram': ['instagram', 'insta', 'ig', 'gram', 'инстаграм'],
    'YouTube': ['youtube', 'yt', 'tube', 'you tube', 'ютуб'],
    'Facebook': ['facebook', 'fb', 'face', 'book', 'фейсбук'],
    'Telegram': ['telegram', 'tg', 'tele', 'gram', 'телеграм'],
    'Spotify': ['spotify', 'spot', 'music', 'спотифай'],
    'Netflix': ['netflix', 'flix', 'net', 'нетфликс'],
    'Google Maps': ['maps', 'google maps', 'gmap', 'карты', 'навигатор'],
    'Gmail': ['gmail', 'google mail', 'email', 'почта', 'гмейл'],
    'Chrome': ['chrome', 'браузер', 'browser', 'google chrome', 'хром'],
    'Twitter': ['twitter', 'twt', 'tweet', 'твиттер'],
    'TikTok': ['tiktok', 'tik', 'tok', 'тикток'],
    'Discord': ['discord', 'disc', 'cord', 'дискорд'],
    'Zoom': ['zoom', 'зум', 'видеозвонки'],
    'Calculator': ['calculator', 'calc', 'калькулятор'],
    'Calendar': ['calendar', 'cal', 'календарь'],
    'Camera': ['camera', 'cam', 'камера', 'фото'],
    'Clock': ['clock', 'часы', 'время', 'будильник'],
    'Weather': ['weather', 'погода', 'прогноз'],
    'Settings': ['settings', 'настройки', 'setup'],
    'Phone': ['phone', 'телефон', 'звонки'],
    'Messages': ['messages', 'sms', 'сообщения'],
    'Photos': ['photos', 'photo', 'галерея'],
    'Wallet': ['wallet', 'кошелек', 'карты']
  };
  
  return keywordMap[appName] || [appName.toLowerCase()];
};

// Форматирование результатов
const formatOCRResults = (matches, ocrResult) => {
  // Сортируем по уверенности
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Ограничиваем 12 приложениями
  const limitedMatches = matches.slice(0, 12);
  
  return limitedMatches.map((match, index) => {
    const finalConfidence = calculateFinalConfidence(match, index, ocrResult);
    
    return {
      ...match.app,
      confidence: finalConfidence,
      detectionMethod: `OCR: ${ocrResult.methodName}`,
      isRealDetection: ocrResult.method !== OCR_METHODS.SIMULATION,
      detectionDetails: getDetectionDetails(match),
      matchType: match.matchType,
      ocrMethod: ocrResult.method,
      ocrConfidence: ocrResult.confidence
    };
  });
};

// Расчет финальной уверенности
const calculateFinalConfidence = (match, position, ocrResult) => {
  let confidence = match.confidence;
  
  // Корректировка на метод OCR
  const methodMultiplier = {
    [OCR_METHODS.OCR_SPACE]: 1.0,
    [OCR_METHODS.TESSERACT]: 0.9,
    [OCR_METHODS.SIMULATION]: 0.6
  };
  
  confidence *= (methodMultiplier[ocrResult.method] || 0.8);
  
  // Корректировка на уверенность OCR
  confidence *= (ocrResult.confidence / 100);
  
  // Штраф за позицию
  confidence -= position * 2;
  
  // Ограничиваем диапазон
  return Math.min(99, Math.max(40, Math.round(confidence)));
};

// Детали обнаружения
const getDetectionDetails = (match) => {
  switch (match.matchType) {
    case 'full':
      return `Текст "${match.matchedText}" найден в изображении`;
    case 'full_line':
      return `Найдено в строке: "${match.matchedText}"`;
    case 'partial':
      return `Частичное совпадение: ${match.matchedWords?.join(' + ') || ''}`;
    case 'keyword':
      return `Ключевое слово: "${match.matchedKeyword}"`;
    default:
      return 'Обнаружено по тексту';
  }
};

// Fallback результаты
const getFallbackResults = (reason) => {
  console.log(`🔄 Используем fallback (причина: ${reason})`);
  
  const popularApps = [
    'WhatsApp', 'Instagram', 'YouTube', 'Chrome', 
    'Gmail', 'Camera', 'Settings', 'Phone', 'Messages', 'Maps'
  ];
  
  return popularApps
    .map(name => {
      const app = APP_DATABASE.find(app => app.name === name);
      if (app) {
        return {
          ...app,
          confidence: 50 + Math.floor(Math.random() * 30),
          detectionMethod: 'Fallback',
          isRealDetection: false,
          detectionDetails: `OCR не сработал: ${reason}`,
          matchType: 'fallback',
          ocrMethod: OCR_METHODS.SIMULATION
        };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 6);
};

// Экспорт функций
export {
  setOCRMethod,
  getCurrentMethod,
  getAvailableMethods,
  getMethodName,
  getMethodDescription,
  testOCRMethod,
  OCR_METHODS
};