import { PARAMETER_PAYROLL_2026 as P } from '../data/initialData';

export type StatusSertifikat = 'Aktif' | 'Perlu Perpanjangan (H-90)' | 'Kedaluwarsa';

const MS_PER_HARI = 86400000;
const AMBANG_PERPANJANGAN_HARI = 90;

export function hitungSisaHari(tanggalTujuan: string, dari: Date = new Date()) {
  const awal = new Date(dari.toISOString().split('T')[0]).getTime();
  const akhir = new Date(tanggalTujuan).getTime();
  if (Number.isNaN(akhir)) return 0;
  return Math.round((akhir - awal) / MS_PER_HARI);
}

export function statusSertifikat(masaBerlaku: string, dari: Date = new Date()): StatusSertifikat {
  const sisaHari = hitungSisaHari(masaBerlaku, dari);
  if (sisaHari < 0) return 'Kedaluwarsa';
  if (sisaHari <= AMBANG_PERPANJANGAN_HARI) return 'Perlu Perpanjangan (H-90)';
  return 'Aktif';
}

export function menitDariJam(jam: string) {
  const [h, m] = jam.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

// Selisih jam kerja lintas tengah malam (Shift 3: 23.00-07.00) dihitung sebagai hari berikutnya.
export function hitungMenitKerja(jamMasuk: string, jamKeluar: string) {
  const masuk = menitDariJam(jamMasuk);
  const keluar = menitDariJam(jamKeluar);
  if (Number.isNaN(masuk) || Number.isNaN(keluar)) return 0;
  return keluar >= masuk ? keluar - masuk : keluar + 1440 - masuk;
}

const JAM_MULAI_KERJA = ['07:00', '08:00', '15:00', '23:00'];

// Jam masuk dinilai terhadap jam kerja terdekat: tiga shift pabrik 24/7 ditambah jam masuk kantor
// 08.00. Jam yang lebih dari 2 jam dari acuan terdekat dianggap bukan absensi shift biasa (mis.
// clock-in lapangan pukul 18.51) sehingga tidak dihitung terlambat.
export function evaluasiKeterlambatan(jamMasuk: string, jamMulaiList: string[] = JAM_MULAI_KERJA) {
  const masuk = menitDariJam(jamMasuk);
  if (Number.isNaN(masuk)) return { jamAcuan: null as string | null, menitTerlambat: 0 };

  let acuan: string | null = null;
  let jarakTerdekat = Infinity;
  let selisihMaju = 0;
  for (const mulai of jamMulaiList) {
    const selisih = (masuk - menitDariJam(mulai) + 1440) % 1440;
    const jarak = Math.min(selisih, 1440 - selisih);
    if (jarak < jarakTerdekat) {
      jarakTerdekat = jarak;
      // Selisih > 12 jam berarti clock-in terjadi sebelum acuan, bukan sesudahnya.
      selisihMaju = selisih > 720 ? 0 : selisih;
      acuan = mulai;
    }
  }

  if (acuan === null || jarakTerdekat > 120) return { jamAcuan: null, menitTerlambat: 0 };
  return {
    jamAcuan: acuan,
    menitTerlambat: Math.max(selisihMaju - P.toleransiKeterlambatanMenit, 0)
  };
}

export function hitungPotonganKeterlambatan(menitTerlambat: number) {
  const jumlahJam = Math.ceil(menitTerlambat / 60);
  return jumlahJam * P.potonganPerJamTerlambat;
}

export function hitungJarakKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (derajat: number) => (derajat * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function verifikasiGeofence(jarakKm: number, radiusMeter: number) {
  const dalamPagar = jarakKm * 1000 <= radiusMeter;
  return {
    dalamPagar,
    label: dalamPagar
      ? `Valid — radius ${Math.round(jarakKm * 1000)} m di dalam pagar geofence ${radiusMeter} m`
      : `Ditolak — radius ${Math.round(jarakKm * 1000)} m di luar pagar geofence ${radiusMeter} m`
  };
}

export function hitungOee(ketersediaanPersen: number, performaPersen: number, kualitasPersen: number) {
  const oee = (ketersediaanPersen / 100) * (performaPersen / 100) * (kualitasPersen / 100) * 100;
  return Math.round(oee * 10) / 10;
}

export function hitungInsentifProduksi(outputUnit: number, tarifPerUnit: number, tingkatRejectPersen: number) {
  const unitLolos = outputUnit * (1 - tingkatRejectPersen / 100);
  return Math.round(unitLolos * tarifPerUnit);
}
