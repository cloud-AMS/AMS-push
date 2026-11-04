import { ReactNode } from 'react';
import {
  Modal,
  formatRupiah,
  formatTanggal,
  formatPersen,
  inputClass,
  labelClass,
  tombolSekunder,
  tombolBahaya,
  chipFilter,
  type Tone
} from '../../commercial/sales/ui';
import { JejakPergerakan, StatusStokFisik, UserRole } from '../../../../types';

export {
  Modal,
  formatRupiah,
  formatTanggal,
  formatPersen,
  inputClass,
  labelClass,
  tombolSekunder,
  tombolBahaya,
  chipFilter,
  type Tone
};

export type GudangTabId =
  | 'dasbor'
  | 'struktur'
  | 'stok'
  | 'rantai-dingin'
  | 'hama'
  | 'inbound'
  | 'outbound'
  | 'opname'
  | 'optimasi'
  | 'scanner'
  | 'recall'
  | 'pemerintah';

export const TAB_NOMOR_KE_ID: Record<number, GudangTabId> = {
  1: 'dasbor',
  2: 'struktur',
  3: 'stok',
  4: 'rantai-dingin',
  5: 'hama',
  6: 'inbound',
  7: 'outbound',
  8: 'opname',
  9: 'optimasi',
  10: 'scanner',
  11: 'recall',
  12: 'pemerintah'
};

/** Tanggal acuan benih (M3/M4 kontrak) agar bets 2024–2025 tidak dinilai kedaluwarsa oleh jam sistem 2026. */
export const TANGGAL_ACUAN_BENIH = '2024-06-15';

export function buatTanggalAcuan(isoTanggal: string): Date {
  const parsed = new Date(`${isoTanggal}T08:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date('2024-06-15T08:00:00') : parsed;
}

/** Menjamin stempel waktu mutasi pergerakan tidak pernah mundur dari mata rantai terakhir (menjaga sha256 chain). */
export function waktuMutasiMonoton(dariAcuan: Date, daftarPergerakan: JejakPergerakan[]): Date {
  let maks = dariAcuan.getTime();
  if (daftarPergerakan.length > 0) {
    const terakhir = daftarPergerakan[daftarPergerakan.length - 1];
    const parsed = Date.parse(terakhir.waktu.replace(' ', 'T'));
    if (!Number.isNaN(parsed) && parsed >= maks) {
      maks = parsed + 60_000;
    }
  }
  return new Date(maks);
}

export function identitasPeranGudang(role: UserRole): {
  pengguna: string;
  peran: string;
  bolehVerifikasiPjt: boolean;
} {
  switch (role) {
    case 'pjt':
      return { pengguna: 'Apt. Sari Dewi, S.Farm (PJT)', peran: 'Penanggung Jawab Teknis', bolehVerifikasiPjt: true };
    case 'qa_manager':
      return { pengguna: 'Manajer QA & Mutu', peran: 'Quality Assurance', bolehVerifikasiPjt: true };
    case 'qc_officer':
      return { pengguna: 'Inspektur QC Gudang', peran: 'Quality Control', bolehVerifikasiPjt: false };
    case 'kepala_gudang':
      return { pengguna: 'Kepala Gudang CDAKB', peran: 'Operations & Technical', bolehVerifikasiPjt: false };
    case 'teknisi_elektromedik':
      return { pengguna: 'Teknisi Elektromedik', peran: 'Operations & Technical', bolehVerifikasiPjt: false };
    case 'purchasing':
      return { pengguna: 'Staf Pengadaan Alkes', peran: 'Purchasing & Procurement', bolehVerifikasiPjt: false };
    case 'auditor_internal':
      return { pengguna: 'Auditor Mutu Internal', peran: 'Regulatory Affairs', bolehVerifikasiPjt: false };
    default:
      return { pengguna: 'Kepala Gudang', peran: 'Operations & Technical', bolehVerifikasiPjt: false };
  }
}

export function toneStatusStok(status?: StatusStokFisik): Tone {
  switch (status ?? 'AVAILABLE') {
    case 'AVAILABLE':
      return 'emerald';
    case 'RESERVED':
      return 'blue';
    case 'QUARANTINE':
      return 'amber';
    case 'DAMAGED':
    case 'EXPIRED_LOCK':
      return 'rose';
  }
}

const BADGE_TONE: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200'
};

const STAT_TONE: Record<Tone, string> = {
  slate: 'text-slate-900',
  emerald: 'text-emerald-700',
  blue: 'text-blue-700',
  amber: 'text-amber-700',
  rose: 'text-rose-700'
};

/** Primitif selaras token tipografi global (text-2xs / text-xs / text-sm / text-xl, tanpa ukuran arbitrer). */
export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold border whitespace-nowrap ${BADGE_TONE[tone]}`}>
      {children}
    </span>
  );
}

export function Panel({
  judul,
  keterangan,
  aksi,
  children
}: {
  judul: string;
  keterangan?: string;
  aksi?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs">
      <header className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{judul}</h3>
          {keterangan && <p className="text-xs text-slate-500 mt-0.5 max-w-3xl leading-relaxed">{keterangan}</p>}
        </div>
        {aksi && <div className="flex items-center gap-2 flex-wrap shrink-0">{aksi}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = 'slate'
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className={`text-xl font-bold mt-1 tabular-nums ${STAT_TONE[tone]}`}>{value}</div>
      {hint && <div className="text-2xs text-slate-500 mt-1 leading-relaxed">{hint}</div>}
    </div>
  );
}

export function BarCapaian({ label, persen, hint }: { label: string; persen: number; hint?: string }) {
  const lebar = Math.max(0, Math.min(persen, 100));
  const tone = persen >= 100 ? 'bg-emerald-600' : persen >= 70 ? 'bg-blue-600' : persen >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-mono tabular-nums text-slate-600">{persen.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${lebar}%` }} />
      </div>
      {hint && <p className="text-2xs text-slate-500 mt-1 leading-relaxed">{hint}</p>}
    </div>
  );
}

export const tombolPrimerGudang =
  'px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer whitespace-nowrap';
