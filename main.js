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
 * - State persistence (kalıcılık) işlemlerini yönetmek
 * - Şehir seçimi değişikliklerini yönetmek
 * 
 * NOT: Bu dosya diğer modülleri import eder ve birbirine bağlar.
 */

// API Katmanı
import { fetchUsers } from './apis/randomUserApi.js';
import { fetchWeather, CITIES } from './apis/weatherApi.js';
import { fetchJoke } from './apis/jokeApi.js';

// Durum Katmanı
import * as State from './state/appState.js';

// UI Katmanı
import { renderApiCard, setAllCardsLoading } from './ui/renderCards.js';
import { renderStateInspector, renderGlobalStatus, renderCounter, renderNextRefresh } from './ui/renderStateInspector.js';

// Persistence (Kalıcılık) Katmanı
import { saveState, loadState, clearState, hasStoredState, getLastSavedTime } from './persistence/storage.js';

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

    // Seçilen şehri al
    const selectedCity = State.getSelectedCity();

    // 3 API için paralel çekim promise'ları
    const fetchPromises = [
        fetchSingleAPI('users', () => fetchUsers(signal), signal),
        fetchSingleAPI('weather', () => fetchWeather(signal, selectedCity), signal),
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
 * Sadece hava durumu API'sini yeniden çeker (şehir değiştiğinde).
 */
async function fetchWeatherOnly() {
    const existingController = State.getAbortController();
    if (existingController) {
        existingController.abort();
    }

    const abortController = new AbortController();
    State.setAbortController(abortController);
    const { signal } = abortController;

    State.setApiLoading('weather');
    renderApiCard('weather', 'loading');
    renderStateInspector();

    const selectedCity = State.getSelectedCity();

    try {
        const data = await fetchWeather(signal, selectedCity);
        const timestamp = State.setApiSuccess('weather', data);
        renderApiCard('weather', 'success', data, timestamp);
    } catch (error) {
        if (error.name !== 'AbortError') {
            const timestamp = State.setApiError('weather', error.message);
            renderApiCard('weather', 'error', null, timestamp, error.message);
        }
    }

    State.setAbortController(null);
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
 * Şehir değiştirme (STATEFUL - hava durumu API'si için)
 */
function handleCityChange(cityKey) {
    State.setSelectedCity(cityKey);
    renderStateInspector();

    // Hava durumu API'sini yeniden çek
    fetchWeatherOnly();
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
// STATE PERSISTENCE (KALICILIK) FONKSİYONLARI
// ============================================

/**
 * State'i localStorage'a kaydeder.
 */
function handleSaveState() {
    const fullState = State.getFullState();
    const success = saveState(fullState);

    if (success) {
        updatePersistenceStatus('✅ State kaydedildi!', 'success');
    } else {
        updatePersistenceStatus('❌ Kaydetme hatası!', 'error');
    }

    renderStateInspector();
}

/**
 * State'i sıfırlar ve localStorage'ı temizler.
 */
function handleResetState() {
    // Zamanlayıcıları durdur
    stopAutoRefreshTimer();

    // localStorage'ı temizle
    clearState();

    // State'i sıfırla
    State.resetState();

    // UI'ı tamamen yeniden çiz
    renderFullUI();

    updatePersistenceStatus('🗑️ State sıfırlandı!', 'reset');

    renderStateInspector();
}

/**
 * Sayfa yüklendiğinde localStorage'dan state'i geri yükler.
 */
function initializeFromStorage() {
    if (hasStoredState()) {
        const loadedState = loadState();
        if (loadedState) {
            // State'i geri yükle
            State.restoreState(loadedState);

            // UI'ı güncelle
            renderFullUI();

            const savedTime = getLastSavedTime();
            if (savedTime) {
                const formattedTime = new Date(savedTime).toLocaleString('tr-TR');
                updatePersistenceStatus(`📁 Kayıtlı state yüklendi (${formattedTime})`, 'loaded');
            }

            console.log('✅ localStorage\'dan state geri yüklendi');
            return true;
        }
    }
    return false;
}

/**
 * Persistence durum mesajını günceller.
 */
function updatePersistenceStatus(message, type) {
    const statusEl = document.getElementById('persistence-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `persistence-status ${type}`;

        // 5 saniye sonra mesajı temizle
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'persistence-status';
        }, 5000);
    }
}

/**
 * Tüm UI bileşenlerini mevcut state'e göre yeniden çizer.
 */
function renderFullUI() {
    // Sayaç
    renderCounter(State.getCounter());

    // Tema
    const theme = State.getTheme();
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) themeSelector.value = theme;

    // Şehir seçici
    const citySelector = document.getElementById('city-selector');
    if (citySelector) citySelector.value = State.getSelectedCity();

    // Otomatik yenileme checkbox
    const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.checked = State.getAutoRefresh().enabled;
    }

    // API kartları
    const state = State.getState();
    ['users', 'weather', 'jokes'].forEach(apiKey => {
        const apiState = state.apis[apiKey];
        if (apiState && apiState.status === 'success' && apiState.data) {
            renderApiCard(apiKey, 'success', apiState.data, apiState.lastFetchedAt);
        } else if (apiState && apiState.status === 'error') {
            renderApiCard(apiKey, 'error', null, apiState.lastFetchedAt, apiState.error);
        } else {
            renderApiCard(apiKey, 'idle');
        }
    });

    // Global durum
    renderGlobalStatus(State.TR_STATUS.idle);

    // Durum denetçisi
    renderStateInspector();
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

    // Şehir seçici (STATEFUL)
    document.getElementById('city-selector')?.addEventListener('change', (e) => {
        handleCityChange(e.target.value);
    });

    // Otomatik yenileme düğmesi
    document.getElementById('auto-refresh-toggle')?.addEventListener('change', (e) => {
        handleAutoRefreshToggle(e.target.checked);
    });

    // Hepsini Çek butonu
    document.getElementById('btn-fetch-all')?.addEventListener('click', fetchAllAPIs);

    // Persistence butonları
    document.getElementById('btn-save-state')?.addEventListener('click', handleSaveState);
    document.getElementById('btn-reset-state')?.addEventListener('click', handleResetState);
}

// ============================================
// UYGULAMA BAŞLATMA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Olay dinleyicilerini kur
    setupEventListeners();

    // localStorage'dan state'i yüklemeyi dene
    const wasRestored = initializeFromStorage();

    if (!wasRestored) {
        // İlk durum denetçisi render'ı (yeni oturum)
        renderStateInspector();
    }

    console.log('🚀 DURUM (State) & DURUMLU (Stateful) Demo başlatıldı!');
    console.log('📁 Mikro Mimari Yapısı:');
    console.log('   └── apis/        → API iletişim modülleri');
    console.log('   └── state/       → Merkezi durum yönetimi');
    console.log('   └── ui/          → UI render modülleri');
    console.log('   └── persistence/ → localStorage kalıcılık');
    console.log('   └── main.js      → Kontrolcü / Orkestrasyon');
    console.log('💡 İpucu: window.appState ile durumu konsolda inceleyin.');
});

// Global erişim için
window.fetchAllAPIs = fetchAllAPIs;
window.handleSaveState = handleSaveState;
window.handleResetState = handleResetState;
