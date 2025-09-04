import { getSupabaseClient, isSupabaseConnected } from './client.js';

// Supabase'den senaryo tablosundan veri çeken fonksiyon
export async function fetchScenariosFromSupabase() {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, senaryo verileri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log("Supabase'den senaryo verileri çekiliyor...");
    
    try {
        // 'senaryo' tablosundan senaryo_id ve senaryo_adi kolonlarını çek
        const { data: scenarioData, error: scenarioError } = await supabaseClient
            .from('senaryo')
            .select('senaryo_id, senaryo_adi')
            .order('senaryo_id', { ascending: true });

        if (scenarioError) {
            console.error('senaryo tablosu veri çekme hatası:', scenarioError.message);
            return null;
        }

        console.log("Senaryo verileri başarıyla çekildi:", scenarioData);
        return scenarioData;
        
    } catch (error) {
        console.error('Senaryo veri çekme hatası:', error);
        return null;
    }
}

// Belirli bir senaryo ID'si için agirliklar tablosundan veri çeken fonksiyon
export async function fetchAgirliklarByScenarioId(senaryoId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, ağırlık verileri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${senaryoId} senaryo ID'si için ağırlık verileri çekiliyor...`);
    
    try {
        // 'agirliklar' tablosundan senaryo_id'ye göre veri_id ve metrik kolonlarını çek
        const { data: agirliklarData, error: agirliklarError } = await supabaseClient
            .from('agirliklar')
            .select('senaryo_id, veri_id, metrik')
            .eq('senaryo_id', senaryoId);
        
        if (agirliklarError) {
            console.error('agirliklar tablosu veri çekme hatası:', agirliklarError.message);
            return null;
        }

        console.log(`${senaryoId} senaryo ID'si için ağırlık verileri başarıyla çekildi:`, agirliklarData);
        return agirliklarData;
        
    } catch (error) {
        console.error('Ağırlık veri çekme hatası:', error);
        return null;
    }
}

// agirliklar ve veriler tablolarını birleştirip metrik ile değeri çarpan fonksiyon
export async function fetchAgirliklarWithVeriler(senaryoId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${senaryoId} senaryo ID'si için ağırlık ve veri bilgileri çekiliyor...`);
    
    try {
        // 1. Önce agirliklar tablosundan veri çek
        const { data: agirliklarData, error: agirliklarError } = await supabaseClient
            .from('agirliklar')
            .select('senaryo_id, veri_id, metrik')
            .eq('senaryo_id', senaryoId);
        
        if (agirliklarError) {
            console.error('agirliklar tablosu veri çekme hatası:', agirliklarError.message);
            return null;
        }
        
        if (!agirliklarData || agirliklarData.length === 0) {
            console.log(`${senaryoId} senaryo ID'si için ağırlık verisi bulunamadı`);
            return null;
        }
        
        // 2. Ağırlık verilerindeki veri_id'leri topla
        const veriIds = agirliklarData.map(agirlik => agirlik.veri_id);
        console.log(`Aranacak veri ID'leri:`, veriIds);
        
        // 3. veriler tablosundan bu veri_id'lere sahip kayıtları çek
        const { data: verilerData, error: verilerError } = await supabaseClient
            .from('veriler')
            .select('veri_id, il_id, deger')
            .in('veri_id', veriIds);
        
        if (verilerError) {
            console.error('veriler tablosu veri çekme hatası:', verilerError.message);
            return null;
        }
        
        // 4. Ağırlık ve veri bilgilerini birleştir
        const birlesikVeriler = [];
        
        agirliklarData.forEach(agirlik => {
            // Bu ağırlık verisi için eşleşen veri kayıtlarını bul
            const eslesenVeriler = verilerData.filter(veri => veri.veri_id === agirlik.veri_id);
            
            eslesenVeriler.forEach(veri => {
                const metrik = parseFloat(agirlik.metrik) || 0;
                const deger = parseFloat(veri.deger) || 0;
                const carpim = metrik * deger;
                
                birlesikVeriler.push({
                    il_id: veri.il_id,
                    veri_id: veri.veri_id,
                    metrik: metrik,
                    deger: deger,
                    carpim: carpim
                });
            });
        });
        
        console.log(`${senaryoId} senaryo ID'si için birleştirilmiş veriler:`, birlesikVeriler);
        return birlesikVeriler;
        
    } catch (error) {
        console.error('Veri birleştirme hatası:', error);
        return null;
    }
}

