/**
 * ============================================
 * API Kartları Render Modülü
 * ============================================
 * 
 * Bu dosya sadece ekrana çizim yapar (API kartları).
 * Mikro mimari prensibi: UI mantığı, API ve durum mantığından ayrıdır.
 * 
 * Sorumluluklar:
 * - API kartlarının HTML içeriğini oluşturmak
 * - Durum rozetlerini güncellemek
 * - Veriyi görsel olarak render etmek
 * - UI mantığı dışında hiçbir şey yapmamak
 */

import { TR_STATUS } from '../state/appState.js';

/**
 * Bir API kartının arayüzünü günceller.
 * @param {string} apiKey - API anahtarı (users, weather, jokes)
 * @param {string} status - Durum (idle, loading, success, error)
 * @param {*} data - API'den gelen veri
 * @param {string} timestamp - Son çekim zamanı
 * @param {string} errorMsg - Hata mesajı
 */
export function renderApiCard(apiKey, status, data = null, timestamp = null, errorMsg = null) {
    const card = document.getElementById(`api-${apiKey}`);
    const statusBadge = document.getElementById(`status-${apiKey}`);
    const content = document.getElementById(`content-${apiKey}`);
    const timeDisplay = document.getElementById(`time-${apiKey}`);

    if (!card || !statusBadge || !content || !timeDisplay) {
        console.error(`API kartı bulunamadı: ${apiKey}`);
        return;
    }

    // Kart sınıfını güncelle
    card.className = `api-card ${status}`;

    // Durum rozetini güncelle
    statusBadge.className = `status-badge ${status}`;
    statusBadge.textContent = getStatusText(status);

    // İçeriği duruma göre güncelle
    content.innerHTML = getContentHtml(apiKey, status, data, errorMsg);

    // Zaman damgasını güncelle
    if (timestamp) {
        timeDisplay.textContent = new Date(timestamp).toLocaleTimeString('tr-TR');
    }
}

/**
 * Durum metnini döndürür.
 */
function getStatusText(status) {
    switch (status) {
        case 'loading': return TR_STATUS.loading;
        case 'success': return TR_STATUS.success;
        case 'error': return TR_STATUS.error;
        default: return TR_STATUS.notFetched;
    }
}

/**
 * Duruma göre içerik HTML'i döndürür.
 */
function getContentHtml(apiKey, status, data, errorMsg) {
    if (status === 'loading') {
        return `
            <div style="text-align:center;padding:2rem;">
                <div class="spinner"></div>
                <p>Veri çekiliyor...</p>
            </div>
        `;
    }

    if (status === 'error') {
        return `<p class="error-message">❌ Hata: ${errorMsg}</p>`;
    }

    if (status === 'success' && data) {
        return renderApiData(apiKey, data);
    }

    return `<p class="placeholder-text">Veri yüklemek için "Hepsini Çek" butonuna tıklayın...</p>`;
}

/**
 * API türüne göre veriyi render eder.
 */
function renderApiData(apiKey, data) {
    switch (apiKey) {
        case 'users':
            // Random User API verisini render et
            if (data.results && Array.isArray(data.results)) {
                return data.results.map(user => `
                    <div class="user-item">
                        <strong>${user.name.first} ${user.name.last}</strong>
                        <span class="user-country">${user.location.country}</span>
                        <small>${user.email}</small>
                    </div>
                `).join('');
            }
            return '<p>Kullanıcı verisi yüklenemedi</p>';

        case 'weather':
            const weather = data.current_weather;
            const city = data.city || { name: 'Bilinmiyor', country: 'Bilinmiyor' };
            return `
                <div class="weather-info">
                    <div class="weather-city">
                        📍 ${city.name} / ${city.country}
                    </div>
                    <div class="weather-temp">${weather.temperature}°C</div>
                    <div class="weather-details">
                        💨 Rüzgar: ${weather.windspeed} km/s | 
                        🌡️ Kod: ${weather.weathercode}
                    </div>
                    <div class="weather-coords">
                        <small>Enlem: ${city.lat} | Boylam: ${city.lon}</small>
                    </div>
                </div>
            `;

        case 'jokes':
            return `<p class="joke-text">"${data.joke}"</p>`;

        default:
            return '<p>Bilinmeyen veri formatı</p>';
    }
}

/**
 * Tüm API kartlarını yükleniyor durumuna ayarlar.
 */
export function setAllCardsLoading() {
    ['users', 'weather', 'jokes'].forEach(apiKey => {
        renderApiCard(apiKey, 'loading');
    });
}
