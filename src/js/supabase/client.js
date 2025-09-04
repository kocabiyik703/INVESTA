// Supabase veritabanına bağlanmak için gerekli bilgiler
const SUPABASE_URL = 'https://hiozpvnfuqdoomjwsqvw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpb3pwdm5mdXFkb29tandzcXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjQyNzMsImV4cCI6MjA3MTAwMDI3M30.sAWeHUaZCwnPlwNhE6y165hqYg1nAP2IzklddOEdhT4';

// Supabase istemcisini oluştur
let supabaseClient = null;

function initializeSupabase() {
    try {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase bağlantısı başarıyla kuruldu');
            return true;
        } else {
            console.error('Supabase client library yüklenmemiş');
            return false;
        }
    } catch (error) {
        console.error('Supabase bağlantısı kurulamadı:', error);
        return false;
    }
}

function getSupabaseClient() {
    return supabaseClient;
}

function isSupabaseConnected() {
    return supabaseClient !== null;
}

// Export functions
export { initializeSupabase, getSupabaseClient, isSupabaseConnected };