// agirliklar ve veriler tablolarını birleştirip il_id'ye göre çarpımları toplayan fonksiyon
export async function fetchAgirliklarWithVerilerToplam(senaryoId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${senaryoId} senaryo ID'si için ağırlık ve veri bilgileri çekiliyor...`);
    
    try {
        // 1. Önce agirliklar tablosundan veri çek
        const { data: agirliklarData, error: agirliklarError } = await supabaseClient
            .from('agirliklar')
            .select('senaryo_id, veri_id, metrik')
            .eq('senaryo_id', senaryoId);
        
        if (agirliklarError) {
            console.error('agirliklar tablosu veri çekme hatası:', agirliklarError.message);
            return null;
        }
        
        if (!agirliklarData || agirliklarData.length === 0) {
            console.log(`${senaryoId} senaryo ID'si için ağırlık verisi bulunamadı`);
            return null;
        }
        
        // 2. Ağırlık verilerindeki veri_id'leri topla
        const veriIds = agirliklarData.map(agirlik => agirlik.veri_id);
        console.log(`Aranacak veri ID'leri:`, veriIds);
        
        // 3. veriler tablosundan bu veri_id'lere sahip kayıtları çek
        const { data: verilerData, error: verilerError } = await supabaseClient
            .from('veriler')
            .select('veri_id, il_id, deger')
            .in('veri_id', veriIds);
        
        if (verilerError) {
            console.error('veriler tablosu veri çekme hatası:', verilerError.message);
            return null;
        }
        
        // 4. Ağırlık ve veri bilgilerini birleştir ve il_id'ye göre topla
        const ilToplamlari = {};
        
        agirliklarData.forEach(agirlik => {
            // Bu ağırlık verisi için eşleşen veri kayıtlarını bul
            const eslesenVeriler = verilerData.filter(veri => veri.veri_id === agirlik.veri_id);
            
            eslesenVeriler.forEach(veri => {
                const metrik = parseFloat(agirlik.metrik) || 0;
                const deger = parseFloat(veri.deger) || 0;
                const carpim = metrik * deger;
                
                const ilId = veri.il_id;
                
                // il_id'ye göre çarpımları topla
                if (!ilToplamlari[ilId]) {
                    ilToplamlari[ilId] = 0;
                }
                ilToplamlari[ilId] += carpim;
            });
        });
        
        // 5. Sonuçları düzenli formata çevir
        const sonuclar = Object.keys(ilToplamlari).map(ilId => ({
            il_id: parseInt(ilId),
            toplam_carpim: parseFloat(ilToplamlari[ilId].toFixed(4))
        }));
        
        console.log(`${senaryoId} senaryo ID'si için il bazında toplam çarpımlar:`, sonuclar);
        return sonuclar;
        
    } catch (error) {
        console.error('Veri birleştirme ve toplama hatası:', error);
        return null;
    }
}

// agirliklar ve veriler tablolarını birleştirip il_id'ye göre çarpımları toplayan ve toplam metrik değerine bölen fonksiyon
export async function fetchAgirliklarWithVerilerOrtalama(senaryoId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${senaryoId} senaryo ID'si için ağırlık ve veri bilgileri çekiliyor...`);
    
    try {
        // 1. Önce agirliklar tablosundan veri çek
        const { data: agirliklarData, error: agirliklarError } = await supabaseClient
            .from('agirliklar')
            .select('senaryo_id, veri_id, metrik')
            .eq('senaryo_id', senaryoId);
        
        if (agirliklarError) {
            console.error('agirliklar tablosu veri çekme hatası:', agirliklarError.message);
            return null;
        }
        
        if (!agirliklarData || agirliklarData.length === 0) {
            console.log(`${senaryoId} senaryo ID'si için ağırlık verisi bulunamadı`);
            return null;
        }
        
        // 2. Ağırlık verilerindeki veri_id'leri topla
        const veriIds = agirliklarData.map(agirlik => agirlik.veri_id);
        console.log(`Aranacak veri ID'leri:`, veriIds);
        
        // 3. veriler tablosundan bu veri_id'lere sahip kayıtları çek
        const { data: verilerData, error: verilerError } = await supabaseClient
            .from('veriler')
            .select('veri_id, il_id, deger')
            .in('veri_id', veriIds);
        
        if (verilerError) {
            console.error('veriler tablosu veri çekme hatası:', verilerError.message);
            return null;
        }
        
        // 4. Ağırlık ve veri bilgilerini birleştir ve il_id'ye göre topla
        const ilToplamlari = {};
        const ilMetrikToplamlari = {};
        
        agirliklarData.forEach(agirlik => {
            // Bu ağırlık verisi için eşleşen veri kayıtlarını bul
            const eslesenVeriler = verilerData.filter(veri => veri.veri_id === agirlik.veri_id);
            
            eslesenVeriler.forEach(veri => {
                const metrik = parseFloat(agirlik.metrik) || 0;
                const deger = parseFloat(veri.deger) || 0;
                const carpim = metrik * deger;
                
                const ilId = veri.il_id;
                
                // il_id'ye göre çarpımları topla
                if (!ilToplamlari[ilId]) {
                    ilToplamlari[ilId] = 0;
                }
                ilToplamlari[ilId] += carpim;
                
                // il_id'ye göre metrik değerlerini topla
                if (!ilMetrikToplamlari[ilId]) {
                    ilMetrikToplamlari[ilId] = 0;
                }
                ilMetrikToplamlari[ilId] += metrik;
            });
        });
        
        // 5. Sonuçları düzenli formata çevir (toplam çarpım / toplam metrik)
        const sonuclar = Object.keys(ilToplamlari).map(ilId => {
            const toplamCarpim = ilToplamlari[ilId];
            const toplamMetrik = ilMetrikToplamlari[ilId];
            const ortalama = toplamMetrik > 0 ? toplamCarpim / toplamMetrik : 0;
            
            return {
                il_id: parseInt(ilId),
                toplam_carpim: parseFloat(toplamCarpim.toFixed(4)),
                toplam_metrik: parseFloat(toplamMetrik.toFixed(4)),
                ortalama: parseFloat(ortalama.toFixed(4))
            };
        });
        
        console.log(`${senaryoId} senaryo ID'si için il bazında ortalama değerler:`, sonuclar);
        return sonuclar;
        
    } catch (error) {
        console.error('Veri birleştirme ve ortalama hesaplama hatası:', error);
        return null;
    }
}

