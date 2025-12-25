/**
 * ============================================
 * Open-Meteo Hava Durumu API Modülü
 * ============================================
 * 
 * Bu dosya sadece Open-Meteo API iletişiminden sorumludur.
 * Mikro mimari prensibi: Her API kendi dosyasında izole edilmiştir.
 * 
 * Sorumluluklar:
 * - API endpoint URL'sini yönetmek
 * - HTTP isteği göndermek
 * - Yanıtı ayrıştırmak
 * - Hataları fırlatmak (UI mantığı ile ilgilenmez)
 */

// API yapılandırması (İstanbul koordinatları)
const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=41.01&longitude=28.95&current_weather=true';

/**
 * Open-Meteo'dan hava durumu verilerini çeker.
 * @param {AbortSignal} signal - İstek iptali için sinyal
 * @returns {Promise<Object>} - Hava durumu verisi
 * @throws {Error} - Ağ veya HTTP hatası
 */
export async function fetchWeather(signal) {
    const response = await fetch(API_URL, { signal });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// API bilgileri (dokümantasyon için)
export const API_INFO = {
    name: 'Open-Meteo Hava Durumu',
    url: API_URL,
    description: 'İstanbul için anlık hava durumu (sıcaklık, rüzgar hızı, hava kodu)'
};
