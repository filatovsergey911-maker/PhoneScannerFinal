// App.js - ПОЛНАЯ ВЕРСИЯ С ОПТИМИЗАЦИЕЙ ИЗОБРАЖЕНИЙ
// ИСПРАВЛЕННЫЕ ИМПОРТЫ:
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useColorScheme,
  Linking,
  Animated,
  StyleSheet,
  Dimensions,
  Vibration,
  Platform,
  Image,
  PermissionsAndroid,
  Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ImageManipulator from 'react-native-image-manipulator';
import appDatabase from './appData.js';
import { styles } from './styles';
import ResultsModalFixed from './components/ResultsModal-fixed';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import ScanAnimation from './ScanAnimation';

// Для отладки
console.log('appDatabase загружена?', !!appDatabase);
console.log('Тип appDatabase:', typeof appDatabase);
console.log('Это массив?', Array.isArray(appDatabase));
console.log('Длина:', appDatabase?.length || 0);
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// Отладка базы данных
console.log('=== DEBUG appDatabase ===');
console.log('Загружена:', !!appDatabase);
console.log('Длина:', appDatabase?.length || 0);
console.log('Тип:', typeof appDatabase);
console.log('Первые 3 записи:');

if (appDatabase && Array.isArray(appDatabase) && appDatabase.length > 0) {
  appDatabase.slice(0, 3).forEach((app, i) => {
    console.log(`${i+1}. ${app.name}: ${app.icon ? 'Есть иконка' : 'Нет иконки'}`);
  });
}

// ============================================================================
// ВСТРОЕННЫЙ OCRSpaceService
// ============================================================================

class OCRSpaceService {
  static OCR_API_KEY = 'K87439088688957';
  static OCR_API_URL = 'https://api.ocr.space/parse/image';

  static async recognizeText(imageUri) {
    console.log('🔍 Отправка запроса к OCR.space API...');
    
    try {
      const isLocalFile = imageUri.startsWith('file://') || !imageUri.includes('http');
      
      let formData = new FormData();
      
      if (isLocalFile) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const fileType = this.getFileType(filename);
        
        formData.append('file', {
          uri: imageUri,
          type: fileType,
          name: filename,
        });
      } else {
        formData.append('url', imageUri);
      }
      
      // Добавляем таймаут 15 секунд
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      formData.append('apikey', this.OCR_API_KEY);
      formData.append('language', 'auto');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '1');
      
