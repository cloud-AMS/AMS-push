/**
 * EDITOR SEKSI WEBSITE — renderer generik untuk tiga bentuk konten:
 * seksi daftar (SeksiDaftar), objek tunggal (identitas/header/hero/…), dan daftar polos (menu/footer).
 */
import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, Link2, Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import { SeksiDaftar } from '../../../../types';
import {
  MEDAN_KEPALA,
  denganPrefix,
  type BagianDefinisi,
  type ItemLoose,
  type Medan,
  type ObjekDefinisi,
  type PolosDefinisi
} from '../skema';
import { KELAS_INPUT, KELAS_LABEL, MedanEditor, ambilJalur, setJalur } from './medanEditor';

export function Sakelar({
  aktif,
  onGanti,
  label
}: {
  aktif: boolean;
  onGanti: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onGanti(!aktif)}
      className="inline-flex items-center gap-2 cursor-pointer select-none"
      aria-pressed={aktif}
    >
      <span className={`w-9 h-5 rounded-full transition-colors ${aktif ? 'bg-slate-700' : 'bg-slate-300'} relative`}>
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${aktif ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
      <span className={`text-xs font-semibold ${aktif ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
    </button>
  );
}

function Petunjuk({ children }: { children: ReactNode }) {
  return <p className="text-2xs text-slate-500 leading-relaxed">{children}</p>;
}

function KartuMedan({ medan, item, onGanti }: { medan: Medan; item: ItemLoose; onGanti: (i: ItemLoose) => void }) {
  return (
    <MedanEditor
      medan={medan}
      nilai={ambilJalur(item, medan.key)}
      onChange={(v) => onGanti(setJalur(item, medan.key, v) as ItemLoose)}
    />
  );
}

const nomorUrut = (daftar: unknown[]) => daftar.length + 1;

/** Kartu item yang bisa dibuka-tutup, dengan urutan, tampil/sembunyi, duplikat, dan hapus dua langkah. */
function ItemKardus({
  judul,
  subjudul,
  aktif,
  adaAktif,
  terkunci,
  sumberId,
  buka,
  onBuka,
  onAktif,
  onKunci,
  onNaik,
  onTurun,
  onDuplikat,
  onLepas,
  onHapus,
  anakBisaNaik,
  anakBisaTurun,
  children
}: {
  judul: string;
  subjudul?: string;
  aktif?: boolean;
  adaAktif: boolean;
  terkunci?: boolean;
  sumberId?: string;
  buka: boolean;
  onBuka: () => void;
  onAktif?: (v: boolean) => void;
  onKunci?: (v: boolean) => void;
  onNaik: () => void;
  onTurun: () => void;
  onDuplikat?: () => void;
  onLepas?: () => void;
  onHapus: () => void;
  anakBisaNaik: boolean;
  anakBisaTurun: boolean;
  children: ReactNode;
}) {
  const [hapusSiap, setHapusSiap] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
      <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
        <button type="button" onClick={onBuka} className="mt-0.5 p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer">
          {buka ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{judul || '(tanpa judul)'}</p>
          {subjudul && <p className="text-2xs text-slate-500 truncate mt-0.5">{subjudul}</p>}
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {adaAktif && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-bold border ${
                  aktif ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {aktif ? 'Tampil' : 'Sembunyi'}
              </span>
            )}
            {sumberId && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Link2 className="w-3 h-3" />
                {sumberId}
              </span>
            )}
            {terkunci && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Lock className="w-3 h-3" />
                terkunci
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onNaik}
            disabled={!anakBisaNaik}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
            aria-label="Naikkan urutan"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onTurun}
            disabled={!anakBisaTurun}
            className="p-1 rounded text-slate-500 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
            aria-label="Turunkan urutan"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          {onDuplikat && (
            <button
              type="button"
              onClick={onDuplikat}
              className="p-1 rounded text-slate-500 hover:bg-slate-200 cursor-pointer"
              aria-label="Duplikat"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {hapusSiap ? (
            <button
              type="button"
              onClick={onHapus}
              onBlur={() => setHapusSiap(false)}
              className="px-2 py-1 rounded bg-rose-600 text-white text-2xs font-bold cursor-pointer"
            >
              Hapus?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setHapusSiap(true)}
              className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
              aria-label="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {buka && (
        <div className="p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-4 pb-1 border-b border-slate-100">
            {onAktif && <Sakelar aktif={Boolean(aktif)} onGanti={onAktif} label="Tampilkan di situs" />}
            {onKunci && (
              <button
                type="button"
                onClick={() => onKunci(!terkunci)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                {terkunci ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {terkunci ? 'Buka kunci dari sinkronisasi' : 'Kunci dari timpa sinkronisasi'}
              </button>
            )}
            {onLepas && (
              <button
                type="button"
                onClick={onLepas}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                Lepas tautan data aplikasi
              </button>
            )}
          </div>
          {sumberId && !terkunci && (
            <Petunjuk>
              Butir ini dibangkitkan dari data aplikasi. Suntingan tetap tersimpan sampai tombol sinkronisasi dipakai —
              aktifkan kunci bila ingin suntingan tidak pernah ditimpa.
            </Petunjuk>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function BarisMedan({ medan, nilai, onGanti }: { medan: Medan; nilai: unknown; onGanti: (v: unknown) => void }) {
  return <MedanEditor medan={medan} nilai={nilai} onChange={onGanti} />;
}

/** Seksi dengan kepala + daftar item (hero, slide, produk, merek, dan seterusnya). */
export function EditorSeksiDaftar({
  def,
  seksi,
  onGanti
}: {
  def: BagianDefinisi;
  seksi: SeksiDaftar<ItemLoose>;
  onGanti: (seksi: SeksiDaftar<ItemLoose>) => void;
}) {
  const [buka, setBuka] = useState<string | null>(null);
  const daftar = seksi.item ?? [];

  const gantiItem = (indeks: number, item: ItemLoose) => {
    const baru = [...daftar];
    baru[indeks] = item;
    onGanti({ ...seksi, item: baru });
  };
  const pindah = (indeks: number, arah: -1 | 1) => {
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= daftar.length) return;
    const baru = [...daftar];
    [baru[indeks], baru[tujuan]] = [baru[tujuan], baru[indeks]];
    onGanti({ ...seksi, item: baru });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{def.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{def.petunjuk}</p>
        </div>
        <div className="flex items-center gap-3">
          {def.dinamis ? (
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
              sumber data aplikasi
            </span>
          ) : (
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
              ditulis manual
            </span>
          )}
          <Sakelar aktif={seksi.isActive} onGanti={(v) => onGanti({ ...seksi, isActive: v })} label="Seksi tampil" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Judul seksi</p>
        {MEDAN_KEPALA.map((m) => (
          <BarisMedan
            key={m.key}
            medan={m}
            nilai={ambilJalur(seksi, `kepala.${m.key}`)}
            onGanti={(v) => onGanti(setJalur(seksi, `kepala.${m.key}`, v) as SeksiDaftar<ItemLoose>)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Butir isi ({daftar.filter((i) => i.isActive).length} tampil dari {daftar.length})
          </p>
        </div>
        {daftar.map((item, indeks) => (
          <ItemKardus
            key={item.id}
            judul={def.judulItem(item)}
            subjudul={(() => {
              const m = def.medan[1];
              if (!m || (m.kind !== 'teks' && m.kind !== 'textarea')) return undefined;
              return String(ambilJalur(item, m.key) ?? '') || undefined;
            })()}
            aktif={item.isActive}
            adaAktif
            terkunci={item.dikunci}
            sumberId={item.sumberId}
            buka={buka === item.id}
            onBuka={() => setBuka(buka === item.id ? null : item.id)}
            onAktif={(v) => gantiItem(indeks, { ...item, isActive: v })}
            onKunci={(v) => gantiItem(indeks, { ...item, dikunci: v })}
            onLepas={item.sumberId ? () => gantiItem(indeks, { ...item, sumberId: undefined }) : undefined}
            onNaik={() => pindah(indeks, -1)}
            onTurun={() => pindah(indeks, 1)}
            onDuplikat={() =>
              onGanti({
                ...seksi,
                item: [
                  ...daftar.slice(0, indeks + 1),
                  {
                    ...(JSON.parse(JSON.stringify(item)) as ItemLoose),
                    id: `${def.kunci}-salin-${Math.random().toString(36).slice(2, 8)}`,
                    sumberId: undefined,
                    dikunci: false
                  },
                  ...daftar.slice(indeks + 1)
                ]
              })
            }
            onHapus={() => onGanti({ ...seksi, item: daftar.filter((_, i) => i !== indeks) })}
            anakBisaNaik={indeks > 0}
            anakBisaTurun={indeks < daftar.length - 1}
          >
            <div className="space-y-3">
              {def.medan.map((m) => (
                <KartuMedan key={m.key} medan={m} item={item} onGanti={(baru) => gantiItem(indeks, baru)} />
              ))}
            </div>
          </ItemKardus>
        ))}
        <button
          type="button"
          onClick={() => {
            const baru = def.pabrik(nomorUrut(daftar)) as ItemLoose;
            onGanti({ ...seksi, item: [...daftar, baru] });
            setBuka(baru.id);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah butir
        </button>
      </div>
    </div>
  );
}

/** Objek tunggal (identitas, header, hero, konsultasi, tentang, kontak). */
export function EditorObjek({
  def,
  objek,
  onGanti
}: {
  def: ObjekDefinisi;
  objek: Record<string, unknown>;
  onGanti: (objek: Record<string, unknown>) => void;
}) {
  const medan = def.punyaKepala ? [...def.medan, ...denganPrefix('kepala', MEDAN_KEPALA)] : def.medan;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{def.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{def.petunjuk}</p>
        </div>
        {def.punyaAktif && (
          <Sakelar
            aktif={Boolean(objek.isActive)}
            onGanti={(v) => onGanti({ ...objek, isActive: v })}
            label="Seksi tampil"
          />
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 grid gap-3 sm:grid-cols-2">
        {medan.map((m) => (
          <div key={m.key} className={m.kind === 'bertingkat' || m.kind === 'gambar' ? 'sm:col-span-2' : ''}>
            <BarisMedan medan={m} nilai={ambilJalur(objek, m.key)} onGanti={(v) => onGanti(setJalur(objek, m.key, v) as Record<string, unknown>)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Daftar polos tanpa kepala (menu navigasi, kolom footer). */
export function EditorPolos({
  def,
  daftar,
  onGanti
}: {
  def: PolosDefinisi;
  daftar: Record<string, unknown>[];
  onGanti: (daftar: Record<string, unknown>[]) => void;
}) {
  const [buka, setBuka] = useState<number | null>(null);

  const ganti = (indeks: number, item: Record<string, unknown>) => {
    const baru = [...daftar];
    baru[indeks] = item;
    onGanti(baru);
  };
  const pindah = (indeks: number, arah: -1 | 1) => {
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= daftar.length) return;
    const baru = [...daftar];
    [baru[indeks], baru[tujuan]] = [baru[tujuan], baru[indeks]];
    onGanti(baru);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{def.label}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{def.petunjuk}</p>
      </div>
      <div className="space-y-2">
        {daftar.map((item, indeks) => (
          <ItemKardus
            key={indeks}
            judul={def.judulItem(item)}
            aktif={item.isActive as boolean | undefined}
            adaAktif={'isActive' in item}
            buka={buka === indeks}
            onBuka={() => setBuka(buka === indeks ? null : indeks)}
            onAktif={'isActive' in item ? (v) => ganti(indeks, { ...item, isActive: v }) : undefined}
            onNaik={() => pindah(indeks, -1)}
            onTurun={() => pindah(indeks, 1)}
            onHapus={() => onGanti(daftar.filter((_, i) => i !== indeks))}
            anakBisaNaik={indeks > 0}
            anakBisaTurun={indeks < daftar.length - 1}
          >
            <div className="space-y-3">
              {def.medan.map((m) => (
                <BarisMedan key={m.key} medan={m} nilai={ambilJalur(item, m.key)} onGanti={(v) => ganti(indeks, setJalur(item, m.key, v))} />
              ))}
            </div>
          </ItemKardus>
        ))}
        <button
          type="button"
          onClick={() => {
            onGanti([...daftar, def.pabrik(nomorUrut(daftar))]);
            setBuka(daftar.length);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah butir
        </button>
      </div>
    </div>
  );
}

/** Medan teks polos satu jalur (mis. catatan footer). */
export function EditorTeksPolos({
  judul,
  petunjuk,
  nilai,
  onGanti
}: {
  judul: string;
  petunjuk: string;
  nilai: string;
  onGanti: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{judul}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{petunjuk}</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className={KELAS_LABEL}>Teks catatan</label>
        <textarea value={nilai} rows={3} onChange={(e) => onGanti(e.target.value)} className={`${KELAS_INPUT} resize-y`} />
      </div>
    </div>
  );
}

/** Item daftar yang menautkan ke data aplikasi boleh dilepas tautannya. */
