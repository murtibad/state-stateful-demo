/**
 * ============================================
 * JSONPlaceholder API Modülü
 * ============================================
 * 
 * Bu dosya sadece JSONPlaceholder API iletişiminden sorumludur.
 * Mikro mimari prensibi: Her API kendi dosyasında izole edilmiştir.
 * 
 * Sorumluluklar:
 * - API endpoint URL'sini yönetmek
 * - HTTP isteği göndermek
 * - Yanıtı ayrıştırmak
 * - Hataları fırlatmak (UI mantığı ile ilgilenmez)
 */

// API yapılandırması
const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=5';

/**
 * JSONPlaceholder'dan gönderi verilerini çeker.
 * @param {AbortSignal} signal - İstek iptali için sinyal
 * @returns {Promise<Array>} - Gönderi dizisi
 * @throws {Error} - Ağ veya HTTP hatası
 */
export async function fetchPosts(signal) {
    const response = await fetch(API_URL, { signal });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// API bilgileri (dokümantasyon için)
export const API_INFO = {
    name: 'JSONPlaceholder Gönderiler',
    url: API_URL,
    description: '5 adet sahte blog gönderi başlığı ve özeti'
};
