import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  DaftarSurat,
  KampanyeSurat,
  MediaSurat,
  PelangganSurat,
  PesanTransaksional,
  TemplatSurat,
  KonfigurasiSurat,
  UserRole
} from '../../../../types';
import {
  cekKesiapanKampanye,
  cocokkanQuerySegmentasi,
  daftarSiapKirim,
  jalankanBatchKirim,
  labelStatusKampanyeSurat,
  lajuTeoritis,
  parseCsvLangganan,
  pratinjauPayloadApi,
  saringPenerima,
  statistikKampanyeSurat,
  tautanBerhentiLangganan
} from '../../../../utils/sales';
import {
  Activity,
  Ban,
  Check,
  ClipboardCopy,
  Download,
  FileCode2,
  Gauge,
  Image as ImageIcon,
  Layers,
  Mail,
  MailCheck,
  Play,
  Plus,
  Search,
  Send,
  Settings2,
  Square,
  TriangleAlert,
  Upload,
  Users
} from 'lucide-react';
import {
  Badge,
  BarCapaian,
  Modal,
  Panel,
  Stat,
  chipFilter,
  formatPersen,
  formatTanggal,
  inputClass,
  labelClass,
  tombolBahaya,
  tombolPrimer,
  tombolSekunder,
  type Tone
} from './ui';

type Tampilan = 'dashboard' | 'subscribers' | 'lists' | 'campaigns' | 'templates' | 'media' | 'tx' | 'settings';

const TAMPILAN: { id: Tampilan; label: string; ikon: typeof Users }[] = [
  { id: 'dashboard', label: 'Dashboard', ikon: Activity },
  { id: 'subscribers', label: 'Subscribers', ikon: Users },
  { id: 'lists', label: 'Lists', ikon: Layers },
  { id: 'campaigns', label: 'Campaigns', ikon: Send },
  { id: 'templates', label: 'Templates', ikon: FileCode2 },
  { id: 'media', label: 'Media', ikon: ImageIcon },
  { id: 'tx', label: 'Transactional', ikon: MailCheck },
  { id: 'settings', label: 'Settings', ikon: Settings2 }
];

/** Selevel dengan granular permission listmonk (subscribers:manage, campaigns:send). */
const PERAN_PENGIRIM: UserRole[] = ['pjt', 'sales_manager', 'it_admin'];

const NADA_STATUS_SUBSCRIBER: Record<PelangganSurat['status'], Tone> = {
  Enabled: 'emerald',
  Unsubscribed: 'slate',
  Blocked: 'rose',
  Imported: 'amber'
};

const NADA_TIPE_DAFTAR: Record<DaftarSurat['tipe'], Tone> = {
  Public: 'blue',
  Private: 'emerald',
  Group: 'slate'
};

function formatDurasi(detik: number) {
  if (detik <= 0) return 'selesai';
  const menit = Math.round(detik / 60);
  if (menit < 60) return `± ${menit} menit`;
  return `± ${Math.round(menit / 60)} jam`;
}

