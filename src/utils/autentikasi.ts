import type { UserRole } from '../types';

/**
 * Gerbang masuk aplikasi. Kredensial ikut terbungkus di berkas sisi klien, jadi ini
 * pembatas tampilan halaman — bukan batas keamanan: isi localStorage pengunjung mana pun
 * tetap terbaca tanpa kata sandi.
 */
export const AKUN_BAWAAN = { namaPengguna: 'admin', kataSandi: 'admin123', peran: 'pjt' as UserRole };

const KUNCI_SESI = 'ams_alkes_sesi_login';

export interface SesiLogin {
  namaPengguna: string;
  peran: UserRole;
  masukPada: string;
}

export function bacaSesi(): SesiLogin | null {
  try {
    const mentah = localStorage.getItem(KUNCI_SESI);
    if (!mentah) return null;
    const sesi = JSON.parse(mentah) as SesiLogin;
    return sesi && sesi.namaPengguna === AKUN_BAWAAN.namaPengguna ? sesi : null;
  } catch {
    return null;
  }
}

export function cobaMasuk(namaPengguna: string, kataSandi: string): SesiLogin | null {
  if (namaPengguna.trim() !== AKUN_BAWAAN.namaPengguna || kataSandi !== AKUN_BAWAAN.kataSandi) return null;
  const sesi: SesiLogin = {
    namaPengguna: AKUN_BAWAAN.namaPengguna,
    peran: AKUN_BAWAAN.peran,
    masukPada: new Date().toISOString()
  };
  try {
    localStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
  } catch {
    /* sesi tetap berlaku sampai halaman ditutup bila penyimpanan penuh */
  }
  return sesi;
}

export function akhiriSesi(): void {
  try {
    localStorage.removeItem(KUNCI_SESI);
  } catch {
    /* tidak ada yang bisa dibersihkan bila penyimpanan tidak tersedia */
  }
}
