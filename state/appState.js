/**
 * ============================================
 * Uygulama Durumu (State) Yönetim Modülü
 * ============================================
 * 
 * Bu dosya uygulamanın durumunu (state) yönetir.
 * Mikro mimari prensibi: Durum merkezi bir yerde tutulur ve kontrollü erişilir.
 * 
 * Sorumluluklar:
 * - Tam uygulama durumu nesnesini tanımlamak
 * - Durum okuma/güncelleme fonksiyonlarını dışa aktarmak
 * - Yükleniyor / başarılı / hata bayraklarını yönetmek
 * - Zaman damgaları, önbellek, sayaçlar ve otomatik yenileme bayraklarını saklamak
 * 
 * ÖNEMLİ: UI asla ham durum değişkenlerini doğrudan değiştirmemelidir.
 */

// ============================================
// DURUM (STATE) NESNESİ
// ============================================
// Bu, tüm uygulamanın tek doğruluk kaynağıdır.

const state = {
    // Kullanıcı etkileşimi durumu
    counter: 0,
    theme: 'light',

    // Otomatik yenileme durumu
    autoRefresh: {
        enabled: false,
        intervalId: null,
        countdownId: null,
        intervalSeconds: 30,
        nextRefreshAt: null
    },

    // Çekim durumu
    fetchCount: 0,
    isFetching: false,
    abortController: null,

    // Seçilen şehir (hava durumu API'si için - STATEFUL)
    selectedCity: 'istanbul',

    // API başına durum (her biri için yükleniyor, başarılı, hata)
    apis: {
        users: {
            status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
            data: null,
            error: null,
            lastFetchedAt: null
        },
        weather: {
            status: 'idle',
            data: null,
            error: null,
            lastFetchedAt: null
        },
        jokes: {
            status: 'idle',
            data: null,
            error: null,
            lastFetchedAt: null
        }
    },

    // Önbellek (son başarılı yanıtları saklar)
    cache: {
        users: null,
        weather: null,
        jokes: null
    }
};

// Türkçe durum metinleri
export const TR_STATUS = {
    idle: 'Boşta',
    loading: 'Yükleniyor',
    success: 'Başarılı',
    error: 'Hata',
    notFetched: 'Çekilmedi',
    never: 'Henüz hiç',
    fetching: 'Çekiliyor...',
    totalFetches: 'Toplam çekim sayısı'
};

// ============================================
// DURUM OKUMA FONKSİYONLARI
// ============================================

/**
 * Mevcut durumun salt okunur bir kopyasını döndürür.
 */
export function getState() {
    return { ...state };
}

/**
 * Belirli bir API'nin durumunu döndürür.
 */
export function getApiState(apiKey) {
    return { ...state.apis[apiKey] };
}

/**
 * Sayacın mevcut değerini döndürür.
 */
export function getCounter() {
    return state.counter;
}

/**
 * Temayı döndürür.
 */
export function getTheme() {
    return state.theme;
}

/**
 * Otomatik yenileme durumunu döndürür.
 */
export function getAutoRefresh() {
    return { ...state.autoRefresh };
}

/**
 * Çekim sayısını döndürür.
 */
export function getFetchCount() {
    return state.fetchCount;
}

/**
 * Çekim yapılıp yapılmadığını döndürür.
 */
export function isFetching() {
    return state.isFetching;
}

// ============================================
// DURUM GÜNCELLEME FONKSİYONLARI
// ============================================

/**
 * Sayacı artırır.
 */
export function incrementCounter() {
    state.counter++;
    return state.counter;
}

/**
 * Sayacı azaltır.
 */
export function decrementCounter() {
    state.counter--;
    return state.counter;
}

/**
 * Temayı değiştirir.
 */
export function setTheme(theme) {
    state.theme = theme;
    return state.theme;
}

/**
 * Seçilen şehri döndürür.
 */
export function getSelectedCity() {
    return state.selectedCity;
}

