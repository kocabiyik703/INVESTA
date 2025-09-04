// Import event listener functions
import { addGroupHeaderEventListeners, addCheckboxEventListeners, addPriorityInputEventListeners } from './eventListeners.js';

// Grup elementi oluşturma fonksiyonu (veri türleri ile birlikte)
export function createGroupElement(groupId, groupName, veriTurleri = []) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    
    // Grup ID'sini güvenli hale getir (HTML ID'lerde kullanılabilir)
    const safeGroupId = groupId.toString().replace(/[^a-zA-Z0-9]/g, '_');
    
    // Veri türleri için HTML oluştur
    let veriTurleriHTML = '';
    if (veriTurleri && veriTurleri.length > 0) {
        veriTurleri.forEach(veriTuru => {
            const safeVeriId = veriTuru.veri_id.toString().replace(/[^a-zA-Z0-9]/g, '_');
            veriTurleriHTML += `
                <div class="checkbox-item">
                    <input type="checkbox" value="${veriTuru.veri_adi.toLowerCase()}" id="${safeVeriId}-checkbox">
                    <span>${veriTuru.veri_adi}</span>
                    <input type="number" class="priority-input" min="0" max="10" value="0" placeholder="0-10">
                </div>
            `;
        });
    } else {
        // Veri türü yoksa sadece grup adını göster
        veriTurleriHTML = `
            <div class="checkbox-item">
                <input type="checkbox" value="${groupName.toLowerCase()}" id="${safeGroupId}-checkbox">
                <span>${groupName}</span>
                <input type="number" class="priority-input" min="0" max="10" value="0" placeholder="0-10">
            </div>
        `;
    }
    
    groupDiv.innerHTML = `
        <div class="group-header" data-group="${safeGroupId}">
            <h4>${groupName}</h4>
            <span class="toggle-icon">▼</span>
        </div>
        <div class="group-items" id="${safeGroupId}-items">
            ${veriTurleriHTML}
        </div>
    `;
    
    return groupDiv;
}

// Sidebar'ı API verileriyle güncelle
export function updateSidebarWithGruplar(gruplar, veriTurleriMap = {}) {
    console.log('Sidebar güncelleniyor...', gruplar);
    console.log('Veri türleri map:', veriTurleriMap);
    
    // Mevcut grup içeriğini temizle
    const mainSectionContent = document.getElementById('main-section-content');
    
    // Mevcut grupları temizle (sadece grup elementlerini)
    const existingGroups = mainSectionContent.querySelectorAll('.group');
    existingGroups.forEach(group => group.remove());
    
    // Supabase'den gelen her grup için yeni grup oluştur
    gruplar.forEach(grup => {
        console.log(`Grup oluşturuluyor: ${grup.grup_adi} (ID: ${grup.grup_id})`);
        
        // Bu grup için veri türlerini al
        const veriTurleri = veriTurleriMap[grup.grup_id] || [];
        console.log(`${grup.grup_adi} için veri türleri:`, veriTurleri);
        
        // Yeni grup elementi oluştur (veri türleri ile birlikte)
        const newGroup = createGroupElement(grup.grup_id, grup.grup_adi, veriTurleri);
        
        // Ana bölüme ekle
        mainSectionContent.appendChild(newGroup);
    });
    
    // Yeni eklenen elementlere event listener'ları ekle
    setTimeout(() => {
        addGroupHeaderEventListeners();
        addCheckboxEventListeners();
        addPriorityInputEventListeners();
    }, 100);
}
