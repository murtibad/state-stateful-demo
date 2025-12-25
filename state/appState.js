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

    // API başına durum (her biri için yükleniyor, başarılı, hata)
    apis: {
        posts: {
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
        posts: null,
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
            gonderiler: {
                durum: TR_STATUS[state.apis.posts.status] || state.apis.posts.status,
                veriVar: state.apis.posts.data !== null,
                hata: state.apis.posts.error,
                sonCekim: state.apis.posts.lastFetchedAt
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
        onbellek: {
            gonderiler: state.cache.posts ? '(önbellekte veri var)' : null,
            havaDurumu: state.cache.weather ? '(önbellekte veri var)' : null,
            fikralar: state.cache.jokes ? '(önbellekte veri var)' : null
        }
    };
}

// Hata ayıklama için global erişim
if (typeof window !== 'undefined') {
    window.appState = state;
}
