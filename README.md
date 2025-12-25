# DURUM (State) & DURUMLU (Stateful) Demo - Mikro Mimari

Web geliştirmede **DURUM (State)** ve **DURUMLU (Stateful)** kavramlarını, 3 paralel API çağrısı ile gösteren statik bir web sitesi. **Mikro Mimari (Modüler Yapı)** prensiplerine göre tasarlanmıştır.

---

## 📁 Proje Yapısı (Mikro Mimari)

```
3api+statestatefull/
├── 📁 apis/                      ← API Katmanı (Veri Kaynakları)
│   ├── jsonPlaceholderApi.js     → JSONPlaceholder API modülü
│   ├── weatherApi.js             → Open-Meteo Hava Durumu API modülü
│   └── jokeApi.js                → ICanHazDadJoke API modülü
│
├── 📁 state/                     ← Durum Yönetimi Katmanı
│   └── appState.js               → Merkezi durum nesnesi ve fonksiyonları
│
├── 📁 ui/                        ← UI / Görünüm Katmanı
│   ├── renderCards.js            → API kartlarını render eder
│   └── renderStateInspector.js   → Durum denetçisini render eder
│
├── main.js                       ← Kontrolcü / Orkestrasyon Katmanı
├── index.html                    → Ana HTML sayfası
├── styles.css                    → CSS stilleri
└── README.md                     → Bu dosya
```

---

## 🏗️ Katman Açıklamaları

| Katman | Dosyalar | Sorumluluk |
|--------|----------|------------|
| **API** | `apis/*.js` | Dış kaynaklardan veri çekme |
| **State** | `state/appState.js` | Uygulama verilerini saklama ve yönetme |
| **UI** | `ui/*.js` | Ekrana çizim yapma |
| **Controller** | `main.js` | Katmanları koordine etme |

---

## 🚀 GitHub Pages Dağıtım Talimatları

### Adım 1: GitHub Repository Oluşturma

1. [github.com](https://github.com) adresine gidip giriş yapın
2. Sağ üstteki **"+"** simgesine tıklayın → **"New repository"**
3. Repository adı: `state-stateful-demo` (veya istediğiniz bir isim)
4. **Public** seçin (ücretsiz GitHub Pages için gerekli)
5. README ile başlatmayı işaretlemeyin
6. **"Create repository"** tıklayın

### Adım 2: Dosyaları Yükleyin

**Terminal/Komut Satırı ile:**
```bash
# Boş repository'yi klonlayın
git clone https://github.com/KULLANICI_ADINIZ/state-stateful-demo.git

# Klasöre girin
cd state-stateful-demo

# Tüm proje dosyalarını bu klasöre kopyalayın
# (index.html, styles.css, main.js, README.md, apis/, state/, ui/ klasörleri)

# Tüm dosyaları stage'e ekleyin
git add .

# Commit yapın
git commit -m "İlk commit: DURUM & DURUMLU demo - Mikro Mimari"

# GitHub'a push edin
git push origin main
```

**GitHub Web Arayüzü ile:**
1. Repository'de **"Add file"** → **"Upload files"** tıklayın
2. Tüm dosya ve klasörleri sürükleyip bırakın
3. Commit mesajı yazın
4. **"Commit changes"** tıklayın

### Adım 3: GitHub Pages'i Etkinleştirin

1. Repository'de **Settings** (dişli simgesi) tıklayın
2. Sol menüden **Pages** seçin
3. **"Build and deployment"** altında:
   - **Source**: **"Deploy from a branch"** seçin
   - **Branch**: **"main"** seçin
   - **Folder**: **"/ (root)"** seçin
4. **Save** tıklayın
5. 1-2 dakika bekleyin

### Adım 4: Canlı Siteye Erişin

Siteniz şu adreste yayında olacak:
```
https://KULLANICI_ADINIZ.github.io/state-stateful-demo/
```

---

## 📡 Kullanılan API'ler

| API | Endpoint | Veri | Anahtar Gerekli mi? |
|-----|----------|------|---------------------|
| **JSONPlaceholder** | `jsonplaceholder.typicode.com/posts?_limit=5` | Sahte blog gönderileri | Hayır |
| **Open-Meteo** | `api.open-meteo.com/v1/forecast` | Hava durumu verileri | Hayır |
| **ICanHazDadJoke** | `icanhazdadjoke.com` | Rastgele fıkralar | Hayır |

---

## 🔧 Teknik Özellikler

- **ES Modülleri**: `import/export` ile modüler yapı
- **Paralel Çekim**: `Promise.allSettled()` ile 3 API aynı anda
- **AbortController**: Devam eden istekleri iptal etme
- **Merkezi Durum**: Tek bir state nesnesi
- **Reaktif UI**: Durum değişikliğinde otomatik güncelleme
- **Önbellekleme**: Son başarılı yanıtlar saklanır

---

## 💡 Yerel Test

ES Modülleri kullandığı için, dosyayı doğrudan tarayıcıda açmak yerine bir yerel sunucu kullanmanız gerekir:

```bash
# Python 3 ile
python -m http.server 8000

# Node.js ile (npx)
npx serve .

# VS Code Live Server eklentisi ile
# Sağ tık → "Open with Live Server"
```

Ardından tarayıcınızda `http://localhost:8000` adresine gidin.

---

## 📝 Lisans

Eğitim amaçlı oluşturulmuştur.
