/**
 * ============================================
 * Durum Denetçisi Render Modülü
 * ============================================
 * 
 * Bu dosya sadece ekrana çizim yapar (Durum Denetçisi paneli).
 * Mikro mimari prensibi: UI mantığı, API ve durum mantığından ayrıdır.
 * 
 * Sorumluluklar:
 * - Durum Denetçisi panelini JSON olarak güncellemek
 * - Durumu görsel olarak render etmek
 */

import { getDisplayState, TR_STATUS, getFetchCount } from '../state/appState.js';

/**
 * Durum Denetçisi panelini günceller.
 * Mevcut uygulama durumunu biçimlendirilmiş JSON olarak gösterir.
 */
export function renderStateInspector() {
    const stateJson = document.getElementById('state-json');
    if (stateJson) {
        const displayState = getDisplayState();
        stateJson.textContent = JSON.stringify(displayState, null, 2);
    }
}

/**
 * Genel durum göstergesini günceller.
 * @param {string} status - Durum metni
 */
export function renderGlobalStatus(status) {
    const globalStatus = document.getElementById('global-status');
    const fetchCount = document.getElementById('fetch-count');

    if (globalStatus) {
        globalStatus.textContent = status;
        globalStatus.style.background = status === TR_STATUS.fetching ? '#f59e0b' : '#10b981';
        globalStatus.style.color = 'white';
        globalStatus.style.padding = '0.25rem 0.75rem';
        globalStatus.style.borderRadius = '4px';
    }

    if (fetchCount) {
        fetchCount.textContent = `(${TR_STATUS.totalFetches}: ${getFetchCount()})`;
    }
}

/**
 * Sayaç göstergesini günceller.
 * @param {number} value - Sayaç değeri
 */
export function renderCounter(value) {
    const counterDisplay = document.getElementById('counter-display');
    if (counterDisplay) {
        counterDisplay.textContent = value;
    }
}

/**
 * Sonraki yenileme geri sayımını günceller.
 * @param {number|null} nextRefreshAt - Sonraki yenileme zaman damgası
 */
export function renderNextRefresh(nextRefreshAt) {
    const display = document.getElementById('next-refresh-display');
    if (display) {
        if (nextRefreshAt) {
            const secondsRemaining = Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
            display.textContent = `⏱️ Sonraki yenileme: ${secondsRemaining} saniye`;
        } else {
            display.textContent = '';
        }
    }
}
