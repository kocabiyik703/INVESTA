# INVEST@ - Veri Tabanlı Yatırım Analizi

📍 **Proje Türü:** Web Tabanlı Bölgesel Yatırım Asistanı  
🎯 **Hackathon:** TEKNOFEST 2025 – Geleceğin Sürdürülebilir Şehirleri Hackathonu  
📂 **Kategori:** Sektörel Yatırım Öncelikleri  
👥 **Takım:** Mexicali Rose  


## 📌 Proje Özeti

Türkiye'deki şehirlerin sürdürülebilirlik ve yatırım potansiyelini analiz etmek için geliştirilmiş, yapay zeka destekli interaktif bir harita uygulamasıdır. Kullanıcılar, kendi yatırım vizyonlarına göre belirledikleri kriterlerle veya yapay zeka asistanının önerileriyle potansiyeli en yüksek olan şehirleri dinamik bir harita üzerinde görselleştirebilirler.

Proje, PostgreSQL altyapısı ve OpenRouter üzerinden erişilen Deepseek yapay zeka modelini kullanarak yatırımcılara, şehir planlamacılarına ve araştırmacılara güçlü bir karar destek aracı sunar.

## 🌟 Temel Özellikler
**🤖 Yapay Zeka Asistanı (Deepseek):** OpenRouter platformu üzerinden çalışan asistan, "tarım yatırımı için en uygun şehirler hangileri?" gibi doğal dil sorgularını anlar ve size özel bir analiz senaryosu önerir.

**🎯 Akıllı Veri Türü Tespiti:** Yapay zeka, kullanıcı istemlerini analiz ederek ilgili veri türlerini (örneğin, "nüfus yoğunluğu", "tarım alanları") tam, kısmi ve bulanık eşleştirme (fuzzy matching) yöntemleriyle otomatik olarak tespit eder.

**🧮 Otomatik Ağırlıklı Ortalama:** Tespit edilen veya kullanıcı tarafından seçilen veri türleri için 1-10 arasında rastgele katsayılar atanır ve il bazında potansiyel skoru hesaplanır.

**🗺️ Dinamik ve İnteraktif Harita:** Analiz sonuçları, anında bir renk skalasıyla Türkiye haritası üzerinde görselleştirilir. Bu sayede yatırım potansiyeli yüksek olan bölgeler kolayca ayırt edilebilir.

**🔧 Özelleştirilebilir Analiz:** Kullanıcılar, kenar çubuğundaki (sidebar) veri metriklerini kullanarak kendi yatırım önceliklerine göre senaryolar oluşturabilir ve katsayıları manuel olarak belirleyebilirler.

**⚡ Hızlı Senaryolar:** Farklı yatırımcı profilleri için önceden tanımlanmış senaryolar sunarak hızlı bir başlangıç imkanı tanır.

## 🛠️ Kullanılan Teknolojiler
**Frontend:** HTML5, CSS3, JavaScript (ES Modules)

**Haritalama:** Leaflet.js

**Yapay Zeka:** Deepseek (via OpenRouter)

**Veritabanı (Backend):** PostgreSQL

**Markdown İşleme:** Marked.js (Yapay zeka yanıtlarını formatlamak için)

