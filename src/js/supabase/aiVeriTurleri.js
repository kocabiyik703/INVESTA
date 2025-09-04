import { getSupabaseClient, isSupabaseConnected } from './client.js';

// AI Assistant için tüm veri türlerini çeken fonksiyon
export async function fetchAllVeriTurleriForAI() {
    if (!isSupabaseConnected()) {
        console.log('❌ Supabase bağlantısı kurulmamış, AI için veri türleri çekilemiyor');
        return [];
    }
    
    const supabaseClient = getSupabaseClient();
    console.log('🔄 AI Assistant için tüm veri türleri çekiliyor...');
    
    try {
        // 'veri_turleri' tablosundan tüm veri_adi ve senaryo_aciklamasi'ları çek
        const { data: veriTurleriData, error: veriTurleriError } = await supabaseClient
            .from('veri_turleri')
            .select('veri_adi, senaryo_aciklamasi')
            .order('veri_adi', { ascending: true });
        
        if (veriTurleriError) {
            console.error('❌ veri_turleri tablosu veri çekme hatası:', veriTurleriError.message);
            return [];
        }

        // Veri adı ve açıklamaları çıkar
        const veriTurleri = veriTurleriData.map(item => ({
            veri_adi: item.veri_adi,
            senaryo_aciklamasi: item.senaryo_aciklamasi || ''
        }));
        
        console.log(`✅ AI Assistant için ${veriTurleri.length} veri türü çekildi:`, veriTurleri);
        return veriTurleri;
        
    } catch (error) {
        console.error('💥 AI için veri türleri çekme hatası:', error);
        return [];
    }
}
