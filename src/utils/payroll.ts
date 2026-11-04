import { PARAMETER_PAYROLL_2026 as P } from '../data/initialData';
import { SlipGaji } from '../types';

const bulatkanRatusan = (nilai: number) => Math.round(nilai / 100) * 100;

export function hitungUpahPerJam(gajiPokok: number) {
  return Math.round(gajiPokok / P.pembagiUpahPerJam);
}

// Upah lembur UU Ketenagakerjaan: jam pertama 1,5x, jam berikutnya 2x upah sejam (1/173 upah sebulan).
export function hitungUpahLembur(gajiPokok: number, jamLembur: number) {
  const upahPerJam = hitungUpahPerJam(gajiPokok);
  if (jamLembur <= 0) return { upahPerJam, totalLembur: 0 };
  const jamPertama = Math.min(jamLembur, 1);
  const jamBerikutnya = Math.max(jamLembur - 1, 0);
  const totalLembur = Math.round(
    upahPerJam * P.faktorLemburJamPertama * jamPertama +
      upahPerJam * P.faktorLemburJamBerikutnya * jamBerikutnya
  );
  return { upahPerJam, totalLembur };
}

export interface RincianBpjs {
  dasarUpahJp: number;
  kesehatanKaryawan: number;
  kesehatanPerusahaan: number;
  jhtKaryawan: number;
  jhtPerusahaan: number;
  jpKaryawan: number;
  jpPerusahaan: number;
  totalKaryawan: number;
  totalPerusahaan: number;
}

export function hitungBpjs(gajiPokok: number): RincianBpjs {
  const dasarUpahJp = Math.min(gajiPokok, P.batasAtasUpahJp);
  const kesehatanKaryawan = bulatkanRatusan((gajiPokok * P.bpjsKesehatanKaryawanPersen) / 100);
  const kesehatanPerusahaan = bulatkanRatusan((gajiPokok * P.bpjsKesehatanPerusahaanPersen) / 100);
  const jhtKaryawan = bulatkanRatusan((gajiPokok * P.bpjsJhtKaryawanPersen) / 100);
  const jhtPerusahaan = bulatkanRatusan((gajiPokok * P.bpjsJhtPerusahaanPersen) / 100);
  const jpKaryawan = bulatkanRatusan((dasarUpahJp * P.bpjsJpKaryawanPersen) / 100);
  const jpPerusahaan = bulatkanRatusan((dasarUpahJp * P.bpjsJpPerusahaanPersen) / 100);

  return {
    dasarUpahJp,
    kesehatanKaryawan,
    kesehatanPerusahaan,
    jhtKaryawan,
    jhtPerusahaan,
    jpKaryawan,
    jpPerusahaan,
    totalKaryawan: kesehatanKaryawan + jhtKaryawan + jpKaryawan,
    totalPerusahaan: kesehatanPerusahaan + jhtPerusahaan + jpPerusahaan
  };
}

export interface RincianPph21 {
  brutoTahunan: number;
  biayaJabatan: number;
  nettoTahunan: number;
  pkpTahunan: number;
  pajakTahunan: number;
  pajakBulanan: number;
}

// PPh 21 tahunan disetahunkan: bruto - biaya jabatan (5%, maks 6 juta) - iuran pensiun/JHT karyawan - PTKP,
// lalu dikenakan tarif Pasal 17 ayat (1) huruf a UU PPh secara berlapis.
export function hitungPph21(brutoBulanan: number, iuranPensiunBulanan: number, ptkpTahunan = P.ptkpTK0): RincianPph21 {
  const brutoTahunan = Math.round(brutoBulanan * 12);
  const biayaJabatan = Math.min(Math.round((brutoTahunan * P.biayaJabatanPersen) / 100), P.biayaJabatanMaksTahunan);
  const nettoTahunan = brutoTahunan - biayaJabatan - Math.round(iuranPensiunBulanan * 12);
  const pkpTahunan = Math.max(Math.floor((nettoTahunan - ptkpTahunan) / 1000) * 1000, 0);

  let sisaPkp = pkpTahunan;
  let batasBawah = 0;
  let pajakTahunan = 0;
  for (const lapis of P.tarifPph21Berlapis) {
    if (sisaPkp <= 0) break;
    const lebarLapis = Math.min(sisaPkp, lapis.sampaiDengan - batasBawah);
    pajakTahunan += Math.round((lebarLapis * lapis.tarifPersen) / 100);
    sisaPkp -= lebarLapis;
    batasBawah = lapis.sampaiDengan;
  }

  return { brutoTahunan, biayaJabatan, nettoTahunan, pkpTahunan, pajakTahunan, pajakBulanan: Math.round(pajakTahunan / 12) };
}

