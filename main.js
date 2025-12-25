/**
 * ============================================
 * Ana Kontrolcü (Controller) - Orkestrasyon Katmanı
 * ============================================
 * 
 * Bu dosya API, durum ve UI katmanları arasındaki koordinasyonu sağlar.
 * Mikro mimari prensibi: Controller, diğer katmanları birbirine bağlar.
 * 
 * Sorumluluklar:
 * - "Hepsini Çek" aksiyonunu koordine etmek
 * - Paralel API çağrılarını tetiklemek
 * - Durum katmanı üzerinden durumu güncellemek
 * - UI yeniden render'larını tetiklemek
 * - Olay dinleyicilerini yönetmek
 * 
 * NOT: Bu dosya diğer modülleri import eder ve birbirine bağlar.
 */

// API Katmanı
import { fetchPosts } from './apis/jsonPlaceholderApi.js';
import { fetchWeather } from './apis/weatherApi.js';
import { fetchJoke } from './apis/jokeApi.js';

// Durum Katmanı
import * as State from './state/appState.js';

// UI Katmanı
import { renderApiCard, setAllCardsLoading } from './ui/renderCards.js';
import { renderStateInspector, renderGlobalStatus, renderCounter, renderNextRefresh } from './ui/renderStateInspector.js';

// ============================================
// API ÇEKIM ORKESTRASYONu
// ============================================

/**
 * Tüm API'leri paralel olarak çeker.
 * Promise.allSettled kullanarak hepsi aynı anda başlatılır.
 */
async function fetchAllAPIs() {
    // Devam eden istekleri iptal et
    const existingController = State.getAbortController();
    if (existingController) {
        existingController.abort();
    }

    // Yeni AbortController oluştur
    const abortController = new AbortController();
    State.setAbortController(abortController);
    const { signal } = abortController;

    // Durumu güncelle
    State.setFetching(true);
    State.incrementFetchCount();
    State.setAllApisLoading();

    // UI'ı güncelle
    setAllCardsLoading();
    renderGlobalStatus(State.TR_STATUS.fetching);
    renderStateInspector();

    // 3 API için paralel çekim promise'ları
    const fetchPromises = [
        fetchSingleAPI('posts', () => fetchPosts(signal), signal),
        fetchSingleAPI('weather', () => fetchWeather(signal), signal),
        fetchSingleAPI('jokes', () => fetchJoke(signal), signal)
    ];

    // Hepsinin tamamlanmasını bekle (paralel)
    await Promise.allSettled(fetchPromises);

    // Durumu güncelle
    State.setFetching(false);
    State.setAbortController(null);

    // UI'ı güncelle
    renderGlobalStatus(State.TR_STATUS.idle);
    renderStateInspector();
}

/**
 * Tek bir API'yi çeker ve durumu/UI'ı günceller.
 */
async function fetchSingleAPI(apiKey, fetchFn, signal) {
    try {
        const data = await fetchFn();
        const timestamp = State.setApiSuccess(apiKey, data);
        renderApiCard(apiKey, 'success', data, timestamp);
        renderStateInspector();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log(`[${apiKey}] İstek iptal edildi`);
            return;
        }
        const timestamp = State.setApiError(apiKey, error.message);
        renderApiCard(apiKey, 'error', null, timestamp, error.message);
        renderStateInspector();
    }
}

// ============================================
// DURUMLU KONTROL FONKSİYONLARI
// ============================================

/**
 * Sayaç artırma
 */
function handleIncrement() {
    const newValue = State.incrementCounter();
    renderCounter(newValue);
    renderStateInspector();
}

/**
 * Sayaç azaltma
 */
function handleDecrement() {
    const newValue = State.decrementCounter();
    renderCounter(newValue);
    renderStateInspector();
}

/**
 * Tema değiştirme
 */
function handleThemeChange(theme) {
    State.setTheme(theme);
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    renderStateInspector();
}

/**
 * Otomatik yenileme açma/kapama
 */
function handleAutoRefreshToggle(enabled) {
    State.setAutoRefreshEnabled(enabled);

    if (enabled) {
        startAutoRefreshTimer();
        fetchAllAPIs();
    } else {
        stopAutoRefreshTimer();
    }

    renderStateInspector();
}

/**
 * Otomatik yenileme zamanlayıcısını başlatır.
 */
function startAutoRefreshTimer() {
    stopAutoRefreshTimer();

    const autoRefresh = State.getAutoRefresh();
    const intervalMs = autoRefresh.intervalSeconds * 1000;

    // Sonraki yenileme zamanını ayarla
    State.setNextRefreshAt(Date.now() + intervalMs);
    renderNextRefresh(State.getAutoRefresh().nextRefreshAt);

    // Geri sayım güncellemesi
    const countdownId = setInterval(() => {
        renderNextRefresh(State.getAutoRefresh().nextRefreshAt);
    }, 1000);
    State.setAutoRefreshCountdownId(countdownId);

    // Ana yenileme aralığı
    const intervalId = setInterval(() => {
        fetchAllAPIs();
        State.setNextRefreshAt(Date.now() + intervalMs);
        renderStateInspector();
    }, intervalMs);
    State.setAutoRefreshIntervalId(intervalId);
}

/**
 * Otomatik yenileme zamanlayıcısını durdurur.
 */
function stopAutoRefreshTimer() {
    const autoRefresh = State.getAutoRefresh();

    if (autoRefresh.intervalId) {
        clearInterval(autoRefresh.intervalId);
        State.setAutoRefreshIntervalId(null);
    }
    if (autoRefresh.countdownId) {
        clearInterval(autoRefresh.countdownId);
        State.setAutoRefreshCountdownId(null);
    }

    State.setNextRefreshAt(null);
    renderNextRefresh(null);
}

// ============================================
// OLAY DİNLEYİCİLERİ KURULUMU
// ============================================

/**
 * Tüm olay dinleyicilerini bağlar.
 */
function setupEventListeners() {
    // Sayaç butonları
    document.getElementById('btn-increment')?.addEventListener('click', handleIncrement);
    document.getElementById('btn-decrement')?.addEventListener('click', handleDecrement);

    // Tema seçici
    document.getElementById('theme-selector')?.addEventListener('change', (e) => {
        handleThemeChange(e.target.value);
    });

    // Otomatik yenileme düğmesi
    document.getElementById('auto-refresh-toggle')?.addEventListener('change', (e) => {
        handleAutoRefreshToggle(e.target.checked);
    });

    // Hepsini Çek butonu
    document.getElementById('btn-fetch-all')?.addEventListener('click', fetchAllAPIs);
}

// ============================================
// UYGULAMA BAŞLATMA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Olay dinleyicilerini kur
    setupEventListeners();

    // İlk durum denetçisi render'ı
    renderStateInspector();

    console.log('🚀 DURUM (State) & DURUMLU (Stateful) Demo başlatıldı!');
    console.log('📁 Mikro Mimari Yapısı:');
    console.log('   └── apis/        → API iletişim modülleri');
    console.log('   └── state/       → Merkezi durum yönetimi');
    console.log('   └── ui/          → UI render modülleri');
    console.log('   └── main.js      → Kontrolcü / Orkestrasyon');
    console.log('💡 İpucu: window.appState ile durumu konsolda inceleyin.');
});

// Global erişim için
window.fetchAllAPIs = fetchAllAPIs;