// agirliklar ve veriler tablolarını birleştirip il_id'ye göre yatırım puanı hesaplayan fonksiyon
export async function fetchAgirliklarWithVerilerYatirimPuani(senaryoId) {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log(`${senaryoId} senaryo ID'si için yatırım puanı hesaplanıyor...`);
    
    try {
        // 1. Önce agirliklar tablosundan veri çek
        const { data: agirliklarData, error: agirliklarError } = await supabaseClient
            .from('agirliklar')
            .select('senaryo_id, veri_id, metrik')
            .eq('senaryo_id', senaryoId);
        
        if (agirliklarError) {
            console.error('agirliklar tablosu veri çekme hatası:', agirliklarError.message);
            return null;
        }
        
        if (!agirliklarData || agirliklarData.length === 0) {
            console.log(`${senaryoId} senaryo ID'si için ağırlık verisi bulunamadı`);
            return null;
        }
        
        // 2. Ağırlık verilerindeki veri_id'leri topla
        const veriIds = agirliklarData.map(agirlik => agirlik.veri_id);
        console.log(`Aranacak veri ID'leri:`, veriIds);
        
        // 3. veriler tablosundan bu veri_id'lere sahip kayıtları çek
        const { data: verilerData, error: verilerError } = await supabaseClient
            .from('veriler')
            .select('veri_id, il_id, deger')
            .in('veri_id', veriIds);
        
        if (verilerError) {
            console.error('veriler tablosu veri çekme hatası:', verilerError.message);
            return null;
        }
        
        // 4. Ağırlık ve veri bilgilerini birleştir ve il_id'ye göre topla
        const ilToplamlari = {};
        const ilMetrikToplamlari = {};
        
        agirliklarData.forEach(agirlik => {
            // Bu ağırlık verisi için eşleşen veri kayıtlarını bul
            const eslesenVeriler = verilerData.filter(veri => veri.veri_id === agirlik.veri_id);
            
            eslesenVeriler.forEach(veri => {
                const metrik = parseFloat(agirlik.metrik) || 0;
                const deger = parseFloat(veri.deger) || 0;
                const carpim = metrik * deger;
                
                const ilId = veri.il_id;
                
                // il_id'ye göre çarpımları topla
                if (!ilToplamlari[ilId]) {
                    ilToplamlari[ilId] = 0;
                }
                ilToplamlari[ilId] += carpim;
                
                // il_id'ye göre metrik değerlerini topla
                if (!ilMetrikToplamlari[ilId]) {
                    ilMetrikToplamlari[ilId] = 0;
                }
                ilMetrikToplamlari[ilId] += metrik;
            });
        });
        
        // 5. Sonuçları düzenli formata çevir (toplam çarpım / toplam metrik) * 100
        const sonuclar = Object.keys(ilToplamlari).map(ilId => {
            const toplamCarpim = ilToplamlari[ilId];
            const toplamMetrik = ilMetrikToplamlari[ilId];
            const ortalama = toplamMetrik > 0 ? toplamCarpim / toplamMetrik : 0;
            const yatirimPuani = ortalama * 100;
            
            return {
                il_id: parseInt(ilId),
                yatirim_puani: parseFloat(yatirimPuani.toFixed(2))
            };
        });
        
        console.log(`${senaryoId} senaryo ID'si için il bazında yatırım puanları:`, sonuclar);
        return sonuclar;
        
    } catch (error) {
        console.error('Veri birleştirme ve yatırım puanı hesaplama hatası:', error);
        return null;
    }
}
