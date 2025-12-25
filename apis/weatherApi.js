/**
 * ============================================
 * Open-Meteo Hava Durumu API Modülü
 * ============================================
 * 
 * Bu dosya sadece Open-Meteo API iletişiminden sorumludur.
 * Mikro mimari prensibi: Her API kendi dosyasında izole edilmiştir.
 * 
 * Sorumluluklar:
 * - API endpoint URL'sini dinamik olarak oluşturmak
 * - Şehir koordinatlarını yönetmek
 * - HTTP isteği göndermek
 * - Yanıtı ayrıştırmak
 * - Hataları fırlatmak (UI mantığı ile ilgilenmez)
 */

// Şehir koordinatları veritabanı
export const CITIES = {
    istanbul: {
        name: 'İstanbul',
        country: 'Türkiye',
        lat: 41.01,
        lon: 28.95
    },
    ankara: {
        name: 'Ankara',
        country: 'Türkiye',
        lat: 39.93,
        lon: 32.86
    },
    izmir: {
        name: 'İzmir',
        country: 'Türkiye',
        lat: 38.42,
        lon: 27.14
    },
    berlin: {
        name: 'Berlin',
        country: 'Almanya',
        lat: 52.52,
        lon: 13.41
    },
    london: {
        name: 'Londra',
        country: 'İngiltere',
        lat: 51.51,
        lon: -0.13
    },
    paris: {
        name: 'Paris',
        country: 'Fransa',
        lat: 48.86,
        lon: 2.35
    }
};

// Varsayılan şehir
export const DEFAULT_CITY = 'istanbul';

/**
 * Belirtilen şehir için API URL'sini oluşturur.
 * @param {string} cityKey - Şehir anahtarı (istanbul, ankara, vb.)
 * @returns {string} - API URL
 */
function buildApiUrl(cityKey) {
    const city = CITIES[cityKey] || CITIES[DEFAULT_CITY];
    return `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
}

/**
 * Open-Meteo'dan belirtilen şehir için hava durumu verilerini çeker.
 * @param {AbortSignal} signal - İstek iptali için sinyal
 * @param {string} cityKey - Şehir anahtarı
 * @returns {Promise<Object>} - Hava durumu verisi (şehir bilgisi eklenmiş)
 * @throws {Error} - Ağ veya HTTP hatası
 */
export async function fetchWeather(signal, cityKey = DEFAULT_CITY) {
    const url = buildApiUrl(cityKey);
    const response = await fetch(url, { signal });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Şehir bilgisini yanıta ekle (UI için)
    const city = CITIES[cityKey] || CITIES[DEFAULT_CITY];
    data.city = {
        key: cityKey,
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
    };

    return data;
}

// API bilgileri (dokümantasyon için)
export const API_INFO = {
    name: 'Open-Meteo Hava Durumu',
    url: 'https://api.open-meteo.com/v1/forecast',
    description: 'Seçilen şehir için anlık hava durumu (sıcaklık, rüzgar hızı, hava kodu)'
};
