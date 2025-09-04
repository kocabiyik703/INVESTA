Geleceğin Sürdürülebilir Şehirleri: Akıllı Şehir Yatırım Asistanı
Bu proje, Türkiye'deki şehirlerin sürdürülebilirlik ve yatırım potansiyelini analiz etmek için geliştirilmiş, yapay zeka destekli interaktif bir harita uygulamasıdır. Kullanıcılar, kendi yatırım vizyonlarına göre belirledikleri kriterlerle veya yapay zeka asistanının önerileriyle potansiyeli en yüksek olan şehirleri dinamik bir harita üzerinde görselleştirebilirler.

Proje, Supabase veritabanı altyapısını ve OpenRouter üzerinden erişilen Google Gemini Flash 2.5 yapay zeka modelini kullanarak yatırımcılara, şehir planlamacılarına ve araştırmacılara güçlü bir karar destek aracı sunar.

🌟 Temel Özellikler
🤖 Yapay Zeka Asistanı (Google Gemini Flash 2.5): OpenRouter platformu üzerinden çalışan asistan, "tarım yatırımı için en uygun şehirler hangileri?" gibi doğal dil sorgularını anlar ve size özel bir analiz senaryosu önerir.

🎯 Akıllı Veri Türü Tespiti: Yapay zeka, kullanıcı istemlerini analiz ederek ilgili veri türlerini (örneğin, "nüfus yoğunluğu", "tarım alanları") tam, kısmi ve bulanık eşleştirme (fuzzy matching) yöntemleriyle otomatik olarak tespit eder.

🧮 Otomatik Ağırlıklı Ortalama: Tespit edilen veya kullanıcı tarafından seçilen veri türleri için 1-10 arasında rastgele katsayılar atanır ve il bazında potansiyel skoru hesaplanır.

🗺️ Dinamik ve İnteraktif Harita: Analiz sonuçları, anında bir renk skalasıyla Türkiye haritası üzerinde görselleştirilir. Bu sayede yatırım potansiyeli yüksek olan bölgeler kolayca ayırt edilebilir.

🔧 Özelleştirilebilir Analiz: Kullanıcılar, kenar çubuğundaki (sidebar) veri metriklerini kullanarak kendi yatırım önceliklerine göre senaryolar oluşturabilir ve katsayıları manuel olarak belirleyebilirler.

⚡ Hızlı Senaryolar: Farklı yatırımcı profilleri için önceden tanımlanmış senaryolar sunarak hızlı bir başlangıç imkanı tanır.

🛠️ Kullanılan Teknolojiler
Frontend: HTML5, CSS3, JavaScript (ES Modules)

Haritalama: Leaflet.js

Yapay Zeka: Google Gemini Flash 2.5 (via OpenRouter)

Veritabanı (Backend): Supabase

Markdown İşleme: Marked.js (Yapay zeka yanıtlarını formatlamak için)

📂 **Proje Dosya Yapısı**
```plaintext
├── 📁 src
│   ├── 📁 css
│   │   └── 📄 style.css       # Stil dosyası
│   └── 📁 js
│       ├── 📁 map
│       │   └── 📄 mapManager.js   # Leaflet harita yönetimi ve katmanlar
│       ├── 📁 supabase
│       │   ├── 📄 aiVeriTurleri.js  # AI tarafından kullanılacak veri türleri
│       │   ├── 📄 client.js       # Supabase bağlantı ayarları
│       │   ├── 📄 groups.js       # Veri türü grupları (örn: Demografi)
│       │   ├── 📄 scenarios.js    # Hızlı senaryo verileri
│       │   └── 📄 veriTurleri.js  # Tüm veri metrikleri
│       └── 📁 ui
│           ├── 📄 aiAssistant.js  # OpenRouter API ve AI mantığı
│           ├── 📄 eventListener.js# Buton ve slider olay dinleyicileri
│           ├── 📄 groups.js       # Arayüzdeki grupları oluşturan kod
│           └── 📄 scenarios.js    # Arayüzdeki hızlı senaryoları oluşturan kod
├── 📄 index.html              # Ana HTML dosyası
├── 📄 README.md               # Bu döküman
└── 📄 cities.geojson          # Türkiye illerinin coğrafi poligon verileri
```
🚀 Kurulum ve Çalıştırma
Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

Gereksinimler
Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)

Bir yerel sunucu aracı (örn: Live Server for VS Code)

Bir OpenAI API anahtarı
Bir Supabase API anahtarı

Kurulum Adımları
1. Projeyi İndirin veya Klonlayın
Projeyi bilgisayarınıza indirin.

🖥️ Projeyi Çalıştırma
Proje, internet üzerindeki bir veritabanına bağlandığı ve ES modülleri kullandığı için bir yerel sunucu (local server) üzerinden çalıştırılmalıdır. Bunun için en kolay yöntem Visual Studio Code ve "Live Server" eklentisidir.

Gereksinimler
Visual Studio Code
Live Server eklentisi

Adımlar
Proje klasörünü Visual Studio Code ile açın.
Eğer yüklü değilse Live Server eklentisini kurun.

Sol taraftaki Dosya Gezgini'nden index.html dosyasına sağ tıklayın.

Açılan menüden "Open with Live Server" seçeneğine tıklayın.

Bu işlem, projenizi varsayılan web tarayıcınızda otomatik olarak açacak ve çalışır hale getirecektir.

Artık projeyi kullanmaya hazırsınız!



