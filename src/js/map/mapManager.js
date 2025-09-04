// Harita yönetimi
let map = null;
let basemap = null;
let geoJSONLayer = null;
let ilAgirlikliOrtalamalari = {}; // İl bazında ağırlıklı ortalamaları sakla

// Harita katmanları tanımları
const MAP_LAYERS = {
    openstreetmap: {
        name: 'OSM Temel',
        layer: null,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    hot: {
        name: 'OSM Sokak',
        layer: null,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    dark: {
        name: 'OSM Gece',
        layer: null,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
};

// Renk skalası tanımları
const COLOR_SCALE = {
    ranges: [
        { min: 0, max: 15, color: '#d73027', label: '0-15' },
        { min: 16, max: 30, color: '#fc8d59', label: '16-30' },
        { min: 31, max: 50, color: '#fee08b', label: '31-50' },
        { min: 51, max: 65, color: '#ffffbf', label: '51-65' },
        { min: 66, max: 80, color: '#d9ef8b', label: '66-80' },
        { min: 81, max: 90, color: '#91cf60', label: '81-90' },
        { min: 91, max: 100, color: '#1a9850', label: '91-100'}
    ],
    defaultColor: '#0b380d', // Veri olmayan iller için varsayılan renk
    noDataColor: '#cccccc' // Hiç veri olmayan iller için gri renk
};

// Ağırlıklı ortalama değerine göre renk belirle
function getColorByValue(agirlikliOrtalama) {
    if (agirlikliOrtalama === null || agirlikliOrtalama === undefined) {
        return COLOR_SCALE.noDataColor;
    }
    
    const value = Math.round(agirlikliOrtalama); // Değeri yuvarlayalım
    
    for (const range of COLOR_SCALE.ranges) {
        if (value >= range.min && value <= range.max) {
            return range.color;
        }
    }
    
    // Eğer hiçbir aralığa girmiyorsa, en yakın aralığı bul
    if (value < 0) return COLOR_SCALE.ranges[0].color;
    if (value > 100) return COLOR_SCALE.ranges[COLOR_SCALE.ranges.length - 1].color;
    
    return COLOR_SCALE.defaultColor;
}

// Değer aralığına göre açıklama metni al
function getValueRangeLabel(agirlikliOrtalama) {
    if (agirlikliOrtalama === null || agirlikliOrtalama === undefined) {
        return 'Veri Yok';
    }
    
    const value = Math.round(agirlikliOrtalama);
    
    for (const range of COLOR_SCALE.ranges) {
        if (value >= range.min && value <= range.max) {
            return range.label;
        }
    }
    
    if (value < 0) return 'Çok Düşük (0 altı)';
    if (value > 100) return 'Çok Yüksek (100 üstü)';
    
    return 'Belirsiz Aralık';
}

// Haritayı başlat
export function initializeMap() {
    map = L.map('map', {
        minZoom: 5,
        maxZoom: 12
    }).setView([39.05026930858989, 35.12732014282004], 6);

    // Harita katmanlarını oluştur
    createMapLayers();
    
    // Varsayılan olarak açık haritayı ekle
    basemap = MAP_LAYERS.openstreetmap.layer;
    basemap.addTo(map);

    // GeoJSON verilerini yükle
    loadGeoJSONData();
    
    // Renk skalası legend'ini ekle
    addColorScaleLegend();
    
    // Harita katman kontrolünü ekle (artık sidebar'da)
    // addLayerControl(); // Sidebar'a taşındı
}

// Harita katmanlarını oluştur
function createMapLayers() {
    // Açık harita katmanı
    MAP_LAYERS.openstreetmap.layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 5,
        maxZoom: 12,
        attribution: MAP_LAYERS.openstreetmap.attribution
    });
    
    // Street Map (HOT) katmanı
    MAP_LAYERS.hot.layer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        minZoom: 5,
        maxZoom: 12,
        attribution: MAP_LAYERS.hot.attribution
    });
    
    // Gece modu harita katmanı
    MAP_LAYERS.dark.layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        minZoom: 5,
        maxZoom: 12,
        attribution: MAP_LAYERS.dark.attribution
    });
}