/**
 * Seçilen şehri değiştirir.
 */
export function setSelectedCity(cityKey) {
    state.selectedCity = cityKey;
    return state.selectedCity;
}

/**
 * Otomatik yenilemeyi açar/kapatır.
 */
export function setAutoRefreshEnabled(enabled) {
    state.autoRefresh.enabled = enabled;
}

/**
 * Otomatik yenileme zamanlayıcı ID'sini ayarlar.
 */
export function setAutoRefreshIntervalId(id) {
    state.autoRefresh.intervalId = id;
}

/**
 * Geri sayım ID'sini ayarlar.
 */
export function setAutoRefreshCountdownId(id) {
    state.autoRefresh.countdownId = id;
}

/**
 * Sonraki yenileme zamanını ayarlar.
 */
export function setNextRefreshAt(timestamp) {
    state.autoRefresh.nextRefreshAt = timestamp;
}

/**
 * Çekim durumunu ayarlar.
 */
export function setFetching(fetching) {
    state.isFetching = fetching;
}

/**
 * Çekim sayacını artırır.
 */
export function incrementFetchCount() {
    state.fetchCount++;
    return state.fetchCount;
}

/**
 * AbortController'ı ayarlar.
 */
export function setAbortController(controller) {
    state.abortController = controller;
}

/**
 * Mevcut AbortController'ı döndürür.
 */
export function getAbortController() {
    return state.abortController;
}

/**
 * Bir API'nin durumunu yükleniyor olarak ayarlar.
 */
export function setApiLoading(apiKey) {
    state.apis[apiKey].status = 'loading';
}

/**
 * Bir API'nin durumunu başarılı olarak ayarlar ve veriyi saklar.
 */
export function setApiSuccess(apiKey, data) {
    const timestamp = new Date().toISOString();
    state.apis[apiKey] = {
        status: 'success',
        data: data,
        error: null,
        lastFetchedAt: timestamp
    };

    // Önbelleği güncelle
    state.cache[apiKey] = {
        data: data,
        cachedAt: timestamp
    };

    return timestamp;
}

/**
 * Bir API'nin durumunu hata olarak ayarlar.
 */
export function setApiError(apiKey, errorMessage) {
    const timestamp = new Date().toISOString();
    state.apis[apiKey] = {
        status: 'error',
        data: null,
        error: errorMessage,
        lastFetchedAt: timestamp
    };
    return timestamp;
}

/**
 * Tüm API'lerin durumunu yükleniyor olarak ayarlar.
 */
export function setAllApisLoading() {
    Object.keys(state.apis).forEach(apiKey => {
        state.apis[apiKey].status = 'loading';
    });
}

// ============================================
// DURUM DENETÇİSİ İÇİN FORMAT FONKSİYONU
// ============================================

/**
 * Durum Denetçisi paneli için görüntülenebilir durum nesnesi döndürür.
 */
export function getDisplayState() {
    return {
        sayac: state.counter,
        tema: state.theme,
        otomatikYenileme: {
            aktif: state.autoRefresh.enabled,
            saniyeAraligi: state.autoRefresh.intervalSeconds,
            sonrakiYenileme: state.autoRefresh.nextRefreshAt
        },
        toplamCekimSayisi: state.fetchCount,
        cekimYapiliyor: state.isFetching,
        apiDurumlari: {
            kullanicilar: {
                durum: TR_STATUS[state.apis.users.status] || state.apis.users.status,
                veriVar: state.apis.users.data !== null,
                hata: state.apis.users.error,
                sonCekim: state.apis.users.lastFetchedAt
            },
            havaDurumu: {
                durum: TR_STATUS[state.apis.weather.status] || state.apis.weather.status,
                veriVar: state.apis.weather.data !== null,
                hata: state.apis.weather.error,
                sonCekim: state.apis.weather.lastFetchedAt
            },
            fikralar: {
                durum: TR_STATUS[state.apis.jokes.status] || state.apis.jokes.status,
                veriVar: state.apis.jokes.data !== null,
                hata: state.apis.jokes.error,
                sonCekim: state.apis.jokes.lastFetchedAt
            }
        },
        secilenSehir: state.selectedCity,
        onbellek: {
            kullanicilar: state.cache.users ? '(önbellekte veri var)' : null,
            havaDurumu: state.cache.weather ? '(önbellekte veri var)' : null,
            fikralar: state.cache.jokes ? '(önbellekte veri var)' : null
        }
    };
}

