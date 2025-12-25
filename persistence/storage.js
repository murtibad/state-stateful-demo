/**
 * ============================================
 * State Kalıcılık (Persistence) Modülü
 * ============================================
 * 
 * Bu dosya localStorage işlemlerinden sorumludur.
 * Mikro mimari prensibi: Kalıcılık işlemleri ayrı bir katmanda tutulur.
 * 
 * Sorumluluklar:
 * - State'i localStorage'a kaydetmek
 * - State'i localStorage'dan yüklemek
 * - localStorage'ı temizlemek
 * 
 * ÖNEMLİ: UI veya API dosyaları bu dosyaya doğrudan erişmez,
 * sadece controller (main.js) bu fonksiyonları çağırır.
 */

// localStorage anahtarı
const STORAGE_KEY = 'state-stateful-demo-appState';

/**
 * State'i localStorage'a kaydeder.
 * @param {Object} state - Kaydedilecek uygulama durumu
 * @returns {boolean} - Kayıt başarılı mı?
 */
export function saveState(state) {
    try {
        // Serileştirilemeyen değerleri temizle (intervalId, abortController vb.)
        const persistableState = {
            counter: state.counter,
            theme: state.theme,
            autoRefresh: {
                enabled: state.autoRefresh?.enabled || false,
                intervalSeconds: state.autoRefresh?.intervalSeconds || 30,
                // intervalId ve countdownId kaydedilmez (yeniden oluşturulur)
            },
            fetchCount: state.fetchCount,
            apis: state.apis,
            cache: state.cache,
            savedAt: new Date().toISOString()
        };

        const serialized = JSON.stringify(persistableState);
        localStorage.setItem(STORAGE_KEY, serialized);

        console.log('✅ State localStorage\'a kaydedildi:', new Date().toLocaleTimeString('tr-TR'));
        return true;
    } catch (error) {
        console.error('❌ State kaydetme hatası:', error);
        return false;
    }
}

/**
 * State'i localStorage'dan yükler.
 * @returns {Object|null} - Yüklenen state veya null (yoksa/hatalıysa)
 */
export function loadState() {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);

        if (!serialized) {
            console.log('ℹ️ localStorage\'da kayıtlı state bulunamadı.');
            return null;
        }

        const loadedState = JSON.parse(serialized);
        console.log('✅ State localStorage\'dan yüklendi. Kaydedilme zamanı:', loadedState.savedAt);

        return loadedState;
    } catch (error) {
        console.error('❌ State yükleme hatası:', error);
        return null;
    }
}

/**
 * localStorage'ı temizler (state'i siler).
 * @returns {boolean} - Temizleme başarılı mı?
 */
export function clearState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ localStorage temizlendi, state silindi.');
        return true;
    } catch (error) {
        console.error('❌ localStorage temizleme hatası:', error);
        return false;
    }
}

/**
 * localStorage'da kayıtlı state olup olmadığını kontrol eder.
 * @returns {boolean}
 */
export function hasStoredState() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Son kayıt zamanını döndürür.
 * @returns {string|null}
 */
export function getLastSavedTime() {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) return null;

        const state = JSON.parse(serialized);
        return state.savedAt || null;
    } catch {
        return null;
    }
}
