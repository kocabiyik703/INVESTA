// Import modules
import { initializeSupabase } from './supabase/client.js';
import { fetchGruplarFromSupabase } from './supabase/groups.js';
import { fetchAllVeriTurleri } from './supabase/veriTurleri.js';
import { fetchScenariosFromSupabase } from './supabase/scenarios.js';
import { updateSidebarWithGruplar } from './ui/groups.js';
import { updateQuickScenariosWithData } from './ui/scenarios.js';
import { addGroupHeaderEventListeners, addCheckboxEventListeners, addPriorityInputEventListeners, addBasemapEventListeners, addLayerControlEventListeners } from './ui/eventListeners.js';
import { initializeMap, highlightCityOnMap, removeCityHighlight, updateCityPriority, updateIlAgirlikliOrtalamalari } from './map/mapManager.js';
import { initializeAIAssistant } from './ui/aiAssistant.js';

// Sidebar işlevselliği
document.addEventListener('DOMContentLoaded', async function() {
    // Haritayı başlat
    initializeMap();
    
    // AI Asistan'ı başlat
    const aiAssistant = initializeAIAssistant();
    
    // Supabase'i başlat
    const supabaseInitialized = initializeSupabase();
    
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    
    // Supabase'den grup verilerini çek (eğer bağlantı varsa)
    if (supabaseInitialized) {
        fetchGruplarFromSupabase().then(async (grupData) => {
            if (grupData) {
                console.log('Supabase\'den grup verileri başarıyla yüklendi:', grupData.length, 'grup');
                
                // Grup verileri için veri türlerini de çek
                const veriTurleriMap = await fetchAllVeriTurleri(grupData);
                
                // AI Asistan'a veri türlerini aktar
                if (aiAssistant && aiAssistant.setVeriTurleri) {
                    aiAssistant.setVeriTurleri(veriTurleriMap);
                }
                
                // Sidebar'ı hem grup hem de veri türleri ile güncelle
                updateSidebarWithGruplar(grupData, veriTurleriMap);
            } else {
                console.log('Supabase veri çekilemedi');
            }
        }).catch(error => {
            console.error('Supabase veri çekme hatası:', error);
        });
        
        // Senaryo verilerini çek
        fetchScenariosFromSupabase().then(async (scenarioData) => {
            if (scenarioData) {
                console.log('Supabase\'den senaryo verileri başarıyla yüklendi:', scenarioData.length, 'senaryo');
                
                // Hızlı Senaryolar bölümünü güncelle
                updateQuickScenariosWithData(scenarioData);
            } else {
                console.log('Supabase\'den senaryo verileri çekilemedi');
            }
        }).catch(error => {
            console.error('Supabase senaryo veri çekme hatası:', error);
        });
    } else {
        console.log('Supabase bağlantısı kurulmamış, mock data kullanılıyor');
    }
    
    // Sidebar'ı aç
    openBtn.addEventListener('click', function() {
        sidebar.classList.add('open');
    });
    
    // Sidebar'ı kapat
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('open');
        console.log('Sidebar kapatıldı');
    });
    
    // Sidebar'ın başlangıçta kapalı olduğundan emin ol
    sidebar.classList.remove('open');
    
    // Sidebar dışına tıklandığında kapat
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !openBtn.contains(event.target)) {
            sidebar.classList.remove('open');
            console.log('Sidebar dışına tıklandı, kapatıldı');
        }
    });
    
    // ESC tuşu ile sidebar'ı kapat
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            console.log('ESC tuşu ile sidebar kapatıldı');
        }
    });
    
    // Ana bölüm başlığına tıklanabilir özellik ekle
    const mainSectionHeader = document.querySelector('.main-section-header');
    const mainSectionContent = document.getElementById('main-section-content');
    const mainToggleIcon = document.querySelector('.main-toggle-icon');
    
    // Ana bölümü başlangıçta kapalı yap
    mainSectionContent.classList.add('collapsed');
    mainSectionHeader.classList.add('collapsed');
    mainToggleIcon.textContent = '▶';
    
    mainSectionHeader.addEventListener('click', function() {
        // Ana bölüm açık mı kapalı mı kontrol et
        if (mainSectionContent.classList.contains('collapsed')) {
            // Ana bölümü aç
            mainSectionContent.classList.remove('collapsed');
            this.classList.remove('collapsed');
            mainToggleIcon.textContent = '▼';
        } else {
            // Ana bölümü kapat
            mainSectionContent.classList.add('collapsed');
            this.classList.add('collapsed');
            mainToggleIcon.textContent = '▶';
        }
    });
    
    // Hızlı Senaryolar bölümü başlığına tıklanabilir özellik ekle
    const quickScenariosHeader = document.getElementById('quick-scenarios-header');
    const quickScenariosContent = document.getElementById('quick-scenarios-content');
    const quickScenariosToggleIcon = quickScenariosHeader.querySelector('.main-toggle-icon');
    
    // Hızlı Senaryolar bölümünü başlangıçta kapalı yap
    quickScenariosContent.classList.add('collapsed');
    quickScenariosHeader.classList.add('collapsed');
    quickScenariosToggleIcon.textContent = '▶';
    
    quickScenariosHeader.addEventListener('click', function() {
        // Hızlı Senaryolar bölümü açık mı kapalı mı kontrol et
        if (quickScenariosContent.classList.contains('collapsed')) {
            // Hızlı Senaryolar bölümünü aç
            quickScenariosContent.classList.remove('collapsed');
            this.classList.remove('collapsed');
            quickScenariosToggleIcon.textContent = '▼';
        } else {
            // Hızlı Senaryolar bölümünü kapat
            quickScenariosContent.classList.add('collapsed');
            this.classList.add('collapsed');
            quickScenariosToggleIcon.textContent = '▶';
        }
    });
    

    

    
    // Event listener'ları ekle
    addGroupHeaderEventListeners();
    addCheckboxEventListeners();
    addPriorityInputEventListeners();
    addBasemapEventListeners();
    addLayerControlEventListeners();
    
    // Senaryo uygulama butonuna event listener ekle
    const applyScenarioBtn = document.getElementById('applyScenarioBtn');
    const clearScenarioBtn = document.getElementById('clearScenarioBtn');
    if (applyScenarioBtn) {
        applyScenarioBtn.addEventListener('click', async function() {
            console.log('Senaryo uygulanıyor...');
            
            // Seçili checkbox'ları ve öncelik değerlerini topla
            const selectedItems = [];
            const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
            
            checkboxes.forEach(checkbox => {
                const checkboxItem = checkbox.closest('.checkbox-item');
                const priorityInput = checkboxItem.querySelector('.priority-input');
                const cityName = checkbox.value;
                const priority = priorityInput ? parseInt(priorityInput.value) || 0 : 0;
                
                // Checkbox'ın ID'sinden veri_id'yi çıkar
                const checkboxId = checkbox.id;
                if (checkboxId.includes('-checkbox')) {
                    const veriId = checkboxId.replace('-checkbox', '');
                    selectedItems.push({
                        city: cityName,
                        priority: priority,
                        veri_id: veriId
                    });
                }
            });
            
            console.log('Seçili öğeler:', selectedItems);
            
            // Burada seçili senaryo verilerine göre işlemler yapılabilir
            // Örnek: Haritayı güncelleme, veri filtreleme, API çağrısı vb.
            if (selectedItems.length > 0) {
                console.log(`${selectedItems.length} öğe seçildi, senaryo uygulanıyor...`);
                
                // Her seçili öğe için veri değerlerini çek ve hesapla
                const hesaplanmisVeriler = [];
                let toplamHesaplanmisDeger = 0;
                
                for (const item of selectedItems) {
                    const veriId = item.veri_id;
                    const priority = item.priority;
                    const cityName = item.city;
                    
                    if (veriId && priority > 0) {
                        console.log(`${cityName} (${veriId}) için veri değerleri çekiliyor...`);
                        
                        try {
                            // Bu veri türü için veri değerlerini çek
                            const veriDegerleri = await fetchVeriDegerleriByVeriId(veriId);
                            
                            if (veriDegerleri && veriDegerleri.length > 0) {
                                // Her veri değerini öncelik puanı ile çarp
                                veriDegerleri.forEach(veri => {
                                    const deger = parseFloat(veri.deger) || 0;
                                    const hesaplanmisDeger = priority * deger;
                                    
                                    hesaplanmisVeriler.push({
                                        veri_id: veri.veri_id,
                                        il_id: veri.il_id,
                                        orijinal_deger: deger,
                                        kullanici_oncelik: priority,
                                        hesaplanmis_deger: hesaplanmisDeger,
                                        city: cityName
                                    });
                                    
                                    toplamHesaplanmisDeger += hesaplanmisDeger;
                                    
                                    console.log(`  ${cityName} - İl ID: ${veri.il_id}`);
                                    console.log(`    Orijinal Değer: ${deger} × Kullanıcı Önceliği: ${priority} = ${hesaplanmisDeger}`);
                                });
                            } else {
                                console.log(`${cityName} (${veriId}) için veri bulunamadı`);
                            }
                        } catch (error) {
                            console.error(`${cityName} (${veriId}) için veri çekme hatası:`, error);
                        }
                    } else {
                        console.log(`${cityName} için geçerli veri ID veya öncelik puanı yok`);
                    }
                }
                
                console.log('Tüm hesaplamalar tamamlandı!');
                console.log('Hesaplanmış veriler:', hesaplanmisVeriler);
                console.log('Toplam hesaplanmış değer:', toplamHesaplanmisDeger);
                
                // Her il için ağırlıklı ortalama hesapla
                const ilAgirlikliOrtalamalari = {};
                
                hesaplanmisVeriler.forEach(veri => {
                    const ilId = veri.il_id;
                    
                    if (!ilAgirlikliOrtalamalari[ilId]) {
                        ilAgirlikliOrtalamalari[ilId] = {
                            toplamHesaplanmisDeger: 0,
                            toplamKullaniciOncelik: 0,
                            veriSayisi: 0
                        };
                    }
                    
                    ilAgirlikliOrtalamalari[ilId].toplamHesaplanmisDeger += veri.hesaplanmis_deger;
                    ilAgirlikliOrtalamalari[ilId].toplamKullaniciOncelik += veri.kullanici_oncelik;
                    ilAgirlikliOrtalamalari[ilId].veriSayisi += 1;
                });
                
                // Ağırlıklı ortalamaları hesapla ve log'da göster
                console.log('\n=== İL BAZINDA AĞIRLIKLI ORTALAMALAR ===');
                
                Object.keys(ilAgirlikliOrtalamalari).forEach(ilId => {
                    const ilVerisi = ilAgirlikliOrtalamalari[ilId];
                    const agirlikliOrtalama = ilVerisi.toplamKullaniciOncelik > 0 
                        ? ilVerisi.toplamHesaplanmisDeger / ilVerisi.toplamKullaniciOncelik 
                        : 0;
                    
                    console.log(`İl ID: ${ilId}`);
                    console.log(`  Toplam Hesaplanmış Değer: ${ilVerisi.toplamHesaplanmisDeger.toFixed(6)}`);
                    console.log(`  Toplam Kullanıcı Önceliği: ${ilVerisi.toplamKullaniciOncelik}`);
                    console.log(`  Veri Sayısı: ${ilVerisi.veriSayisi}`);
                    console.log(`  Ağırlıklı Ortalama: ${agirlikliOrtalama.toFixed(6)}`);
                    console.log('  ---');
                    
                    // Ağırlıklı ortalamayı il verisine ekle
                    ilVerisi.agirlikliOrtalama = agirlikliOrtalama * 100;
                });
                
                console.log('=== AĞIRLIKLI ORTALAMA HESAPLAMASI TAMAMLANDI ===\n');
                
                // Senaryo uygulama işlemleri burada yapılacak
                if (hesaplanmisVeriler.length > 0) {
                    console.log('Senaryo başarıyla uygulandı!');
                    console.log('İl bazında ağırlıklı ortalamalar:', ilAgirlikliOrtalamalari);
                    
                    // Haritayı güncelle - ağırlıklı ortalamaları gönder
                    updateIlAgirlikliOrtalamalari(ilAgirlikliOrtalamalari);
                    
                    // Burada harita güncelleme, görselleştirme vb. işlemler yapılabilir
                } else {
                    console.log('Hesaplanmış veri bulunamadı');
                }
                
            } else {
                console.log('Hiçbir öğe seçilmedi');
                alert('Lütfen en az bir öğe seçin!');
            }
        });
    }

    // Özelleştirilmiş senaryo seçimlerini temizle
    if (clearScenarioBtn) {
        clearScenarioBtn.addEventListener('click', function() {
            // Tüm checkbox'ları ve öncelik değerlerini sıfırla
            const allCheckboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
            const allPriorityInputs = document.querySelectorAll('.checkbox-item .priority-input');

            allCheckboxes.forEach(cb => {
                cb.checked = false;
                const item = cb.closest('.checkbox-item');
                if (item) item.classList.remove('selected');
            });

            allPriorityInputs.forEach(input => {
                input.value = 0;
            });

            // Varsa senaryo sonuç/özet alanını temizle (geleceğe dönük)
            const aiResponse = document.querySelector('.ai-response-content');
            if (aiResponse) {
                aiResponse.textContent = '';
            }
        });
    }
    
    // Yeni eklenen elementlere event listener'ları eklemek için global fonksiyonlar
    window.addGroupHeaderEventListeners = addGroupHeaderEventListeners;
    window.addCheckboxEventListeners = addCheckboxEventListeners;
    window.addPriorityInputEventListeners = addPriorityInputEventListeners;
    window.addBasemapEventListeners = addBasemapEventListeners;
    window.addLayerControlEventListeners = addLayerControlEventListeners;
    
    // Harita fonksiyonlarını global scope'a ekle
    window.highlightCityOnMap = highlightCityOnMap;
    window.removeCityHighlight = removeCityHighlight;
    window.updateCityPriority = updateCityPriority;
    
    // Veri getirme fonksiyonunu global scope'a ekle
    const { fetchVeriDegerleriByVeriId } = await import('./map/mapManager.js');
    window.fetchVeriDegerleriByVeriId = fetchVeriDegerleriByVeriId;
    });