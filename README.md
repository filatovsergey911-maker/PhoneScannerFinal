# 📱 Phone Scanner

**Умное приложение для сканирования и распознавания приложений с экрана телефона**

[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-49.0.0-lightgrey.svg)](https://expo.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform: iOS & Android](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev)

English | [Русский](#русский)

## 🌟 Features (English)

**Phone Scanner** is a smart mobile application that uses your phone's camera or gallery images to detect and recognize applications displayed on another device's screen. Perfect for quickly identifying apps from screenshots or live camera feeds.

### ✨ Key Features
*   **📸 Dual Scanning Modes**: Use your camera in real-time or select an image from your gallery.
*   **🤖 Smart Recognition**: Powered by **OCR.space API** for real text extraction and app identification from images.
*   **🎭 Simulation Mode**: Fallback demo mode that generates realistic app data when the API is unavailable.
*   **📊 Rich Results**: View detected apps with confidence scores, icons, descriptions, and direct links to app stores.
*   **🕒 Scan History**: Automatically saves your scan results for later review.
*   **🌙 Dark/Light Theme**: Full theme support that respects your system preferences.
*   **⚙️ Customizable Settings**: Toggle between recognition modes, auto-save, and themes.

### 🛠️ Tech Stack
*   **Frontend**: React Native, Expo
*   **Camera**: `expo-camera`
*   **Image Processing**: `expo-image-picker`, `react-native-image-manipulator`
*   **OCR Integration**: Custom service layer for OCR.space API
*   **State & Storage**: React Hooks, `@react-native-async-storage/async-storage`
*   **UI Components**: Custom modals, animations, `@expo/vector-icons`

### 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/phone-scanner.git
    cd phone-scanner
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install iOS dependencies (if on macOS)**
    ```bash
    cd ios && pod install && cd ..
    ```

4.  **Configure API Key**
    *   The app uses a free tier of the [OCR.space](https://ocr.space/) API by default.
    *   For production use, it is **highly recommended** to [obtain your own API key](https://ocr.space/ocrapi).
    *   Replace the `OCR_API_KEY` constant in `App.js` (inside the `OCRSpaceService` class) with your own key.

5.  **Run the application**
    ```bash
    # For Android
    npx react-native run-android

    # For iOS
    npx react-native run-ios
    ```

### 📁 Project Structure
phone-scanner/
├── App.js # Main application component
├── appData.js # Database of known applications
├── styles.js # Global application styles
├── ScanAnimation.js # Custom scanning animation component
├── services/ # External service integrations
│ └── (OCR integration is embedded in App.js)
├── components/ # Reusable UI components
│ ├── ResultsModal-fixed.js
│ ├── HistoryModal.js
│ └── SettingsModal.js
├── assets/ # Images, fonts, and other static resources
└── README.md # This file

### ⚙️ Configuration & Modes

The app operates in two primary modes, which can be toggled in Settings:

1.  **🔬 Smart Analysis Mode**: Uses the real OCR.space API to extract text from images and match it against the app database. Requires an internet connection.
2.  **🎭 Simulation Mode**: Uses locally generated, realistic demo data. Works offline and is useful for testing or when API limits are reached.

### 🔑 API Considerations

*   The included free API key (`K87439088688957`) is subject to **daily limits** and may experience slowdowns or timeouts during peak hours.
*   For a reliable experience, especially in production, using a **paid OCR.space PRO plan** is strongly advised.

### 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Русский

**Phone Scanner** — это умное мобильное приложение, которое использует камеру вашего телефона или изображения из галереи для обнаружения и распознавания приложений, отображаемых на экране другого устройства. Идеально подходит для быстрой идентификации приложений со скриншотов или прямой трансляции с камеры.

### ✨ Ключевые возможности
*   **📸 Два режима сканирования**: Используйте камеру в реальном времени или выберите изображение из галереи.
*   **🤖 Умное распознавание**: На базе **OCR.space API** для реального извлечения текста и идентификации приложений с изображений.
*   **🎭 Режим симуляции**: Резервный демо-режим, генерирующий реалистичные данные приложений, когда API недоступен.
*   **📊 Подробные результаты**: Просматривайте найденные приложения с показателем уверенности, иконками, описаниями и прямыми ссылками в магазины приложений.
*   **🕒 История сканирований**: Автоматически сохраняет результаты сканирований для последующего просмотра.
*   **🌙 Темная/Светлая тема**: Полная поддержка тем, соответствующая системным настройкам.
*   **⚙️ Настраиваемые параметры**: Переключение между режимами распознавания, автосохранением и темами.

### 🛠️ Стек технологий
*   **Фронтенд**: React Native, Expo
*   **Камера**: `expo-camera`
*   **Обработка изображений**: `expo-image-picker`, `react-native-image-manipulator`
*   **Интеграция с OCR**: Кастомный сервисный слой для API OCR.space
*   **Состояние и хранилище**: React Hooks, `@react-native-async-storage/async-storage`
*   **UI компоненты**: Кастомные модальные окна, анимации, `@expo/vector-icons`

### 🚀 Начало работы

1.  **Клонируйте репозиторий**
    ```bash
    git clone https://github.com/ваш-username/phone-scanner.git
    cd phone-scanner
    ```

2.  **Установите зависимости**
    ```bash
    npm install
    # или
    yarn install
    ```

3.  **Установите зависимости для iOS (если используете macOS)**
    ```bash
    cd ios && pod install && cd ..
    ```

4.  **Настройте API-ключ**
    *   Приложение по умолчанию использует бесплатный тариф API [OCR.space](https://ocr.space/).
    *   Для production-использования **настоятельно рекомендуется** [получить свой собственный API-ключ](https://ocr.space/ocrapi).
    *   Замените константу `OCR_API_KEY` в `App.js` (внутри класса `OCRSpaceService`) на ваш собственный ключ.

5.  **Запустите приложение**
    ```bash
    # Для Android
    npx react-native run-android

    # Для iOS
    npx react-native run-ios
    ```

### 📁 Структура проекта
phone-scanner/
├── App.js # Главный компонент приложения
├── appData.js # База данных известных приложений
├── styles.js # Глобальные стили приложения
├── ScanAnimation.js # Компонент кастомной анимации сканирования
├── services/ # Интеграции с внешними сервисами
│ └── (Интеграция с OCR встроена в App.js)
├── components/ # Переиспользуемые UI-компоненты
│ ├── ResultsModal-fixed.js
│ ├── HistoryModal.js
│ └── SettingsModal.js
├── assets/ # Изображения, шрифты и другие статические ресурсы
└── README.md # Этот файл


### ⚙️ Конфигурация и режимы работы

Приложение работает в двух основных режимах, которые можно переключать в Настройках:

1.  **🔬 Режим "Умный анализ"**: Использует реальное API OCR.space для извлечения текста с изображений и сопоставления с базой данных приложений. Требует подключения к интернету.
2.  **🎭 Режим "Симуляция"**: Использует локально сгенерированные реалистичные демо-данные. Работает оффлайн и полезен для тестирования или при достижении лимитов API.

### 🔑 Особенности работы с API

*   Встроенный бесплатный API-ключ (`K87439088688957`) имеет **суточные лимиты** и может испытывать замедления или таймауты в часы пиковой нагрузки.
*   Для стабильной работы, особенно в production, настоятельно рекомендуется использовать **платный тариф OCR.space PRO**.

### 📄 Лицензия
Этот проект распространяется под лицензией MIT. Подробности смотрите в файле [LICENSE](LICENSE).

---
**Разработано с ❤️ для упрощения идентификации приложений.**