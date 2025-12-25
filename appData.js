// appData.js - База данных приложений с реальными иконками

const appDatabase = [
  {
    id: 1,
    name: "WhatsApp Messenger",
    packageName: "com.whatsapp",
    icon: "https://img.icons8.com/color/96/000000/whatsapp--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.whatsapp",
    description: "Мессенджер для общения",
    category: "messenger"
  },
  {
    id: 2,
    name: "Telegram",
    packageName: "org.telegram.messenger",
    icon: "https://img.icons8.com/color/96/000000/telegram-app.png",
    storeUrl: "https://play.google.com/store/apps/details?id=org.telegram.messenger",
    description: "Быстрый и безопасный мессенджер",
    category: "messenger"
  },
  {
    id: 3,
    name: "Instagram",
    packageName: "com.instagram.android",
    icon: "https://img.icons8.com/color/96/000000/instagram-new.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.instagram.android",
    description: "Социальная сеть для фото и видео",
    category: "social"
  },
  {
    id: 4,
    name: "YouTube",
    packageName: "com.google.android.youtube",
    icon: "https://img.icons8.com/color/96/000000/youtube-play.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.youtube",
    description: "Видеохостинг и стриминг",
    category: "video"
  },
  {
    id: 5,
    name: "Netflix",
    packageName: "com.netflix.mediaclient",
    icon: "https://img.icons8.com/color/96/000000/netflix-desktop-app.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.netflix.mediaclient",
    description: "Стриминг фильмов и сериалов",
    category: "video"
  },
  {
    id: 6,
    name: "Spotify",
    packageName: "com.spotify.music",
    icon: "https://img.icons8.com/color/96/000000/spotify--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.spotify.music",
    description: "Стриминг музыки и подкастов",
    category: "music"
  },
  {
    id: 7,
    name: "Google Maps",
    packageName: "com.google.android.apps.maps",
    icon: "https://img.icons8.com/color/96/000000/google-maps-new.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
    description: "Навигация и карты",
    category: "navigation"
  },
  {
    id: 8,
    name: "Gmail",
    packageName: "com.google.android.gm",
    icon: "https://img.icons8.com/color/96/000000/gmail-new.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.gm",
    description: "Электронная почта от Google",
    category: "productivity"
  },
  {
    id: 9,
    name: "Facebook",
    packageName: "com.facebook.katana",
    icon: "https://img.icons8.com/color/96/000000/facebook-new.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.facebook.katana",
    description: "Социальная сеть",
    category: "social"
  },
  {
    id: 10,
    name: "TikTok",
    packageName: "com.zhiliaoapp.musically",
    icon: "https://img.icons8.com/color/96/000000/tiktok--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically",
    description: "Платформа для коротких видео",
    category: "social"
  },
  {
    id: 11,
    name: "Google Chrome",
    packageName: "com.android.chrome",
    icon: "https://img.icons8.com/color/96/000000/chrome--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.android.chrome",
    description: "Веб-браузер от Google",
    category: "browser"
  },
  {
    id: 12,
    name: "Discord",
    packageName: "com.discord",
    icon: "https://img.icons8.com/color/96/000000/discord-logo.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.discord",
    description: "Общение для сообществ",
    category: "messenger"
  },
  {
    id: 13,
    name: "Zoom",
    packageName: "us.zoom.videomeetings",
    icon: "https://img.icons8.com/color/96/000000/zoom.png",
    storeUrl: "https://play.google.com/store/apps/details?id=us.zoom.videomeetings",
    description: "Видеоконференции",
    category: "productivity"
  },
  {
    id: 14,
    name: "Twitter",
    packageName: "com.twitter.android",
    icon: "https://img.icons8.com/color/96/000000/twitter--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.twitter.android",
    description: "Социальная сеть и новости",
    category: "social"
  },
  {
    id: 15,
    name: "Viber",
    packageName: "com.viber.voip",
    icon: "https://img.icons8.com/color/96/000000/viber.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.viber.voip",
    description: "Мессенджер и звонки",
    category: "messenger"
  },
  {
    id: 16,
    name: "Google Drive",
    packageName: "com.google.android.apps.docs",
    icon: "https://img.icons8.com/color/96/000000/google-drive--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.docs",
    description: "Облачное хранилище файлов",
    category: "productivity"
  },
  {
    id: 17,
    name: "Snapchat",
    packageName: "com.snapchat.android",
    icon: "https://img.icons8.com/color/96/000000/snapchat--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.snapchat.android",
    description: "Мультимедийное общение",
    category: "social"
  },
  {
    id: 18,
    name: "Pinterest",
    packageName: "com.pinterest",
    icon: "https://img.icons8.com/color/96/000000/pinterest--v1.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.pinterest",
    description: "Поиск идей и вдохновения",
    category: "social"
  },
  {
    id: 19,
    name: "Amazon",
    packageName: "com.amazon.mShop.android.shopping",
    icon: "https://img.icons8.com/color/96/000000/amazon.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.amazon.mShop.android.shopping",
    description: "Интернет-магазин",
    category: "shopping"
  },
  {
    id: 20,
    name: "Microsoft Teams",
    packageName: "com.microsoft.teams",
    icon: "https://img.icons8.com/color/96/000000/microsoft-teams-2019.png",
    storeUrl: "https://play.google.com/store/apps/details?id=com.microsoft.teams",
    description: "Корпоративное общение",
    category: "productivity"
  }
  // Остальные приложения можно дополнить по аналогии
];

export default appDatabase;