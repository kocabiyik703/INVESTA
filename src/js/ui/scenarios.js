// Import event listener functions
import { addGroupHeaderEventListeners, addCheckboxEventListeners, addPriorityInputEventListeners } from './eventListeners.js';
import { fetchAgirliklarByScenarioId, fetchAgirliklarWithVeriler, fetchAgirliklarWithVerilerToplam, fetchAgirliklarWithVerilerOrtalama, fetchAgirliklarWithVerilerYatirimPuani } from '../supabase/scenarios.js';
import { updateIlAgirlikliOrtalamalari } from '../map/mapManager.js';

// Hızlı senaryo butonu oluşturma fonksiyonu
export function createQuickScenarioButton(scenarioId, scenarioName, scenarioDescription = '') {
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'quick-scenario-button';
    
    // Senaryo ID'sini güvenli hale getir (HTML ID'lerde kullanılabilir)
    const safeScenarioId = scenarioId.toString().replace(/[^a-zA-Z0-9]/g, '_');
    
    buttonDiv.innerHTML = `
        <button class="scenario-btn" id="scenario-${safeScenarioId}" data-scenario-id="${scenarioId}">
            <span class="scenario-icon">•</span>
            <span class="scenario-text">${scenarioName}</span>
        </button>
        ${scenarioDescription ? `<div class="scenario-desc">${scenarioDescription}</div>` : ''}
    `;
    
    return buttonDiv;
}