      const response = await fetch(this.OCR_API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage || 'Ошибка обработки изображения');
      }
      
      const parsedText = this.extractTextFromOCRResult(data);
      
      if (!parsedText || parsedText.trim() === '') {
        return {
          text: '',
          success: false,
          error: 'Текст не распознан'
        };
      }
      
      console.log('📝 Текст распознан, длина:', parsedText.length, 'символов');
      
      return {
        text: parsedText,
        success: true,
        remainingRequests: data.RemainingRequests || 0,
      };
      
    } catch (error) {
      console.error('❌ Ошибка OCR.space API:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Таймаут запроса: сервер не ответил за 15 секунд.');
      }
      if (error.message.includes('network') || error.message.includes('Network')) {
        throw new Error('Проблемы с сетью. Проверьте подключение к интернету.');
      }
      throw new Error(`Ошибка распознавания: ${error.message}`);
    }
  }
  
  static extractTextFromOCRResult(ocrData) {
    if (!ocrData?.ParsedResults?.length) return '';
    
    let fullText = '';
    ocrData.ParsedResults.forEach(result => {
      if (result.ParsedText) {
        fullText += result.ParsedText + '\n';
      }
    });
    
    return fullText.trim();
  }
  
  static getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
    };
    return typeMap[extension] || 'image/jpeg';
  }
  
  static findAppsInText(text, appDatabase) {
    if (!text || text.trim() === '') return [];
    
    const lowerText = text.toLowerCase();
    const keywordMap = this.createKeywordMap(appDatabase);
    const foundApps = [];
    const usedAppIds = new Set();
    
    Object.entries(keywordMap).forEach(([keyword, appInfo]) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        const app = appDatabase.find(a => a.name === appInfo.name);
        
        if (app && !usedAppIds.has(app.name)) {
          const confidence = this.calculateConfidence(lowerText, keyword, appInfo);
          
          foundApps.push({
            ...app,
            id: `${Date.now()}-ocr-${foundApps.length}`,
            confidence: Math.min(confidence, 95),
            detectionMethod: 'ocr_text_analysis',
            description: `Найдено по ключевому слову "${keyword}"`,
          });
          
          usedAppIds.add(app.name);
        }
      }
    });
    
    if (foundApps.length > 0) {
      foundApps.sort((a, b) => b.confidence - a.confidence);
      return foundApps;
    }
    
    return this.findAppsByPartialMatch(lowerText, appDatabase, usedAppIds);
  }
  
  static createKeywordMap(appDatabase) {
    const keywordMap = {};
    
    appDatabase.forEach(app => {
      keywordMap[app.name.toLowerCase()] = {
        name: app.name,
        weight: 100
      };
      
      const aliases = this.getAppAliases(app.name);
      aliases.forEach(alias => {
        if (alias) {
          keywordMap[alias.toLowerCase()] = {
            name: app.name,
            weight: 80
          };
        }
      });
    });
    
    return keywordMap;
  }
  
  static getAppAliases(appName) {
    const aliasMap = {
      'WhatsApp': ['whatsapp', 'вацап', 'ватсап'],
      'YouTube': ['youtube', 'ютуб', 'you tube'],
      'Instagram': ['instagram', 'инстаграм', 'инста'],
      'Telegram': ['telegram', 'телеграм', 'телега'],
      'Facebook': ['facebook', 'фейсбук', 'fb'],
      'TikTok': ['tiktok', 'тикток'],
      'Spotify': ['spotify', 'спотифай'],
      'Netflix': ['netflix', 'нетфликс'],
      'Chrome': ['chrome', 'хром'],
      'Gmail': ['gmail', 'джимейл'],
      'Google Maps': ['google maps', 'гугл карты'],
      'Discord': ['discord', 'дискорд'],
    };
    
    return aliasMap[appName] || [];
  }
  
  static calculateConfidence(text, keyword, appInfo) {
    let confidence = appInfo.weight || 70;
    const occurrences = (text.match(new RegExp(keyword, 'gi')) || []).length;
    confidence += Math.min(occurrences * 5, 15);
    return confidence;
  }
  
  static findAppsByPartialMatch(text, appDatabase, usedAppIds) {
    const foundApps = [];
    
    appDatabase.forEach(app => {
      if (usedAppIds.has(app.name)) return;
      
      const appNameWords = app.name.toLowerCase().split(' ');
      let matchScore = 0;
      
      appNameWords.forEach(word => {
        if (word.length > 3 && text.includes(word)) {
          matchScore += 20;
        }
      });
      
      if (matchScore >= 20) {
        foundApps.push({
          ...app,
          id: `${Date.now()}-partial-${foundApps.length}`,
          confidence: Math.min(70 + matchScore, 85),
          detectionMethod: 'partial_match',
          description: 'Частичное совпадение в тексте',
        });
      }
    });
    
    return foundApps;
  }
}

// ============================================================================
// КОНЕЦ OCRSpaceService
// ============================================================================

// Ключи для хранения
const HISTORY_STORAGE_KEY = '@scan_history';
const THEME_STORAGE_KEY = '@theme_preference';
const RECOGNITION_STORAGE_KEY = '@recognition_preference';
const AUTO_SAVE_KEY = '@auto_save_preference';

// Утилиты для истории
const getHistory = async () => {
  try {
    const historyJSON = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    return historyJSON ? JSON.parse(historyJSON) : [];
  } catch (error) {
    console.error('❌ Ошибка загрузки истории:', error);
    return [];
  }
};

const saveToHistory = async (scanResult) => {
  try {
    const currentHistory = await getHistory();
    const updatedHistory = [scanResult, ...currentHistory].slice(0, 50);
    
    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY, 
      JSON.stringify(updatedHistory)
    );
    
    return updatedHistory;
  } catch (error) {
    console.error('❌ Ошибка сохранения в историю:', error);
    return await getHistory();
  }
};

