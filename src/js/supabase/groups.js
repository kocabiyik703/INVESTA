import { getSupabaseClient, isSupabaseConnected } from './client.js';

// Supabase'den grup tablosundan veri çeken fonksiyon
export async function fetchGruplarFromSupabase() {
    if (!isSupabaseConnected()) {
        console.log('Supabase bağlantısı kurulmamış, veri çekilemiyor');
        return null;
    }
    
    const supabaseClient = getSupabaseClient();
    console.log("Supabase'den grup verileri çekiliyor...");
    
    try {
        // 'grup' tablosundan grup_id ve grup_adi kolonlarını çek
        const { data: grupData, error: grupError } = await supabaseClient
            .from('grup')
            .select('grup_id, grup_adi')
            .order('grup_id', { ascending: true });

        if (grupError) {
            console.error('grup tablosu veri çekme hatası:', grupError.message);
            return null;
        }

        console.log("Grup verileri başarıyla çekildi:", grupData);
        return grupData;
        
    } catch (error) {
        console.error('Veri çekme hatası:', error);
        return null;
    }
}
