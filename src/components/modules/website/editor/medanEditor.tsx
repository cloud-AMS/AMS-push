/**
 * RENDERER MEDAN GENERIK — satu komponen untuk semua jenis medan konten website.
 *
 * Nilai diakses lewat jalur bertitik (mis. 'kepala.judul') sehingga seksi dengan
 * struktur bersarang tetap memakai definisi medan yang sama.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2 } from 'lucide-react';
import { HalamanWebsite, TautanWebsite } from '../../../../types';
import { kompresGambarWebsite, selesaikanGambar, simpanMediaWebsite } from '../../../../utils/website';
import type { Medan, NilaiMedan } from '../skema';

export const KELAS_INPUT =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none';
export const KELAS_LABEL = 'block font-semibold text-slate-700 text-xs mb-1';

const HALAMAN: HalamanWebsite[] = ['beranda', 'produk', 'solusi', 'layanan', 'sumber-daya', 'tentang', 'kontak'];
const LABEL_HALAMAN: Record<HalamanWebsite, string> = {
  beranda: 'Beranda',
  produk: 'Produk',
  solusi: 'Solusi',
  layanan: 'Layanan',
  'sumber-daya': 'Sumber Daya',
  tentang: 'Tentang Kami',
  kontak: 'Kontak'
};

export function ambilJalur(objek: unknown, jalur: string): NilaiMedan {
  return jalur.split('.').reduce<unknown>((acc, bagian) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[bagian];
  }, objek) as NilaiMedan;
}

/** Klon tidak-mutasi sepanjang jalur; bagian antara yang hilang dibuat sebagai objek. */
export function setJalur<T>(objek: T, jalur: string, nilai: unknown): T {
  const bagian = jalur.split('.');
  const ganti = (acc: unknown, kedalaman: number): unknown => {
    const kunci = bagian[kedalaman];
    const dasar = (acc ?? {}) as Record<string, unknown>;
    const salinan = Array.isArray(acc) ? [...(acc as unknown[])] : { ...dasar };
    if (kedalaman === bagian.length - 1) {
      (salinan as Record<string, unknown>)[kunci] = nilai;
      return salinan;
    }
    (salinan as Record<string, unknown>)[kunci] = ganti(dasar[kunci], kedalaman + 1);
    return salinan;
  };
  return ganti(objek, 0) as T;
}

function Bacaan({ petunjuk }: { petunjuk?: string }) {
  if (!petunjuk) return null;
  return <p className="text-2xs text-slate-500 mt-1 leading-relaxed">{petunjuk}</p>;
}

