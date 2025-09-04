// Import map functions
import { highlightCityOnMap, removeCityHighlight, updateCityPriority } from '../map/mapManager.js';

// Event listener'ları ekleme fonksiyonları
export function addGroupHeaderEventListeners() {
    const groupHeaders = document.querySelectorAll('.group-header');
    groupHeaders.forEach(header => {
        // Event listener zaten eklenmişse tekrar ekleme
        if (header.hasAttribute('data-event-added')) return;
        
        // Grup başlığını başlangıçta kapalı yap
        const groupId = header.getAttribute('data-group');
        const groupItems = document.getElementById(groupId + '-items');
        const toggleIcon = header.querySelector('.toggle-icon');
        
        if (groupItems && toggleIcon) {
            groupItems.classList.add('collapsed');
            header.classList.add('collapsed');
            toggleIcon.textContent = '▶';
        }
        
        header.addEventListener('click', function() {
            const groupId = this.getAttribute('data-group');
            const groupItems = document.getElementById(groupId + '-items');
            const toggleIcon = this.querySelector('.toggle-icon');
            
            // Grup açık mı kapalı mı kontrol et
            if (groupItems.classList.contains('collapsed')) {
                // Grubu aç
                groupItems.classList.remove('collapsed');
                this.classList.remove('collapsed');
                toggleIcon.textContent = '▼';
            } else {
                // Grubu kapat
                groupItems.classList.add('collapsed');
                this.classList.add('collapsed');
                toggleIcon.textContent = '▶';
            }
        });
        
        // Event listener eklendiğini işaretle
        header.setAttribute('data-event-added', 'true');
    });
}

export function addCheckboxEventListeners() {
    const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Event listener zaten eklenmişse tekrar ekleme
        if (checkbox.hasAttribute('data-event-added')) return;
        
        checkbox.addEventListener('change', async function() {
            const cityName = this.value;
            const isChecked = this.checked;
            const checkboxItem = this.closest('.checkbox-item');
            const priorityInput = checkboxItem.querySelector('.priority-input');
            
            // Checkbox item'a selected class'ı ekle/çıkar
            if (isChecked) {
                checkboxItem.classList.add('selected');
                if (priorityInput) priorityInput.focus(); // Input'a odaklan
                
                // Checkbox'a tıklandığında veri getir
                const checkboxId = this.id;
                if (checkboxId.includes('-checkbox')) {
                    const veriId = checkboxId.replace('-checkbox', '');
                    console.log(`${cityName} için veri ID: ${veriId} ile veri getiriliyor...`);
                    
                    try {
                        // Global scope'tan fetchVeriDegerleriByVeriId fonksiyonunu al
                        const fetchVeriDegerleriByVeriId = window.fetchVeriDegerleriByVeriId;
                        if (fetchVeriDegerleriByVeriId) {
                            const veriDegerleri = await fetchVeriDegerleriByVeriId(veriId);
                            if (veriDegerleri) {
                                console.log(`${veriId} veri ID'si için çekilen veriler:`, veriDegerleri);
                                
                                // Her veri için detaylı log
                                veriDegerleri.forEach(veri => {
                                    console.log(`  Veri ID: ${veri.veri_id}, İl ID: ${veri.il_id}, Değer: ${veri.deger}`);
                                });
                            } else {
                                console.log(`${veriId} veri ID'si için veri bulunamadı`);
                            }
                        } else {
                            console.log('fetchVeriDegerleriByVeriId fonksiyonu bulunamadı');
                        }
                    } catch (error) {
                        console.error('Veri getirme hatası:', error);
                    }
                }
                
            } else {
                checkboxItem.classList.remove('selected');
                if (priorityInput) priorityInput.value = '0'; // Değeri sıfırla
            }
            
            console.log(`${cityName} şehri ${isChecked ? 'seçildi' : 'seçim kaldırıldı'}`);
            
            // Burada seçilen şehirleri haritada gösterme/gizleme işlemleri yapılabilir
            if (isChecked) {
                highlightCityOnMap(cityName);
            } else {
                removeCityHighlight(cityName);
            }
        });
        
        // Event listener eklendiğini işaretle
        checkbox.setAttribute('data-event-added', 'true');
    });
}

export function addPriorityInputEventListeners() {
    const priorityInputs = document.querySelectorAll('.priority-input');
    priorityInputs.forEach(input => {
        // Event listener zaten eklenmişse tekrar ekleme
        if (input.hasAttribute('data-event-added')) return;
        
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            const cityName = this.closest('.checkbox-item').querySelector('input[type="checkbox"]').value;
            
            // 0-10 arası sınırlama
            if (value < 0) this.value = 0;
            if (value > 10) this.value = 10;
            
            console.log(`${cityName} şehri için öncelik puanı: ${this.value}`);
            updateCityPriority(cityName, this.value);
        });
        
        // Enter tuşuna basıldığında input'tan çık
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
        
        // Input'tan çıkıldığında değeri kontrol et
        input.addEventListener('blur', function() {
            if (this.value === '' || this.value < 0) {
                this.value = 0;
            }
        });
        
        // Event listener eklendiğini işaretle
        input.setAttribute('data-event-added', 'true');
    });
}

// Altlık harita seçimi event listener'ları
export function addBasemapEventListeners() {
    const basemapRadios = document.querySelectorAll('input[name="basemapLayer"]');
    basemapRadios.forEach(radio => {
        // Event listener zaten eklenmişse tekrar ekleme
        if (radio.hasAttribute('data-event-added')) return;
        
        radio.addEventListener('change', function() {
            if (this.checked) {
                const layerName = this.value;
                console.log(`Altlık harita değiştirildi: ${layerName}`);
                
                // MapManager'dan switchMapLayer fonksiyonunu çağır
                import('../map/mapManager.js').then(({ switchMapLayer }) => {
                    switchMapLayer(layerName);
                }).catch(error => {
                    console.error('MapManager import hatası:', error);
                });
            }
        });
        
        // Event listener eklendiğini işaretle
        radio.setAttribute('data-event-added', 'true');
    });
}

// Katman kontrol popup event listener'ları
export function addLayerControlEventListeners() {
    const layerControlBtn = document.getElementById('layerControlBtn');
    const layerControlPopup = document.getElementById('layerControlPopup');
    
    if (!layerControlBtn || !layerControlPopup) return;
    
    // Katman kontrol butonuna tıklama
    layerControlBtn.addEventListener('click', () => {
        layerControlPopup.classList.toggle('show');
    });
    
    // Popup dışına tıklama
    document.addEventListener('click', (e) => {
        if (layerControlPopup.classList.contains('show') && 
            !layerControlPopup.contains(e.target) && 
            !layerControlBtn.contains(e.target)) {
            layerControlPopup.classList.remove('show');
        }
    });
    
    // Popup içindeki radio button'lar için event listener'lar
    const popupRadios = document.querySelectorAll('input[name="popupBasemapLayer"]');
    popupRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const layerName = this.value;
                console.log(`Popup'tan altlık harita değiştirildi: ${layerName}`);
                
                // MapManager'dan switchMapLayer fonksiyonunu çağır
                import('../map/mapManager.js').then(({ switchMapLayer }) => {
                    switchMapLayer(layerName);
                }).catch(error => {
                    console.error('MapManager import hatası:', error);
                });
                
                // Popup'ı kapat
                layerControlPopup.classList.remove('show');
            }
        });
    });
}
