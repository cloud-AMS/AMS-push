/**
 * DASHBOARD WEBSITE — CMS konten situs publik AMS.
 *
 * Semua isi halaman /web disunting di sini: identitas & SEO, navigasi, hero, setiap seksi
 * daftar, kontak, hingga footer. Draf tersimpan terpisah dari snapshot tayang, dan setiap
 * penyimpanan/sinkronisasi/penerbitan tercatat pada jejak audit dengan nilai lama & baru.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  ExternalLink,
  Globe,
  History,
  Lock,
  Monitor,
  Pencil,
  RefreshCw,
  Save,
  Smartphone,
  Tablet,
  UploadCloud
} from 'lucide-react';
import { KonfigurasiSitus, SeksiDaftar, UserRole } from '../../../types';
import { db } from '../../../services/pocketbase';
import { namaPengguna, peranPengguna } from '../../layout/Navbar';
import {
  BAGIAN_WEBSITE,
  OBJEK_WEBSITE,
  POLOS_WEBSITE,
  jumlahButir,
  type ItemLoose,
  type KunciDaftar,
  type KunciEditorSitus,
  type KunciObjek,
  type KunciPolos
} from './skema';
import { EditorObjek, EditorPolos, EditorSeksiDaftar, EditorTeksPolos } from './editor/sectionsEditor';
import { Badge, Panel, Stat, tombolPrimer, tombolSekunder, chipFilter, formatTanggal } from '../commercial/sales/ui';

interface PropsWebsite {
  currentRole: UserRole;
}

const GRUP_RAIL: { judul: string; kunci: KunciEditorSitus[] }[] = [
  {
    judul: 'Identitas & Navigasi',
    kunci: ['identitas', 'header', 'menu', 'footerKolom', 'footerCatatan']
  },
  {
    judul: 'Konten Beranda',
    kunci: ['hero', 'slide', 'kepercayaan', 'solusi', 'konsultasi', 'statistik', 'merek', 'perjalanan', 'institusi', 'kegiatan', 'promo']
  },
  {
    judul: 'Katalog & Sumber Daya',
    kunci: ['produk', 'artikel', 'galeri', 'testimoni', 'faq', 'tentang', 'kantor', 'kontak', 'sosial']
  }
];

const LABEL_RAIL: Record<string, string> = (() => {
  const peta: Record<string, string> = { footerCatatan: 'Catatan Footer' };
  BAGIAN_WEBSITE.forEach((b) => (peta[b.kunci] = b.label));
  OBJEK_WEBSITE.forEach((b) => (peta[b.kunci] = b.label));
  POLOS_WEBSITE.forEach((b) => (peta[b.kunci] = b.label));
  return peta;
})();

const IKON_RAIL: Record<string, ComponentType<{ className?: string }>> = (() => {
  const peta: Record<string, ComponentType<{ className?: string }>> = { footerCatatan: Pencil };
  BAGIAN_WEBSITE.forEach((b) => (peta[b.kunci] = b.ikon));
  OBJEK_WEBSITE.forEach((b) => (peta[b.kunci] = b.ikon));
  POLOS_WEBSITE.forEach((b) => (peta[b.kunci] = b.ikon));
  return peta;
})();

/** Hanya peran ini yang boleh mengubah status tayang situs publik. */
const PERAN_PENERBIT: UserRole[] = ['pjt', 'it_admin'];

const PERANGKAT = {
  desktop: { label: 'Desktop', lebar: 1440, ikon: Monitor },
  tablet: { label: 'Tablet', lebar: 834, ikon: Tablet },
  mobile: { label: 'Ponsel', lebar: 390, ikon: Smartphone }
} as const;

type Mode = 'sunting' | 'pratinjau' | 'jejak';

const tanpaMeta = (cfg: KonfigurasiSitus) => {
  const { lastModifiedAt: _m, lastPublishedAt: _p, isPublished: _i, ...isi } = cfg;
  return JSON.stringify(isi);
};

