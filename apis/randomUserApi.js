/**
 * ============================================
 * Random User API Modülü
 * ============================================
 * 
 * Bu dosya sadece Random User API iletişiminden sorumludur.
 * Mikro mimari prensibi: Her API kendi dosyasında izole edilmiştir.
 * 
 * Sorumluluklar:
 * - API endpoint URL'sini yönetmek
 * - HTTP isteği göndermek
 * - Yanıtı ayrıştırmak
 * - Hataları fırlatmak (UI mantığı ile ilgilenmez)
 * 
 * API Açıklaması:
 * Random User API, rastgele kullanıcı profilleri oluşturur.
 * Bu veri, gerçek dünya senaryolarında kullanıcı listesi,
 * müşteri veritabanı vb. simülasyonu için kullanılabilir.
 */

// API yapılandırması (5 rastgele kullanıcı çek)
const API_URL = 'https://randomuser.me/api/?results=5&nat=tr,us,gb,de';

/**
 * Random User API'den rastgele kullanıcı verilerini çeker.
 * @param {AbortSignal} signal - İstek iptali için sinyal
 * @returns {Promise<Object>} - Kullanıcı verileri
 * @throws {Error} - Ağ veya HTTP hatası
 */
export async function fetchUsers(signal) {
    const response = await fetch(API_URL, { signal });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

// API bilgileri (dokümantasyon için)
export const API_INFO = {
    name: 'Random User API (Kullanıcı Listesi)',
    url: API_URL,
    description: '5 adet rastgele kullanıcı profili (isim, e-posta, ülke)'
};
