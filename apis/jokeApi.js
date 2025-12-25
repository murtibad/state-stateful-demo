/**
 * ============================================
 * ICanHazDadJoke API Modülü
 * ============================================
 * 
 * Bu dosya sadece ICanHazDadJoke API iletişiminden sorumludur.
 * Mikro mimari prensibi: Her API kendi dosyasında izole edilmiştir.
 * 
 * Sorumluluklar:
 * - API endpoint URL'sini yönetmek
 * - HTTP isteği göndermek (özel header ile)
 * - Yanıtı ayrıştırmak
 * - Hataları fırlatmak (UI mantığı ile ilgilenmez)
 */

// API yapılandırması
const API_URL = 'https://icanhazdadjoke.com/';

/**
 * ICanHazDadJoke'dan rastgele fıkra çeker.
 * @param {AbortSignal} signal - İstek iptali için sinyal
 * @returns {Promise<Object>} - Fıkra verisi
 * @throws {Error} - Ağ veya HTTP hatası
 */
export async function fetchJoke(signal) {
    const response = await fetch(API_URL, {
        signal,
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// API bilgileri (dokümantasyon için)
export const API_INFO = {
    name: 'ICanHazDadJoke (Fıkralar)',
    url: API_URL,
    description: 'Rastgele bir baba fıkrası (İngilizce - API\'den gelen orijinal veri)'
};