export default function ListmonkModule({ currentRole }: { currentRole: UserRole }) {
  const [tampilan, setTampilan] = useState<Tampilan>('dashboard');
  const [pesan, setPesan] = useState('');

  const [daftar, setDaftar] = useState<DaftarSurat[]>(db.getDaftarSurat());
  const [pelanggan, setPelanggan] = useState<PelangganSurat[]>(db.getPelangganSurat());
  const [kampanye, setKampanye] = useState<KampanyeSurat[]>(db.getKampanyeSurat());
  const [templat, setTemplat] = useState<TemplatSurat[]>(db.getTemplatSurat());
  const [media, setMedia] = useState<MediaSurat[]>(db.getMediaSurat());
  const [transaksional, setTransaksional] = useState<PesanTransaksional[]>(db.getPesanTransaksional());
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSurat>(db.getKonfigurasiSurat());

  const bolehKirim = PERAN_PENGIRIM.includes(currentRole);

  const namaDaftar = (id: string) => daftar.find((d) => d.id === id)?.nama ?? id;
  const namaTemplat = (id: string) => templat.find((t) => t.id === id)?.nama ?? id;

  // ---------- turunan yang dipakai banyak tampilan ----------
  const penerimaPerDaftar = useMemo(() => {
    const peta = new Map<string, Record<PelangganSurat['status'], number>>();
    daftar.forEach((d) => peta.set(d.id, { Enabled: 0, Unsubscribed: 0, Blocked: 0, Imported: 0 }));
    pelanggan.forEach((p) => {
      p.daftarIds.forEach((id) => {
        const hit = peta.get(id);
        if (hit) hit[p.status] += 1;
      });
    });
    return peta;
  }, [daftar, pelanggan]);

  const statusPelanggan = useMemo(() => {
    const awal: Record<PelangganSurat['status'], number> = { Enabled: 0, Unsubscribed: 0, Blocked: 0, Imported: 0 };
    pelanggan.forEach((p) => {
      awal[p.status] += 1;
    });
    return awal;
  }, [pelanggan]);

  const pertumbuhan = useMemo(() => {
    const peta = new Map<string, number>();
    pelanggan.forEach((p) => {
      const bulan = p.tanggalBerlangganan.slice(0, 7);
      if (p.status !== 'Blocked') peta.set(bulan, (peta.get(bulan) ?? 0) + 1);
    });
    return Array.from(peta.entries())
      .map(([bulan, jumlah]) => ({ bulan, jumlah }))
      .sort((a, b) => a.bulan.localeCompare(b.bulan));
  }, [pelanggan]);

  const statusKampanye = useMemo(() => {
    const peta = new Map<KampanyeSurat['status'], number>();
    kampanye.forEach((k) => peta.set(k.status, (peta.get(k.status) ?? 0) + 1));
    return peta;
  }, [kampanye]);

  const sedangMengirim = kampanye.filter((k) => k.status === 'sending' || k.status === 'running');
  const kampanyeSelesai = kampanye.filter((k) => k.status === 'finished');
  const rataDeliverability =
    kampanyeSelesai.length > 0
      ? kampanyeSelesai.reduce((total, k) => total + statistikKampanyeSurat(k).tingkatPengiriman, 0) / kampanyeSelesai.length
      : 0;

  // ---------- state tampilan Subscribers ----------
  const [filterStatus, setFilterStatus] = useState<PelangganSurat['status'] | 'Semua'>('Semua');
  const [kataKunci, setKataKunci] = useState('');
  const [kueri, setKueri] = useState('');
  const [kueriAktif, setKueriAktif] = useState('');
  const [subscriberDetail, setSubscriberDetail] = useState<PelangganSurat | null>(null);
  const [imporTeks, setImporTeks] = useState('');
  const [imporDaftar, setImporDaftar] = useState<string>('LST-01');

  const hasilImpor = useMemo(
    () => parseCsvLangganan(imporTeks, pelanggan.map((p) => p.surel)),
    [imporTeks, pelanggan]
  );

  const pelangganTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return pelanggan
      .filter((p) => filterStatus === 'Semua' || p.status === filterStatus)
      .filter((p) => !kunci || [p.surel, p.nama, p.catatan].some((n) => n.toLowerCase().includes(kunci)))
      .filter((p) => !kueriAktif || cocokkanQuerySegmentasi(kueriAktif, p, daftar));
  }, [pelanggan, filterStatus, kataKunci, kueriAktif, daftar]);

  // ---------- state tampilan Campaigns ----------
  const [kampanyeDetail, setKampanyeDetail] = useState<KampanyeSurat | null>(null);
  const [jadwalkalTarget, setJadwalkanTarget] = useState<KampanyeSurat | null>(null);
  const [tanggalJadwal, setTanggalJadwal] = useState('');
  const [sudahValidasiPjt, setSudahValidasiPjt] = useState(false);
  const [jumlahGagal, setJumlahGagal] = useState(0);

  // ---------- state tampilan Templates ----------
  const [templatDetail, setTemplatDetail] = useState<TemplatSurat | null>(null);
  const [templatBody, setTemplatBody] = useState('');

  // ---------- state tampilan Media / TX ----------
  const [mediaBaru, setMediaBaru] = useState({ namaFile: '', url: '', tipeMime: 'image/jpeg', ukuranKB: 0 });
  const [pesanBaru, setPesanBaru] = useState({ surel: '', subjek: '', keperluan: '' });

  // ---------- aksi ----------
  const tampilkanPesan = (teks: string) => {
    setPesan(teks);
    window.setTimeout(() => setPesan(''), 6000);
  };

  const konfirmasiDaftar = (d: DaftarSurat) => {
    db.ubahDaftarSurat(d.id, { status: 'confirmed' });
    setDaftar(db.getDaftarSurat());
    tampilkanPesan(`Daftar "${d.nama}" dikonfirmasi — sekarang boleh dipakai mengirim.`);
  };

  const ubahOptinDaftar = (d: DaftarSurat, optin: DaftarSurat['optin']) => {
    db.ubahDaftarSurat(d.id, { optin });
    setDaftar(db.getDaftarSurat());
    tampilkanPesan(`Metode opt-in "${d.nama}" diubah ke ${optin} (sama dengan PUT /api/lists/${d.id}).`);
  };

  const ubahStatusSubscriber = (p: PelangganSurat, status: PelangganSurat['status'], alasan: string) => {
    db.ubahStatusPelangganSurat(p.id, status, alasan);
    setPelanggan(db.getPelangganSurat());
    setSubscriberDetail((d) => (d && d.id === p.id ? { ...d, status } : d));
  };

  const jalankanImpor = () => {
    const targetId = imporDaftar;
    const daftarTarget = daftar.find((d) => d.id === targetId);
    const baru: PelangganSurat[] = hasilImpor.baris.map((b, indeks) => ({
      id: `SUB-I${String(indeks + 1).padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      uuid: `${Date.now().toString(36)}${indeks}`,
      surel: b.surel,
      nama: b.nama,
      status: daftarTarget?.optin === 'double' ? 'Imported' : 'Enabled',
      daftarIds: [targetId],
      atribut: b.atribut,
      sumber: 'Impor CSV',
      tanggalBerlangganan: new Date().toISOString().split('T')[0],
      bounceBeruntun: 0,
      catatan:
        daftarTarget?.optin === 'double'
          ? 'Menunggu konfirmasi opt-in ganda sebelum dihitung sebagai penerima kirim.'
          : 'Langsung confirmed karena metode opt-in daftar ini single.'
    }));
    db.tambahPelangganSurat(baru, `Impor CSV ${baru.length} baris ke daftar ${daftarTarget?.nama ?? targetId}`);
    setPelanggan(db.getPelangganSurat());
    setImporTeks('');
    tampilkanPesan(
      `${baru.length} baris diimpor, ${hasilImpor.ditolak.length} ditolak, ${hasilImpor.duplikat.length} duplikat dilewati.`
    );
  };

  const lakukanAksiQuery = (aksi: 'add' | 'remove' | 'block') => {
    const ids = pelangganTampil.map((p) => p.id);
    if (ids.length === 0) {
      tampilkanPesan('Query tidak mencocokkan subscriber apa pun.');
      return;
    }
    if (aksi === 'block') {
      ids.forEach((id) => db.ubahStatusPelangganSurat(id, 'Blocked', 'Aksi blocklist berbasis query (PUT /api/subscribers/query/blocklist)'));
      setPelanggan(db.getPelangganSurat());
      tampilkanPesan(`${ids.length} subscriber masuk blocklist dari hasil query.`);
      return;
    }
    const targetId = imporDaftar;
    db.ubahKeanggotaanDaftar(ids, targetId, aksi);
    setPelanggan(db.getPelangganSurat());
    tampilkanPesan(`${ids.length} subscriber dipindahkan ${aksi === 'add' ? 'ke' : 'dari'} daftar ${namaDaftar(targetId)}.`);
  };

  const jadwalkanKampanye = () => {
    if (!jadwalkalTarget) return;
    db.ubahKampanyeSurat(
      jadwalkalTarget.id,
      { status: 'scheduled', jadwalKirim: tanggalJadwal, catatan: `${jadwalkalTarget.catatan} | dijadwalkan ${tanggalJadwal}` },
      'Penjadwalan kampanye buletin',
      currentRole === 'pjt' ? 'Penanggung Jawab (PJT)' : 'Manajer Pemasaran'
    );
    setKampanye(db.getKampanyeSurat());
    setJadwalkanTarget(null);
    setSudahValidasiPjt(false);
    tampilkanPesan(`${jadwalkalTarget.nomorKampanye} terjadwal untuk ${formatTanggal(tanggalJadwal)}.`);
  };

  const mulaiKirim = (k: KampanyeSurat) => {
    const hasil = cekKesiapanKampanye({ kampanye: k, daftar, pelanggan, sedangMengirim });
    if (!hasil.siap) {
      tampilkanPesan(`Ditolak: ${hasil.alasan}`);
      return;
    }
    db.ubahKampanyeSurat(
      k.id,
      { status: 'sending', targetTotal: saringPenerima(k, daftar, pelanggan).length },
      'Mulai kirim kampanye (PUT /api/campaigns/{id}/start)',
      currentRole === 'pjt' ? 'Penanggung Jawab (PJT)' : 'Manajer Pemasaran'
    );
    setKampanye(db.getKampanyeSurat());
    tampilkanPesan(`${k.nomorKampanye} masuk antrian kirim.`);
  };

  const ubahStatusKampanye = (k: KampanyeSurat, status: KampanyeSurat['status'], aktivitas: string) => {
    db.ubahKampanyeSurat(k.id, { status }, aktivitas, currentRole === 'pjt' ? 'Penanggung Jawab (PJT)' : 'Manajer Pemasaran');
    setKampanye(db.getKampanyeSurat());
  };

  const prosesBatch = (k: KampanyeSurat) => {
    const hasil = jalankanBatchKirim(k, konfigurasi, jumlahGagal);
    db.ubahKampanyeSurat(
      k.id,
      hasil.kampanye,
      `Eksekusi satu batch antrian (batch_size ${konfigurasi.batchSize})`,
      currentRole === 'pjt' ? 'Penanggung Jawab (PJT)' : 'Manajer Pemasaran'
    );
    setKampanye(db.getKampanyeSurat());
    setKampanyeDetail((d) => (d && d.id === k.id ? hasil.kampanye : d));
    tampilkanPesan(hasil.pesan);
  };

  const duplikasiKampanye = (k: KampanyeSurat) => {
    const idBaru = `KMP-${String(kampanye.length + 1).padStart(2, '0')}`;
    const salinan: KampanyeSurat = {
      ...k,
      id: idBaru,
      nomorKampanye: `${k.nomorKampanye}-R`,
      nama: `${k.nama} (salinan draf)`,
      status: 'draft',
      terkirim: 0,
      dibukaTotal: 0,
      dibukaUnik: 0,
      klikTotal: 0,
      klikUnik: 0,
      bounce: 0,
      keluhan: 0,
      berhentiLangganan: 0,
      jadwalKirim: '',
      jadwalSelesai: '',
      tautan: [],
      catatan: `Diduplikasi dari ${k.nomorKampanye}; statistik tidak ikut tersalin.`
    };
    db.saveKampanyeSurat([salinan, ...db.getKampanyeSurat()]);
    db.logAudit(
      'Sales & Marketing — Newsletter',
      'Duplikasi kampanye menjadi draf baru (ParentCampaignID listmonk)',
      salinan.nomorKampanye,
      'Manajer Pemasaran',
      'Sales & Marketing'
    );
    setKampanye(db.getKampanyeSurat());
    tampilkanPesan(`Draf ${salinan.nomorKampanye} dibuat sebagai salinan ${k.nomorKampanye}.`);
  };

  const kirimUji = (k: KampanyeSurat, jumlah: number) => {
    db.logAudit(
      'Sales & Marketing — Newsletter',
      `Kirim uji (POST /api/campaigns/${k.id}/test) ke ${jumlah} subscriber`,
      k.nomorKampanye,
      currentRole === 'pjt' ? 'Penanggung Jawab (PJT)' : 'Manajer Pemasaran',
      'Sales & Marketing'
    );
    tampilkanPesan(`${jumlah} surel uji dikirim — tidak dicatat pada statistik kampanye.`);
  };

  const simpanTemplat = (t: TemplatSurat, body: string) => {
    db.saveTemplatSurat(templat.map((x) => (x.id === t.id ? { ...x, bodyHtml: body } : x)));
    setTemplat(db.getTemplatSurat());
    db.logAudit('Sales & Marketing — Newsletter', 'Sunting body template email (Go template)', t.nama, 'Manajer Pemasaran', 'Sales & Marketing', [
      { kolom: 'bodyHtml', nilaiLama: `${t.bodyHtml.length} karakter`, nilaiBaru: `${body.length} karakter` }
    ]);
    setTemplatDetail(null);
    tampilkanPesan(`Template "${t.nama}" disimpan.`);
  };

  const daftarkanMedia = () => {
    if (!mediaBaru.namaFile || !mediaBaru.url) {
      tampilkanPesan('Nama file dan URL wajib diisi.');
      return;
    }
    const baru: MediaSurat = {
      id: `MED-${String(media.length + 1).padStart(2, '0')}`,
      namaFile: mediaBaru.namaFile,
      tipeMime: mediaBaru.tipeMime,
      ukuranKB: mediaBaru.ukuranKB,
      url: mediaBaru.url,
      diunggahPada: new Date().toISOString().split('T')[0],
      penanggungJawab: 'Manajer Pemasaran'
    };
    db.saveMediaSurat([baru, ...db.getMediaSurat()]);
    setMedia(db.getMediaSurat());
    setMediaBaru({ namaFile: '', url: '', tipeMime: 'image/jpeg', ukuranKB: 0 });
    db.logAudit('Sales & Marketing — Newsletter', 'Penambahan aset media library (POST /api/media)', baru.namaFile, 'Manajer Pemasaran', 'Sales & Marketing');
    tampilkanPesan(`${baru.namaFile} terdaftar pada media library.`);
  };

  const hapusMedia = (m: MediaSurat) => {
    db.saveMediaSurat(db.getMediaSurat().filter((x) => x.id !== m.id));
    setMedia(db.getMediaSurat());
    db.logAudit('Sales & Marketing — Newsletter', 'Penghapusan aset media (DELETE /api/media/{id})', m.namaFile, 'Manajer Pemasaran', 'Sales & Marketing');
  };

  const antrekanPesan = () => {
    if (!pesanBaru.surel || !pesanBaru.subjek) {
      tampilkanPesan('Surel tujuan dan subjek wajib diisi.');
      return;
    }
    const tujuanDiblokir = pelanggan.some((p) => p.surel.toLowerCase() === pesanBaru.surel.toLowerCase() && p.status === 'Blocked');
    const hariIni = new Date().toISOString().split('T')[0];
    const baru: PesanTransaksional = {
      id: `TXA-${String(transaksional.length + 1).padStart(2, '0')}`,
      surel: pesanBaru.surel.toLowerCase(),
      subjek: pesanBaru.subjek,
      status: tujuanDiblokir ? 'failed' : 'queued',
      dikirimPada: '',
      keperluan: pesanBaru.keperluan || 'Permintaan manual dari modul'
    };
    db.savePesanTransaksional([baru, ...db.getPesanTransaksional()]);
    setTransaksional(db.getPesanTransaksional());
    setPesanBaru({ surel: '', subjek: '', keperluan: '' });
    db.logAudit('Sales & Marketing — Newsletter', 'Antrean pesan transaksional (POST /api/messages/email)', baru.surel, 'Manajer Pemasaran', 'Sales & Marketing');
    tampilkanPesan(
      tujuanDiblokir
        ? 'Ditolak oleh SMTP: alamat termasuk blocklist subscriber, kirim tidak dicoba.'
        : `${baru.surel} masuk antrian transaksional.`
    );
  };

  const kirimUlangPesan = (t: PesanTransaksional) => {
    const hariIni = new Date().toISOString().split('T')[0];
    const gagal = t.surel.includes('@persi-asosiasi.go.id');
    db.savePesanTransaksional(
      db.getPesanTransaksional().map((x) => (x.id === t.id ? { ...x, status: gagal ? 'failed' : 'sent', dikirimPada: gagal ? x.dikirimPada : hariIni } : x))
    );
    setTransaksional(db.getPesanTransaksional());
    db.logAudit(
      'Sales & Marketing — Newsletter',
      gagal ? 'Retransmisi gagal (SMTP menolak dengan 550)' : 'Retransmisi pesan transaksional berhasil',
      t.surel,
      'Administrator IT',
      'Sales & Marketing',
      [{ kolom: 'status', nilaiLama: t.status, nilaiBaru: gagal ? 'failed' : 'sent' }]
    );
  };

  const simpanKonfigurasi = (patch: Partial<KonfigurasiSurat>) => {
    db.saveKonfigurasiSurat(patch);
    setKonfigurasi(db.getKonfigurasiSurat());
    tampilkanPesan('Pengaturan disimpan — sama seperti PUT /api/settings.');
  };

  // ---------- pratinjau payload API ----------
  const payload = kampanyeDetail ? pratinjauPayloadApi(kampanyeDetail, daftar, templat) : null;

  const chipTampilan = (aktif: boolean) =>
    `inline-flex items-center gap-1.5 ${chipFilter(aktif)}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {TAMPILAN.map((t) => {
          const Ikon = t.ikon;
          return (
            <button key={t.id} type="button" onClick={() => setTampilan(t.id)} className={chipTampilan(tampilan === t.id)}>
              <Ikon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
        <span className="ml-auto text-2xs text-slate-500">
          Mesin: <span className="font-semibold">listmonk</span> (knadh/listmonk) &middot; laju efektif{' '}
          <span className="font-mono">{lajuTeoritis(konfigurasi)} pesan/detik</span>
        </span>
      </div>

      {pesan && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
          <Activity className="w-4 h-4 shrink-0 mt-0.5" />
          {pesan}
        </div>
      )}

      {/* ============================ DASHBOARD ============================ */}
      {tampilan === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat
              label="Subscribers aktif"
              value={statusPelanggan.Enabled}
              hint={`Unsubscribed ${statusPelanggan.Unsubscribed} • Blocked ${statusPelanggan.Blocked} • Imported ${statusPelanggan.Imported}`}
              tone="emerald"
            />
            <Stat
              label="Subscriber lists"
              value={daftar.length}
              hint={`${daftarSiapKirim(daftar).length} siap kirim • ${daftar.filter((d) => d.status !== 'confirmed').length} menunggu konfirmasi owner`}
              tone="blue"
            />
            <Stat
              label="Kampanye berjalan"
              value={sedangMengirim.length}
              hint={
                sedangMengirim.length > 0
                  ? `${sedangMengirim[0].nomorKampanye} — sisa antrian ${statistikKampanyeSurat(sedangMengirim[0]).antrianSisa} pesan`
                  : 'Antrian SMTP kosong (hanya satu kampanye dapat mengirim)'
              }
              tone={sedangMengirim.length > 0 ? 'amber' : 'slate'}
            />
            <Stat
              label="Deliverability rata-rata"
              value={formatPersen(rataDeliverability, 1)}
              hint={`Dihitung dari ${kampanyeSelesai.length} kampanye finished (terkirim − bounce) / target`}
              tone={rataDeliverability >= 95 ? 'emerald' : 'amber'}
            />
          </div>

          <Panel
            judul="Antrian kirim berjalan"
            keterangan="Eksekusi mengikuti model listmonk: satu kampanye pada satu waktu, laju dibatasi app.rate x app.concurrency, dan kesalahan di atas app.max_send_errors menjeda kampanye secara otomatis."
          >
            {sedangMengirim.length === 0 ? (
              <p className="text-xs text-slate-500">Tidak ada kampanye berstatus sending/running saat ini.</p>
            ) : (
              sedangMengirim.map((k) => {
                const stat = statistikKampanyeSurat(k);
                return (
                  <div key={k.id} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-900">{k.nomorKampanye}</span>
                      <span className="text-slate-600">{k.nama}</span>
                      <Badge tone={labelStatusKampanyeSurat(k.status).tone}>{labelStatusKampanyeSurat(k.status).label}</Badge>
                      <span className="text-2xs text-slate-500 font-mono">
                        {k.terkirim}/{k.targetTotal} • laju {k.lajuPerDetik}/dtk • ETA {formatDurasi(stat.perkiraanSisaDetik)}
                      </span>
                    </div>
                    <BarCapaian
                      label="Progres antrian"
                      persen={stat.capaianPersen}
                      hint={`${formatPersen(stat.tingkatPengiriman, 1)} tersampaikan • ${k.bounce} bounce • sisa ${stat.antrianSisa} pesan`}
                    />
                  </div>
                );
              })
            )}
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel judul="Pertumbuhan langganan per bulan" keterangan="Baris Blocked tidak dihitung sebagai penambahan anggota.">
              <div className="space-y-2">
                {pertumbuhan.map((b) => {
                  const max = Math.max(...pertumbuhan.map((x) => x.jumlah), 1);
                  return (
                    <div key={b.bulan} className="flex items-center gap-2">
                      <span className="w-16 text-2xs font-mono text-slate-500">{b.bulan}</span>
                      <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(b.jumlah / max) * 100}%` }} />
                      </div>
                      <span className="w-8 text-2xs font-mono text-slate-700 text-right">{b.jumlah}</span>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel judul="Kampanye per status" keterangan="Distribusi status sesuai kolom campaigns.status pada API listmonk.">
              <div className="grid grid-cols-2 gap-2">
                {(['draft', 'scheduled', 'running', 'paused', 'sending', 'finished', 'cancelled'] as KampanyeSurat['status'][]).map((s) => (
                  <div key={s} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <Badge tone={labelStatusKampanyeSurat(s).tone}>{labelStatusKampanyeSurat(s).label}</Badge>
                    <span className="font-mono text-xs font-bold text-slate-800">{statusKampanye.get(s) ?? 0}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-2xs text-amber-900 leading-relaxed">
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Kepatuhan promosi alat kesehatan: seluruh materi buletin yang memuat klaim produk wajib divalidasi PJT dan
              mencantumkan Nomor Izin Edar sebelum dijadwalkan. Data pribadi subscriber (nama, surel, atribut) diproses
              atas dasar persetujuan opt-in dan wajib menyediakan penghentian langganan satu klik sesuai praktik
              List-Unsubscribe (RFC 8058) serta UU PDP No. 27/2022.
            </span>
          </div>
        </div>
      )}

      {/* ============================ SUBSCRIBERS ============================ */}
      {tampilan === 'subscribers' && (
        <div className="space-y-4">
          <Panel
            judul="Subscribers"
            keterangan="Status mengikuti API listmonk: Enabled dikirim, Unsubscribed berhenti, Blocked dikecualikan dari semua kirim, Imported belum pernah menerima kampanye."
            aksi={
              <span className="text-2xs text-slate-500">
                {pelangganTampil.length} dari {pelanggan.length} baris tampil
              </span>
            }
          >
            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={kataKunci}
                  onChange={(e) => setKataKunci(e.target.value)}
                  placeholder="Cari surel, nama, atau catatan..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(['Semua', 'Enabled', 'Unsubscribed', 'Blocked', 'Imported'] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setFilterStatus(s)} className={chipFilter(filterStatus === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mb-3">
              <input
                type="text"
                value={kueri}
                onChange={(e) => setKueri(e.target.value)}
                placeholder="Query segmentasi, mis. attributes->>'rayon' = 'Rayon Sumatera'"
                className={`${inputClass} font-mono`}
              />
              <button
                type="button"
                className={tombolSekunder}
                onClick={() => {
                  setKueriAktif(kueri.trim());
                }}
              >
                Terapkan query
              </button>
              {kueriAktif && (
                <button type="button" className={tombolSekunder} onClick={() => { setKueriAktif(''); setKueri(''); }}>
                  <Ban className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Subscriber</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Lists</th>
                    <th className="py-3 px-4">Sumber</th>
                    <th className="py-3 px-4">Bergabung</th>
                    <th className="py-3 px-4">Bounce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pelangganTampil.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSubscriberDetail(p)}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.nama}</div>
                        <div className="text-2xs font-mono text-slate-500">{p.surel}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={NADA_STATUS_SUBSCRIBER[p.status]}>{p.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.daftarIds.map((id) => (
                            <span key={id} className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {namaDaftar(id)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.sumber}</td>
                      <td className="py-3 px-4 font-mono text-2xs text-slate-600">{p.tanggalBerlangganan}</td>
                      <td className="py-3 px-4">
                        <span className={p.bounceBeruntun >= konfigurasi.ambangBounce ? 'font-mono text-rose-700 font-bold' : 'font-mono text-slate-500'}>
                          {p.bounceBeruntun}/{konfigurasi.ambangBounce}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pelangganTampil.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                        Tidak ada subscriber yang cocok dengan filter/query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-2 text-2xs text-slate-500 leading-relaxed">
              Subset query yang didukung luring: kolom <span className="font-mono">subscribers.email|name|status|created_at|uuid</span>,{' '}
              <span className="font-mono">lists.name</span>, dan atribut JSON{' '}
              <span className="font-mono">attributes-&gt;&gt;'kunci'</span> dengan operator <span className="font-mono">=</span>,{' '}
              <span className="font-mono">!=</span>, <span className="font-mono">LIKE</span> serta penghubung AND/OR.
            </p>
          </Panel>

          <Panel
            judul="Import subscribers"
            keterangan="CSV seperti listmonk: kolom email (wajib), name, attributes (JSON). Baris duplikat berdasarkan email dilewati; daftar ber-optin double membuat langganan unconfirmed."
          >
            <textarea
              rows={5}
              value={imporTeks}
              onChange={(e) => setImporTeks(e.target.value)}
              placeholder={'email,name,attributes\nrs.damar@klinikdamar.co.id,"dr. Damar",{"rayon":"Rayon Kalimantan"}'}
              className={`${inputClass} font-mono`}
            />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <select value={imporDaftar} onChange={(e) => setImporDaftar(e.target.value)} className={`${inputClass} w-auto`}>
                {daftar.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.tipe}, {d.optin})
                  </option>
                ))}
              </select>
              <button type="button" className={tombolPrimer} onClick={jalankanImpor} disabled={hasilImpor.baris.length === 0}>
                <Upload className="w-4 h-4" />
                Impor {hasilImpor.baris.length} baris
              </button>
              <button type="button" className={tombolSekunder} onClick={() => lakukanAksiQuery('add')} disabled={!kueriAktif}>
                <Plus className="w-3.5 h-3.5" />
                Tambah hasil query ke daftar
              </button>
              <button type="button" className={tombolSekunder} onClick={() => lakukanAksiQuery('block')} disabled={!kueriAktif}>
                <Ban className="w-3.5 h-3.5" />
                Blocklist hasil query
              </button>
            </div>
            {(hasilImpor.ditolak.length > 0 || hasilImpor.duplikat.length > 0) && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-2xs text-rose-900 space-y-1">
                {hasilImpor.ditolak.map((t) => (
                  <div key={t}>{t}</div>
                ))}
                {hasilImpor.duplikat.length > 0 && <div>Duplikat dilewati: {hasilImpor.duplikat.join(', ')}</div>}
              </div>
            )}
          </Panel>

          {subscriberDetail && (
            <Modal
              judul={subscriberDetail.nama}
              keterangan={`${subscriberDetail.surel} • uuid ${subscriberDetail.uuid}`}
              onClose={() => setSubscriberDetail(null)}
            >
              {(() => {
                const p = subscriberDetail;
                const tautan = tautanBerhentiLangganan(p, konfigurasi.urlInstance);
                const kampanyeTerkait = kampanye.filter((k) => k.daftarIds.some((id) => p.daftarIds.includes(id)));
                return (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        ['Status', p.status],
                        ['Sumber', p.sumber],
                        ['Bergabung', formatTanggal(p.tanggalBerlangganan)],
                        ['Bounce beruntun', `${p.bounceBeruntun} (ambang ${konfigurasi.ambangBounce})`]
                      ].map(([label, nilai]) => (
                        <div key={label}>
                          <dt className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                          <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-2xs font-bold text-slate-700 mb-1">Attributes (JSONB)</div>
                      <pre className="font-mono text-2xs text-slate-700 whitespace-pre-wrap">{JSON.stringify(p.atribut, null, 2)}</pre>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 space-y-1">
                      <div className="text-2xs font-bold text-slate-700">Tautan opt-out ({'{ unique_id }'} = {p.uuid})</div>
                      <div className="font-mono text-2xs text-slate-600 break-all">{tautan.unik}</div>
                      <div className="font-mono text-2xs text-slate-600 break-all">{tautan.manajemen}</div>
                      <div className="font-mono text-2xs text-slate-500">{tautan.oneClickHeader}</div>
                    </div>

                    <div>
                      <div className="text-2xs font-bold text-slate-700 mb-1">Kampanye pada daftarnya</div>
                      {kampanyeTerkait.length === 0 ? (
                        <p className="text-2xs text-slate-500">Belum ada kampanye yang menyasar daftar subscriber ini.</p>
                      ) : (
                        <ul className="space-y-1">
                          {kampanyeTerkait.map((k) => (
                            <li key={k.id} className="flex items-center justify-between text-2xs border-b border-slate-100 pb-1">
                              <span className="text-slate-700">{k.nomorKampanye} — {k.nama}</span>
                              <Badge tone={labelStatusKampanyeSurat(k.status).tone}>{labelStatusKampanyeSurat(k.status).label}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {p.catatan && <p className="text-2xs text-slate-600 italic">{p.catatan}</p>}

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-end gap-2">
                      {p.status !== 'Enabled' && bolehKirim && (
                        <button type="button" className={tombolPrimer} onClick={() => ubahStatusSubscriber(p, 'Enabled', 'Subscriber diaktifkan kembali')}>
                          <Check className="w-4 h-4" />
                          Enable
                        </button>
                      )}
                      {p.status !== 'Unsubscribed' && (
                        <button
                          type="button"
                          className={tombolSekunder}
                          onClick={() => ubahStatusSubscriber(p, 'Unsubscribed', 'Penghentian langganan manual (PUT /api/subscribers/{id}/blocklist varian unsubscribe)')}
                        >
                          <Square className="w-4 h-4" />
                          Unsubscribe
                        </button>
                      )}
                      {p.status !== 'Blocked' && bolehKirim && (
                        <button type="button" className={tombolBahaya} onClick={() => ubahStatusSubscriber(p, 'Blocked', 'Diblokir manual — dikecualikan dari semua kirim')}>
                          <Ban className="w-4 h-4" />
                          Blocklist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </Modal>
          )}
        </div>
      )}

      {/* ============================ LISTS ============================ */}
      {tampilan === 'lists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daftar.map((d) => {
            const hit = penerimaPerDaftar.get(d.id) ?? { Enabled: 0, Unsubscribed: 0, Blocked: 0, Imported: 0 };
            const total = Object.values(hit).reduce((a, b) => a + b, 0);
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{d.nama}</h3>
                    <p className="text-2xs text-slate-500 mt-0.5">id {d.id} • uuid listmonk pada kolom lists.uuid</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={NADA_TIPE_DAFTAR[d.tipe]}>{d.tipe}</Badge>
                    <Badge tone={d.status === 'confirmed' ? 'emerald' : 'amber'}>{d.status}</Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{d.keterangan}</p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {d.tag.map((t) => (
                    <span key={t} className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4">
                  {(['Enabled', 'Unsubscribed', 'Blocked', 'Imported'] as PelangganSurat['status'][]).map((s) => (
                    <div key={s} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
                      <div className="text-2xs text-slate-500">{s}</div>
                      <div className="text-sm font-bold text-slate-800">{hit[s]}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <span className="text-2xs text-slate-500">
                    {total} anggota • template default {namaTemplat(d.templatDefaultId)} • opt-in{' '}
                    <span className="font-mono">{d.optin}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={d.optin}
                      onChange={(e) => ubahOptinDaftar(d, e.target.value as DaftarSurat['optin'])}
                      className="px-2 py-1 border border-slate-300 rounded-lg text-2xs"
                    >
                      <option value="single">single opt-in</option>
                      <option value="double">double opt-in</option>
                    </select>
                    {d.status !== 'confirmed' && bolehKirim && (
                      <button type="button" className={tombolPrimer} onClick={() => konfirmasiDaftar(d)}>
                        <MailCheck className="w-4 h-4" />
                        Confirm subscription
                      </button>
                    )}
                  </div>
                </div>

                {d.tipe === 'Public' && (
                  <p className="text-2xs text-slate-500 mt-2 font-mono break-all">
                    {d.status === 'confirmed'
                      ? `${konfigurasi.urlInstance.replace(/\/$/, '')}/public/subscribe → form & halaman /subscription/{uuid}`
                      : 'Halaman publik belum aktif: owner harus mengonfirmasi daftar lebih dulu.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================ CAMPAIGNS ============================ */}
      {tampilan === 'campaigns' && (
        <div className="space-y-4">
          <Panel
            judul="Campaigns"
            keterangan="Siklus hidup: draft → scheduled → running/sending → (paused) → finished | cancelled. Hanya satu kampanye boleh berada pada antrian kirim."
            aksi={
              <span className="text-2xs text-slate-500">
                antrian berjalan: <span className="font-mono">{sedangMengirim.length}</span> • batch_size{' '}
                <span className="font-mono">{konfigurasi.batchSize}</span>
              </span>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Kampanye</th>
                    <th className="py-3 px-4">Lists</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Progres kirim</th>
                    <th className="py-3 px-4">Views</th>
                    <th className="py-3 px-4">Clicks</th>
                    <th className="py-3 px-4">Bounce</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kampanye.map((k) => {
                    const stat = statistikKampanyeSurat(k);
                    const status = labelStatusKampanyeSurat(k.status);
                    return (
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 cursor-pointer" onClick={() => setKampanyeDetail(k)}>
                          <div className="font-bold text-slate-900">{k.nama}</div>
                          <div className="text-2xs font-mono text-slate-500">{k.nomorKampanye} • {k.mime} • {k.tipe}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {k.daftarIds.map((id) => (
                              <span key={id} className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                                {namaDaftar(id)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="font-mono text-2xs text-slate-700">{k.terkirim}/{k.targetTotal}</div>
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(stat.capaianPersen, 100)}%` }} />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-2xs text-slate-700">
                          {k.dibukaUnik} unik / {k.dibukaTotal}
                        </td>
                        <td className="py-3 px-4 font-mono text-2xs text-slate-700">
                          {k.klikUnik} unik / {k.klikTotal}
                        </td>
                        <td className="py-3 px-4">
                          <span className={k.bounce > 0 ? 'font-mono text-rose-700 font-bold' : 'font-mono text-slate-500'}>{k.bounce}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {k.status === 'draft' && bolehKirim && (
                              <button
                                type="button"
                                className={tombolSekunder}
                                onClick={() => {
                                  setJadwalkanTarget(k);
                                  setTanggalJadwal(new Date().toISOString().split('T')[0]);
                                }}
                              >
                                Jadwalkan
                              </button>
                            )}
                            {(k.status === 'scheduled' || k.status === 'paused') && bolehKirim && (
                              <button type="button" className={tombolPrimer} onClick={() => mulaiKirim(k)}>
                                <Play className="w-3.5 h-3.5" />
                                {k.status === 'paused' ? 'Lanjutkan' : 'Mulai kirim'}
                              </button>
                            )}
                            {(k.status === 'sending' || k.status === 'running') && bolehKirim && (
                              <button type="button" className={tombolSekunder} onClick={() => ubahStatusKampanye(k, 'paused', 'Kampanye dijeda (PUT /api/campaigns/{id}/status)')}>
                                Jeda
                              </button>
                            )}
                            <button type="button" className={tombolSekunder} onClick={() => setKampanyeDetail(k)}>
                              <Gauge className="w-3.5 h-3.5" />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel judul="Kampanye optin & daftar unconfirmed" keterangan="Kampanye bertipe optin hanya menyasar langganan yang belum terkonfirmasi pada daftar double opt-in.">
            <div className="space-y-2">
              {kampanye
                .filter((k) => k.tipe === 'optin')
                .map((k) => {
                  const penerima = saringPenerima(k, daftar, pelanggan);
                  return (
                    <div key={k.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{k.nomorKampanye}</span>
                        <span className="text-slate-600 ml-2">{k.nama}</span>
                        <div className="text-2xs text-slate-500 mt-0.5">
                          target saat ini {penerima.length} penerima (langganan pada daftar double opt-in)
                        </div>
                      </div>
                      <Badge tone={labelStatusKampanyeSurat(k.status).tone}>{labelStatusKampanyeSurat(k.status).label}</Badge>
                    </div>
                  );
                })}
            </div>
          </Panel>
        </div>
      )}

      {/* ============================ TEMPLATES ============================ */}
      {tampilan === 'templates' && (
        <Panel
          judul="Templates"
          keterangan={'Template adalah fondasi pohon Go template; body kampanye disisipkan pada {{ template "content" . }}. Hanya muncul satu kali per template.'}
        >
          <div className="space-y-3">
            {templat.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.nama}</h4>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      tipe <span className="font-mono">{t.tipe}</span> • {t.bodyHtml.length} karakter •{' '}
                      {t.isActive ? 'aktif' : 'nonaktif'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={t.isActive ? 'emerald' : 'slate'}>{t.isActive ? 'is_default' : 'disimpan'}</Badge>
                    <button
                      type="button"
                      className={tombolSekunder}
                      onClick={() => {
                        setTemplatDetail(t);
                        setTemplatBody(t.bodyHtml);
                      }}
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      Sunting body
                    </button>
                  </div>
                </div>
                <p className="text-2xs text-slate-600 mt-2 leading-relaxed">{t.catatan}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* ============================ MEDIA ============================ */}
      {tampilan === 'media' && (
        <Panel
          judul="Media library"
          keterangan="Aset yang dirujuk template/campaign body. URL menunjuk berkas pada aplikasi ini agar dapat diverifikasi; pada instance listmonk berkas disimpan di provider media (POST /api/media)."
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {media.map((m) => (
              <figure key={m.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <img src={m.url} alt={m.namaFile} className="w-full h-24 object-cover" loading="lazy" />
                <figcaption className="p-2">
                  <div className="text-2xs font-semibold text-slate-800 truncate">{m.namaFile}</div>
                  <div className="text-2xs text-slate-500 font-mono">{m.ukuranKB} KB</div>
                  <button type="button" className="text-2xs text-rose-700 hover:underline cursor-pointer mt-1" onClick={() => hapusMedia(m)}>
                    Hapus
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div>
              <label className={labelClass}>Nama file</label>
              <input type="text" value={mediaBaru.namaFile} onChange={(e) => setMediaBaru({ ...mediaBaru, namaFile: e.target.value })} className={inputClass} placeholder="brosur-monitor.jpg" />
            </div>
            <div>
              <label className={labelClass}>URL / path</label>
              <input type="text" value={mediaBaru.url} onChange={(e) => setMediaBaru({ ...mediaBaru, url: e.target.value })} className={`${inputClass} font-mono`} placeholder="/site/nama-berkas.jpg" />
            </div>
            <div>
              <label className={labelClass}>Content type</label>
              <select value={mediaBaru.tipeMime} onChange={(e) => setMediaBaru({ ...mediaBaru, tipeMime: e.target.value })} className={inputClass}>
                {['image/jpeg', 'image/png', 'application/pdf'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ukuran (KB)</label>
              <input type="number" value={mediaBaru.ukuranKB} onChange={(e) => setMediaBaru({ ...mediaBaru, ukuranKB: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
          <button type="button" className={`${tombolPrimer} mt-3`} onClick={daftarkanMedia}>
            <Plus className="w-4 h-4" />
            Daftarkan aset
          </button>
        </Panel>
      )}

      {/* ============================ TRANSACTIONAL ============================ */}
      {tampilan === 'tx' && (
        <Panel
          judul="Transactional messages"
          keterangan="Kiriman satu penerima lewat API (bukan kampanye) sehingga tidak mengubah statistik. Alamat pada blocklist subscriber ditolak sebelum SMTP."
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-4">
            <div>
              <label className={labelClass}>Surel tujuan</label>
              <input type="email" value={pesanBaru.surel} onChange={(e) => setPesanBaru({ ...pesanBaru, surel: e.target.value })} className={`${inputClass} font-mono`} placeholder="nama@fasyankes.go.id" />
            </div>
            <div>
              <label className={labelClass}>Subjek</label>
              <input type="text" value={pesanBaru.subjek} onChange={(e) => setPesanBaru({ ...pesanBaru, subjek: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Keperluan</label>
              <input type="text" value={pesanBaru.keperluan} onChange={(e) => setPesanBaru({ ...pesanBaru, keperluan: e.target.value })} className={inputClass} />
            </div>
            <button type="button" className={tombolPrimer} onClick={antrekanPesan}>
              <Send className="w-4 h-4" />
              Antrekan
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Subjek</th>
                  <th className="py-3 px-4">Keperluan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Dikirim</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksional.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-2xs text-slate-700">{t.surel}</td>
                    <td className="py-3 px-4 text-slate-800">{t.subjek}</td>
                    <td className="py-3 px-4 text-slate-600">{t.keperluan}</td>
                    <td className="py-3 px-4">
                      <Badge tone={t.status === 'sent' ? 'emerald' : t.status === 'queued' ? 'blue' : 'rose'}>{t.status}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600">{t.dikirimPada || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      {t.status !== 'sent' && bolehKirim && (
                        <button type="button" className={tombolSekunder} onClick={() => kirimUlangPesan(t)}>
                          <Mail className="w-3.5 h-3.5" />
                          Kirim ulang
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* ============================ SETTINGS ============================ */}
      {tampilan === 'settings' && (
        <div className="space-y-4">
          <Panel judul="Pengirim & SMTP" keterangan="Kunci settings listmonk (app.from_name, app.from_email, smtp.*). Password SMTP dan API key tidak pernah disimpan di aplikasi ini.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([
                ['app.from_name', 'appFromName', 'text'],
                ['app.from_email', 'appFromEmail', 'email'],
                ['smtp.host', 'smtpHost', 'text'],
                ['smtp.username', 'smtpUser', 'text']
              ] as const).map(([kunci, field, tipe]) => (
                <div key={kunci}>
                  <label className={labelClass}>
                    {kunci} <span className="font-mono text-2xs text-slate-400">({field})</span>
                  </label>
                  <input
                    type={tipe}
                    value={konfigurasi[field] as string}
                    onChange={(e) => setKonfigurasi({ ...konfigurasi, [field]: e.target.value })}
                    className={`${inputClass} ${tipe === 'email' ? 'font-mono' : ''}`}
                  />
                </div>
              ))}
              <div>
                <label className={labelClass}>smtp.port</label>
                <input type="number" value={konfigurasi.smtpPort} onChange={(e) => setKonfigurasi({ ...konfigurasi, smtpPort: Number(e.target.value) })} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>smtp.auth / smtp.encryption</label>
                <div className="flex gap-2">
                  <select value={konfigurasi.smtpAuth} onChange={(e) => setKonfigurasi({ ...konfigurasi, smtpAuth: e.target.value as KonfigurasiSurat['smtpAuth'] })} className={inputClass}>
                    {(['none', 'plain', 'login', 'cram'] as const).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    value={konfigurasi.smtpEncryption}
                    onChange={(e) => setKonfigurasi({ ...konfigurasi, smtpEncryption: e.target.value as KonfigurasiSurat['smtpEncryption'] })}
                    className={inputClass}
                  >
                    {(['none', 'tls', 'starttls'] as const).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Instance listmonk (url dasar)</label>
                <input type="text" value={konfigurasi.urlInstance} onChange={(e) => setKonfigurasi({ ...konfigurasi, urlInstance: e.target.value })} className={`${inputClass} font-mono`} />
              </div>
            </div>
            <button type="button" className={`${tombolPrimer} mt-4`} onClick={() => simpanKonfigurasi(konfigurasi)}>
              <Check className="w-4 h-4" />
              Simpan pengaturan pengirim
            </button>
          </Panel>

          <Panel
            judul="Message rate & threading"
            keterangan="Laju efektif = app.concurrency x app.rate. app.batch_size dianjurkan lebih besar dari laju efektif; kesalahan kirim di atas app.max_send_errors menjeda kampanye."
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                ['app.rate (pesan/detik)', 'appRate'],
                ['app.batch_size', 'batchSize'],
                ['app.concurrency', 'concurrency'],
                ['app.max_send_errors', 'maxSendErrors']
              ] as const).map(([label, field]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" value={konfigurasi[field]} onChange={(e) => setKonfigurasi({ ...konfigurasi, [field]: Number(e.target.value) })} className={`${inputClass} font-mono`} />
                </div>
              ))}
            </div>
            <div className={`mt-3 rounded-xl border p-3 text-2xs leading-relaxed ${konfigurasi.batchSize < lajuTeoritis(konfigurasi) ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
              Laju efektif <span className="font-mono font-bold">{lajuTeoritis(konfigurasi)} pesan/detik</span> ({konfigurasi.concurrency} thread x {konfigurasi.appRate}).{' '}
              {konfigurasi.batchSize < lajuTeoritis(konfigurasi)
                ? `batch_size ${konfigurasi.batchSize} lebih kecil dari laju efektif — naikkan agar antrian tidak sering putus.`
                : `batch_size ${konfigurasi.batchSize} memadai terhadap laju efektif.`}
            </div>
          </Panel>

          <Panel judul="Bounce & privasi" keterangan="bounce.enabled + aksi pada ambang, default opt-in daftar baru, dan pelacakan tautan.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>bounce threshold (beruntun)</label>
                <input type="number" value={konfigurasi.ambangBounce} onChange={(e) => setKonfigurasi({ ...konfigurasi, ambangBounce: Number(e.target.value) })} className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>bounce action</label>
                <select value={konfigurasi.aksiBounce} onChange={(e) => setKonfigurasi({ ...konfigurasi, aksiBounce: e.target.value as KonfigurasiSurat['aksiBounce'] })} className={inputClass}>
                  {(['blocklist', 'unsubscribe', 'delete'] as const).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Default opt-in daftar baru</label>
                <select value={konfigurasi.optInDefault} onChange={(e) => setKonfigurasi({ ...konfigurasi, optInDefault: e.target.value as KonfigurasiSurat['optInDefault'] })} className={inputClass}>
                  <option value="single">single</option>
                  <option value="double">double</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={konfigurasi.lacakTautan} onChange={(e) => setKonfigurasi({ ...konfigurasi, lacakTautan: e.target.checked })} />
              Lacak tautan (link tracking) dan catat views per subscriber
            </label>
            <button type="button" className={`${tombolPrimer} mt-4`} onClick={() => simpanKonfigurasi(konfigurasi)}>
              <Check className="w-4 h-4" />
              Simpan bounce &amp; privasi
            </button>
          </Panel>

          <Panel judul="Pemetaan ke REST API listmonk" keterangan="Referensi bagi tim IT saat menyinkronkan modul ini dengan instance listmonk yang sebenarnya.">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-2xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2 px-3">Panel modul</th>
                    <th className="py-2 px-3">Endpoint</th>
                    <th className="py-2 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Subscribers / list keanggotaan', 'GET|POST /api/subscribers, PUT /api/subscribers/lists', 'Dedup berbasis email unik'],
                    ['Aksi massal dari query', 'PUT /api/subscribers/query/lists | /query/blocklist', 'Butuh izin subscribers:sql_query'],
                    ['Impor CSV', 'POST /api/import/subscribers', 'Header email, name, attributes'],
                    ['Lists', 'GET|POST|PUT /api/lists', 'Tipe Public/Group/Private'],
                    ['Campaigns', 'GET|POST /api/campaigns, PUT /api/campaigns/{id}', 'Hanya satu kampanye mengirim'],
                    ['Mulai / status kirim', 'PUT /api/campaigns/{id}/start, PUT .../status', 'Body {"status":"paused|running|..."}'],
                    ['Batch antrian', 'POST /api/campaigns/{id}/next-send', 'Checkpoints last_subscriber_id'],
                    ['Kirim uji', 'POST /api/campaigns/{id}/test', 'Tidak mengubah statistik'],
                    ['Templates', 'GET|POST|PUT /api/templates', '{{ template "content" . }} satu kali'],
                    ['Media', 'POST /api/media', 'Batas ukuran dari settings upload/media'],
                    ['Transactional', 'POST /api/messages/email', 'Tanpa pencatatan campaign'],
                    ['Settings', 'GET|PUT /api/settings', 'Kredensial diisi di instance, bukan di sini']
                  ].map(([panel, endpoint, catatan]) => (
                    <tr key={endpoint}>
                      <td className="py-2 px-3 text-slate-700">{panel}</td>
                      <td className="py-2 px-3 font-mono text-slate-800">{endpoint}</td>
                      <td className="py-2 px-3 text-slate-500">{catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ============================ MODAL: JADWALKAN ============================ */}
      {jadwalkalTarget && (
        <Modal judul={`Jadwalkan ${jadwalkalTarget.nomorKampanye}`} keterangan="Jadwal dibandingkan terhadap jam server listmonk (bukan jam peramban)." onClose={() => setJadwalkanTarget(null)}>
          <div className="space-y-4 text-xs">
            <div>
              <label className={labelClass}>Tanggal kirim</label>
              <input type="date" value={tanggalJadwal} onChange={(e) => setTanggalJadwal(e.target.value)} className={`${inputClass} font-mono`} />
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" checked={sudahValidasiPjt} onChange={(e) => setSudahValidasiPjt(e.target.checked)} className="mt-0.5" />
              <span>
                Materi buletin sudah diverifikasi PJT (etika promosi alkes, bebas klaim medis, mencantumkan NIE) —
                syarat sebelum kampanye boleh dijadwalkan.
              </span>
            </label>
            {!bolehKirim && (
              <p className="text-2xs text-rose-700">Peran Anda ({currentRole}) tidak memiliki izin campaigns:send.</p>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setJadwalkanTarget(null)}>
                Batal
              </button>
              <button
                type="button"
                className={tombolPrimer}
                disabled={!sudahValidasiPjt || !tanggalJadwal || !bolehKirim}
                onClick={jadwalkanKampanye}
              >
                <Check className="w-4 h-4" />
                Jadwalkan kampanye
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================ MODAL: DETAIL KAMPANYE ============================ */}
      {kampanyeDetail && payload && (
        <Modal
          judul={`${kampanyeDetail.nomorKampanye} — ${kampanyeDetail.nama}`}
          keterangan={`${kampanyeDetail.subjek} • dari ${kampanyeDetail.dariNama} <${kampanyeDetail.dariSurel}>`}
          onClose={() => setKampanyeDetail(null)}
        >
          {(() => {
            const k = kampanyeDetail;
            const stat = statistikKampanyeSurat(k);
            const penerima = saringPenerima(k, daftar, pelanggan);
            const kesiapan = cekKesiapanKampanye({ kampanye: k, daftar, pelanggan, sedangMengirim });
            return (
              <div className="space-y-4 text-xs">
                <BarCapaian
                  label={`Progres kirim ${k.terkirim}/${k.targetTotal}`}
                  persen={stat.capaianPersen}
                  hint={`Sisa antrian ${stat.antrianSisa} • ETA ${formatDurasi(stat.perkiraanSisaDetik)} • template ${namaTemplat(k.templatId)}`}
                />

                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Views unik', `${k.dibukaUnik} / ${k.dibukaTotal}`, formatPersen(stat.tingkatKeterbukaan, 1)],
                    ['Clicks unik', `${k.klikUnik} / ${k.klikTotal}`, formatPersen(stat.tingkatKlik, 1)],
                    ['Bounce', `${k.bounce}`, formatPersen(100 - stat.tingkatPengiriman, 1)],
                    ['Keluhan (complaint)', `${k.keluhan}`, formatPersen(stat.tingkatKeluhan, 2)],
                    ['Berhenti langganan', `${k.berhentiLangganan}`, formatPersen(stat.tingkatBerhenti, 1)],
                    ['Penerima lolos saring', `${penerima.length}`, `dari ${k.targetTotal} target`]
                  ].map(([label, nilai, hint]) => (
                    <div key={label as string} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <div className="text-2xs text-slate-500">{label}</div>
                      <div className="text-sm font-bold text-slate-800">{nilai}</div>
                      <div className="text-2xs text-slate-500 font-mono">{hint}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-2xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Link tracking
                  </div>
                  {k.tautan.length === 0 ? (
                    <p className="text-2xs text-slate-500">Belum ada tautan tercatat (kampanye belum dikirim atau lacakTautan mati).</p>
                  ) : (
                    <table className="w-full text-2xs">
                      <tbody className="divide-y divide-slate-100">
                        {k.tautan.map((l) => (
                          <tr key={l.url}>
                            <td className="py-1.5 pr-2 font-mono text-slate-700 break-all">{l.url}</td>
                            <td className="py-1.5 text-right font-mono text-slate-600">{l.klikUnik} unik / {l.klikTotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xs font-bold text-slate-700 mb-1">Header penghentian satu klik</div>
                  <pre className="font-mono text-2xs text-slate-600 whitespace-pre-wrap">{JSON.stringify(payload.body.campaign.headers, null, 2)}</pre>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-2xs font-bold text-slate-700">
                      {payload.method} {payload.endpoint}
                    </span>
                    <button
                      type="button"
                      className="text-2xs inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
                        tampilkanPesan('Payload API disalin ke papan klip (tanpa kredensial).');
                      }}
                    >
                      <ClipboardCopy className="w-3 h-3" />
                      Salin
                    </button>
                  </div>
                  <pre className="font-mono text-2xs text-slate-600 overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Auth instance memakai <span className="font-mono">Authorization: Basic base64(api_key:token)</span>; token
                    diisi pada instance listmonk, tidak pernah di aplikasi ini.
                  </p>
                </div>

                <div className={`rounded-xl border p-3 text-2xs leading-relaxed ${kesiapan.siap ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                  {kesiapan.siap ? 'Siap dikirim: ' : 'Belum siap: '}
                  {kesiapan.alasan}
                </div>

                {(k.status === 'sending' || k.status === 'running') && (
                  <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="text-2xs font-bold text-slate-700">Eksekusi antrian (batch)</div>
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className={labelClass}>Kesalahan kirim pada batch ini</label>
                        <input type="number" value={jumlahGagal} onChange={(e) => setJumlahGagal(Number(e.target.value))} className={`${inputClass} w-24 font-mono`} />
                      </div>
                      <button type="button" className={tombolPrimer} onClick={() => prosesBatch(k)} disabled={!bolehKirim}>
                        <Download className="w-4 h-4" />
                        Proses batch {konfigurasi.batchSize}
                      </button>
                    </div>
                    <p className="text-2xs text-slate-500">
                      ambang auto-pause app.max_send_errors = {konfigurasi.maxSendErrors}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-end gap-2">
                  <button type="button" className={tombolSekunder} onClick={() => setKampanyeDetail(null)}>
                    Tutup
                  </button>
                  <button type="button" className={tombolSekunder} onClick={() => duplikasiKampanye(k)}>
                    Duplikat sebagai draf
                  </button>
                  {bolehKirim && (
                    <button type="button" className={tombolSekunder} onClick={() => kirimUji(k, Math.min(penerima.length, 3))}>
                      <Send className="w-3.5 h-3.5" />
                      Kirim uji ({Math.min(penerima.length, 3)})
                    </button>
                  )}
                  {k.status !== 'cancelled' && k.status !== 'finished' && bolehKirim && (
                    <button
                      type="button"
                      className={tombolBahaya}
                      onClick={() => {
                        ubahStatusKampanye(k, 'cancelled', 'Kampanye dibatalkan');
                        setKampanyeDetail(null);
                      }}
                    >
                      <Ban className="w-4 h-4" />
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ============================ MODAL: SUNTING TEMPLATE ============================ */}
      {templatDetail && (
        <Modal judul={`Sunting template — ${templatDetail.nama}`} keterangan="Pratinjau di bawah hanya mengganti token dengan contoh subscriber; renderer sebenarnya adalah Go template pada listmonk." onClose={() => setTemplatDetail(null)}>
          <div className="space-y-3 text-xs">
            <textarea rows={10} value={templatBody} onChange={(e) => setTemplatBody(e.target.value)} className={`${inputClass} font-mono`} />
            {(() => {
              const contoh = pelanggan.find((p) => p.status === 'Enabled') ?? pelanggan[0];
              const k = kampanye[0];
              if (!contoh || !k) return null;
              const hasil = templatBody
                .replace(/\{\{\s*\.Subscriber\.Name\s*\}\}/g, contoh.nama)
                .replace(/\{\{\s*\.Subscriber\.Email\s*\}\}/g, contoh.surel)
                .replace(/\{\{\s*\.Subscriber\.UUID\s*\}\}/g, contoh.uuid)
                .replace(/\{\{\s*\.Campaign\.Subject\s*\}\}/g, k.subjek)
                .replace(/\{\{\s*\.List\.Name\s*\}\}/g, namaDaftar(k.daftarIds[0]))
                .replace(/\{\{\s*\.Site\.Name\s*\}\}/g, konfigurasi.appFromName)
                .replace(/\{\{\s*L\s+"([^"]*)"\s*\}\}/g, '$1')
                .replace(/\{\{\s*(TrackLink|OptinURL|UnsubscribeURL|ManageURL|MessageURL|WrapText|OptinFormAction|Donation|TrackView)\s*/g, '<!-- $1 -->');
              return (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-2xs font-bold text-slate-700 mb-1">Pratinjau token</div>
                  <pre className="font-mono text-2xs text-slate-600 whitespace-pre-wrap">{hasil}</pre>
                </div>
              );
            })()}
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setTemplatDetail(null)}>
                Batal
              </button>
              <button type="button" className={tombolPrimer} onClick={() => simpanTemplat(templatDetail, templatBody)}>
                <Check className="w-4 h-4" />
                Simpan template
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