// Harita katman kontrolünü ekle
function addLayerControl() {
    const layerControl = L.control({ position: 'bottomleft' });
    
    layerControl.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'custom-layer-control');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        div.style.padding = '12px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        div.style.border = '2px solid #e9ecef';
        div.style.minWidth = '140px';
        div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        div.style.zIndex = '1000';
        
        let controlHTML = '<div style="font-weight: 600; color: #333; margin-bottom: 8px; text-align: center; font-size: 13px; border-bottom: 1px solid #e9ecef; padding-bottom: 6px;">Altlık Harita</div>';
        
        // Açık harita seçeneği
        controlHTML += `
            <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                <input type="radio" id="layer-openstreetmap" name="mapLayer" value="openstreetmap" checked style="margin: 0; cursor: pointer; accent-color: #007bff;">
                <label for="layer-openstreetmap" style="margin: 0; cursor: pointer; font-size: 12px; color: #495057; font-weight: 500; transition: color 0.2s ease;">${MAP_LAYERS.openstreetmap.name}</label>
            </div>
        `;
        
        // Street Map (HOT) seçeneği
        controlHTML += `
            <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                <input type="radio" id="layer-hot" name="mapLayer" value="hot" style="margin: 0; cursor: pointer; accent-color: #007bff;">
                <label for="layer-hot" style="margin: 0; cursor: pointer; font-size: 12px; color: #495057; font-weight: 500; transition: color 0.2s ease;">${MAP_LAYERS.hot.name}</label>
            </div>
        `;
        
        // Gece modu seçeneği
        controlHTML += `
            <div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
                <input type="radio" id="layer-dark" name="mapLayer" value="dark" style="margin: 0; cursor: pointer; accent-color: #007bff;">
                <label for="layer-dark" style="margin: 0; cursor: center; font-size: 12px; color: #495057; font-weight: 500; transition: color 0.2s ease;">${MAP_LAYERS.dark.name}</label>
            </div>
        `;
        
        div.innerHTML = controlHTML;
        
        // Radio button event listener'ları ekle
        const radioButtons = div.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    switchMapLayer(this.value);
                }
            });
        });
        
        // Label hover efektleri
        const labels = div.querySelectorAll('label');
        labels.forEach(label => {
            label.addEventListener('mouseenter', function() {
                this.style.color = '#007bff';
            });
            
            label.addEventListener('mouseleave', function() {
                if (!this.previousElementSibling.checked) {
                    this.style.color = '#495057';
                }
            });
        });
        
        return div;
    };
    
    layerControl.addTo(map);
}

// Harita katmanını değiştir
export function switchMapLayer(layerName) {
    if (!map || !MAP_LAYERS[layerName]) return;
    
    // Mevcut katmanı kaldır
    if (basemap) {
        map.removeLayer(basemap);
    }
    
    // Yeni katmanı ekle
    basemap = MAP_LAYERS[layerName].layer;
    basemap.addTo(map);
    
    console.log(`Harita katmanı değiştirildi: ${MAP_LAYERS[layerName].name}`);
}

// Renk skalası legend'ini haritaya ekle
function addColorScaleLegend() {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        div.style.fontSize = '12px';
        div.style.lineHeight = '18px';
        
        let legendHTML = '<div style="font-weight: bold; margin-bottom: 5px; text-align: center;">Yatırım Potansiyeli</div>';
        
        COLOR_SCALE.ranges.forEach(range => {
            legendHTML += `
                <div style="margin: 2px 0;">
                    <span style="
                        display: inline-block; 
                        width: 18px; 
                        height: 18px; 
                        background-color: ${range.color}; 
                        margin-right: 5px;
                        border: 1px solid #ccc;
                        vertical-align: middle;
                    "></span>
                    <span style="vertical-align: middle; font-size: 11px;">${range.label}</span>
                </div>
            `;
        });
        
        // Veri yok seçeneği
        legendHTML += `
            <div style="margin: 2px 0;">
                <span style="
                    display: inline-block; 
                    width: 18px; 
                    height: 18px; 
                    background-color: ${COLOR_SCALE.noDataColor}; 
                    margin-right: 5px;
                    border: 1px solid #ccc;
                    vertical-align: middle;
                "></span>
                <span style="vertical-align: middle; font-size: 11px;">Veri Yok</span>
            </div>
        `;
        
        div.innerHTML = legendHTML;
        return div;
    };
    
    legend.addTo(map);
}