// ============================================
// STATE PERSISTENCE (KALICILIK) FONKSİYONLARI
// ============================================

/**
 * Kaydedilebilir tam state nesnesini döndürür (serileştirilebilir).
 * intervalId, abortController gibi fonksiyon/nesne referansları hariç tutulur.
 */
export function getFullState() {
    return {
        counter: state.counter,
        theme: state.theme,
        selectedCity: state.selectedCity,
        autoRefresh: {
            enabled: state.autoRefresh.enabled,
            intervalSeconds: state.autoRefresh.intervalSeconds
        },
        fetchCount: state.fetchCount,
        apis: state.apis,
        cache: state.cache
    };
}

/**
 * Dışarıdan yüklenen state ile mevcut state'i günceller.
 * @param {Object} loadedState - localStorage'dan yüklenen state
 */
export function restoreState(loadedState) {
    if (!loadedState) return;

    // Basit değerleri geri yükle
    if (typeof loadedState.counter === 'number') {
        state.counter = loadedState.counter;
    }
    if (loadedState.theme) {
        state.theme = loadedState.theme;
    }
    if (loadedState.selectedCity) {
        state.selectedCity = loadedState.selectedCity;
    }
    if (typeof loadedState.fetchCount === 'number') {
        state.fetchCount = loadedState.fetchCount;
    }

    // Otomatik yenileme ayarlarını geri yükle (zamanlayıcılar hariç)
    if (loadedState.autoRefresh) {
        state.autoRefresh.enabled = loadedState.autoRefresh.enabled || false;
        state.autoRefresh.intervalSeconds = loadedState.autoRefresh.intervalSeconds || 30;
        // intervalId ve countdownId manuel olarak yeniden başlatılmalı
    }

    // API durumlarını geri yükle
    if (loadedState.apis) {
        Object.keys(loadedState.apis).forEach(apiKey => {
            if (state.apis[apiKey]) {
                state.apis[apiKey] = { ...loadedState.apis[apiKey] };
            }
        });
    }

    // Önbelleği geri yükle
    if (loadedState.cache) {
        Object.keys(loadedState.cache).forEach(cacheKey => {
            if (state.cache.hasOwnProperty(cacheKey)) {
                state.cache[cacheKey] = loadedState.cache[cacheKey];
            }
        });
    }

    console.log('🔄 State geri yüklendi (restored)');
}

/**
 * State'i başlangıç değerlerine sıfırlar.
 */
export function resetState() {
    // Sayaç ve tema
    state.counter = 0;
    state.theme = 'light';

    // Otomatik yenileme (zamanlayıcıları durdurmak controller'ın işi)
    state.autoRefresh.enabled = false;
    state.autoRefresh.intervalId = null;
    state.autoRefresh.countdownId = null;
    state.autoRefresh.nextRefreshAt = null;

    // Çekim durumu
    state.fetchCount = 0;
    state.isFetching = false;
    state.abortController = null;

    // API durumları
    Object.keys(state.apis).forEach(apiKey => {
        state.apis[apiKey] = {
            status: 'idle',
            data: null,
            error: null,
            lastFetchedAt: null
        };
    });

    // Önbellek
    Object.keys(state.cache).forEach(cacheKey => {
        state.cache[cacheKey] = null;
    });

    console.log('🗑️ State sıfırlandı (reset)');
}

// Hata ayıklama için global erişim
if (typeof window !== 'undefined') {
    window.appState = state;
}