// Hızlı Senaryolar bölümünü API verileriyle güncelle
export function updateQuickScenariosWithData(scenarios) {
    console.log('Hızlı Senaryolar bölümü güncelleniyor...', scenarios);
    
    // Mevcut senaryo içeriğini temizle
    const quickScenariosContent = document.getElementById('quick-scenarios-content');
    
    // Mevcut senaryo butonlarını temizle
    const existingButtons = quickScenariosContent.querySelectorAll('.quick-scenario-button');
    existingButtons.forEach(button => button.remove());
    
    if (!scenarios || scenarios.length === 0) {
        // Senaryo yoksa bilgi mesajı göster
        quickScenariosContent.innerHTML = `
            <div class="no-scenarios-message">
                <p>Henüz hızlı senaryo bulunmuyor.</p>
            </div>
        `;
        return;
    }
    
    // Başlıkları normalize etmek için yardımcı (küçük harf, aksan/punkt. kaldır, boşluk/hyphen normalize)
    const normalizeTitle = (text = '') => {
        return text
            .toString()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // aksanları kaldır
            .toLowerCase()
            .replace(/[^a-z0-9ğüşiöç\s-]/g, '') // tırnak vb. temizle (Türkçe harfler dahil)
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Senaryo açıklamaları (alias listeleri ile)
    const descriptionCatalog = [
        {
            aliases: [
                'yüksek hacimli yeşil üretim',
                'yüksek hacimli üretim',
            ],
            desc: 'İhracat odaklı, büyük ölçekli ve teknolojiye dayalı üretim tesisleri için en düşük maliyetli ve en verimli bölgeleri belirler.'
        },
        {
            aliases: [
                'ileri teknoloji ve ar ge merkezi',
                'ileri teknoloji ve ar-ge merkezi',
                'ileri teknoloji ve arge merkezi',
            ],
            desc: 'Beyin gücü ve inovasyon ekosistemine dayanarak, yetenekli personeli çekebilecek ve teknoloji üretebilecek en ideal bölgeleri sıralar.'
        },
        {
            aliases: [
                'yeşil hidrojen ve enerji depolama',
                'yesil hidrojen ve enerji depolama',
                'yeşil hidrojen ve yenilenebilir enerji',
                'yesil hidrojen ve yenilenebilir enerji',
            ],
            desc: 'Yenilenebilir enerji kaynakları ile sanayi tüketiminin kesişiminde, hidrojen ekonomisi için stratejik yatırım alanlarını ortaya çıkarır.'
        },
        {
            aliases: ['sürdürülebilir tarım ve gıda teknolojileri'],
            desc: 'Gıda güvenliği ve tarımsal verimliliği artırmak için, tarım pazarlarına yakın ve teknolojiye ihtiyaç duyan bölgelerde Agri-Tech yatırımlarını optimize eder.'
        },
        {
            aliases: ['e ticaret ve son kilometre dağıtımı', 'e-ticaret ve son kilometre dağıtımı'],
            desc: 'Yoğun nüfuslu pazarlara erişimi güçlendirerek, son kilometre teslimatını en verimli şekilde yönetecek bölgeleri saptar.'
        },
        {
            aliases: ['lojistik ve tedarik zinciri yönetimi'],
            desc: 'Üretim ve tüketim merkezleri arasında köprü kuran, çok modlu ulaşım ağlarının kesişimindeki stratejik lojistik merkezlerini tanımlar.'
        }
    ];

    // Supabase'den gelen her senaryo için yeni buton oluştur
    scenarios.forEach(scenario => {
        console.log(`Senaryo butonu oluşturuluyor: ${scenario.senaryo_adi} (ID: ${scenario.senaryo_id})`);
        
        // Açıklamayı ad üzerinden alias listeleri ile eşleştir
        const normName = normalizeTitle(scenario.senaryo_adi);
        const matched = descriptionCatalog.find(entry => entry.aliases.some(a => normalizeTitle(a) === normName));
        const description = matched ? matched.desc : '';

        // Yeni senaryo butonu elementi oluştur
        const newScenarioButton = createQuickScenarioButton(scenario.senaryo_id, scenario.senaryo_adi, description);
        
        // Hızlı Senaryolar bölümüne ekle
        quickScenariosContent.appendChild(newScenarioButton);
    });
    
    // Yeni eklenen butonlara event listener'ları ekle
    setTimeout(() => {
        addQuickScenarioButtonEventListeners();
    }, 100);
}

// Hızlı senaryo butonlarına event listener ekleme
export function addQuickScenarioButtonEventListeners() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    scenarioButtons.forEach(button => {
        // Event listener zaten eklenmişse tekrar ekleme
        if (button.hasAttribute('data-event-added')) return;
        
        button.addEventListener('click', async function() {
            const scenarioId = this.getAttribute('data-scenario-id');
            const scenarioText = this.querySelector('.scenario-text').textContent;
            console.log(`Hızlı senaryo tıklandı: ${scenarioText} (ID: ${scenarioId})`);
            
            // Buton tıklandığında loading durumunu göster
            const originalText = this.querySelector('.scenario-text').textContent;
            this.querySelector('.scenario-text').textContent = 'Yükleniyor...';
            this.disabled = true;
            
            try {
                // agirliklar ve veriler tablolarını birleştirip il_id'ye göre yatırım puanı hesapla
                const yatirimPuaniSonuclar = await fetchAgirliklarWithVerilerYatirimPuani(scenarioId);
                
                if (yatirimPuaniSonuclar && yatirimPuaniSonuclar.length > 0) {
                    console.log(`${scenarioText} senaryosu için il bazında yatırım puanları:`, yatirimPuaniSonuclar);
                    
                    // Her il için sadece il_id ve yatırım puanını yazdır
                    console.log(`\n=== ${scenarioText} Senaryosu - İl Bazında Yatırım Puanları ===`);
                    yatirimPuaniSonuclar.forEach(sonuc => {
                        console.log(`İl ID: ${sonuc.il_id} | Yatırım Puanı: ${sonuc.yatirim_puani}`);
                    });
                    console.log(`=== Toplam ${yatirimPuaniSonuclar.length} il bulundu ===\n`);
                    
                    // Yatırım puanı verilerini harita için uygun formata dönüştür
                    const haritaVerileri = {};
                    yatirimPuaniSonuclar.forEach(sonuc => {
                        haritaVerileri[sonuc.il_id] = {
                            agirlikliOrtalama: sonuc.yatirim_puani,
                            toplamHesaplanmisDeger: sonuc.yatirim_puani, // Yatırım puanını kullan
                            toplamKullaniciOncelik: 1, // Varsayılan değer
                            veriSayisi: 1 // Varsayılan değer
                        };
                    });
                    
                    console.log('Harita için hazırlanan veriler:', haritaVerileri);
                    
                    // Haritayı güncelle
                    updateIlAgirlikliOrtalamalari(haritaVerileri);
                    // Başarıyla uygulandıktan sonra sidebar'ı kapat
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar && sidebar.classList.contains('open')) {
                        sidebar.classList.remove('open');
                    }
                    
                } else {
                    console.log(`${scenarioText} senaryosu için yatırım puanı verisi bulunamadı`);
                }
                
            } catch (error) {
                console.error(`${scenarioText} senaryosu için veri işleme hatası:`, error);
            } finally {
                // Buton durumunu geri yükle
                this.querySelector('.scenario-text').textContent = originalText;
                this.disabled = false;
            }
        });
        
        // Event listener eklendiğini işaretle
        button.setAttribute('data-event-added', 'true');
    });
}