// GeoJSON verilerini yükle
async function loadGeoJSONData() {
    try {
        const response = await fetch('cities.geojson');
        if (!response.ok) {
            throw new Error('GeoJSON dosyası bulunamadı veya bir hata oluştu: ' + response.statusText);
        }
        
        const data = await response.json();
        
        geoJSONLayer = L.geoJSON(data, {
            style: function(feature) {
                // İl ID'sini al
                const ilId = feature.id || feature.properties.id || feature.properties.il_id;
                
                // İl verisi var mı kontrol et
                let fillColor = COLOR_SCALE.defaultColor;
                let ilVerisi = null;
                
                if (ilId !== undefined && ilId !== null) {
                    // Hem string hem number olarak kontrol et
                    ilVerisi = ilAgirlikliOrtalamalari[ilId] || 
                              ilAgirlikliOrtalamalari[ilId.toString()] || 
                              ilAgirlikliOrtalamalari[Number(ilId)];
                    
                    if (ilVerisi && ilVerisi.agirlikliOrtalama !== undefined) {
                        fillColor = getColorByValue(ilVerisi.agirlikliOrtalama);
                    } else {
                        fillColor = COLOR_SCALE.noDataColor;
                    }
                }
                
                return {
                    color: '#ffffff', 
                    weight: 2, 
                    opacity: 1, 
                    fillColor: fillColor, 
                    fillOpacity: 0.85 
                };
            },
            onEachFeature: function(feature, layer) {
                // Her il için click event ekle
                layer.on('click', function() {
                    // GeoJSON'da id doğrudan feature seviyesinde, properties içinde değil
                    const ilId = feature.id || feature.properties.id || feature.properties.il_id;
                    const ilAdi = feature.properties.name || feature.properties.name_tr || 'Bilinmeyen İl';
                    
                    console.log('=== İL TIKLAMA DEBUG ===');
                    console.log(`İl tıklandı: ${ilAdi} (ID: ${ilId})`);
                    console.log('İl ID tipi:', typeof ilId);
                    console.log('İl ID değeri:', ilId);
                    console.log('Feature objesi:', feature);
                    console.log('Mevcut ağırlıklı ortalamalar:', ilAgirlikliOrtalamalari);
                    console.log('Mevcut il ID\'leri:', Object.keys(ilAgirlikliOrtalamalari));
                    
                    if (ilId !== undefined && ilId !== null) {
                        console.log('İl ID string olarak:', ilId.toString());
                        console.log('İl ID number olarak:', Number(ilId));
                        
                        // Hem string hem number olarak kontrol et
                        const stringIlId = ilId.toString();
                        const numberIlId = Number(ilId);
                        
                        let ilVerisi = null;
                        if (ilAgirlikliOrtalamalari[ilId]) {
                            ilVerisi = ilAgirlikliOrtalamalari[ilId];
                            console.log(`✅ İl verisi bulundu (orijinal ID):`, ilVerisi);
                        } else if (ilAgirlikliOrtalamalari[stringIlId]) {
                            ilVerisi = ilAgirlikliOrtalamalari[stringIlId];
                            console.log(`✅ İl verisi bulundu (string ID):`, ilVerisi);
                        } else if (ilAgirlikliOrtalamalari[numberIlId]) {
                            ilVerisi = ilAgirlikliOrtalamalari[numberIlId];
                            console.log(`✅ İl verisi bulundu (number ID):`, ilVerisi);
                        } else {
                            console.log(`❌ İl ID ${ilId} için veri bulunamadı`);
                            console.log('Aranan ID\'ler:', [ilId, stringIlId, numberIlId]);
                        }
                        
                        showIlBilgileri(ilId, ilAdi, ilVerisi);
                    } else {
                        console.log(`❌ İl ID bulunamadı - feature.id: ${feature.id}, feature.properties.id: ${feature.properties.id}`);
                        showIlBilgileri(null, ilAdi, null);
                    }
                });
                
                // Hover efekti ekle
                layer.on('mouseover', function(e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.95
                    });
                    
                    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        layer.bringToFront();
                    }
                });
                
                layer.on('mouseout', function(e) {
                    geoJSONLayer.resetStyle(e.target);
                });
            }
        }).addTo(map);
        
    } catch (error) {
        console.error('Harita yüklenirken bir hata oluştu:', error);
    }
}