export default function WebsiteModule({ currentRole }: PropsWebsite) {
  const [draf, setDraf] = useState<KonfigurasiSitus>(() => db.getWebsiteDraft());
  const [baseline, setBaseline] = useState<string>(() => tanpaMeta(db.getWebsiteDraft()));
  const [terbit, setTerbit] = useState<KonfigurasiSitus | null>(() => db.getWebsiteTerbit());
  const [kunci, setKunci] = useState<KunciEditorSitus>('identitas');
  const [mode, setMode] = useState<Mode>('sunting');
  const [perangkat, setPerangkat] = useState<keyof typeof PERANGKAT>('desktop');
  const [pesan, setPesan] = useState<{ nada: 'ok' | 'waspada'; teks: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeSiap = useRef(false);

  const pengguna = namaPengguna(currentRole);
  const peran = peranPengguna(currentRole);
  const bolehTerbit = PERAN_PENERBIT.includes(currentRole);

  useEffect(() => {
    const berhenti = db.subscribe('website_published', () => setTerbit(db.getWebsiteTerbit()));
    return berhenti;
  }, []);

  useEffect(() => {
    if (!pesan) return;
    const t = setTimeout(() => setPesan(null), 6000);
    return () => clearTimeout(t);
  }, [pesan]);

  const belumTersimpan = tanpaMeta(draf) !== baseline;
  const belumTerbit = terbit ? tanpaMeta(draf) !== tanpaMeta(terbit) : true;

  const tandaiTersimpan = useCallback((cfg: KonfigurasiSitus) => {
    setDraf(cfg);
    setBaseline(tanpaMeta(cfg));
  }, []);

  const simpan = () => {
    tandaiTersimpan(db.simpanWebsiteDraft(draf, pengguna, peran));
    setPesan({ nada: 'ok', teks: 'Draf konten tersimpan. Jejak perubahan tercatat pada audit trail.' });
  };

  const sinkron = () => {
    const { baru } = db.sinkronkanWebsiteDraft(pengguna, peran);
    tandaiTersimpan(baru);
    const jumlah = BAGIAN_WEBSITE.filter((b) => b.dinamis).reduce((acc, b) => acc + jumlahButir(baru, b.kunci), 0);
    setPesan({
      nada: 'ok',
      teks: `Sinkron selesai — ${jumlah} butir konten dibangun ulang dari register izin edar, sertifikat, pelanggan, kampanye, teritorial, dan stok.`
    });
  };

  /** Snapshot dikirim ke server agar /web tayang lintas perangkat; hosting statis memakai berkas unduhan. */
  const kirimSnapshot = async (snapshot: KonfigurasiSitus) => {
    try {
      const jawaban = await fetch('/api/website/published', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: snapshot })
      });
      return jawaban.ok;
    } catch {
      return false;
    }
  };

  const terbitkan = async () => {
    db.simpanWebsiteDraft(draf, pengguna, peran);
    const snapshot = db.terbitkanWebsite(pengguna, peran);
    tandaiTersimpan(db.getWebsiteDraft());
    setTerbit(snapshot);
    const terkirim = await kirimSnapshot(snapshot);
    setPesan({
      nada: terkirim ? 'ok' : 'waspada',
      teks: terkirim
        ? 'Konten tayang. Snapshot server diperbarui dan penerbitan tercatat di audit trail.'
        : 'Konten tayang pada perangkat ini. Snapshot server tidak tersedia (hosting statis) — pakai Unduh Snapshot JSON lalu unggah sebagai website-published.json.'
    });
  };

  const tahan = () => {
    const tersisa = db.tahanWebsite(pengguna, peran);
    setTerbit(tersisa);
    tandaiTersimpan(db.getWebsiteDraft());
    void kirimSnapshot(tersisa ?? { ...draf, isPublished: false });
    setPesan({ nada: 'waspada', teks: 'Situs publik ditahan. Pengunjung melihat pesan non-aktif sampai penerbitan berikutnya.' });
  };

  const unduh = () => {
    const isi = JSON.stringify(terbit ?? draf, null, 2);
    const tautan = document.createElement('a');
    tautan.href = URL.createObjectURL(new Blob([isi], { type: 'application/json' }));
    tautan.download = 'website-published.json';
    tautan.click();
    URL.revokeObjectURL(tautan.href);
    setPesan({ nada: 'ok', teks: 'website-published.json diunduh. Letakkan di folder public/ atau unggah lewat panel Storage situs.' });
  };

  /** Kirim draf ke iframe pratinjau setiap kali konten atau kesiapan iframe berubah. */
  useEffect(() => {
    if (mode !== 'pratinjau') {
      iframeSiap.current = false;
      return;
    }
    if (!iframeSiap.current) return;
    const t = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'ams-website-pratinjau', konfigurasi: draf }, window.location.origin);
    }, 250);
    return () => clearTimeout(t);
  }, [draf, mode]);

  useEffect(() => {
    const terima = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if ((e.data as { type?: string })?.type !== 'ams-website-pratinjau-siap') return;
      iframeSiap.current = true;
      iframeRef.current?.contentWindow?.postMessage({ type: 'ams-website-pratinjau', konfigurasi: draf }, window.location.origin);
    };
    window.addEventListener('message', terima);
    return () => window.removeEventListener('message', terima);
  }, [draf]);

  const jejak = useMemo(
    () => db.getAuditTrail().filter((l) => l.modul?.startsWith('Website')).slice(0, 12),
    // baseline/terbit ikut memicu pembaruan daftar jejak
    [baseline, terbit, mode]
  );

  const nilaiSeksi = (k: KunciEditorSitus) => (draf as unknown as Record<string, unknown>)[k];
  const gantiSeksi = (k: KunciEditorSitus, nilai: unknown) => setDraf({ ...(draf as KonfigurasiSitus), [k]: nilai } as KonfigurasiSitus);

  const seksiAktif = useMemo(
    () => BAGIAN_WEBSITE.filter((b) => (nilaiSeksi(b.kunci) as SeksiDaftar<ItemLoose>)?.isActive).length,
    [draf]
  );

  const statusTayang = !terbit
    ? { label: 'Belum pernah tayang', nada: 'slate' as const }
    : terbit.isPublished
      ? { label: 'Tayang', nada: 'emerald' as const }
      : { label: 'Ditahan', nada: 'amber' as const };

  const kunciRail = GRUP_RAIL.flatMap((g) => g.kunci);
  const totalButir = kunciRail.reduce((acc, k) => acc + jumlahButir(draf, k), 0);

  /** Dipanggil sebagai fungsi (bukan komponen) agar state kartu item tidak hilang saat mengetik. */
  const renderEditor = () => {
    const bagian = BAGIAN_WEBSITE.find((b) => b.kunci === kunci);
    if (bagian) {
      return (
        <EditorSeksiDaftar
          def={bagian}
          seksi={nilaiSeksi(bagian.kunci) as SeksiDaftar<ItemLoose>}
          onGanti={(baru) => gantiSeksi(bagian.kunci as KunciDaftar, baru)}
        />
      );
    }
    const objek = OBJEK_WEBSITE.find((b) => b.kunci === kunci);
    if (objek) {
      return (
        <EditorObjek
          def={objek}
          objek={nilaiSeksi(objek.kunci) as Record<string, unknown>}
          onGanti={(baru) => gantiSeksi(objek.kunci as KunciObjek, baru)}
        />
      );
    }
    const polos = POLOS_WEBSITE.find((b) => b.kunci === kunci);
    if (polos) {
      return (
        <EditorPolos
          def={polos}
          daftar={(nilaiSeksi(polos.kunci) as Record<string, unknown>[]) ?? []}
          onGanti={(baru) => gantiSeksi(polos.kunci as KunciPolos, baru)}
        />
      );
    }
    return (
      <EditorTeksPolos
        judul="Catatan Footer"
        petunjuk="Baris hak cipta dan keterangan legal di bagian paling bawah situs."
        nilai={String(nilaiSeksi('footerCatatan') ?? '')}
        onGanti={(v) => gantiSeksi('footerCatatan', v)}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* ================= STATUS KONTEN ================= */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Konten Situs Publik (Website CMS)</h2>
                <Badge tone={statusTayang.nada}>{statusTayang.label}</Badge>
                {belumTerbit && <Badge tone="blue">perubahan belum terbit</Badge>}
                {belumTersimpan && <Badge tone="amber">draf belum disimpan</Badge>}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {OBJEK_WEBSITE.length + BAGIAN_WEBSITE.length + POLOS_WEBSITE.length} kelompok konten · {seksiAktif} dari{' '}
                {BAGIAN_WEBSITE.length} seksi daftar tampil · terakhir disunting{' '}
                {new Date(draf.lastModifiedAt).toLocaleString('id-ID')} oleh {draf.lastModifiedBy ?? pengguna}
                {terbit?.lastPublishedAt ? ` · terbit ${new Date(terbit.lastPublishedAt).toLocaleString('id-ID')}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
            <button
              type="button"
              onClick={simpan}
              disabled={!belumTersimpan}
              className={`inline-flex items-center gap-1.5 ${tombolPrimer} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Draf
            </button>
            <button
              type="button"
              onClick={sinkron}
              className={`inline-flex items-center gap-1.5 ${tombolSekunder}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sinkron dari Data Aplikasi
            </button>
            {terbit?.isPublished && belumTerbit && (
              <button
                type="button"
                onClick={terbitkan}
                disabled={!bolehTerbit}
                title={bolehTerbit ? undefined : 'Hanya PJT / Admin IT yang dapat menerbitkan'}
                className={`inline-flex items-center gap-1.5 ${tombolPrimer} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Terbitkan
              </button>
            )}
            {terbit?.isPublished ? (
              <button
                type="button"
                onClick={tahan}
                disabled={!bolehTerbit}
                title={bolehTerbit ? undefined : 'Hanya PJT / Admin IT yang dapat menahan tayang'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Tahan Situs
              </button>
            ) : (
              <button
                type="button"
                onClick={terbitkan}
                disabled={!bolehTerbit}
                title={bolehTerbit ? undefined : 'Hanya PJT / Admin IT yang dapat menerbitkan'}
                className={`inline-flex items-center gap-1.5 ${tombolPrimer} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Terbitkan
              </button>
            )}
            <button
              type="button"
              onClick={unduh}
              className={`inline-flex items-center gap-1.5 ${tombolSekunder}`}
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Snapshot JSON
            </button>
            <a
              href="/web/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 ${tombolSekunder}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Halaman /web
            </a>
          </div>
        </div>

        {!bolehTerbit && (
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <p className="text-xs text-slate-600">
              Peran {peran} dapat menyunting dan menyimpan draf; penerbitan konten tayang dikhususkan untuk PJT dan Admin IT
              dan tercatat dengan nama pengguna pada jejak audit.
            </p>
          </div>
        )}

        {pesan && (
          <div
            className={`px-5 py-2.5 border-t flex items-start gap-2 ${
              pesan.nada === 'ok' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            }`}
          >
            {pesan.nada === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            )}
            <p className={`text-xs leading-relaxed ${pesan.nada === 'ok' ? 'text-emerald-900' : 'text-amber-900'}`}>{pesan.teks}</p>
          </div>
        )}
      </section>

      {/* ================= CAPAIAN KONTEN ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Kelompok Konten" value={kunciRail.length} hint="Identitas, navigasi, seksi beranda, katalog, dan footer." />
        <Stat
          label="Seksi Daftar Tampil"
          value={`${seksiAktif} / ${BAGIAN_WEBSITE.length}`}
          tone="emerald"
          hint="Seksi yang dilihat pengunjung pada halaman beranda."
        />
        <Stat label="Butir Konten" value={totalButir} tone="blue" hint="Kartu konten hasil sinkronisasi register izin edar, sertifikat, pelanggan, kampanye, dan stok." />
        <Stat
          label="Terbit Terakhir"
          value={terbit?.lastPublishedAt ? formatTanggal(new Date(terbit.lastPublishedAt).toISOString()) : '-'}
          hint={`Status tayang: ${statusTayang.label}.`}
        />
      </div>

      {/* ================= RAIL + PANE ================= */}
      <div className="grid xl:grid-cols-[260px_1fr] gap-4 items-start">
        <nav className="bg-white border border-slate-200 rounded-2xl shadow-xs p-3 xl:sticky xl:top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {GRUP_RAIL.map((grup) => (
            <div key={grup.judul} className="mb-3 last:mb-0">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">{grup.judul}</p>
              <div className="space-y-0.5">
                {grup.kunci.map((k) => {
                  const Ikon = IKON_RAIL[k];
                  const aktif = kunci === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setKunci(k);
                        setMode('sunting');
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        aktif ? 'bg-slate-700 text-white' : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {Ikon && <Ikon className={`w-3.5 h-3.5 shrink-0 ${aktif ? 'text-white' : 'text-slate-500'}`} />}
                      <span className="text-xs font-semibold truncate flex-1">{LABEL_RAIL[k]}</span>
                      <span
                        className={`text-2xs font-mono shrink-0 ${aktif ? 'text-slate-200' : 'text-slate-400'}`}
                      >
                        {jumlahButir(draf, k)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {([
              { id: 'sunting', label: 'Editor', ikon: Pencil },
              { id: 'pratinjau', label: 'Live Preview', ikon: Eye },
              { id: 'jejak', label: 'trails', ikon: History }
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-1.5 ${chipFilter(mode === t.id)}`}
              >
                <t.ikon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}

            {mode === 'pratinjau' && (
              <div className="ml-auto flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1">
                {(Object.keys(PERANGKAT) as (keyof typeof PERANGKAT)[]).map((p) => {
                  const Ikon = PERANGKAT[p].ikon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPerangkat(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        perangkat === p ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Ikon className="w-3.5 h-3.5" />
                      {PERANGKAT[p].label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {mode === 'sunting' && (
            <div className="space-y-3">
              {renderEditor()}
              {belumTersimpan && (
                <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  Ada suntingan yang belum disimpan. Simpan draf untuk mencatatnya pada jejak audit, lalu Terbitkan untuk
                  menayangkannya di /web.
                </p>
              )}
            </div>
          )}

          {mode === 'pratinjau' && (
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 overflow-x-auto">
              <iframe
                ref={iframeRef}
                title="Pratinjau situs publik"
                src="/web/?pratinjau=1"
                onLoad={() => {
                  iframeSiap.current = true;
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: 'ams-website-pratinjau', konfigurasi: draf },
                    window.location.origin
                  );
                }}
                className="bg-white border border-slate-200 rounded-xl h-[70vh] mx-auto"
                style={{ width: perangkat === 'desktop' ? '100%' : `${PERANGKAT[perangkat].lebar}px`, minWidth: '320px' }}
              />
              <p className="text-2xs text-slate-500 mt-2">
                Pratinjau memakai draf yang belum disimpan. Konten yang dilihat pengunjung adalah snapshot hasil Terbitkan.
              </p>
            </div>
          )}

          {mode === 'jejak' && (
            <Panel
              judul="Jejak Audit Konten Situs"
              keterangan="Penyimpanan draf, sinkronisasi data, penerbitan, dan penahanan tercatat dengan pengguna, peran, nilai lama, dan nilai baru sesuai CDAKB Permenkes 4/2014 & ISO 13485:2016 klausul 4.2.4."
              aksi={<Badge tone={jejak.length ? 'emerald' : 'slate'}>{jejak.length} entri terakhir</Badge>}
            >
              {jejak.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Belum ada aktivitas konten situs pada perangkat ini. Simpan draf untuk membuat entri pertama.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 -mx-2">
                  {jejak.map((log) => (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-900">{log.aktivitas}</span>
                        <span className="text-2xs font-mono text-slate-500">{log.waktu}</span>
                        <span className="ml-auto text-2xs font-mono text-slate-500">{log.nomorReferensi}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {log.pengguna} · {log.peran} · {log.statusIntegritas}
                      </p>
                      {log.perubahan && log.perubahan.length > 0 && (
                        <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden">
                          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] bg-slate-50 text-2xs font-bold uppercase tracking-wider text-slate-500">
                            <span className="px-2 py-1.5">Kolom</span>
                            <span className="px-2 py-1.5">Nilai Lama</span>
                            <span className="px-2 py-1.5">Nilai Baru</span>
                          </div>
                          {log.perubahan.slice(0, 8).map((p, i) => (
                            <div key={`${p.kolom}-${i}`} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] text-xs border-t border-slate-100">
                              <span className="px-2 py-1.5 font-mono text-slate-700 break-all">{p.kolom}</span>
                              <span className="px-2 py-1.5 text-rose-700 break-all">{p.nilaiLama}</span>
                              <span className="px-2 py-1.5 text-emerald-800 break-all">{p.nilaiBaru}</span>
                            </div>
                          ))}
                          {log.perubahan.length > 8 && (
                            <p className="px-2 py-1.5 text-2xs text-slate-500 border-t border-slate-100">
                              +{log.perubahan.length - 8} perubahan lain pada entri ini
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
