import { getSupabaseClient, isSupabaseConnected } from './client.js';

// Belirli bir grup için veri türlerini çeken fonksiyon
export async function fetchVeriTurleriForGroup(grupId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri türleri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${grupId} grup ID'si için veri türleri çekiliyor...`);
    
    try {
        // 'veri_turleri' tablosundan grup_id'ye göre veri_id ve veri_adi kolonlarını çek
        const { data: veriTurleriData, error: veriTurleriError } = await supabaseClient
            .from('veri_turleri')
            .select('veri_id, veri_adi')
            .order('veri_id', { ascending: true })
            .eq('grup_id', grupId);
        
        if (veriTurleriError) {
            console.error('veri_turleri tablosu veri çekme hatası:', veriTurleriError.message);
            return null;
        }

        console.log(`${grupId} grup ID'si için veri türleri başarıyla çekildi:`, veriTurleriData);
        return veriTurleriData;
        
    } catch (error) {
        console.error('Veri türleri çekme hatası:', error);
        return null;
    }
}

// Tüm gruplar için veri türlerini toplu olarak çeken fonksiyon
export async function fetchAllVeriTurleri(gruplar) {
    if (!gruplar || gruplar.length === 0) {
        console.log('Grup verisi yok, veri türleri çekilemiyor');
        return {};
    }
    
    console.log('Tüm gruplar için veri türleri çekiliyor...');
    
    const veriTurleriMap = {};
    
    // Her grup için veri türlerini paralel olarak çek
    const promises = gruplar.map(async (grup) => {
        const veriTurleri = await fetchVeriTurleriForGroup(grup.grup_id);
        if (veriTurleri) {
            veriTurleriMap[grup.grup_id] = veriTurleri;
        }
    });
    
    // Tüm promise'ların tamamlanmasını bekle
    await Promise.all(promises);
    
    console.log('Tüm veri türleri çekildi:', veriTurleriMap);
    return veriTurleriMap;
}