// İl bilgilerini göster
function showIlBilgileri(ilId, ilAdi, ilVerisi) {
    let popupContent = '';
    
    if (ilVerisi) {
        const valueRangeLabel = getValueRangeLabel(ilVerisi.agirlikliOrtalama);
        const currentColor = getColorByValue(ilVerisi.agirlikliOrtalama);
        
        popupContent = `
            <div style="text-align: center; min-width: 250px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">${ilAdi}</h3>
                <div style="background: linear-gradient(135deg, ${currentColor}, ${currentColor}CC); color: white; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Ağırlıklı Ortalama</h4>
                    <div style="font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${ilVerisi.agirlikliOrtalama.toFixed(2)}</div>
                </div>
            </div>
        `;
    } else {
        popupContent = `
            <div style="text-align: center; min-width: 200px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">${ilAdi}</h3>
                <div style="background: ${COLOR_SCALE.noDataColor}; color: #333; padding: 15px; border-radius: 10px;">
                    <p style="margin: 0;">Bu il için henüz veri hesaplanmamış</p>
                </div>
            </div>
        `;
    }
    
    // Popup'ı haritada göster
    L.popup({
        maxWidth: 300,
        className: 'il-bilgi-popup'
    })
    .setLatLng(map.getCenter())
    .setContent(popupContent)
    .openOn(map);
}

// İl ağırlıklı ortalamalarını güncelle
export function updateIlAgirlikliOrtalamalari(yeniOrtalamalar) {
    console.log('updateIlAgirlikliOrtalamalari çağrıldı');
    console.log('Gelen yeni ortalamalar:', yeniOrtalamalar);
    console.log('Önceki ilAgirlikliOrtalamalari:', ilAgirlikliOrtalamalari);
    
    ilAgirlikliOrtalamalari = yeniOrtalamalar;
    
    console.log('Güncellenmiş ilAgirlikliOrtalamalari:', ilAgirlikliOrtalamalari);
    console.log('Harita için il ağırlıklı ortalamaları güncellendi:', ilAgirlikliOrtalamalari);
    
    // Haritayı yeniden çiz - renklendirme ile birlikte
    if (geoJSONLayer && map) {
        console.log('GeoJSON layer yeniden çiziliyor...');
        map.removeLayer(geoJSONLayer);
        loadGeoJSONData();
    } else {
        console.log('GeoJSON layer bulunamadı, yeniden çizilemiyor');
    }
}

