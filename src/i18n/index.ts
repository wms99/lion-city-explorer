import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        touristSpots: 'Tourist & Food Spots',
        itinerary: 'Itinerary Planner',
        transport: 'Transport Options',
        settings: 'Settings'
      },
      home: {
        welcome: 'Welcome to Singapore!',
        personalizedGreeting: 'Welcome, {{name}}!',
        weather: 'Weather Forecast',
        events: 'Exciting Things Happening in SG',
        today: 'Today',
        next7Days: 'Next 7 Days',
        viewDetails: 'View Details'
      },
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        retry: 'Retry'
      }
    }
  },
  zh: {
    translation: {
      nav: {
        home: '首页',
        touristSpots: '旅游景点和美食',
        itinerary: '行程规划师',
        transport: '交通选项',
        settings: '设置'
      },
      home: {
        welcome: '欢迎来到新加坡！',
        personalizedGreeting: '欢迎，{{name}}！',
        weather: '天气预报',
        events: '新加坡精彩活动',
        today: '今天',
        next7Days: '未来7天',
        viewDetails: '查看详情'
      },
      common: {
        loading: '加载中...',
        error: '出现错误',
        retry: '重试'
      }
    }
  },
  ms: {
    translation: {
      nav: {
        home: 'Utama',
        touristSpots: 'Tempat Pelancongan & Makanan',
        itinerary: 'Perancang Itinerari',
        transport: 'Pilihan Pengangkutan',
        settings: 'Tetapan'
      },
      home: {
        welcome: 'Selamat datang ke Singapura!',
        personalizedGreeting: 'Selamat datang, {{name}}!',
        weather: 'Ramalan Cuaca',
        events: 'Perkara Menarik di Singapura',
        today: 'Hari Ini',
        next7Days: '7 Hari Akan Datang',
        viewDetails: 'Lihat Butiran'
      },
      common: {
        loading: 'Memuatkan...',
        error: 'Berlaku ralat',
        retry: 'Cuba Lagi'
      }
    }
  },
  ta: {
    translation: {
      nav: {
        home: 'முகப்பு',
        touristSpots: 'சுற்றுலா மற்றும் உணவு இடங்கள்',
        itinerary: 'பயண திட்டமிடுபவர்',
        transport: 'போக்குவரத்து விருப்பங்கள்',
        settings: 'அமைப்புகள்'
      },
      home: {
        welcome: 'சிங்கப்பூருக்கு வரவேற்கிறோம்!',
        personalizedGreeting: 'வரவேற்கிறோம், {{name}}!',
        weather: 'வானிலை முன்னறிவிப்பு',
        events: 'சிங்கப்பூரில் அற்புதமான நிகழ்வுகள்',
        today: 'இன்று',
        next7Days: 'அடுத்த 7 நாட்கள்',
        viewDetails: 'விவரங்களைக் காண்க'
      },
      common: {
        loading: 'ஏற்றுகிறது...',
        error: 'ஏதோ தவறு நடந்தது',
        retry: 'மீண்டும் முயற்சிக்கவும்'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;