// Metode Gross Up: perusahaan menanggung pajak melalui tunjangan pajak sehingga
// penerimaan bersih karyawan tidak berkurang. Dicari dengan iterasi sampai konvergen.
export function hitungTunjanganPajak(brutoBulanan: number, iuranPensiunBulanan: number, ptkpTahunan = P.ptkpTK0) {
  let tunjanganPajak = 0;
  for (let iterasi = 0; iterasi < 25; iterasi++) {
    const { pajakBulanan } = hitungPph21(brutoBulanan + tunjanganPajak, iuranPensiunBulanan, ptkpTahunan);
    if (Math.abs(pajakBulanan - tunjanganPajak) < 500) return pajakBulanan;
    tunjanganPajak = pajakBulanan;
  }
  return tunjanganPajak;
}

export interface InputSlipGaji {
  periode: string;
  karyawanId: string;
  nama: string;
  gajiPokok: number;
  tunjanganKehadiran: number;
  insentifSales: number;
  insentifProduksi: number;
  potonganAbsensi: number;
  lembur: number;
  metodePph21: SlipGaji['metodePph21'];
  ptkpTahunan?: number;
}

export interface HasilSlipGaji extends Omit<SlipGaji, 'id' | 'status'> {
  bruto: number;
  biayaJabatan: number;
  pkpTahunan: number;
  pph21Tahunan: number;
  bpjsKesehatanPerusahaan: number;
  bpjsJhtPerusahaan: number;
  bpjsJpPerusahaan: number;
  totalBebanPerusahaan: number;
}

export function hitungSlipGaji(input: InputSlipGaji): HasilSlipGaji {
  const ptkpTahunan = input.ptkpTahunan ?? P.ptkpTK0;
  const bpjs = hitungBpjs(input.gajiPokok);
  const iuranPensiunBulanan = bpjs.jhtKaryawan + bpjs.jpKaryawan;

  const brutoSebelumPajak =
    input.gajiPokok +
    input.tunjanganKehadiran +
    input.insentifSales +
    input.insentifProduksi +
    input.lembur -
    input.potonganAbsensi;

  let pph21 = 0;
  let tunjanganPajak = 0;
  if (input.metodePph21 === 'Gross Up') {
    tunjanganPajak = hitungTunjanganPajak(brutoSebelumPajak, iuranPensiunBulanan, ptkpTahunan);
    pph21 = tunjanganPajak;
  } else if (input.metodePph21 === 'Gross') {
    pph21 = hitungPph21(brutoSebelumPajak, iuranPensiunBulanan, ptkpTahunan).pajakBulanan;
  }

  const dasarPph = hitungPph21(brutoSebelumPajak + tunjanganPajak, iuranPensiunBulanan, ptkpTahunan);
  const bruto = brutoSebelumPajak + tunjanganPajak;
  const takeHomePay = bruto - bpjs.totalKaryawan - pph21;

  return {
    periode: input.periode,
    karyawanId: input.karyawanId,
    nama: input.nama,
    gajiPokok: input.gajiPokok,
    tunjanganKehadiran: input.tunjanganKehadiran,
    insentifSales: input.insentifSales,
    insentifProduksi: input.insentifProduksi,
    potonganAbsensi: input.potonganAbsensi,
    lembur: input.lembur,
    bpjsKesehatanKaryawan: bpjs.kesehatanKaryawan,
    bpjsJhtKaryawan: bpjs.jhtKaryawan,
    bpjsJpKaryawan: bpjs.jpKaryawan,
    pph21,
    tunjanganPajak,
    metodePph21: input.metodePph21,
    takeHomePay,
    bruto,
    biayaJabatan: dasarPph.biayaJabatan,
    pkpTahunan: dasarPph.pkpTahunan,
    pph21Tahunan: dasarPph.pajakTahunan,
    bpjsKesehatanPerusahaan: bpjs.kesehatanPerusahaan,
    bpjsJhtPerusahaan: bpjs.jhtPerusahaan,
    bpjsJpPerusahaan: bpjs.jpPerusahaan,
    totalBebanPerusahaan: bruto + bpjs.totalPerusahaan + (input.metodePph21 === 'Net' ? dasarPph.pajakBulanan : 0)
  };
}

export const formatRupiah = (nilai: number) =>
  'Rp ' + Math.round(nilai).toLocaleString('id-ID');
