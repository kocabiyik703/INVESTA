// AI Asistan işlevselliği - Yatırım analizi için yapay zeka asistanı
class AIAssistant {
    constructor() {
        // DOM elementlerini başlat ve event listener'ları bağla
        this.initializeElements();
        this.bindEvents();
        
        // Veri türleri için boş map ve array oluştur
        this.veriTurleriMap = {}; // Grup bazında veri türleri
        this.allVeriTurleri = []; // Tüm veri türlerinin düz listesi
        
        // AI chatbox popup'ını başlangıçta kapalı yap
        this.aiChatboxPopup.classList.remove('show');
        // AI asistanının temel görev tanımı ve sistem kuralları
        this.systemRule = `Sen, kullanıcıların yatırım potansiyeli analizi yapmasına 
        yardımcı olan bir AI asistansın. Görevin, kullanıcı sana yatırım hikayesini 
        anlattığında, elindeki TÜİK verileri (veri türleri) arasından bu hikayeye en 
        uygun olanları belirlemek.
        Hafızanda olan veri türleri dinamik olarak yüklenecek.

        Bu veriler, il bazında mevcut ve her birinin benzersiz bir ID'si var. Kullanıcının girdiği senaryayo göre bunları optimum şekilde katsayılarla beraber kullanıcıya sun.
        Her bir uygun veri türü için:
        1. Neden bu veriyi kullanması gerektiğini açıkla.
        2. Yatırım hikayesine göre bu veriye 1'den 10'a kadar bir metrik puanı (önem derecesi) öner.
        
                    ÖNEMLİ FORMAT KURALI: Sadece aşağıdaki formatta cevap ver:
            **Veri Adı: [1-10 arası puan]**
            Açıklama
            
            Örnek format:
            **Nüfus Yoğunluğu: [8]**
            Yatırım potansiyeli için kritik faktör
            
            **Tarım Alanları: [6]**
            Tarımsal yatırımlar için önemli
        
        KURALLAR:
        1. Sadece yukarıdaki formatı kullan, başka hiçbir açıklama ekleme
        2. Her veri türü için 1-10 arası puan ver
        3. Açıklama kısa ve net olsun (maksimum 20 kelime)
        4. Birden fazla veri türü önerebilirsin
        5. Sadece tespit ettiğin veri isimlerini döndür
        6. Türkçe olarak cevap ver
        7. Format dışında hiçbir metin ekleme`;
    }

    // DOM elementlerini başlat - HTML'deki AI chatbox elementlerini bul ve referans al
    initializeElements() {
        // Chatbox elementleri
        this.chatInput = document.getElementById('chatInput'); // Chat input textarea
        this.chatSendBtn = document.getElementById('chatSendBtn'); // Chat gönder butonu
        this.chatMessages = document.getElementById('chatMessages'); // Chat mesajları container'ı
        this.refreshChatBtn = document.getElementById('refreshChatBtn'); // Yenile butonu
        this.closeChatBtn = document.getElementById('closeChatBtn'); // Kapat butonu
        
        // AI chat butonu ve popup
        this.aiChatBtn = document.getElementById('aiChatBtn'); // AI chat butonu
        this.aiChatboxPopup = document.getElementById('aiChatboxPopup'); // AI chatbox popup
        
        // Legacy elementler (geriye dönük uyumluluk için)
        this.promptInput = this.chatInput; // Eski referansları koru
        this.sendButton = this.chatSendBtn;
        // Legacy olayları kapatma bayrağı (yeni chat akışı kullanılıyor)
        this.enableLegacyEvents = false;
        
        //this.apiKey = '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'; // OpenRouter API anahtarı (DeepSeek)
        this.apiKey =  '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';
        // Chat geçmişi
        this.chatHistory = [];
    }

