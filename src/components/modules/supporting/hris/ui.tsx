import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { formatRupiah } from '../../../../utils/payroll';

export { formatRupiah };

export type Tone = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose';

const BADGE_TONE: Record<Tone, string> = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200'
};

const STAT_TONE: Record<Tone, string> = {
  slate: 'text-slate-900',
  blue: 'text-blue-700',
  emerald: 'text-emerald-700',
  amber: 'text-amber-700',
  rose: 'text-rose-700'
};

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatTanggal(iso: string) {
  if (!iso || iso === '-') return '-';
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return iso;
  return `${tanggal.getDate()} ${NAMA_BULAN[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${BADGE_TONE[tone]}`}>
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
          {keterangan && <p className="text-[11px] text-slate-500 mt-0.5 max-w-3xl leading-relaxed">{keterangan}</p>}
        </div>
        {aksi}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint, tone = 'slate' }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${STAT_TONE[tone]}`}>{value}</div>
      {hint && <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{hint}</div>}
    </div>
  );
}

export function Modal({
  judul,
  keterangan,
  onClose,
  children
}: {
  judul: string;
  keterangan?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h3 className="font-bold text-base text-slate-900">{judul}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {keterangan && <p className="text-xs text-slate-500 mb-4">{keterangan}</p>}
        {children}
      </div>
    </div>
  );
}

export const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-xs';
export const labelClass = 'block font-semibold text-slate-700 mb-1 text-xs';
export const tombolPrimer =
  'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer';
export const tombolSekunder =
  'px-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 hover:bg-slate-100 cursor-pointer';