function MedanTeks({
  nilai,
  onChange,
  multiline,
  rows,
  placeholder
}: {
  nilai: unknown;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  if (multiline) {
    return (
      <textarea
        value={String(nilai ?? '')}
        rows={rows ?? 3}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${KELAS_INPUT} resize-y leading-relaxed`}
      />
    );
  }
  return (
    <input
      type="text"
      value={String(nilai ?? '')}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={KELAS_INPUT}
    />
  );
}

/** Daftar string dengan satu baris per butir; state lokal menjaga baris kosong saat mengetik. */
function MedanDaftarTeks({ nilai, onChange }: { nilai: unknown; onChange: (v: string[]) => void }) {
  const daftar = Array.isArray(nilai) ? (nilai as unknown[]).map((n) => String(n ?? '')) : [];
  const [teks, setTeks] = useState(daftar.join('\n'));
  const suarKeluar = useRef(teks);
  const pantul = daftar.join('\n');

  useEffect(() => {
    if (pantul !== suarKeluar.current) {
      suarKeluar.current = pantul;
      setTeks(pantul);
    }
  }, [pantul]);

  return (
    <textarea
      value={teks}
      rows={Math.max(3, daftar.length + 1)}
      placeholder={'Satu butir per baris'}
      onChange={(e) => {
        const baru = e.target.value;
        suarKeluar.current = baru;
        setTeks(baru);
        onChange(
          baru
            .split('\n')
            .map((b) => b.trim())
            .filter(Boolean)
        );
      }}
      className={`${KELAS_INPUT} resize-y font-mono leading-relaxed`}
    />
  );
}

function MedanAngka({ nilai, onChange }: { nilai: unknown; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={Number(nilai ?? 0)}
      onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
      className={KELAS_INPUT}
    />
  );
}

function MedanPilihan({
  nilai,
  opsi,
  onChange,
  labelOpsi
}: {
  nilai: unknown;
  opsi: string[];
  onChange: (v: string) => void;
  labelOpsi?: (o: string) => string;
}) {
  return (
    <select value={String(nilai ?? '')} onChange={(e) => onChange(e.target.value)} className={KELAS_INPUT}>
      {!opsi.includes(String(nilai ?? '')) && <option value={String(nilai ?? '')}>{String(nilai ?? '(kosong)')}</option>}
      {opsi.map((o) => (
        <option key={o} value={o}>
          {labelOpsi ? labelOpsi(o) : o}
        </option>
      ))}
    </select>
  );
}

const TIPE_TAUTAN: TautanWebsite['tipe'][] = ['halaman', 'url', 'whatsapp', 'email', 'telepon'];
const LABEL_TIPE: Record<TautanWebsite['tipe'], string> = {
  halaman: 'Halaman situs',
  url: 'URL luar',
  whatsapp: 'WhatsApp',
  email: 'Surel',
  telepon: 'Telepon'
};

function MedanTautan({ nilai, onChange }: { nilai: unknown; onChange: (v: TautanWebsite) => void }) {
  const tautan = (nilai ?? { tipe: 'halaman' }) as TautanWebsite;
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        value={tautan.tipe}
        onChange={(e) => {
          const tipe = e.target.value as TautanWebsite['tipe'];
          onChange({ tipe, nilai: tipe === 'halaman' ? 'beranda' : undefined });
        }}
        className={KELAS_INPUT}
      >
        {TIPE_TAUTAN.map((t) => (
          <option key={t} value={t}>
            {LABEL_TIPE[t]}
          </option>
        ))}
      </select>
      {tautan.tipe === 'halaman' ? (
        <select
          value={String(tautan.nilai ?? 'beranda')}
          onChange={(e) => onChange({ tipe: 'halaman', nilai: e.target.value })}
          className={KELAS_INPUT}
        >
          {HALAMAN.map((h) => (
            <option key={h} value={h}>
              {LABEL_HALAMAN[h]}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={String(tautan.nilai ?? '')}
          placeholder={tautan.tipe === 'whatsapp' ? '628123456789' : tautan.tipe === 'email' ? 'pjt@anugrahmitraselaras.co.id' : 'https://'}
          onChange={(e) => onChange({ tipe: tautan.tipe, nilai: e.target.value })}
          className={KELAS_INPUT}
        />
      )}
    </div>
  );
}

function MedanGambar({
  nilai,
  onChange,
  petunjuk
}: {
  nilai: unknown;
  onChange: (v: string | undefined) => void;
  petunjuk?: string;
}) {
  const [sedangOlah, setSedangOlah] = useState(false);
  const [gagal, setGagal] = useState('');
  const rujukan = String(nilai ?? '');
  const pratinjau = selesaikanGambar(rujukan || undefined);

  const pilihBerkas = async (berkas?: File) => {
    if (!berkas) return;
    setSedangOlah(true);
    setGagal('');
    try {
      const dataUrl = await kompresGambarWebsite(berkas);
      const id = `img-${Math.random().toString(36).slice(2, 9)}`;
      simpanMediaWebsite({ id, nama: berkas.name, dataUrl, ukuran: berkas.size });
      onChange(`media:${id}`);
    } catch {
      setGagal('Gambar gagal diolah. Gunakan PNG/JPG di bawah 8 MB.');
    } finally {
      setSedangOlah(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-20 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          {pratinjau ? (
            <img src={pratinjau} alt="Pratinjau gambar" className="w-full h-full object-contain" />
          ) : (
            <ImageOff className="w-4 h-4 text-slate-300" />
          )}
        </div>
        <label className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer">
          {sedangOlah ? 'Mengolah…' : pratinjau ? 'Ganti Gambar' : 'Unggah Gambar'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void pilihBerkas(e.target.files?.[0])}
          />
        </label>
        {rujukan && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>
      <input
        type="text"
        value={rujukan.startsWith('media:') ? '' : rujukan}
        placeholder="atau tempel URL gambar https://…"
        onChange={(e) => onChange(e.target.value || undefined)}
        className={KELAS_INPUT}
      />
      {petunjuk && <Bacaan petunjuk={petunjuk} />}
      {gagal && <p className="text-2xs font-semibold text-rose-700">{gagal}</p>}
    </div>
  );
}

function MedanBertingkat({
  medan,
  nilai,
  onChange,
  petunjuk
}: {
  medan: Extract<Medan, { kind: 'bertingkat' }>;
  nilai: unknown;
  onChange: (v: unknown[]) => void;
  petunjuk?: string;
}) {
  const daftar = Array.isArray(nilai) ? [...(nilai as Record<string, unknown>[])] : [];

  const ganti = (indeks: number, item: Record<string, unknown>) => {
    const baru = [...daftar];
    baru[indeks] = item;
    onChange(baru);
  };
  const pindah = (indeks: number, arah: -1 | 1) => {
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= daftar.length) return;
    const baru = [...daftar];
    [baru[indeks], baru[tujuan]] = [baru[tujuan], baru[indeks]];
    onChange(baru);
  };

  return (
    <div className="space-y-2">
      {petunjuk && <Bacaan petunjuk={petunjuk} />}
      {daftar.map((item, indeks) => (
        <div key={indeks} className="border border-slate-200 rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-600 truncate">{medan.judulItem(item)}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => pindah(indeks, -1)}
                disabled={indeks === 0}
                className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                aria-label="Naik"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => pindah(indeks, 1)}
                disabled={indeks === daftar.length - 1}
                className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                aria-label="Turun"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(daftar.filter((_, i) => i !== indeks))}
                className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                aria-label="Hapus"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {medan.medan.map((m) => (
              <MedanEditor
                key={m.key}
                medan={m}
                nilai={ambilJalur(item, m.key)}
                onChange={(v) => ganti(indeks, setJalur(item, m.key, v))}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...daftar, medan.pabrik()])}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Tambah {medan.label}
      </button>
    </div>
  );
}

export function MedanEditor({
  medan,
  nilai,
  onChange
}: {
  medan: Medan;
  nilai: NilaiMedan;
  onChange: (nilai: NilaiMedan) => void;
}) {
  return (
    <div>
      <label className={KELAS_LABEL}>{medan.label}</label>
      {medan.kind === 'teks' && <MedanTeks nilai={nilai} onChange={onChange} />}
      {medan.kind === 'textarea' && <MedanTeks nilai={nilai} onChange={onChange} multiline rows={medan.rows} />}
      {medan.kind === 'daftarTeks' && <MedanDaftarTeks nilai={nilai} onChange={onChange} />}
      {medan.kind === 'angka' && <MedanAngka nilai={nilai} onChange={onChange} />}
      {medan.kind === 'pilihan' && (
        <MedanPilihan
          nilai={nilai}
          opsi={medan.opsi}
          onChange={onChange}
          labelOpsi={(o) => LABEL_HALAMAN[o as HalamanWebsite] ?? o}
        />
      )}
      {medan.kind === 'tautan' && <MedanTautan nilai={nilai} onChange={onChange} />}
      {medan.kind === 'gambar' && <MedanGambar nilai={nilai} onChange={onChange} petunjuk={medan.petunjuk} />}
      {medan.kind === 'bertingkat' && (
        <MedanBertingkat medan={medan} nilai={nilai} onChange={onChange} petunjuk={medan.petunjuk} />
      )}
      {medan.petunjuk && medan.kind !== 'gambar' && medan.kind !== 'bertingkat' && (
        <Bacaan petunjuk={medan.petunjuk} />
      )}
    </div>
  );
}

export { LABEL_HALAMAN };
