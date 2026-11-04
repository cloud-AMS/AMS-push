/**
 * HALAMAN DEPAN APLIKASI — tampilan situs publik yang sama, dipakai sebagai beranda
 * sebelum pengguna masuk. Dashboard hanya dirender setelah sesi login tersimpan.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LogIn, ShieldCheck, X } from 'lucide-react';
import type { KonfigurasiSitus } from '../../../../types';
import { db } from '../../../../services/pocketbase';
import { cobaMasuk, type SesiLogin } from '../../../../utils/autentikasi';
import PublicWebsite from './PublicWebsite';
import { tentukanKontenTayang } from './PublicWebsiteApp';

type StatusMuat = 'memuat' | 'selesai';

export default function HalamanDepan({ onMasuk }: { onMasuk: (sesi: SesiLogin) => void }) {
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSitus | null>(null);
  const [status, setStatus] = useState<StatusMuat>('memuat');
  const [formTerbuka, setFormTerbuka] = useState(() => new URLSearchParams(window.location.search).get('masuk') === '1');

  useEffect(() => {
    let batal = false;
    tentukanKontenTayang().then(({ konfigurasi: isi }) => {
      if (batal) return;
      setKonfigurasi(isi);
      setStatus('selesai');
    });
    return () => {
      batal = true;
    };
  }, []);

  const terima = (sesi: SesiLogin) => {
    setFormTerbuka(false);
    onMasuk(sesi);
  };

  if (status === 'memuat') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Memuat halaman…</p>
      </div>
    );
  }

  /* Tanpa konten terbit (mis. publikasi ditahan) gerbang tetap harus bisa dibuka. */
  if (!konfigurasi) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <KartuMasuk onTerima={terima} onBatal={() => window.location.href = '/web/'} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <PublicWebsite konfigurasi={konfigurasi} landasan="/" padaMasuk={() => setFormTerbuka(true)} />
      {formTerbuka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setFormTerbuka(false)} />
          <div className="relative w-full max-w-md">
            <KartuMasuk onTerima={terima} onBatal={() => setFormTerbuka(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export function KartuMasuk({ onTerima, onBatal }: { onTerima: (sesi: SesiLogin) => void; onBatal: () => void }) {
  const [namaPengguna, setNamaPengguna] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [tampilSandi, setTampilSandi] = useState(false);
  const [galat, setGalat] = useState('');
  const [memproses, setMemproses] = useState(false);
  const bidangRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bidangRef.current?.focus();
    const tutup = (e: KeyboardEvent) => e.key === 'Escape' && onBatal();
    window.addEventListener('keydown', tutup);
    return () => window.removeEventListener('keydown', tutup);
  }, [onBatal]);

  const kirim = (e: FormEvent) => {
    e.preventDefault();
    if (memproses) return;
    setMemproses(true);
    const sesi = cobaMasuk(namaPengguna, kataSandi);
    if (!sesi) {
      db.logAudit('Autentikasi & Akses', 'Percobaan masuk ditolak (kredensial tidak cocok)', namaPengguna.trim() || '-', namaPengguna.trim() || '-', 'Pengguna');
      setGalat('Nama pengguna atau kata sandi salah.');
      setMemproses(false);
      return;
    }
    db.logAudit('Autentikasi & Akses', 'Masuk berhasil ke aplikasi', sesi.namaPengguna, sesi.namaPengguna, 'Administrator', [
      { kolom: 'sesi', nilaiLama: 'Keluar', nilaiBaru: `Masuk ${sesi.masukPada}` }
    ]);
    onTerima(sesi);
  };

  const gayaBidang = 'w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">Masuk ke Aplikasi AMS</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Halaman ini memakai tampilan situs perusahaan. Dashboard CDAKB & ISO terbuka setelah Anda masuk.
          </p>
        </div>
        <button
          type="button"
          onClick={onBatal}
          aria-label="Tutup form masuk"
          className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={kirim} className="mt-5 space-y-3">
        <label className="block">
          <span className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama pengguna</span>
          <input
            ref={bidangRef}
            value={namaPengguna}
            onChange={(e) => { setNamaPengguna(e.target.value); setGalat(''); }}
            autoComplete="username"
            className={gayaBidang}
            placeholder="admin"
          />
        </label>
        <label className="block">
          <span className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">Kata sandi</span>
          <span className="relative block">
            <input
              value={kataSandi}
              onChange={(e) => { setKataSandi(e.target.value); setGalat(''); }}
              type={tampilSandi ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${gayaBidang} pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setTampilSandi((t) => !t)}
              aria-label={tampilSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              {tampilSandi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </span>
        </label>

        {galat && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
            {galat}
          </p>
        )}

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
          disabled={!namaPengguna || !kataSandi}
        >
          <LogIn className="w-4 h-4" />
          Masuk
        </button>
      </form>
    </div>
  );
}