    // Event listener'ları bağla - Kullanıcı etkileşimlerini dinle
    bindEvents() {
        // AI Chat butonuna tıklama - Popup'ı aç/kapat
        this.aiChatBtn.addEventListener('click', () => {
            this.toggleChatPopup();
        });

        // Chat mesajı gönderme - Gönder butonuna tıklandığında
        this.chatSendBtn.addEventListener('click', () => {
            this.sendChatMessage();
        });

        // Enter tuşu ile gönderme - Enter tuşu ile (Shift+Enter yeni satır)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Input otomatik yükseklik ayarlama
        this.chatInput.addEventListener('input', () => {
            this.adjustTextareaHeight();
        });

        // Chat yenileme - Yenile butonuna tıklandığında
        this.refreshChatBtn.addEventListener('click', () => {
            this.refreshChat();
        });

        // Chat kapatma - Kapat butonuna tıklandığında
        this.closeChatBtn.addEventListener('click', () => {
            this.closeChatPopup();
        });

        // Chatbox dışına tıklandığında kapat
        document.addEventListener('click', (e) => {
            if (this.aiChatboxPopup.classList.contains('show') && 
                !this.aiChatboxPopup.contains(e.target) && 
                !this.aiChatBtn.contains(e.target)) {
                this.closeChatPopup();
            }
        });

        // ESC tuşu ile chatbox'ı kapat
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.aiChatboxPopup.classList.contains('show')) {
                this.closeChatPopup();
            }
        });

        // Legacy event listener'lar (geriye dönük uyumluluk için)
        if (this.enableLegacyEvents) {
            this.sendButton.addEventListener('click', () => {
                this.sendPrompt();
            });

            this.promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.sendPrompt();
                }
            });
        }
    }

    // Veri türlerini ayarla - Dışarıdan gelen veri türleri map'ini al ve işle
    setVeriTurleri(veriTurleriMap) {
        this.veriTurleriMap = veriTurleriMap; // Grup bazında veri türleri map'ini sakla
        this.allVeriTurleri = this.extractAllVeriTurleri(); // Tüm veri türlerini düz liste haline getir
        console.log('AI Asistan için veri türleri ayarlandı:', this.allVeriTurleri);
        
        // System rule'u güncelle - dinamik veri türleri listesi ile
        this.updateSystemRuleWithVeriTurleri();
    }

    // AI için veri türlerini ayarla - Veri adı + açıklama formatında
    setVeriTurleriForAI(veriTurleri) {
        // Sadece veri adlarını küçük harfe çevir (detectVeriTurleriInPrompt için)
        this.allVeriTurleri = veriTurleri.map(vt => vt.veri_adi.toLowerCase());
        console.log('AI Asistan için veri türleri ayarlandı (veri adı + açıklama formatı):', this.allVeriTurleri);
        
        // System rule'u güncelle - veri türleri + açıklamalar ile
        this.updateSystemRuleWithSimpleVeriTurleri(veriTurleri);
    }

    // System rule'u dinamik veri türleri ile güncelle
    updateSystemRuleWithVeriTurleri() {
        if (this.veriTurleriMap && Object.keys(this.veriTurleriMap).length > 0) {
            // Veri türlerini sadece ad ile listele
            let veriTurleriList = '';
            let count = 1;
            console.log('🔍 System rule güncelleniyor, veri türleri map:', this.veriTurleriMap);
            Object.values(this.veriTurleriMap).forEach(grupVeriTurleri => {
                if (grupVeriTurleri && Array.isArray(grupVeriTurleri)) {
                    console.log('📋 Grup veri türleri:', grupVeriTurleri);
                    grupVeriTurleri.forEach(veriTuru => {
                        if (veriTuru.veri_adi) {
                            console.log(`📝 Veri türü ${count}: ${veriTuru.veri_adi}`);
                            veriTurleriList += `- ${count}. ${veriTuru.veri_adi}\n`;
                            count++;
                        }
                    });
                }
            });
            console.log('📄 Oluşturulan veri türleri listesi:', veriTurleriList);
            
            this.systemRule = `Sen, kullanıcıların yatırım potansiyeli analizi yapmasına 
            yardımcı olan bir AI asistansın. Görevin, kullanıcı sana yatırım hikayesini 
            anlattığında, elindeki TÜİK verileri (veri türleri) arasından bu hikayeye en 
            uygun olanları belirlemek.
            
            KRİTİK KURAL: SADECE AŞAĞIDA LİSTELENEN VERİ TÜRLERİNİ KULLAN!
            Hafızanda olan veri türleri:
            
            ${veriTurleriList}

            Bu veriler, il bazında mevcut ve her birinin benzersiz bir ID'si var. Kullanıcının girdiği senaryoyo göre bunları optimum şekilde katsayılarla beraber kullanıcıya sun.
            
            ÖNEMLİ FORMAT KURALI: Sadece aşağıdaki formatta cevap ver:
            **Veri Adı: [1-10 arası puan]**
            Açıklama
            
            Örnek format:
            **Gübre Tüketimi: [8]**
            Tarımsal faaliyet yoğunluğunu gösterir
            
            **Güneşlenme Endeksi: [6]**
            Güneş enerjisi potansiyelini belirler
            
            KESIN KURALLAR:
            1. SADECE yukarıda listelenen veri türlerini kullan, başka hiçbir veri adı önerme
            2. Veri adlarını TAMAMEN AYNI şekilde yaz (büyük/küçük harf, noktalama dahil)
            3. Her veri türü için 1-10 arası puan ver
            4. Açıklama kısa ve net olsun (maksimum 20 kelime)
            5. Birden fazla veri türü önerebilirsin
            6. Sadece yukarıdaki listede olan veri isimlerini döndür
            7. Türkçe olarak cevap ver
            8. Format dışında hiçbir metin ekleme
            9. Eğer uygun veri türü bulamazsan "Uygun veri türü bulunamadı" yaz
            10. KESINLIKLE listede olmayan veri adları kullanma!`;
            
            console.log('✅ System rule dinamik veri türleri ile güncellendi');
        }
    }

    // System rule'u basit veri türleri listesi ile güncelle
    updateSystemRuleWithSimpleVeriTurleri(veriTurleri) {
        if (veriTurleri && veriTurleri.length > 0) {
            // Veri türlerini ad + açıklama ile listele
            let veriTurleriList = '';
            veriTurleri.forEach((veriTuru, index) => {
                const aciklama = veriTuru.senaryo_aciklamasi ? ` - ${veriTuru.senaryo_aciklamasi}` : '';
                veriTurleriList += `- ${index + 1}. ${veriTuru.veri_adi}${aciklama}\n`;
            });
            
            console.log('📄 Oluşturulan veri türleri + açıklamalar listesi:', veriTurleriList);
            
            this.systemRule = `Sen, kullanıcıların yatırım potansiyeli analizi yapmasına 
            yardımcı olan bir AI asistansın. Görevin, kullanıcı sana yatırım hikayesini 
            anlattığında, elindeki TÜİK verileri (veri türleri) arasından bu hikayeye en 
            uygun olanları belirlemek.
            
            KRİTİK KURAL: SADECE AŞAĞIDA LİSTELENEN VERİ TÜRLERİNİ KULLAN!
            Hafızanda olan veri türleri ve açıklamaları:
            
            ${veriTurleriList}

            Bu veriler, il bazında mevcut ve her birinin benzersiz bir ID'si var. Kullanıcının girdiği senaryoyo göre bunları optimum şekilde katsayılarla beraber kullanıcıya sun.
            
            ÖNEMLİ FORMAT KURALI: Sadece aşağıdaki formatta cevap ver:
            **Veri Adı: [1-10 arası puan]**
            Açıklama
            
            Örnek format:
            **Gübre Tüketimi: [8]**
            Tarımsal faaliyet yoğunluğunu gösterir
            
            **Güneşlenme Endeksi: [6]**
            Güneş enerjisi potansiyelini belirler
            
            KESIN KURALLAR:
            1. SADECE yukarıda listelenen veri türlerini kullan, başka hiçbir veri adı önerme
            2. Veri adlarını TAMAMEN AYNI şekilde yaz (büyük/küçük harf, noktalama dahil)
            3. Her veri türü için 1-10 arası puan ver
            4. Açıklama kısa ve net olsun (maksimum 20 kelime)
            5. Birden fazla veri türü önerebilirsin
            6. Sadece yukarıdaki listede olan veri isimlerini döndür
            7. Türkçe olarak cevap ver
            8. Format dışında hiçbir metin ekleme
            9. Eğer uygun veri türü bulamazsan "Uygun veri türü bulunamadı" yaz
            10. KESINLIKLE listede olmayan veri adları kullanma!`;
            
            console.log('✅ System rule basit veri türleri ile güncellendi');
        }
    }

    // Tüm veri türlerini düz bir liste haline getir - Grup yapısından çıkarıp tek liste yap
    extractAllVeriTurleri() {
        const allVeriTurleri = [];
        console.log('🔍 extractAllVeriTurleri başladı, veri türleri map:', this.veriTurleriMap);
        // Her grubun veri türlerini tek tek al
        Object.values(this.veriTurleriMap).forEach(grupVeriTurleri => {
            if (grupVeriTurleri && Array.isArray(grupVeriTurleri)) {
                grupVeriTurleri.forEach(veriTuru => {
                    if (veriTuru.veri_adi) {
                        console.log(`📝 Orijinal: "${veriTuru.veri_adi}" -> Küçük harf: "${veriTuru.veri_adi.toLowerCase()}"`);
                        allVeriTurleri.push(veriTuru.veri_adi.toLowerCase()); // Küçük harfe çevir
                    }
                });
            }
        });
        const uniqueVeriTurleri = [...new Set(allVeriTurleri)]; // Tekrarları kaldır
        console.log('📊 Tüm veri türleri (küçük harf):', uniqueVeriTurleri);
        return uniqueVeriTurleri;
    }

    // Kullanıcının prompt'unda hangi veri türlerini kullandığını tespit et - Akıllı metin analizi
    detectVeriTurleriInPrompt(prompt) {
        const promptLower = prompt.toLowerCase(); // Prompt'u küçük harfe çevir
        const detectedVeriTurleri = [];
        
        // 1. Tam eşleşme kontrolü - Prompt'ta tam olarak geçen veri türlerini bul
        this.allVeriTurleri.forEach(veriTuru => {
            if (promptLower.includes(veriTuru)) {
                detectedVeriTurleri.push(veriTuru);
            }
        });

        // 2. Kısmi kelime eşleşmesi kontrolü - Veri türü adındaki kelimeleri tek tek kontrol et
        this.allVeriTurleri.forEach(veriTuru => {
            const words = veriTuru.split(' '); // Veri türü adını kelimelere böl
            words.forEach(word => {
                if (word.length > 3 && promptLower.includes(word)) { // 3 karakterden uzun kelimeleri kontrol et
                    if (!detectedVeriTurleri.includes(veriTuru)) {
                        detectedVeriTurleri.push(veriTuru);
                    }
                }
            });
        });

        // 3. Benzer kelimeler için fuzzy matching - Levenshtein distance ile benzerlik hesapla
        this.allVeriTurleri.forEach(veriTuru => {
            if (!detectedVeriTurleri.includes(veriTuru)) {
                const similarity = this.calculateSimilarity(promptLower, veriTuru);
                if (similarity > 0.7) { // %70 benzerlik eşiği
                    detectedVeriTurleri.push(veriTuru);
                }
            }
        });

        // 4. Türkçe karakter varyasyonları - Ç, Ğ, I, Ö, Ş, Ü karakterlerini normalize et
        const turkishVariations = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
        };
        
        this.allVeriTurleri.forEach(veriTuru => {
            if (!detectedVeriTurleri.includes(veriTuru)) {
                let normalizedVeriTuru = veriTuru;
                // Türkçe karakterleri Latin karşılıklarıyla değiştir
                Object.entries(turkishVariations).forEach(([turkish, latin]) => {
                    normalizedVeriTuru = normalizedVeriTuru.replace(new RegExp(turkish, 'g'), latin);
                });
                
                if (promptLower.includes(normalizedVeriTuru)) {
                    detectedVeriTurleri.push(veriTuru);
                }
            }
        });

        return [...new Set(detectedVeriTurleri)]; // Tekrarları kaldır ve döndür
    }

    // İki string arasındaki benzerliği hesapla (Levenshtein distance tabanlı) - Fuzzy matching için
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2; // Uzun string'i belirle
        const shorter = str1.length > str2.length ? str2 : str1; // Kısa string'i belirle
        
        if (longer.length === 0) return 1.0; // Boş string durumu
        
        const distance = this.levenshteinDistance(longer, shorter); // Levenshtein mesafesini hesapla
        return (longer.length - distance) / longer.length; // Benzerlik oranını döndür (0-1 arası)
    }

    // Levenshtein distance hesaplama - İki string arasındaki minimum düzenleme mesafesi
    levenshteinDistance(str1, str2) {
        const matrix = []; // Dinamik programlama matrisi
        
        // İlk satırı başlat (0'dan str2.length'e kadar)
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        // İlk sütunu başlat (0'dan str1.length'e kadar)
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        // Matrisi doldur - Her karakter için minimum düzenleme sayısını hesapla
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    // Karakterler aynıysa, önceki değeri al
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    // Karakterler farklıysa, minimum düzenleme sayısını hesapla
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // Değiştirme
                        matrix[i][j - 1] + 1,     // Ekleme
                        matrix[i - 1][j] + 1      // Silme
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length]; // Son değeri döndür
    }

    // Veri türlerine özel system rule oluştur - Tespit edilen veri türlerine göre AI'ya özel talimat
    createVeriTurleriSpecificSystemRule(detectedVeriTurleri) {
        // Eğer tespit edilen veri türü yoksa, temel sistem kuralını döndür
        if (!Array.isArray(detectedVeriTurleri) || detectedVeriTurleri.length === 0) {
            return this.systemRule;
        }

        // Tespit edilen veri türlerini liste haline getir
        const veriTurleriList = detectedVeriTurleri.map(vt => `- ${vt}`).join('\n');
        
        // Temel sistem kuralına tespit edilen veri türlerini ekle
        return `${this.systemRule}

Kullanıcının prompt'unda aşağıdaki veri türleri tespit edildi:
${veriTurleriList}

Bu veri türlerini incele ve kullanıcı promptunda bahsettiği veri isimlerini listemizde varsa döndürelim ek bilgiye ihtiyaç yok. Birden fazla veri isimlerinden bahsedebilir..`;
    }

    // Tespit edilen veri türlerini kullanarak ağırlıklı ortalama hesapla - Ana hesaplama fonksiyonu
    async calculateWeightedAverageFromDetectedVeriTurleri(detectedVeriTurleri) {
        // Veri türü kontrolü
        if (!detectedVeriTurleri || detectedVeriTurleri.length === 0) {
            console.log('Tespit edilen veri türü yok, hesaplama yapılamıyor');
            return null;
        }

        console.log('Tespit edilen veri türlerinden ağırlıklı ortalama hesaplanıyor:', detectedVeriTurleri);

        try {
            // 1. Kullanıcının prompt'unu al
            const prompt = this.promptInput.value.trim();

            // 2. Yapay zekadan mantıklı katsayılar al (1-10 arası önem dereceleri)
            const dynamicKatsayilar = await this.generateDynamicKatsayilar(detectedVeriTurleri, prompt);
            if (!dynamicKatsayilar) {
                console.log('Yapay zekadan katsayı alınamadı, hesaplama yapılamıyor');
                return null;
            }

            // 3. Veri türü ID'lerini bul (veri türü adlarından ID'lere çevir)
            const veriTurleriIds = this.findVeriTurleriIds(detectedVeriTurleri);
            console.log('Bulunan veri türü ID\'leri:', veriTurleriIds);

            if (veriTurleriIds.length === 0) {
                console.log('Hiçbir veri türü ID\'si bulunamadı');
                return null;
            }

            // 4. Veri değerlerini çek (Supabase'den il bazında veri değerleri)
            const veriDegerleri = await this.fetchVeriDegerleriForVeriTurleri(veriTurleriIds);
            console.log('Çekilen veri değerleri:', veriDegerleri);

            if (!veriDegerleri || veriDegerleri.length === 0) {
                console.log('Veri değerleri çekilemedi');
                return null;
            }

            // 5. Ağırlıklı ortalama hesapla (katsayılar × veri değerleri)
            const agirlikliOrtalamalar = this.calculateAgirlikliOrtalamalar(veriDegerleri, veriTurleriIds, dynamicKatsayilar);
            console.log('Hesaplanan ağırlıklı ortalamalar:', agirlikliOrtalamalar);

            // 6. Haritayı güncelle (yeni hesaplanan değerlerle)
            this.updateMapWithNewData(agirlikliOrtalamalar);

            // Sonuçları döndür
            return {
                veriTurleriIds,
                dynamicKatsayilar,
                agirlikliOrtalamalar
            };

        } catch (error) {
            console.error('Ağırlıklı ortalama hesaplama hatası:', error);
            return null;
        }
    }

    // Yapay zekadan mantıklı katsayılar al - AI'dan 1-10 arası önem dereceleri iste
    async generateDynamicKatsayilar(detectedVeriTurleri, prompt) {
        try {
            // Veri türü kontrolü
            if (!Array.isArray(detectedVeriTurleri) || detectedVeriTurleri.length === 0) {
                console.error('detectedVeriTurleri geçersiz veya boş:', detectedVeriTurleri);
                return;
            }

            // AI'ya gönderilecek sistem kuralı - Katsayı önerisi için
            const systemRule = `
            Sen bir yapay zeka asistansın. Kullanıcının yatırım hikayesine göre, aşağıdaki veri türleri için 1-10 arasında mantıklı katsayılar öner:
            Veri türleri: ${detectedVeriTurleri.join(', ')}

            Her bir veri türü için:
            1. Katsayıyı (önem derecesi) 1-10 arasında bir sayı olarak belirt.
            2. Neden bu katsayıyı önerdiğini kısaca açıkla.

            Cevabını şu formatta döndür:
            Veri Türü: [katsayı] - Açıklama
            `;
            
            // OpenRouter API'ye katsayı önerisi için istek gönder
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`, // API anahtarı
                    'HTTP-Referer': window.location.origin, // Referer bilgisi
                    'X-Title': 'LEAFLET - Investment Analysis Platform', // Uygulama adı
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash', // Kullanılacak AI modeli
                    messages: [
                        {
                            role: 'system',
                            content: systemRule // Sistem kuralı
                        },
                        {
                            role: 'user',
                            content: `Kullanıcının hikayesi: ${prompt}` // Kullanıcı prompt'u
                        }
                    ],
                    max_tokens: 1000, // Maksimum token sayısı
                    temperature: 0.7 // Yaratıcılık seviyesi
                })
            });

            // API yanıtını kontrol et
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Katsayı API isteği başarısız oldu:', errorData.error?.message);
                return null;
            }

            // API yanıtını parse et
            const data = await response.json();
            const katsayiResponse = data.choices[0].message.content;

            console.log('Yapay zekadan gelen yanıt:', katsayiResponse);

            // AI'dan gelen yanıttan katsayıları parse et (regex ile)
            const katsayilar = [];
            detectedVeriTurleri.forEach(veriTuru => {
                const regex = new RegExp(`${veriTuru}: \\[(\\d+)\\]`, 'i'); // "Veri Türü: [5]" formatını yakala
                const match = katsayiResponse.match(regex);
                if (match) {
                    let katsayi = parseInt(match[1], 10);
                    // Katsayıyı 1-10 arasında sınırla
                    katsayi = Math.max(1, Math.min(10, katsayi));
                    katsayilar.push(katsayi);
                } else {
                    console.warn(`"${veriTuru}" için yapay zekadan katsayı alınamadı, varsayılan değer atanıyor.`);
                    katsayilar.push(5); // Varsayılan değer (orta önem)
                }
            });

            console.log('Yapay zekadan alınan katsayılar:', katsayilar);
            return katsayilar;

        } catch (error) {
            console.error('Katsayı oluşturma hatası:', error);
            return null;
        }
    }

    // Veri türü adlarından ID'leri bul - Veri türü adlarını veritabanı ID'lerine çevir
    findVeriTurleriIds(detectedVeriTurleri) {
        const veriTurleriIds = [];
        
        // Her grubun veri türlerini kontrol et
        Object.entries(this.veriTurleriMap).forEach(([grupId, grupVeriTurleri]) => {
            if (grupVeriTurleri && Array.isArray(grupVeriTurleri)) {
                grupVeriTurleri.forEach(veriTuru => {
                    // Tespit edilen veri türü adı ile eşleşen ID'yi bul
                    if (veriTuru.veri_adi && detectedVeriTurleri.includes(veriTuru.veri_adi.toLowerCase())) {
                        veriTurleriIds.push(veriTuru.veri_id); // ID'yi listeye ekle
                    }
                });
            }
        });

        return veriTurleriIds; // Bulunan ID'leri döndür
    }

    // Veri türleri için veri değerlerini çek - Supabase'den il bazında veri değerlerini al
    async fetchVeriDegerleriForVeriTurleri(veriTurleriIds) {
        try {
            // Supabase client'ını import et
            const { getSupabaseClient, isSupabaseConnected } = await import('../supabase/client.js');
            
            // Supabase bağlantısını kontrol et
            if (!isSupabaseConnected()) {
                console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
                return null;
            }
            
            const supabaseClient = getSupabaseClient();
            
            // Veri türü ID'lerine göre veri değerlerini çek
            const { data: veriDegerleriData, error: veriDegerleriError } = await supabaseClient
                .from('veriler') // 'veriler' tablosundan
                .select('deger, veri_id, il_id') // Bu sütunları seç
                .in('veri_id', veriTurleriIds); // Belirtilen veri türü ID'lerine göre filtrele
            
            // Hata kontrolü
            if (veriDegerleriError) {
                console.error('Veri değerleri çekme hatası:', veriDegerleriError.message);
                return null;
            }

            return veriDegerleriData; // Çekilen veri değerlerini döndür
            
        } catch (error) {
            console.error('Veri değerleri çekme hatası:', error);
            return null;
        }
    }

    // Random katsayılar oluştur (1-10 arası) - Test amaçlı rastgele katsayılar
    generateRandomKatsayilar(count) {
        const katsayilar = [];
        for (let i = 0; i < count; i++) {
            katsayilar.push(Math.floor(Math.random() * 10) + 1); // 1-10 arası rastgele sayı
        }
        return katsayilar;
    }

    // Ağırlıklı ortalamaları hesapla - İl bazında yatırım potansiyeli skorları
    calculateAgirlikliOrtalamalar(veriDegerleri, veriTurleriIds, katsayilar) {
        const ilVerileri = {}; // Her il için veri toplamları
        
        // Her il için veri toplamlarını hesapla
        veriDegerleri.forEach(veri => {
            const ilId = veri.il_id; // İl ID'si
            const veriId = veri.veri_id; // Veri türü ID'si
            const deger = parseFloat(veri.deger) || 0; // Veri değeri (sayısal)
            
            // İl için veri yapısını oluştur
            if (!ilVerileri[ilId]) {
                ilVerileri[ilId] = {
                    toplamHesaplanmisDeger: 0, // Toplam (değer × katsayı)
                    toplamKullaniciOncelik: 0, // Toplam katsayı
                    veriSayisi: 0 // Veri sayısı
                };
            }
            
            // Veri türü ID'sinin index'ini bul (katsayı ile eşleştirmek için)
            const veriTuruIndex = veriTurleriIds.indexOf(veriId);
            if (veriTuruIndex !== -1) {
                const katsayi = katsayilar[veriTuruIndex]; // Bu veri türü için katsayı
                ilVerileri[ilId].toplamHesaplanmisDeger += deger * katsayi; // Değer × katsayı
                ilVerileri[ilId].toplamKullaniciOncelik += katsayi; // Toplam katsayı
                ilVerileri[ilId].veriSayisi++; // Veri sayısını artır
            }
        });
        
        // Ağırlıklı ortalamaları hesapla (formül: toplam_hesaplanmış_değer / toplam_katsayı)
        const agirlikliOrtalamalar = {};
        Object.entries(ilVerileri).forEach(([ilId, ilVerisi]) => {
            if (ilVerisi.toplamKullaniciOncelik > 0) {
                agirlikliOrtalamalar[ilId] = {
                    agirlikliOrtalama: (ilVerisi.toplamHesaplanmisDeger / ilVerisi.toplamKullaniciOncelik ) * 100, // Yüzde olarak
                    toplamHesaplanmisDeger: ilVerisi.toplamHesaplanmisDeger,
                    toplamKullaniciOncelik: ilVerisi.toplamKullaniciOncelik,
                    veriSayisi: ilVerisi.veriSayisi
                };
            }
        });
        
        return agirlikliOrtalamalar; // İl bazında ağırlıklı ortalamalar
    }

    // Haritayı yeni verilerle güncelle - Hesaplanan skorları haritada göster
    async updateMapWithNewData(agirlikliOrtalamalar) {
        try {
            // mapManager'dan updateIlAgirlikliOrtalamalari fonksiyonunu çağır
            const { updateIlAgirlikliOrtalamalari } = await import('../map/mapManager.js');
            
            if (typeof updateIlAgirlikliOrtalamalari === 'function') {
                updateIlAgirlikliOrtalamalari(agirlikliOrtalamalar); // Haritayı güncelle
                console.log('Harita yeni verilerle güncellendi');
            } else {
                console.log('updateIlAgirlikliOrtalamalari fonksiyonu bulunamadı');
            }
        } catch (error) {
            console.error('Harita güncelleme hatası:', error);
        }
    }

    // Hesaplama sonuçlarını UI'da göster - Kullanıcıya hesaplama detaylarını göster
    displayCalculationResults(hesaplamaSonuclari) {
        const { veriTurleriIds, dynamicKatsayilar, agirlikliOrtalamalar } = hesaplamaSonuclari;

        // Veri ve katsayıları eşleştir - Hangi veri türüne hangi katsayının atandığını göster
        let veriKatsayiListesi = '';
        if (Array.isArray(veriTurleriIds) && Array.isArray(dynamicKatsayilar) && veriTurleriIds.length === dynamicKatsayilar.length) {
            veriKatsayiListesi = veriTurleriIds.map((id, index) => `Veri ID ${id}: ${dynamicKatsayilar[index]}`).join('<br>');
        } else {
            veriKatsayiListesi = 'Veri ve katsayı eşlemesi yapılamadı.';
        }

        // Hesaplama sonuçları için HTML oluştur
        const calculationResultsHTML = `
<div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-top: 15px; border-radius: 4px;">
<strong>🧮 Otomatik Hesaplama Sonuçları:</strong><br><br>
<strong>Kullanılan Veri Türleri ve Katsayılar:</strong><br>
${veriKatsayiListesi}<br><br>
<strong>Hesaplanan İl Sayısı:</strong> ${Object.keys(agirlikliOrtalamalar).length}<br><br>
<strong>✅ Harita otomatik olarak güncellendi!</strong><br>
<em>Haritada yeni renk skalası ile sonuçları görebilirsiniz.</em>
</div>`;

        // Yeni chatbox yapısında hesaplama sonuçlarını chat'e ekle
        this.addMessageToChat('ai', calculationResultsHTML);

        // Legacy response section için de ekle (geriye dönük uyumluluk)
        if (this.responseContent) {
            this.responseContent.innerHTML += calculationResultsHTML;
            // Scroll'u en alta getir - Yeni eklenen içeriği göster
            this.responseContent.scrollTop = this.responseContent.scrollHeight;
        }
    }

    // AI asistan bölümünü aç/kapat - Toggle fonksiyonu
    toggleSection() {
        const isCollapsed = this.aiContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Bölümü aç - collapsed sınıfını kaldır ve içeriği göster
            this.aiContent.classList.remove('collapsed');
            this.aiHeader.classList.remove('collapsed');
            this.aiContent.style.display = 'block';
        } else {
            // Bölümü kapat - collapsed sınıfını ekle ve içeriği gizle
            this.aiContent.classList.add('collapsed');
            this.aiHeader.classList.add('collapsed');
        }
        
        // Toggle ikonunu güncelle (▼ açık, ▶ kapalı)
        const icon = this.aiHeader.querySelector('.main-toggle-icon');
        icon.textContent = isCollapsed ? '▼' : '▶';
    }

    // Ana prompt gönderme fonksiyonu - Kullanıcı sorusunu işle ve AI'dan cevap al
    async sendPrompt() {
        const prompt = this.promptInput.value.trim();

        // Boş prompt kontrolü
        if (!prompt) {
            alert('Lütfen bir soru yazın.');
            return;
        }

        // Kullanıcı mesajını chatbox'a ekle
        this.addMessageToChat('user', prompt);

        // UI'ı güncelle - Loading durumunu göster
        this.setLoadingState(true);
        this.showResponseSection();

        // Typing indicator göster
        this.showTypingIndicator();

        try {
            // 1. Veri türlerini tespit et - Prompt'ta hangi veri türlerinin geçtiğini bul
            const detectedVeriTurleri = this.detectVeriTurleriInPrompt(prompt);
            console.log('Tespit edilen veri türleri:', detectedVeriTurleri);

            // 2. Veri türlerine özel system rule oluştur - AI'ya özel talimatlar
            const specificSystemRule = this.createVeriTurleriSpecificSystemRule(detectedVeriTurleri);

            // 3. AI'dan cevap al
            const response = await this.callOpenAI(prompt, this.apiKey, specificSystemRule, detectedVeriTurleri);
            
            // Typing indicator'ı kaldır
            this.hideTypingIndicator();
            
            // Konsola da yazdır
            console.log('AI cevabı (sendPrompt):', response);

            this.displayResponse(response, detectedVeriTurleri);

            // 4. Eğer veri türleri tespit edildiyse, otomatik hesaplama yap
            if (detectedVeriTurleri && detectedVeriTurleri.length > 0) {
                console.log('Veri türleri tespit edildi, otomatik hesaplama başlatılıyor...');
                
                // Hesaplama sonuçlarını al - Ağırlıklı ortalama hesapla
                const hesaplamaSonuclari = await this.calculateWeightedAverageFromDetectedVeriTurleri(detectedVeriTurleri);
                
                if (hesaplamaSonuclari) {
                    // Hesaplama sonuçlarını UI'da göster
                    this.displayCalculationResults(hesaplamaSonuclari);
                }
            }
        } catch (error) {
            console.error('OpenAI API Hatası:', error);
            this.hideTypingIndicator();
            this.displayError(error.message);
        } finally {
            // Loading durumunu kapat
            this.setLoadingState(false);
        }
    }

    // OpenRouter API'ye istek gönder - AI'dan cevap al
    async callOpenAI(prompt, apiKey, systemRule, detectedVeriTurleri) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`, // API anahtarı
                'HTTP-Referer': window.location.origin, // Referer bilgisi
                'X-Title': 'LEAFLET - Investment Analysis Platform', // Uygulama adı
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash', // Kullanılacak AI modeli
                messages: [
                    {
                        role: 'system',
                        content: systemRule // Sistem kuralı (AI'ya talimatlar)
                    },
                    {
                        role: 'user',
                        content: prompt // Kullanıcı sorusu
                    }
                ],
                max_tokens: 1000, // Maksimum token sayısı
                temperature: 0.7 // Yaratıcılık seviyesi
            })
        });

        // API yanıtını kontrol et
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API isteği başarısız oldu');
        }

        // API yanıtını parse et ve cevabı döndür
        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Loading durumunu ayarla - Buton durumunu ve metnini güncelle
    setLoadingState(isLoading) {
        this.sendButton.disabled = isLoading; // Butonu devre dışı bırak/aktif et
        this.sendButton.innerHTML = isLoading 
            ? '<span class="ai-loading">İşleniyor...</span>' // Loading metni
            : '<span class="btn-icon">🤖</span><span class="btn-text">Gönder</span>'; // Normal metin
    }

    // Cevap bölümünü göster - Loading mesajı ile
    showResponseSection() {
        this.responseSection.style.display = 'block'; // Cevap bölümünü göster
        this.responseContent.innerHTML = '<div class="ai-loading">AI cevabı hazırlanıyor...</div>'; // Loading mesajı
    }

    // AI cevabını göster - Tespit edilen veri türlerini vurgula
    displayResponse(response, detectedVeriTurleri) {
        let responseHTML = response;
        
        // Eğer veri türleri tespit edildiyse, bunları vurgula
        if (Array.isArray(detectedVeriTurleri) && detectedVeriTurleri.length > 0) {
            const veriTurleriInfo = `
<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
<strong>🔍 Tespit Edilen Veri Türleri:</strong><br>
${detectedVeriTurleri.map(vt => `• ${vt}`).join('<br>')}
</div>`;
            responseHTML = veriTurleriInfo + response; // Veri türleri bilgisini cevabın başına ekle
        }
        
        // Yeni chatbox yapısında mesajı chat'e ekle
        this.addMessageToChat('ai', responseHTML);
        
        // Legacy response section için de ekle (geriye dönük uyumluluk)
        if (this.responseContent) {
            this.responseContent.innerHTML = responseHTML; // Cevabı göster
            this.responseContent.scrollTop = 0; // Scroll'u en üste getir
        }
    }

    // Hata mesajını göster
    displayError(errorMessage) {
        // Yeni chatbox yapısında hata mesajını chat'e ekle
        this.addMessageToChat('ai', `❌ Hata: ${errorMessage}`);
        
        // Legacy response section için de ekle (geriye dönük uyumluluk)
        if (this.responseContent) {
            this.responseContent.innerHTML = `<div style="color: #dc3545; font-weight: 600;">Hata: ${errorMessage}</div>`;
        }
    }

    // Cevabı temizle - Tüm içeriği sıfırla
    clearResponse() {
        this.responseSection.style.display = 'none'; // Cevap bölümünü gizle
        this.responseContent.innerHTML = ''; // İçeriği temizle
        this.promptInput.value = ''; // Input'u temizle
        this.promptInput.focus(); // Input'a odaklan
    }

    // Chat mesajı gönder - Yeni chatbox fonksiyonu
    async sendChatMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) {
            return;
        }

        // Kullanıcı mesajını chat'e ekle
        this.addMessageToChat('user', message);
        
        // Input'u temizle
        this.chatInput.value = '';
        this.adjustTextareaHeight();
        
        // Loading göstergesi ekle
        this.showTypingIndicator();
        
        try {
            // AI'dan cevap al
            const response = await this.getAIResponse(message);
            
            // Typing indicator'ı kaldır
            this.hideTypingIndicator();
            
            // Konsola da yazdır
            console.log('AI cevabı (sendChatMessage):', response);

            // AI cevabını chat'e ekle
            this.addMessageToChat('ai', response);
            
            // Chat geçmişine ekle
            this.chatHistory.push({ role: 'user', content: message });
            this.chatHistory.push({ role: 'assistant', content: response });
            
        } catch (error) {
            console.error('Chat mesajı gönderme hatası:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('ai', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    // Chat'e mesaj ekle - Mesaj bubble'ı oluştur ve ekle
    addMessageToChat(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const currentTime = new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const bubbleClass = sender === 'ai' ? 'ai' : 'user';
        const timeClass = sender === 'ai' ? 'ai' : '';
        
        // AI mesajları için markdown'ı HTML'e çevir
        let processedContent = content;
        if (sender === 'ai' && typeof marked !== 'undefined') {
            try {
                processedContent = marked.parse(content);
            } catch (error) {
                console.warn('Markdown parse hatası:', error);
                // Hata durumunda orijinal içeriği kullan
                processedContent = content;
            }
        }
        
        // AI mesajları için butonlar ekle
        let actionButtons = '';
        if (sender === 'ai') {
            // Content'i güvenli şekilde encode et
            const encodedContent = encodeURIComponent(content);
            actionButtons = `
                <div class="ai-action-buttons">
                    <button class="accept-btn" onclick="aiAssistant.acceptAIResponse(decodeURIComponent('${encodedContent}'))">
                        ✅ Kabul Et
                    </button>
                    <button class="reject-btn" onclick="aiAssistant.rejectAIResponse()">
                        ❌ Reddet
                    </button>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble ${bubbleClass}">${processedContent}</div>
                ${actionButtons}
                <div class="message-time ${timeClass}">${currentTime}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    // Typing indicator göster - AI yazıyor göstergesi
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    // Typing indicator gizle - AI yazıyor göstergesini kaldır
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // AI'dan cevap al - Chat geçmişi ile birlikte
    async getAIResponse(message) {
        // Veri türlerini tespit et
        const detectedVeriTurleri = this.detectVeriTurleriInPrompt(message);
        
        // System rule oluştur
        const specificSystemRule = this.createVeriTurleriSpecificSystemRule(detectedVeriTurleri);
        
        // Chat geçmişini hazırla
        const messages = [
            { role: 'system', content: specificSystemRule }
        ];
        
        // Son 10 mesajı ekle (çok uzun olmaması için)
        const recentHistory = this.chatHistory.slice(-10);
        messages.push(...recentHistory);
        messages.push({ role: 'user', content: message });
        
        // API'ye istek gönder
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'LEAFLET - Investment Analysis Platform',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        console.log('responseeeeee', response);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API isteği başarısız oldu');
        }

        const data = await response.json();
        console.log('dataaaaaaa', data.choices[0].message.content);
        return data.choices[0].message.content;
    }

    // Textarea yüksekliğini otomatik ayarla
    adjustTextareaHeight() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    // Chat'i en alta kaydır
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Chat'i yenile - Tüm mesajları temizle
    refreshChat() {
        // Hoş geldin mesajı dışındaki tüm mesajları kaldır
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach((message, index) => {
            if (index > 0) { // İlk mesaj (hoş geldin) hariç
                message.remove();
            }
        });
        
        // Chat geçmişini temizle
        this.chatHistory = [];
        
        // Input'u temizle
        this.chatInput.value = '';
        this.adjustTextareaHeight();
    }

    // Chat popup'ını aç/kapat
    toggleChatPopup() {
        if (this.aiChatboxPopup.classList.contains('show')) {
            this.closeChatPopup();
        } else {
            this.openChatPopup();
        }
    }

    // Chat popup'ını aç
    openChatPopup() {
        this.aiChatboxPopup.classList.add('show');
        this.aiChatBtn.classList.add('hidden'); // İkonu gizle
        this.chatInput.focus();
    }

    // Chat popup'ını kapat
    closeChatPopup() {
        this.aiChatboxPopup.classList.remove('show');
        this.aiChatBtn.classList.remove('hidden'); // İkonu göster
    }

    // Chat'i kapat - AI asistan bölümünü kapat (legacy)
    closeChat() {
        this.closeChatPopup();
    }

    // HTML escape fonksiyonu - Güvenlik için
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // AI cevabını parse et - Veri türleri ve metrik değerlerini çıkar
    parseAIResponse(aiResponse) {
        console.log('🔍 PARSE BAŞLADI - AI Cevabı:', aiResponse);
        
        const parsedData = [];
        const lines = aiResponse.split('\n');
        
        console.log('📝 Satırlara bölündü:', lines);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            console.log(`📄 Satır ${i + 1}: "${line}"`);
            
            // Format: "**Veri Adı: [puan]**" veya "Veri Adı: [puan] - Açıklama"
            let match = line.match(/^\*\*(.+?):\s*\[(\d+)\]\*\*$/);
            if (!match) {
                // Eski format için fallback
                match = line.match(/^(.+?):\s*\[(\d+)\]\s*-\s*(.+)$/);
            }
            
            if (match) {
                const veriAdi = match[1].trim();
                const puan = parseInt(match[2], 10);
                let aciklama = '';
                
                // Yeni format için açıklama bir sonraki satırda olabilir
                if (match[3]) {
                    aciklama = match[3].trim();
                } else {
                    // Yeni format için bir sonraki satırı kontrol et
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine && !nextLine.startsWith('**') && !nextLine.includes('[')) {
                            aciklama = nextLine;
                            i++; // Bir sonraki satırı atla
                        }
                    }
                }
                
                console.log(`✅ EŞLEŞME BULUNDU:`);
                console.log(`   - Veri Adı: "${veriAdi}"`);
                console.log(`   - Puan: ${puan}`);
                console.log(`   - Açıklama: "${aciklama}"`);
                
                parsedData.push({
                    veriAdi: veriAdi,
                    puan: puan,
                    aciklama: aciklama
                });
            } else {
                console.log(`❌ EŞLEŞME BULUNAMADI - Satır: "${line}"`);
            }
        }
        
        console.log('🎯 PARSE SONUCU:', parsedData);
        console.log(`📊 Toplam ${parsedData.length} veri türü parse edildi`);
        
        return parsedData;
    }

    // AI cevabını kabul et - Senaryo bölümünü doldur ve hesaplama başlat
    async acceptAIResponse(aiResponse) {
        try {
            console.log('🚀 KABUL ET BUTONU TIKLANDI');
            console.log('📨 AI Cevabı:', aiResponse);
            
            // Butonları disable et
            this.disableActionButtons();
            
            // AI cevabını parse et
            console.log('🔄 Parse işlemi başlatılıyor...');
            const parsedData = this.parseAIResponse(aiResponse);
            
            if (parsedData.length === 0) {
                console.log('❌ Parse sonucu boş - Toast gösteriliyor');
                this.showToast('AI cevabında geçerli veri türü bulunamadı.', 'error');
                this.enableActionButtons();
                return;
            }

            console.log('✅ Parse başarılı, senaryo doldurma başlatılıyor...');
            // Senaryo bölümünü otomatik doldur
            await this.autoFillScenarioSection(parsedData);
            
            console.log('✅ Senaryo doldurma tamamlandı, hesaplama başlatılıyor...');
            // Hesaplama işlemini başlat
            await this.triggerCalculation(parsedData);
            
            console.log('✅ Tüm işlemler tamamlandı, toast mesajı gösteriliyor');
            // Başarı toast mesajı göster
            this.showToast('✅ AI önerileri kabul edildi ve hesaplama başlatıldı!', 'success');
            
        } catch (error) {
            console.error('💥 AI cevabı kabul etme hatası:', error);
            this.showToast('❌ Hata: AI cevabı işlenirken bir sorun oluştu.', 'error');
            this.enableActionButtons();
        }
    }

    // AI cevabını reddet
    rejectAIResponse() {
        console.log('🚫 REDDET BUTONU TIKLANDI');
        
        // Butonları disable et
        this.disableActionButtons();
        
        // Toast mesajı göster
        this.showToast('❌ AI önerileri reddedildi. Yeni bir soru sorabilirsiniz.', 'info');
    }

    // Senaryo bölümünü otomatik doldur
    async autoFillScenarioSection(parsedData) {
        try {
            console.log('🏗️ SENARYO BÖLÜMÜ DOLDURMA BAŞLADI');
            console.log('📊 Parse edilen veri:', parsedData);
            
            // Senaryo bölümünü bul ve aç - Doğru selector'ları kullan
            const scenarioSection = document.querySelector('.main-section');
            const scenarioContent = document.getElementById('main-section-content');
            console.log('🔍 Senaryo bölümü aranıyor...');
            console.log('🔍 .main-section:', scenarioSection);
            console.log('🔍 #main-section-content:', scenarioContent);
            
            if (!scenarioSection || !scenarioContent) {
                console.warn('❌ Senaryo bölümü bulunamadı');
                return;
            }
            
            console.log('✅ Senaryo bölümü bulundu:', scenarioSection);

            // Senaryo bölümünü aç (collapsed değilse)
            if (scenarioContent.classList.contains('collapsed')) {
                console.log('📂 Senaryo bölümü kapalı, açılıyor...');
                const toggleBtn = scenarioSection.querySelector('.main-section-header');
                if (toggleBtn) {
                    toggleBtn.click();
                    console.log('✅ Senaryo bölümü açıldı');
                } else {
                    console.warn('❌ Toggle butonu bulunamadı');
                }
            } else {
                console.log('✅ Senaryo bölümü zaten açık');
            }

            // Önce mevcut seçimleri temizle
            console.log('🧹 Mevcut seçimler temizleniyor...');
            const allCheckboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
            let clearedCount = 0;
            
            allCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    checkbox.checked = false;
                    clearedCount++;
                    
                    // Checkbox item'dan selected class'ını kaldır
                    const checkboxItem = checkbox.closest('.checkbox-item');
                    if (checkboxItem) {
                        checkboxItem.classList.remove('selected');
                    }
                    
                    // Priority input'u sıfırla
                    const priorityInput = checkbox.closest('.checkbox-item').querySelector('.priority-input');
                    if (priorityInput) {
                        priorityInput.value = '0';
                    }
                }
            });
            
            console.log(`✅ ${clearedCount} seçim temizlendi`);

            // Veri türlerini işaretle ve metrik değerlerini doldur
            console.log('🔍 Checkbox\'lar aranıyor...');
            const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
            console.log(`📋 Toplam ${checkboxes.length} checkbox bulundu`);
            
            // Tüm checkbox'ları listele
            checkboxes.forEach((checkbox, index) => {
                console.log(`   📝 Checkbox ${index + 1}: value="${checkbox.value}", id="${checkbox.id}"`);
            });
            
            for (let i = 0; i < parsedData.length; i++) {
                const data = parsedData[i];
                console.log(`\n🎯 Veri ${i + 1}/${parsedData.length} işleniyor:`, data);
                
                // Veri türü checkbox'ını bul ve işaretle
                const veriAdi = data.veriAdi.toLowerCase();
                console.log(`🔍 Aranan veri adı: "${veriAdi}"`);
                
                let found = false;
                for (let j = 0; j < checkboxes.length; j++) {
                    const checkbox = checkboxes[j];
                    const checkboxValue = checkbox.value.toLowerCase();
                    console.log(`   📝 Checkbox ${j + 1} kontrol ediliyor: value="${checkboxValue}"`);
                    
                    if (checkboxValue.includes(veriAdi) || veriAdi.includes(checkboxValue)) {
                        console.log(`   ✅ EŞLEŞME BULUNDU!`);
                        checkbox.checked = true;
                        console.log(`   ✅ Checkbox işaretlendi`);
                        
                        // Metrik değerini doldur
                        const metricInput = checkbox.closest('.checkbox-item').querySelector('.priority-input');
                        if (metricInput) {
                            metricInput.value = data.puan;
                            console.log(`   ✅ Metrik değeri dolduruldu: ${data.puan}`);
                        } else {
                            console.warn(`   ❌ Metrik input bulunamadı`);
                        }
                        
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    console.warn(`❌ "${data.veriAdi}" için eşleşen checkbox bulunamadı`);
                }
            }

            // Kısa bir bekleme süresi ekle (UI güncellemesi için)
            console.log('⏳ UI güncellemesi için 500ms bekleniyor...');
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✅ Senaryo doldurma tamamlandı');
            
        } catch (error) {
            console.error('💥 Senaryo bölümü doldurma hatası:', error);
        }
    }

    // Hesaplama işlemini başlat
    async triggerCalculation(parsedData) {
        try {
            console.log('🧮 HESAPLAMA BAŞLATMA BAŞLADI');
            console.log('📊 Parse edilen veri:', parsedData);
            
            // Uygula butonunu bul ve tıkla
            console.log('🔍 Uygula butonu aranıyor...');
            const applyBtn = document.querySelector('#applyScenarioBtn');
            
            if (applyBtn) {
                console.log('✅ Uygula butonu bulundu:', applyBtn);
                console.log('🖱️ Uygula butonu tıklanıyor...');
                applyBtn.click();
                console.log('✅ Uygula butonu tıklandı');
            } else {
                console.warn('❌ Uygula butonu bulunamadı (#applyScenarioBtn)');
                
                // Alternatif buton arama
                console.log('🔍 Alternatif butonlar aranıyor...');
                const altButtons = document.querySelectorAll('button');
                console.log(`📋 Toplam ${altButtons.length} buton bulundu`);
                
                for (let i = 0; i < altButtons.length; i++) {
                    const btn = altButtons[i];
                    const btnText = btn.textContent.toLowerCase();
                    console.log(`   📝 Buton ${i + 1}: "${btnText}"`);
                    
                    if (btnText.includes('uygula') || btnText.includes('hesapla') || btnText.includes('apply')) {
                        console.log(`   ✅ UYGULA BUTONU BULUNDU!`);
                        console.log('🖱️ Alternatif uygula butonu tıklanıyor...');
                        btn.click();
                        console.log('✅ Alternatif uygula butonu tıklandı');
                        return;
                    }
                }
                
                console.warn('❌ Hiçbir uygula butonu bulunamadı');
            }
        } catch (error) {
            console.error('💥 Hesaplama başlatma hatası:', error);
        }
    }

    // Toast mesajı göster
    showToast(message, type = 'info') {
        // Mevcut toast'ları temizle
        const existingToasts = document.querySelectorAll('.ai-toast');
        existingToasts.forEach(toast => toast.remove());

        // Toast container'ı oluştur
        const toastContainer = document.createElement('div');
        toastContainer.className = 'ai-toast-container';
        
        // Toast mesajı oluştur
        const toast = document.createElement('div');
        toast.className = `ai-toast ai-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        // 3 saniye sonra otomatik kaldır
        setTimeout(() => {
            if (toastContainer.parentElement) {
                toastContainer.remove();
            }
        }, 3000);
        
        console.log(`🍞 Toast mesajı gösterildi: ${message} (${type})`);
    }

    // Action butonlarını disable et
    disableActionButtons() {
        const actionButtons = document.querySelectorAll('.ai-action-buttons button');
        actionButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        });
        console.log('🔒 Action butonları disable edildi');
    }

    // Action butonlarını enable et
    enableActionButtons() {
        const actionButtons = document.querySelectorAll('.ai-action-buttons button');
        actionButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
        });
        console.log('🔓 Action butonları enable edildi');
    }

    // Veri türlerini database'den yükle
    async loadVeriTurleriFromDatabase() {
        try {
            console.log('🔄 AI Asistan için veri türleri database\'den yükleniyor...');
            
            // Yeni aiVeriTurleri.js dosyasından veri türlerini çek
            const { fetchAllVeriTurleriForAI } = await import('../supabase/aiVeriTurleri.js');
            
            // Tüm veri türlerini çek
            const veriTurleri = await fetchAllVeriTurleriForAI();
            
            if (veriTurleri.length === 0) {
                console.warn('❌ Hiç veri türü çekilemedi');
                return;
            }
            
            // AI Assistant'a veri türlerini ayarla (veri adı + açıklama formatında)
            this.setVeriTurleriForAI(veriTurleri);
            
            console.log('✅ AI Asistan için tüm veri türleri başarıyla yüklendi');
            
        } catch (error) {
            console.error('💥 Veri türleri yükleme hatası:', error);
        }
    }


}

// AI Asistan'ı başlat - Dışarıdan çağrılacak ana fonksiyon
export async function initializeAIAssistant() {
    const aiAssistant = new AIAssistant(); // Yeni AI Assistant instance'ı oluştur
    window.aiAssistant = aiAssistant; // Global erişim için window objesine ekle
    
    // Veri türlerini otomatik yükle
    await aiAssistant.loadVeriTurleriFromDatabase();
    
    return aiAssistant; // Instance'ı döndür
}