const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('❌ Ошибка очистки истории:', error);
    return await getHistory();
  }
};

// Основной компонент приложения
function MainApp() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [detectedApps, setDetectedApps] = useState([]);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [useDarkTheme, setUseDarkTheme] = useState(false);
  const [useRealRecognition, setUseRealRecognition] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    available: true,
    lastCheck: null,
    remainingRequests: 100
  });
  
  const cameraRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const systemColorScheme = useColorScheme();
  const isDarkMode = useDarkTheme || systemColorScheme === 'dark';

  useEffect(() => {
    loadAllPreferences();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // ============================================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ОПТИМИЗАЦИИ ИЗОБРАЖЕНИЙ
  // ============================================================================
  
  // ПОЛУЧЕНИЕ РАЗМЕРА ФАЙЛА ИЗОБРАЖЕНИЯ
  const getImageFileSize = async (uri) => {
    try {
      if (uri.startsWith('file://')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob.size;
      }
      return 1024 * 1024;
    } catch (error) {
      console.log('⚠️ Не удалось получить размер файла:', error);
      return 0;
    }
  };

  // ФОРМАТИРОВАНИЕ РАЗМЕРА ФАЙЛА
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЯ ДЛЯ OCR
  const optimizeImageForOCR = async (imageAsset) => {
    console.log('⚙️ Оптимизация изображения для OCR...');
    
    try {
      const originalUri = imageAsset.uri;
      const originalSize = await getImageFileSize(originalUri);
      
      // Если изображение уже достаточно маленькое
      if (originalSize < 300 * 1024) {
        console.log('✅ Изображение уже оптимального размера:', formatFileSize(originalSize));
        return {
          ...imageAsset,
          sizeKB: Math.round(originalSize / 1024)
        };
      }
      
      console.log('📐 Сжимаем изображение...');
      
      // Определяем размеры для уменьшения
      const maxDimension = 1200;
      let resizeWidth = imageAsset.width;
      let resizeHeight = imageAsset.height;
      
      if (imageAsset.width > maxDimension || imageAsset.height > maxDimension) {
        if (imageAsset.width > imageAsset.height) {
          resizeWidth = maxDimension;
          resizeHeight = (imageAsset.height / imageAsset.width) * maxDimension;
        } else {
          resizeHeight = maxDimension;
          resizeWidth = (imageAsset.width / imageAsset.height) * maxDimension;
        }
      }
      
      // Выполняем сжатие
      const manipResult = await ImageManipulator.manipulate(
        originalUri,
        [
          { 
            resize: { 
              width: Math.round(resizeWidth), 
              height: Math.round(resizeHeight) 
            } 
          },
        ],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      const optimizedSize = await getImageFileSize(manipResult.uri);
      
      console.log(`✅ Изображение оптимизировано: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)}`);
      
      return {
        uri: manipResult.uri,
        width: manipResult.width,
        height: manipResult.height,
        sizeKB: Math.round(optimizedSize / 1024),
        optimized: true,
        originalSizeKB: Math.round(originalSize / 1024)
      };
      
    } catch (error) {
      console.error('❌ Ошибка оптимизации изображения:', error);
      // В случае ошибки возвращаем оригинальное изображение
      const fallbackSize = await getImageFileSize(imageAsset.uri);
      return {
        ...imageAsset,
        sizeKB: Math.round(fallbackSize / 1024)
      };
    }
  };
  
  // ============================================================================
  // ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ
  // ============================================================================

  const loadAllPreferences = async () => {
    try {
      const history = await getHistory();
      setScanHistory(history);
      
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setUseDarkTheme(savedTheme === 'dark');
      }
      
      const savedRecognition = await AsyncStorage.getItem(RECOGNITION_STORAGE_KEY);
      if (savedRecognition !== null) {
        setUseRealRecognition(savedRecognition === 'true');
      }
      
      const savedAutoSave = await AsyncStorage.getItem(AUTO_SAVE_KEY);
      if (savedAutoSave !== null) {
        setAutoSave(savedAutoSave === 'true');
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки настроек:', error);
    }
  };

  const saveThemePreference = async (isDark) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Ошибка сохранения темы:', error);
    }
  };

  const saveRecognitionPreference = async (useReal) => {
    try {
      await AsyncStorage.setItem(RECOGNITION_STORAGE_KEY, useReal.toString());
    } catch (error) {
      console.log('Ошибка сохранения настройки распознавания:', error);
    }
  };

  const saveAutoSavePreference = async (save) => {
    try {
      await AsyncStorage.setItem(AUTO_SAVE_KEY, save.toString());
    } catch (error) {
      console.log('Ошибка сохранения настройки автосохранения:', error);
    }
  };

  const vibrateOnDetection = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate(50);
    }
  };

  const vibrateOnScanToggle = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(200);
    } else {
      Vibration.vibrate(100);
    }
  };

  // ВЫБОР И СЖАТИЕ ИЗОБРАЖЕНИЯ ИЗ ГАЛЕРЕИ
  const pickImageFromGallery = async () => {
    try {
      console.log('📁 Запрос разрешения на доступ к галерее...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Разрешение отклонено',
          'Для выбора изображений нужен доступ к вашей галерее фотографий.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Открыть настройки', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      console.log('✅ Разрешение получено, открытие галереи...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: false,
        exif: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        console.log('🖼️ Изображение выбрано:', {
          uri: selectedAsset.uri.substring(0, 50) + '...',
          width: selectedAsset.width,
          height: selectedAsset.height,
        });
        
        // ОПТИМИЗАЦИЯ ИЗОБРАЖЕНИЯ
        const optimizedImage = await optimizeImageForOCR(selectedAsset);
        
        setSelectedImage(optimizedImage);
        setShowCamera(false);
        setIsScanning(false);
        setDetectedApps([]);
        
        Alert.alert(
          'Изображение загружено',
          `Размер: ${optimizedImage.sizeKB || 'неизвестно'} KB\nГотово к сканированию!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Ошибка выбора фото:', error);
      Alert.alert(
        'Ошибка',
        `Не удалось загрузить изображение: ${error.message}`,
        [{ text: 'Понятно' }]
      );
    }
  };

  // ОЧИСТКА ВЫБРАННОГО ИЗОБРАЖЕНИЯ
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setShowCamera(true);
    setDetectedApps([]);
  };

  // Основная функция сканирования
  const startScanning = async () => {
    console.log('🔍 ЗАПУСК СКАНИРОВАНИЯ...');
    console.log('Режим:', useRealRecognition ? 'УМНЫЙ АНАЛИЗ' : 'СИМУЛЯЦИЯ');
    
    if (isScanning || isProcessing) {
      console.log('Сканирование уже выполняется');
      return;
    }
    
    if ((!isCameraReady && !selectedImage)) {
      Alert.alert('Не готово', 'Камера не готова или изображение не выбрано');
      return;
    }
    
    // ПРОВЕРКА РАЗМЕРА ИЗОБРАЖЕНИЯ
    if (selectedImage && selectedImage.sizeKB > 1500) {
      Alert.alert(
        'Большое изображение',
        `Изображение весит ${selectedImage.sizeKB}KB. Сканирование может занять больше времени.\n\nРекомендуем изображения до 500KB.`,
        [
          { text: 'Выбрать другое', onPress: pickImageFromGallery },
          { 
            text: 'Продолжить', 
            onPress: () => proceedWithScanning(),
            style: 'default'
          }
        ]
      );
      return;
    }
    
    setIsScanning(true);
    setDetectedApps([]);
    
    vibrateOnScanToggle();
    
    await proceedWithScanning();
  };

  const proceedWithScanning = async () => {
    try {
      let imageUri = null;
      
      if (selectedImage) {
        imageUri = selectedImage.uri;
        console.log('🖼️ Использую выбранное изображение');
      } else if (cameraRef.current) {
        console.log('📷 Делаю фото с камеры...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        imageUri = photo.uri;
        console.log('✅ Фото сделано');
      } else {
        throw new Error('Нет источника изображения');
      }
      
      setIsProcessing(true);
      const detected = await recognizeAppsFromImage(imageUri);
      setIsProcessing(false);
      
      console.log('📊 Результат:', detected.length, 'приложений');
      
      if (detected.length > 0) {
        setDetectedApps(detected);
        
        detected.forEach((app, index) => {
          setTimeout(() => vibrateOnDetection(), index * 150);
        });
        
        await saveScanResult(detected, imageUri);
        setResultsVisible(true);
      } else {
        Alert.alert(
          'Ничего не найдено',
          'Не удалось распознать приложения',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('❌ Ошибка сканирования:', error);
      
      let errorMessage = 'Не удалось выполнить сканирование';
      
      if (error.message.includes('network')) {
        errorMessage = 'Проблемы с сетью. Проверьте подключение к интернету.';
      }
      
      Alert.alert('Ошибка', errorMessage);
      
      if (error.message.includes('network')) {
        setUseRealRecognition(false);
      }
      
    } finally {
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  // Распознавание приложений
  const recognizeAppsFromImage = async (imageUri) => {
    console.log('🔍 ЗАПУСК РАСПОЗНАВАНИЯ...');
    
    if (!useRealRecognition) {
      console.log('🎭 ИСПОЛЬЗУЮ СИМУЛЯЦИЮ');
      return generateSimulatedApps();
    }
    
    console.log('🔬 ИСПОЛЬЗУЮ OCR.space API');
    
    try {
      const ocrResult = await OCRSpaceService.recognizeText(imageUri);
      
      if (!ocrResult.success || !ocrResult.text || ocrResult.text.trim() === '') {
        console.log('⚠️ Текст не распознан, использую симуляцию');
        return generateSimulatedApps();
      }
      
      console.log('✅ Текст распознан');
      
      const foundApps = OCRSpaceService.findAppsInText(ocrResult.text, appDatabase);
      console.log('🔍 Найдено приложений:', foundApps.length);
      
      if (foundApps.length === 0) {
        console.log('⚠️ Приложения не найдены, использую симуляцию');
        return generateSimulatedApps();
      }
      
      setApiStatus(prev => ({
        ...prev,
        remainingRequests: ocrResult.remainingRequests || prev.remainingRequests
      }));
      
      return foundApps;
      
    } catch (error) {
      console.error('❌ Ошибка OCR.space:', error);
      
      Alert.alert(
        'API недоступен',
        'Включен режим симуляции',
        [{ text: 'OK' }]
      );
      
      setUseRealRecognition(false);
      return generateSimulatedApps();
    }
  };

  // Генерация симуляционных данных
  const generateSimulatedApps = () => {
  // Список популярных приложений
  const popularApps = [
    { name: 'WhatsApp', packageName: 'com.whatsapp' },
    { name: 'YouTube', packageName: 'com.google.android.youtube' },
    { name: 'Instagram', packageName: 'com.instagram.android' },
    { name: 'Telegram', packageName: 'org.telegram.messenger' },
    { name: 'Facebook', packageName: 'com.facebook.katana' },
    { name: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
    { name: 'Spotify', packageName: 'com.spotify.music' },
    { name: 'Netflix', packageName: 'com.netflix.mediaclient' },
    { name: 'Chrome', packageName: 'com.android.chrome' },
    { name: 'Gmail', packageName: 'com.google.android.gm' },
    { name: 'Google Maps', packageName: 'com.google.android.apps.maps' },
    { name: 'Discord', packageName: 'com.discord' },
  ];
  
  // Выбираем случайные приложения
  const shuffled = [...popularApps].sort(() => 0.5 - Math.random());
  const count = 2 + Math.floor(Math.random() * 4);
  const selected = shuffled.slice(0, count);
  
  return selected.map((app, index) => {
    const confidence = 70 + Math.floor(Math.random() * 25);
    
    // Получаем иконку из функции
    const iconUrl = getAppIcon(app.name);
    
    console.log(`📱 ${app.name}: ${iconUrl}`); // Для отладки
    
    return {
      id: `${Date.now()}-sim-${index}`,
      name: app.name,
      packageName: app.packageName,
      icon: iconUrl,
      storeUrl: `https://play.google.com/store/apps/details?id=${app.packageName}`,
      confidence: confidence,
      detectionMethod: 'simulation',
      description: `Популярное приложение - ${app.name}`,
    };
  });
};

  const getAppIcon = (appName) => {
  const iconMap = {
    'WhatsApp': 'https://img.icons8.com/color/96/whatsapp--v1.png',
    'YouTube': 'https://img.icons8.com/color/96/youtube-play.png',
    'Instagram': 'https://img.icons8.com/color/96/instagram-new.png',
    'Telegram': 'https://img.icons8.com/color/96/telegram-app.png',
    'Facebook': 'https://img.icons8.com/color/96/facebook-new.png',
    'TikTok': 'https://img.icons8.com/color/96/tiktok--v1.png',
    'Spotify': 'https://img.icons8.com/color/96/spotify--v1.png',
    'Netflix': 'https://img.icons8.com/color/96/netflix-desktop-app.png',
    'Chrome': 'https://img.icons8.com/color/96/chrome--v1.png',
    'Gmail': 'https://img.icons8.com/color/96/gmail-new.png',
    'Google Maps': 'https://img.icons8.com/color/96/google-maps-new.png',
    'Discord': 'https://img.icons8.com/color/96/discord-logo.png',
    'Twitter': 'https://img.icons8.com/color/96/twitter--v1.png',
    'Viber': 'https://img.icons8.com/color/96/viber.png',
    'Google Drive': 'https://img.icons8.com/color/96/google-drive--v1.png',
    'Snapchat': 'https://img.icons8.com/color/96/snapchat--v1.png',
    'Pinterest': 'https://img.icons8.com/color/96/pinterest--v1.png',
    'Amazon': 'https://img.icons8.com/color/96/amazon.png',
    'Microsoft Teams': 'https://img.icons8.com/color/96/microsoft-teams-2019.png',
  };
  
  return iconMap[appName] || 'https://cdn-icons-png.flaticon.com/512/888/888879.png';
};

  const saveScanResult = async (apps, imageUri) => {
    if (apps.length === 0 || !autoSave) return;

    const scanResult = {
      id: Date.now().toString(),
      deviceName: selectedImage ? 'Из галереи' : 'С камеры',
      date: new Date().toLocaleString(),
      appsCount: apps.length,
      apps: [...apps],
      recognitionMethod: useRealRecognition ? 'ocr_space_api' : 'simulation',
      imageUri: imageUri,
    };

    try {
      const updatedHistory = await saveToHistory(scanResult);
      setScanHistory(updatedHistory);
    } catch (error) {
      console.error('❌ Ошибка сохранения результата:', error);
    }
  };

  const toggleRecognitionMode = () => {
    const newMode = !useRealRecognition;
    
    if (newMode) {
      setApiStatus({
        available: true,
        lastCheck: new Date(),
        remainingRequests: 100
      });
    }
    
    setUseRealRecognition(newMode);
    saveRecognitionPreference(newMode);
    
    Alert.alert(
      'Режим распознавания',
      newMode 
        ? '✅ Включен режим УМНОГО АНАЛИЗА'
        : '🎭 Включен режим СИМУЛЯЦИИ',
      [{ text: 'OK' }]
    );
  };

  const toggleTheme = () => {
    const newTheme = !useDarkTheme;
    setUseDarkTheme(newTheme);
    saveThemePreference(newTheme);
  };

  const toggleAutoSave = () => {
    const newAutoSave = !autoSave;
    setAutoSave(newAutoSave);
    saveAutoSavePreference(newAutoSave);
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Очистить историю?',
      'Все сохранённые результаты сканирования будут удалены',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            const cleared = await clearHistory();
            setScanHistory(cleared);
            setHistoryVisible(false);
          }
        }
      ]
    );
  };

  const openInStore = (app) => {
    if (app.storeUrl) {
      Linking.openURL(app.storeUrl).catch(err => {
        Alert.alert('Ошибка', 'Не удалось открыть магазин приложений');
      });
    } else {
      Alert.alert('Ссылка отсутствует', 'Для этого приложения нет ссылки в магазин');
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
    console.log('📷 Камера готова');
  };

  const getRecognitionStatus = () => {
    if (!useRealRecognition) {
      return { 
        text: 'СИМУЛЯЦИЯ', 
        color: isDarkMode ? '#FF9800' : '#F57C00',
        icon: 'game-controller-outline'
      };
    }
    
    return { 
      text: 'УМНЫЙ АНАЛИЗ', 
      color: isDarkMode ? '#4CAF50' : '#2E7D32',
      icon: 'scan-outline'
    };
  };

  const recognitionStatus = getRecognitionStatus();
  const isScanButtonDisabled = (!isCameraReady && !selectedImage) || isProcessing;
  const scanButtonText = isProcessing ? 'ОБРАБОТКА...' : 
                        isScanning ? 'ОСТАНОВИТЬ' : 
                        selectedImage ? 'СКАНИРОВАТЬ' : 'СКАНИРОВАТЬ';

  // ============================================================================
  // RENDER ЛОГИКА
  // ============================================================================

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#007AFF" : "#0056CC"} />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#666' : '#888' }]}>Загрузка...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7' }]}>
        <MaterialIcons name="camera-alt" size={80} color={isDarkMode ? "#007AFF" : "#0056CC"} />
        <Text style={[styles.message, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>Доступ к камере</Text>
        <Text style={[styles.subMessage, { color: isDarkMode ? '#aaa' : '#666' }]}>
          Для сканирования экрана нужен доступ к камере
        </Text>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: isDarkMode ? "#007AFF" : "#0056CC" }]} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Разрешить доступ к камере</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const safeDetectedApps = Array.isArray(detectedApps) ? detectedApps : [];

  return (
    <Animated.View style={[styles.container, { 
      backgroundColor: isDarkMode ? '#0a0a0a' : '#f5f5f7',
      opacity: fadeAnim 
    }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Шапка */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }]}>
        <View style={localStyles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#1d1d1f' }]}>
              Phone Scanner
            </Text>
            <View style={[localStyles.statusBadge, { backgroundColor: recognitionStatus.color + '20' }]}>
              <View style={[localStyles.statusDot, { backgroundColor: recognitionStatus.color }]} />
              <Text style={[localStyles.statusText, { color: recognitionStatus.color }]}>
                {recognitionStatus.text}
              </Text>
            </View>
          </View>
          
          <View style={localStyles.headerButtons}>
           {/* Кнопка переключения режима */}
           <TouchableOpacity 
             style={[localStyles.headerButton, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}
             onPress={toggleRecognitionMode}
           >
             <Ionicons 
               name={recognitionStatus.icon} 
               size={22} 
               color={recognitionStatus.color} 
             />
           </TouchableOpacity>
  
           {/* Кнопка настроек */}
           <TouchableOpacity 
              style={[localStyles.headerButton, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}
              onPress={() => setSettingsVisible(true)}
           >
             <Ionicons name="settings-outline" size={22} color={isDarkMode ? "#007AFF" : "#0056CC"} />
           </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <View style={styles.cameraSection}>
          <View style={[styles.cameraWrapper, { backgroundColor: isDarkMode ? '#000' : '#1a1a1a' }]}>
            
            {showCamera && !selectedImage ? (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                onCameraReady={handleCameraReady}
              />
            ) : selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.camera}
                resizeMode="cover"
              />
            ) : null}
            
            <View style={styles.cameraOverlay}>
              {selectedImage && (
                <View style={localStyles.imageInfoOverlay}>
                  <TouchableOpacity 
                    style={localStyles.clearImageButton}
                    onPress={clearSelectedImage}
                  >
                    <Ionicons name="close-circle" size={24} color="white" />
                    <Text style={localStyles.clearImageText}>Закрыть</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {(isScanning || isProcessing) && (
                <View style={localStyles.scanStatusOverlay}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={localStyles.scanStatusOverlayText}>
                    {isProcessing ? 'Анализ...' : 'Сканирование...'}
                  </Text>
                </View>
              )}
              
              <View style={styles.scanFrame}>
                <View style={[
                  styles.corner, 
                  styles.topLeft, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.topRight, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.bottomLeft, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                <View style={[
                  styles.corner, 
                  styles.bottomRight, 
                  { borderColor: isDarkMode ? '#007AFF' : '#0056CC' }
                ]} />
                
                <ScanAnimation 
                  isActive={isScanning} 
                  isDarkMode={isDarkMode}
                  frameHeight={screenHeight * 0.44}
                />
              </View>
              
              <Text style={[styles.scanHint, { 
                color: 'white',
                backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.6)'
              }]}>
                {selectedImage 
                  ? '📷 Изображение из галереи' 
                  : useRealRecognition 
                    ? '🔍 Наведите на экран' 
                    : '🎭 Режим симуляции'}
              </Text>
            </View>
          </View>

          {/* Управляющие кнопки */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' },
                selectedImage && { backgroundColor: isDarkMode ? '#4CAF50' : '#2E7D32' }
              ]}
              onPress={pickImageFromGallery}
            >
              <Ionicons 
                name={selectedImage ? "image" : "image-outline"} 
                size={24} 
                color={selectedImage ? "white" : (isDarkMode ? "white" : "#1d1d1f")} 
              />
            </TouchableOpacity>
            
           <View style={localStyles.scanButtonCenterContainer}>
             <TouchableOpacity
                style={[
                  styles.scanButton, 
                  { backgroundColor: isDarkMode ? '#007AFF' : '#0056CC' },
                  (isScanning || isProcessing) && { backgroundColor: isDarkMode ? '#ff3b30' : '#d70015' },
                 isScanButtonDisabled && styles.disabledButton
               ]}
               onPress={startScanning}
                activeOpacity={0.7}
               disabled={isScanButtonDisabled}
             >
                <View style={styles.scanButtonContent}>
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : isScanning ? (
                    <Ionicons name="stop-circle" size={22} color="white" />
                  ) : (
                    <Ionicons name="scan" size={22} color="white" />
                 )}
                 <Text style={styles.scanButtonText}>
                   {scanButtonText}
                  </Text>
                </View>
             </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isDarkMode ? '#333' : '#e5e5e7' }]}
              onPress={() => setHistoryVisible(true)}
           >
             <Ionicons name="time-outline" size={24} color={isDarkMode ? "#007AFF" : "#0056CC"} />
             {scanHistory.length > 0 && (
              <View style={[
               styles.historyBadge, 
                { 
                 position: 'absolute',
                 top: -5,
                 right: -5,
                 backgroundColor: '#FF3B30',
                  borderRadius: 10,
                 minWidth: 20,
                 height: 20,
                 alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
               }
              ]}>
                <Text style={{
                  color: 'white',
                 fontSize: 10,
                 fontWeight: 'bold',
               }}>
                 {scanHistory.length}
               </Text>
             </View>
           )}
           </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Модальные окна */}
      <ResultsModalFixed
        visible={resultsVisible}
        onClose={() => {
          setResultsVisible(false);
          if (selectedImage) {
            clearSelectedImage();
          }
        }}
        detectedApps={safeDetectedApps}
        isDarkMode={isDarkMode}
        openInStore={openInStore}
        useRealRecognition={useRealRecognition}
      />

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        scanHistory={scanHistory}
        isDarkMode={isDarkMode}
        onClearHistory={handleClearHistory}
        onViewScanResult={(apps) => {
          setDetectedApps([...apps]);
          setHistoryVisible(false);
          setResultsVisible(true);
        }}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isDarkMode={isDarkMode}
        useDarkTheme={useDarkTheme}
        useRealRecognition={useRealRecognition}
        autoSave={autoSave}
        onToggleTheme={toggleTheme}
        onToggleAutoSave={toggleAutoSave}
        onToggleRecognitionMode={toggleRecognitionMode}
        onClearHistory={handleClearHistory}
      />
    </Animated.View>
  );
 }

const localStyles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  historyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  historyBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scanStatusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 20,
  },
  scanStatusOverlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
    marginTop: 5,
  },
  imageInfoOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  clearImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearImageText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default MainApp;