// Tek bir veri türünün veri_id'si ile veri değerlerini getir
export async function fetchVeriDegerleriByVeriId(veriId) {
    if (!veriId) {
        console.log('Veri ID yok, sorgu yapılamıyor');
        return null;
    }
    
    console.log(`${veriId} veri ID'si için veri değerleri çekiliyor...`);
    
    try {
        // Supabase client'ı al
        const { getSupabaseClient, isSupabaseConnected } = await import('../supabase/client.js');
        
        if (!isSupabaseConnected()) {
            console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
            return null;
        }
        
        const supabaseClient = getSupabaseClient();
        
        // 'veriler' tablosundan belirli veri_id'ye sahip kayıtları çek
        const { data: veriDegerleriData, error: veriDegerleriError } = await supabaseClient
            .from('veriler')
            .select('deger, veri_id, il_id')
            .eq('veri_id', veriId);
        
        if (veriDegerleriError) {
            console.error('veriler tablosu veri çekme hatası:', veriDegerleriError.message);
            return null;
        }

        console.log(`${veriId} veri ID'si için veri değerleri başarıyla çekildi:`, veriDegerleriData);
        return veriDegerleriData;
        
    } catch (error) {
        console.error('Veri değerleri çekme hatası:', error);
        return null;
    }
}

// Seçili veri türlerinin veri_id'lerini kullanarak yeni veritabanı sorgusu yap
export async function fetchVeriDegerleri(selectedVeriIds) {
    if (!selectedVeriIds || selectedVeriIds.length === 0) {
        console.log('Seçili veri ID\'leri yok, sorgu yapılamıyor');
        return null;
    }
    
    console.log('Seçili veri ID\'leri için veri değerleri çekiliyor:', selectedVeriIds);
    
    try {
        // Supabase client'ı al
        const { getSupabaseClient, isSupabaseConnected } = await import('../supabase/client.js');
        
        if (!isSupabaseConnected()) {
            console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
            return null;
        }
        
        const supabaseClient = getSupabaseClient();
        
        // 'veriler' tablosundan ilgili veri_id'lere sahip kayıtları çek
        const { data: veriDegerleriData, error: veriDegerleriError } = await supabaseClient
            .from('veriler')
            .select('deger, veri_id, il_id')
            .in('veri_id', selectedVeriIds);
        
        if (veriDegerleriError) {
            console.error('veriler tablosu veri çekme hatası:', veriDegerleriError.message);
            return null;
        }

        console.log('Veri değerları başarıyla çekildi:', veriDegerleriData);
        return veriDegerleriData;
        
    } catch (error) {
        console.error('Veri değerleri çekme hatası:', error);
        return null;
    }
}

// Şehirleri haritada vurgulama fonksiyonu
export function highlightCityOnMap(cityName) {
    console.log(`${cityName} haritada vurgulanıyor...`);
    // Burada haritada şehir vurgulama işlemleri yapılabilir
    // Örnek: Şehir noktasını büyütme, renk değiştirme vb.
}

// Şehir vurgulamasını kaldırma fonksiyonu
export function removeCityHighlight(cityName) {
    console.log(`${cityName} vurgulaması kaldırılıyor...`);
    // Burada haritada şehir vurgulamasını kaldırma işlemleri yapılabilir
}

// Şehir öncelik puanını güncelleme fonksiyonu
export function updateCityPriority(cityName, priority) {
    console.log(`${cityName} şehri için öncelik puanı güncellendi: ${priority}`);
    // Burada öncelik puanına göre haritada işlemler yapılabilir
    // Örnek: Renk değiştirme, boyut değiştirme vb.
}

// Renk skalası ayarlarını dışarıdan değiştirme imkanı
export function updateColorScale(newColorScale) {
    if (newColorScale && newColorScale.ranges) {
        COLOR_SCALE.ranges = newColorScale.ranges;
        if (newColorScale.defaultColor) COLOR_SCALE.defaultColor = newColorScale.defaultColor;
        if (newColorScale.noDataColor) COLOR_SCALE.noDataColor = newColorScale.noDataColor;
        
        // Haritayı yeniden çiz
        if (geoJSONLayer && map) {
            map.removeLayer(geoJSONLayer);
            loadGeoJSONData();
        }
    }
}

// Harita nesnesini al
export function getMap() {
    return map;
}

// Basemap nesnesini al
export function getBasemap() {
    return basemap;
}

// Renk skalası bilgilerini al
export function getColorScale() {
    return COLOR_SCALE;
}