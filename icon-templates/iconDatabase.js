// iconDatabase.js - база иконок для сравнения
import { APP_DATABASE } from './appData';

// Упрощенная база иконок
export const SIMPLE_ICON_DB = APP_DATABASE.map(app => ({
  ...app,
  // Добавляем дополнительные характеристики для сравнения
  features: {
    isPopular: ['WhatsApp', 'Instagram', 'YouTube', 'Facebook', 'Telegram'].includes(app.name),
    color: app.color,
    complexity: Math.floor(Math.random() * 5) + 1, // 1-5
    hasLetter: Math.random() > 0.3 // 70% шанс что есть буква/символ
  }
}));

// Функция для получения приложений по категории
export const getAppsByCategory = (category) => {
  return APP_DATABASE.filter(app => app.type === category);
};

// Функция для получения популярных приложений
export const getPopularApps = (count = 5) => {
  const popularNames = ['WhatsApp', 'Instagram', 'YouTube', 'Facebook', 'Telegram', 'Spotify', 'Google Maps'];
  return APP_DATABASE
    .filter(app => popularNames.includes(app.name))
    .slice(0, count);
};

// Функция для получения приложений по цвету
export const getAppsByColor = (colorHex) => {
  return APP_DATABASE.filter(app => 
    app.color.toLowerCase() === colorHex.toLowerCase()
  );
};