## 📂 Proje Yapısı
```plaintext
├── 📁 data_csv                      # CSV ve Excel verilerinin saklandığı klasör
│   ├── 📄 TUM_VERILER_GSS.xlsx      # Genel veri seti, tüm verileri içerir.
│   ├── 📄 agirliklar_rows.csv       # Ağırlıklandırma için kullanılan veri.
│   ├── 📄 grup_rows.csv             # Veri türü gruplarına ait veriler.
│   ├── 📄 iller_rows.csv            # Türkiye illeri plaka sırasına göre.
│   ├── 📄 senaryo_rows.csv          # Ön tanımlı senaryolar.
│   ├── 📄 veri_turleri_rows.csv     # Sistemdeki tüm veri metrikleri ve senaryolar için açıklaması.
│   └── 📄 veriler_rows.csv          # Hazır senaryolar için ağırlıklandırılmış veya filtrelenmiş veriler.
├── 📁 src
│   ├── 📁 css
│   │   └── 📄 style.css            # Stil dosyası
│   └── 📁 js
│       ├── 📁 map
│       │   └── 📄 mapManager.js      # Leaflet harita yönetimi ve katmanlar
│       ├── 📁 supabase
│       │   ├── 📄 aiVeriTurleri.js   # AI tarafından kullanılacak veri türleri
│       │   ├── 📄 client.js          # Supabase bağlantı ayarları
│       │   ├── 📄 groups.js          # Veri türü grupları (örn: Demografi)
│       │   ├── 📄 scenarios.js       # Hızlı senaryo verileri
│       │   └── 📄 veriTurleri.js     # Tüm veri metrikleri
│       └── 📁 ui
│           ├── 📄 aiAssistant.js     # OpenRouter API ve AI mantığı
│           ├── 📄 eventListener.js   # Buton ve slider olay dinleyicileri
│           ├── 📄 groups.js          # Arayüzdeki grupları oluşturan kod
│           └── 📄 scenarios.js       # Arayüzdeki hızlı senaryoları oluşturan kod
├── 📄 index.html                   # Ana HTML dosyası
├── 📄 README.md                    # Bu döküman
└── 📄 cities.geojson               # Türkiye illerinin coğrafi poligon verileri
```
## 🚀 Kurulum ve Çalıştırma
### Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

**Gereksinimler**  

- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)  
- Bir yerel sunucu aracı (örn: Live Server for VS Code)  
- Bir OpenAI API anahtarı  
- Bir Supabase API anahtarı  

**Kurulum Adımları**
1. Projeyi İndirin veya Klonlayın
Projeyi bilgisayarınıza indirin.

🖥️ Projeyi Çalıştırma
Proje, internet üzerindeki bir veritabanına bağlandığı ve ES modülleri kullandığı için bir yerel sunucu (local server) üzerinden çalıştırılmalıdır. Bunun için en kolay yöntem Visual Studio Code ve "Live Server" eklentisidir.

Gereksinimler
Visual Studio Code
Live Server eklentisi

**Adımlar**
Proje klasörünü Visual Studio Code ile açın.
Eğer yüklü değilse Live Server eklentisini kurun.

src/js/ui/aiAssistant.js dosyasını açıp

    //this.apiKey = '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'; // OpenRouter API anahtarı (DeepSeek)
    
    satırının altına aşağıdaki linkten edineceğiz API keyi üstteki gibi girin. 
    
    //this.apiKey = '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'; // OpenRouter API anahtarı (DeepSeek)
    this.apiKey = 'SİZİN_API_ANAHTARINIZ'; // OpenRouter API anahtarı

*Link: https://docs.google.com/document/d/1ANKJwP8dTDk-Tj2SzEPtDTnketL0bmTPhdOliluckwE/edit?usp=sharing

Sol taraftaki Dosya Gezgini'nden index.html dosyasına sağ tıklayın.

Açılan menüden "Open with Live Server" seçeneğine tıklayın.

Bu işlem, projenizi varsayılan web tarayıcınızda otomatik olarak açacak ve çalışır hale getirecektir.

Artık projeyi kullanmaya hazırsınız!

## 👥 Takım
| Ad Soyad         | Ekip Rolü                            |
|------------------|--------------------------------------|
| Metin Kocabıyık  | Project Manager & Frontend Developer |
| Faruk Kezer      | Backend Developer & Data Analyst     |


## 🌐 DEMO

INVEST@'yı aşağıdaki bağlantı üzerinden canlı olarak önizleyebilirsiniz:

### [Web Uygulaması](https://investa-demo-csb.vercel.app/)

 📬 İletişim & Geri Bildirim
    Daha fazla bilgi almak, değerli önerilerinizi ve fikirlerinizi bizimle paylaşmak için aşağıdaki e-posta adreslerine mesajınızı iletebilirsiniz. 
           
            👇
            
            ✉️ kocabiyik703@gmail.com

            
            ✉️ farukkezerr@gmail.com












