# Blueprint — Menu Warehouse & Logistics (Gudang & Logistik)

Status: **M1–M6 SELESAI (tipe domain + seed & penjaga benih + util 12 aturan + accessor/mutasi & jalur FEFO + shell 12 tab & migrasi kepemilikan §0B + verifikasi akhir `cek:semua`, `tsc --noEmit`, `vite build`)** — Penjaga permanen aktif: `npm run cek:semua` (`cek:benih`, `cek:fefo`, `cek:gudang`)
Sumber cetak biru: lampiran spesifikasi "Warehouse & Logistics" (Senior Software Architect / Full-Stack Developer) yang dimasukkan 4 November 2026.
Sasaran: menu **Operations & Technical → Gudang & Logistik** (`src/components/modules/operations/WarehouseModule.tsx`).
Kerangka regulasi: CDAKB Permenkes RI 4/2014 (kini CDB), ISO 13485:2016, e-Katalog LKPP, SATUSEHAT Logistik / SMILE Kemenkes.

---

## 0A. Keputusan yang sudah diambil

| # | Topik | Putusan | Catatan pelaksanaan |
| --- | --- | --- | --- |
| 1 | Kepemilikan layar ketertelusuran bets/serial & recall (sudah ada di Sales & PMS) | **PINDAH KE GUDANG** | Tab 3 (Stok & FEFO Dual-Track) dan tab 11 (Karantina & Recall) menjadi pemilik penuh. Konsekuensi lintas modul, lihat §0B. |
| 2 | `db.catatPengirimanSalesOrder` dipakai ulang menjadi eksekusi FEFO sadar-kunci | **BOLEH DIUBAH** | Jalur order→stok→piutang modul Sales akan ikut berubah perilaku; wajib diuji ulang pada tab Order & Penjualan sebelum terbit. |
| 3 | `import()` per tab untuk memecah bundel 1,09 MB | **DILEWATI DULU** | Lihat backlog §7. |
| 4 | Pustaka barcode asli untuk cetak label | **DILEWATI DULU** | Lihat backlog §7. |

### 0B. Konsekuensi keputusan (1) — kepindahan kepemilikan ke Gudang

| Modul terbit | Perubahan | Catatan |
| --- | --- | --- |
| Sales & Marketing | Tab **"Ketertelusuran Produk (Lot & Serial)" dihapus** dari strip tab; jumlah tab kembali **7** dan teks cetak biru "7 kelompok kerja" dipulihkan. Berkas `KetelusuranSalesModule.tsx` dihapus bersih. | Data `UnitSerialAlkes`, `cariKetelusuran()`, dan rantai bets tetap ada — hanya layarnya pindah. Nomor bets masih tampil sebagai kolom di tab Order. |
| PMS & Vigilance | Tab/form **recall (Penarikan Produk) pindah** ke Gudang; PMS mempertahankan laporan KTD dan menambahkan panel ringkasan recall (jumlah status terbuka/tertutup + tautan ke tab 11). | Pelaporan regulatori tetap di PMS, eksekusi kunci batch & penarikan lapangan di Gudang. |
| Gudang & Logistik | Tab 3 memegang rantai ketertelusuran bets/serial; tab 11 memegang CRUD recall + kunci batch + daftar fasyankes penerima. | Menjadi satu-satunya tempat menulis `PenarikanProduk` dan status unit. |

Ini menyentuh modul yang sudah terbit, jadi M5 wajib menguji ulang tab Sales yang tersisa dan layar PMS sebelum publikasi.

---

## 0. Keputusan lingkup (baca sebelum menyetujui)

Lampiran meminta bentuk infrastruktur yang tidak bisa dijalankan dari dalam aplikasi ini. Tabel keputusan di bawah berlaku untuk seluruh rencana; kalau ada baris yang tidak disetujui, tab terkait tidak dibangun.

| Permintaan lampiran | Bisa dibangun di aplikasi ini? | Bentuk yang saya terapkan |
| --- | --- | --- |
| Backend Go/NestJS, microservices, gRPC, Kafka/RabbitMQ | Tidak | Satu modul dengan "context" data sendiri di atas lapisan koleksi lokal + pemicu lintas modul yang sudah ada (order → FEFO → piutang). |
| Skema PostgreSQL (`inventory_batches`, `inventory_serials`, `inventory_locations`, indeks partial) | Tidak langsung | Interface TypeScript + kunci localStorage, dengan indeks logis ditiru lewat memo pengurutan (FEFO, lookup serial, lookup RFID). |
| Aplikasi PDA Flutter (Zebra/Honeywell) | Tidak | Tab **Scanner & RFID** dengan alur *Scan-to-Action* (pindai Bin → Produk → Jumlah) yang bisa dipraktikkan di layar, plus jejak perangkat. |
| RFID Gate / Tunnel fisik + broker MQTT | Tidak | Pemonitoran antrean kejadian perangkat (`protokol: MQTT`), validasi silang ke manifes pengiriman. |
| Sensor IoT suhu/kelembaban langsung | Sebagian | Tab **Rantai Dingin** sudah memakai log sensor; ditambahkan excursion → kunci stok otomatis + wajib CAPA. |
| Webhook e-Katalog LKPP nyata | Tidak | Antrean sinkronisasi + pratinjau payload (endpoint, body, status percobaan) yang bisa disalin tim IT. |
| API SATUSEHAT / HL7 FHIR nyata | Tidak | Builder Bundle FHIR (`SupplyDelivery`, `Device`, `Immunization`) + status tolakan `OperationOutcome`. Kredensial tidak pernah disimpan di aplikasi. |
| Cetak label barcode/QR/RFID | Sebagian | Antrean cetak label per baris penerimaan (SKU, no. bets, ED) dengan tautan cetak aplikasi yang sudah ada (`PrintModal`). |
| e-Faktur / finansial | Sebagian | Terbit nomor faktur + status sinkronisasi ke modul Keuangan, bukan koneksi ke DJP. |

Preseden: modul **Newsletter & Mailing List (listmonk)** dikerjakan dengan pendekatan yang sama — permukaan fitur dan aturan mesin aslinya diimplementasikan ulang, integrasi hardware/API jadi layar antrean + pratinjau payload.

---

## 1. Peta fitur: 12 tab baru

Strip tab mengikuti pola `SalesModule` (`pb-3 px-3 font-semibold border-b-2`, aksen **amber** khas menu Operations, `overflow-x-auto`).

| # | Tab | Bagian lampiran | Isi | Penjaga (guard) yang ditegakkan |
| --- | --- | --- | --- | --- |
| 1 | Dasbor & Kesiapan Audit | §5 arsitektur | KPI stok, pencapai FEFO, stok terkunci, antrean inbound/outbound, senarai periksa kesiapan audit CDB, alarm lintas tab | Senarai periksa tidak bisa "lunas" bila masih ada excursion suhu tanpa CAPA |
| 2 | Struktur Gudang & Bin | §1 | Multi-warehouse (Utama, Karantina, Retur, Bad Stock, Cold Room) + bin Aisle-Row-Shelf-Bin, kapasitas, zona suhu, tag RFID, jarak dari dock | Bin tidak boleh menampung zona suhu yang berbeda dari aturan simpan |
| 3 | Stok & FEFO Dual-Track | §2, §5 arsitektur | Tabel stok saat ini + trek jamak: jalur A (bets & ED) / jalur B (serial & kalibrasi), `qty_available` vs `qty_reserved`, status `AVAILABLE/RESERVED/QUARANTINE/DAMAGED/EXPIRED_LOCK` | Picking menolak bets terkunci; pengeluaran memakai FEFO, bukan batch acak |
| 4 | Rantai Dingin & Lingkungan | §1, §3 pemerintah | Sensor (dipertahankan), excursion tinggi/rendah, durasi di luar 2–8°C, bukti suhu untuk Kemenkes, pemicu CAPA | Excursion > ambang → stok cold chain terkunci karantina otomatis |
| 5 | Pengendalian Hama | sudah ada | Log pest control (dipertahankan, hanya dipindah ke sub-modul sendiri) | Temuan "Ditemukan Indikasi" wajib punya tindakan sanitasi |
| 6 | Penerimaan (Inbound) | §4 | Pencocokan PO, QC incoming (uji fungsi & kalibrasi), directed put-away dari atribut katalog, antrean cetak label, penolakan | Jumlah diterima ≠ jumlah PO → status "Selisih Jumlah" dan tidak bisa release; alat berat wajib lolos uji fungsi sebelum `AVAILABLE` |
| 7 | Pengiriman (Outbound) | §4 | Picking & packing dengan rute terpendek antar bin, Surat Jalan, sinkronisasi e-Faktur/Keuangan, manifes + lacak kurir/3PL, nomor paket LKPP | Surat jalan tidak dapat terbit bila rute belum tersusun atau alokasi FEFO kurang |
| 8 | Opname & Cycle Count | §5 | Hitung fisik *blind count* per zona tanpa menutup gudang, selisih, pengajuan penyesuaian | `qtyFisik` disembunyikan dari petugas (tidak ada kolom qty sistem saat input); penyesuaian di atas ambang butuh persetujuan PJT |
| 9 | Optimasi Stok (Min-Max & ROP) | §5 | Reorder point, safety stock, notifikasi ke Purchasing, ageing analysis & cuci gudang | Stok tersisa < 6 bulan → kunci + saran program cuci gudang ke tim Sales; ROP terlampaui memancing usulan PO |
| 10 | Scanner & RFID | §1 arsitektur | Alur Scan-to-Action handheld, gerbang RFID, validasi silang ke manifes, status protokol | Bin tidak sesuai produk, bets tidak terdaftar, jumlah melebihi manifes, stok terkunci — semua ditolak + tercatat |
| 11 | Karantina & Penarikan (Recall) | §2, §5 arsitektur | Kunci batch atas edaran recall, daftar fasyankes penerima batch tersebut, jalur retur/pemusnahan | Batch recall tidak mungkin terpilih oleh FEFO; penutupan recall butuh verifikasi PJT |
| 12 | Kemenkes RI | §3 arsitektur | Antrean webhook stok e-Katalog LKPP + pencocokan kontrak, kiriman FHIR SATUSEHAT, kirim berkala data kepatuhan suhu | Stok kosong di aplikasi → wajib sinkron sebelum pesanan LKPP diterima (hindari penalti pembatalan) |

Catatan benturan tampilan (sudah diputuskan, lihat §0B): ketertelusuran dan recall **sudah** punya layar di tab Sales "Ketertelusuran Produk (Lot & Serial)" dan di modul PMS. Kepemilikan keduanya **pindah ke Gudang** (tab 3 dan tab 11); Sales kehilangan tab ketertelusuran dan PMS menyimpan laporan KTD plus ringkasan recall. Data tetap satu sumber — `db.cariKetelusuran()` dan `PenarikanProduk` tidak diduplikasi, hanya pemindahan hak tulis ke layar gudang.

---

## 2. Model data

Sudah diterapkan pada M1 di `src/types/index.ts`; bentuk potongan yang mengubah `StokGudang` ada di §Lampiran A.

| Tipe baru | Padanan di lampiran | Kunci localStorage | Isi pokok |
| --- | --- | --- | --- |
| `GudangFisik` | Multi-Warehouse Setup | `gudang_unit` | `tipe: Gudang Utama \| Gudang Karantina \| Gudang Retur \| Gudang Rusak (Bad Stock) \| Cold Room`, penanggung jawab, zona suhu, `isActive` |
| `LokasiBin` | Bin Location Tracking / `inventory_locations` | `gudang_bin` | `lorong, baris, rak, laci`, `zonaSuhu`, `kapasitas`, `terpakai`, `rfidTagId`, `jarakDariDockMeter` |
| `AturanSimpan` | directed put-away (§3) | `gudang_aturan_simpan` | kondisi (zona suhu dibutuhkan, kategori, butuh kalibrasi, steril) → gudang/bin tujuan + prioritas + `alasanRegulasi` |
| `TerimaBarang` | Inbound + PO matching (§4) | `gudang_penerimaan` | nomor terima, PO & pemasok, status pencocokan, baris (SKU/bets/ED/dipesan/diterima/ditolak/bin tujuan), hasil QC + uji fungsi, `labelDicetak`, `rfidDitempel` |
| `SuratJalan` | Outbound, DO, e-Faktur, manifes (§4) | `gudang_surat_jalan` | status alur 7 tahap, `rute: {binId, kodeBin, bets, qty, langkah}[]`, `jarakMeter`, kurir + nomor lacak, `statusEFaktur`, `nomorPaketLkpp`, `statusSyncLkpp` |
| `OpnameStok` | Stock opname / cycle counting (§5) | `gudang_opname` | `metode: Blind Count \| Open Count`, baris (qty sistem vs qty fisik null), status berjalan/terkunci/selisih diajukan/selesai |
| `JejakPergerakan` | Immutable movement log (§5) | `gudang_pergerakan` | waktu, SKU, bets, bin asal → tujuan, jumlah, tipe kejadian, pengguna & peran, dokumen rujukan, alasan, `hashSebelum` + `hash` (rantai anti-ubah) |
| `AmbangStok` | Min-Max & reorder point (§5) | `gudang_ambang` | rata-rata terjual/hari, `leadTimeHari`, `safetyStockHari`, min/max, gudang & pemasok tujuan |
| `KejadianScanner` | Barcode/RFID workflow (§1 arsitektur) | `gudang_scanner` | perangkat, `protokol: USB/Serial \| MQTT`, mode, bin/produk/bets/jumlah yang dipindai, hasil validasi |
| `SinkronisasiLkpp` | e-Katalog webhook (§3 arsitektur) | `gudang_lkpp_sync` | SKU, nomor paket, qty dilaporkan, status antre/terkirim/gagal, percobaan, pemicu, pesan respons |
| `KirimanSatuSehat` | SATUSEHAT / SMILE FHIR (§3 arsitektur) | `gudang_satusehat` | tipe sumber daya (`SupplyDelivery/Device/Immunization/Organization`), kode fasyankes, bets/serial, status, `payloadJson`, suhu lampiran |
| `KonfigurasiGudang` | ambang & endpoint | `gudang_pengaturan` | `umurKunciEdHari` (180), toleransi cold chain `{min,max,menitMaksimum}`, ambang selisih opname, frekuensi log suhu, prefix surat jalan, endpoint LKPP & SATUSEHAT (tanpa token) |

Perluasan tipe lama:
- `StokGudang` → opsi baru `gudangId`, `binId`, `statusStok`, `qtyDipesan`, `jalur: 'A' \| 'B'`, `nomorSerial`, `rfidTagId`, `tanggalDikunci`, `alasanKunci` (opsional supaya 5 baris seed lama dan jalur FEFO yang ada tetap valid).
- `UnitSerialAlkes` → opsi `tahapSiklusHidup`, `kalibrasiBerikutnya`, `tanggalInstalasi`, `kodeFasyankesSatuSehat` untuk siklus hidup Track B.
- `PurchaseOrderAlkes`, `InspeksiQC`, `ProdukKembalian`, `PenarikanProduk`, `LayananTeknis` dipakai ulang, tidak diduplikasi.

---

## 3. Aturan bisnis yang menjadi penjaga layar

1. **FEFO sadar-kunci** — `alokasikanFEFO` (saat ini `src/utils/sales.ts:148`) diperluas: lewati baris `QUARANTINE`, `DAMAGED`, `EXPIRED_LOCK`, dan kurangi kapasitas dengan `qtyDipesan`.
2. **Eksekusi FEFO** — `db.catatPengirimanSalesOrder` (`src/services/pocketbase.ts:1032`) sekarang hanya memotong batch persis; diubah supaya memakai usulan FEFO multi-bets dan menolak bila ada bets terkunci.
3. **Directed put-away** — resolusi aturan (prioritas terkecil menang) atas atribut katalog → usulan gudang + bin; penempatan manual wajib beralasan dan tercatat old/new.
4. **Rute picking** — urut bin berdasarkan lorong→baris→rak→laci dan jarak dari dock; tampilkan langkah, total meter, dan hemat vs urutan gudang mentah.
5. **Reorder point** — `ROP = rataRataHari × leadTimeHari + safetyStock`, `safetyStock = rataRataHari × safetyStockHari`; status Aman/Perlu Pesan/Kritis + tombol usul PO ke Purchasing.
6. **Ageing lock** — sisa ED < `umurKunciEdHari` → `EXPIRED_LOCK`/karantina + saran cuci gudang ke Sales; tetap terbaca di analitik.
7. **Kalibrasi (Track B)** — unit dengan `kalibrasiBerikutnya` terlewat → tidak `AVAILABLE`, ditolak picking dan muncul di tab Karantina.
8. **Blind count** — input fisik tanpa angka sistem; selisih > ambang → `Selisih Diajukan` dan butuh `verifikasiPJT`; setiap penyesuaian menulis satu mata rantai `JejakPergerakan`.
9. **Rantai hash log** — `hash = sha256(waktu|kodeSKU|nomorBets|dariBin->keBin|jumlah|tipe|dokumenRujukan|hashSebelum)` dengan baris pertama `hashSebelum = 64 angka nol` dan urutan rantai = urutan kronologis array; tombol "Verifikasi Integritas" memindai putus rantai (bukti immutability untuk audit). Bentuk kanonik ini adalah kontrak: util M3 dan penjaga benih harus menghitung string yang persis sama dengan seed.
10. **Validasi scanner** — empat penolakan eksplisit (bin tak sesuai, bets tak terdaftar, jumlah melebihi manifes, stok terkunci) + penerimaan tercatat sebagai pergerakan.
11. **Kunci recall** — masukkan nomor bets → `QUARANTINE` semua baris bets itu + daftar fasyankes penerima (dari `cariKetelusuran`) + antrean webhook LKPP dan kiriman FHIR.
12. **Antrean pemerintah** — perubahan stok/karusakan/recall memicu baris `SinkronisasiLkpp`; kegagalan menaikkan percobaan dan memblokir konfirmasi stok ke Sales.

**Penjaga benih (sudah aktif sejak M2)** — `scripts/cek-benih-gudang.ts`, dijalankan dengan `npm run cek:benih`, menegakkan empat invarian data: (a) saldo log pergerakan per bin+bets sama dengan `jumlahStok` dan tanpa saldo yatim; (b) `terpakai` bin sama dengan total stok di bin itu dan tidak melebihi kapasitas; (c) rantai sha256 `JejakPergerakan` cocok dengan bentuk kanonik aturan 9 dan urut waktu; (d) seluruh rujukan silang resolve (`gudangId`, `binId`, `purchaseOrderId`, `nomorTerima`, `binDipindai`). Setiap penambahan baris seed harus membuat perintah ini tetap hijau — ini yang dipakai M6 sebagai bukti bahwa angka gudang tidak dikarang.

---

## 4. Selaras UI/UX dengan menu lain

- Primitif dipindah ke `src/components/modules/operations/gudang/ui.tsx`: impor ulang `Badge`, `Panel`, `Stat`, `Modal`, `BarCapaian`, `chipFilter`, `inputClass`, `labelClass`, `formatTanggal`, `formatPersen`, `formatRupiah` dari `commercial/sales/ui.tsx`, lalu varian tombol **amber** (`tombolPrimerGudang`) agar aksen menu Operations tetap.
- Tipografi hanya token: `text-2xs` (10px), `text-xs` (11px), `text-sm` (12.5px), `text-xl` (16.5px). Migrasi wajib: `WarehouseModule.tsx` lama memakai `text-[10px]`/`text-[11px]` arbitrer di 9 tempat; token memberi langkah naik otomatis di mobile.
- Chip filter seragam netral: aktif `bg-slate-700`/teks putih, hover `bg-slate-200` — memakai `chipFilter()` yang sudah jadi konvensi.
- Tabel: `thead` `bg-slate-100`, `tbody` `divide-y divide-slate-100`, `text-xs`; badge status memakai `Tone` yang ada (`amber`/`rose`/`emerald`/`blue`/`slate`).
- Header modul mempertahankan badge "Rantai Pasok CDAKB" dan teks hukum yang sudah ada, ditambah baris cetak biru "12 kelompok kerja".
- Seluruh mutasi lewat `db.logAudit('Gudang & Logistik — <area>', aktivitas, nomorReferensi, pengguna, peran, bentangPerubahan(lama, patch))` agar Old Value/New Value muncul di jejak audit.

---

## 5. Tahap kerja

| Tahap | Hasil | Berkas | Perkiraan |
| --- | --- | --- | --- |
| M1 | 12 tipe + perluasan 2 tipe lama — **selesai, `tsc --noEmit` hijau** | `src/types/index.ts` | 1 sesi |
| M2 | **Selesai.** Seed 5 gudang, 18 bin, 6 aturan simpan, 9 penerimaan, 6 surat jalan, 4 opname, 19 pergerakan (rantai sha256 utuh, 0 penyimpangan), 8 ambang, 8 kejadian scanner, 6 sinkron LKPP, 6 kiriman FHIR, 1 konfigurasi — plus 14 baris `StokGudang` (STK-001…STK-014) yang membuat tiap `terpakai` bin punya dasar, 6 `PurchaseOrderAlkes` baru (PO-2023-019, PO-2024-017/024/029/044/045) agar `purchaseOrderId` penerimaan resolve, dan izin edar NIE-006 untuk alat radiasi. Fixture penjaga sengaja dibiarkan: bets `LOT-2024-SP08` karantina dengan ED paling awal (FEFO naif salah pilih), SJT-002 tertahan `Antre Picking`, AMB-06 di bawah titik pesan, OPN-002 `qtyFisik: null`, LKP-005 HTTP 503, FHR-004 `OperationOutcome` | `src/data/initialData.ts`, `scripts/cek-benih-gudang.ts`, `package.json` | 1 sesi |
| M3 | **Selesai.** `src/utils/gudang.ts` (~900 baris) mengimplementasikan 12 aturan §3 per tab: FEFO sadar-kunci (`alokasiFEFOSadarKunci`, `stokBebas`), directed put-away (`tentukanTempatSimpan`), rute picking + gerbang surat jalan (`susunRutePicking`, `gerbangSuratJalan`), reorder point, ageing lock, opname buta + usulan penyesuaian, deteksi excursi cold chain, validasi pemindaian, dampak/gerbang recall, builder payload LKPP & bundle FHIR SATUSEHAT, plus skor kesiapan audit CDB (15 poin) dan KPI lintas tab. SHA-256 ditulis murni TypeScript (BigInt table + DataView, tanpa Web Crypto/pustaka baru) sehingga bentuk kanonik util **terbukti identik** dengan 19 hash seed — kontraknya kini dijaga permanen oleh `npm run cek:benih` (bersama pengecekan FEFO tidak memilih bets karantina). Ikutan: tipe `AturanSimpan` dapat penanda `terikatRecall?` (seed `ATR-01` memakainya) supaya aturan karantina tidak menyeret barang sehat; `persenTerkunci` diganti `persenUnitTidakBebas` agar label KPI jujur. **Catatan untuk M5/M6:** benih bertanggal 2024 sedangkan jam jalan 2026 — util menerima opsional `dari?: Date`, jadi shell harus meneruskan satu tanggal acuan agar layar tidak menampilkan semua bets kedaluwarsa | `src/utils/gudang.ts`, `scripts/cek-benih-gudang.ts`, `src/types/index.ts`, `src/data/initialData.ts` | 1 sesi |
| M4 | **Selesai.** `src/services/pocketbase.ts` menambah blok GUDANG & LOGISTIK: 12 koleksi (13 getter/save + `getKonfigurasiGudang`/`saveKonfigurasiGudang` di 12 kunci `gudang_*`), semua tulisan memakai `auditGudang(area, …)` → `logAudit('Gudang & Logistik — <area tab §1>', …, bentangPerubahan(lama, patch))` dengan pengguna default 'Kepala Gudang' / peran 'Operations & Technical'. Mutasi tingkat dokumen: `releasePenerimaanKeStok` (posting sekali + prakalkulasi kapasitas), `pindahkanStokAntarBin`, `kunciStokKarantina`/`lepasKunciStok`, `susunRuteSuratJalan`, `ajukanSelisihOpname`/`verifikasiSelisihOpname`, `catatPemindaian`, `antrekanSinkronisasiLkpp`, `catatKirimanSatuSehat`. Retensi 300 baris (pergerakan kronologis memangkas kepala, scanner terbaru di depan) mengikuti pola `log_suhu` 50 baris; `verifikasiRantaiHash` kini sadar-jendela (baris pertama = jangkar, `mulaiDariGenesis` menandai rantai penuh). **Jalur FEFO Sales ditulis ulang:** `catatPengirimanSalesOrder(id, dari)` kini memakai `alokasiFEFOSadarKunci` → `susunRutePicking` → `gerbangSuratJalan`, mengunci & melepas `qtyDipesan`, menulis satu jejak 'Pengiriman' per bets, menerbitkan surat jalan + e-Faktur + faktur pajak + piutang, dan hanya masuk antrean LKPP untuk pesanan berjalur 'e-Katalog LKPP'; penolakan gerbang menahan pesanan di status 'Menunggu Alokasi FEFO' tanpa menyentuh stok; surat jalan yang sudah terbit **mempertahankan nomornya sendiri** dan jejak pergerakan menunjuk nomor itu (bukan nomor baru dari jam jalan — diverifikasi langsung di aplikasi pada 4 November 2026, ketika generator memberi `SJ/CDAKB/2026/…` sementara dokumennya `SJ/CDAKB/2024/…`). Penjaga permanennya `npm run cek:fefo` (60 an asersi: outbound idempoten, penahan kekurangan stok, posting sekali-saja, kapasitas rak, karantina QC, verifikasi PJT opname, retensi 300 baris + isi bin = kartu stok). Ikutan: `nomorIzinEdarUntuk()` mencocokkan registri dengan awalan nama (registri menyimpan 'Syringe Pump Presisi Tinggi', kartu stok '… AMS-SP500' — pencocokan persis dulu selalu jatuh ke '-'), dan `labelWaktu` memakai tanggal+jam satu basis (sebelumnya tanggal UTC + jam lokal, selisih sampai 20 jam). **Kontrak untuk M5:** semua mutasi menerima `dari?: Date` — shell wajib meneruskan satu tanggal acuan | `src/services/pocketbase.ts`, `scripts/cek-jalur-fefo.ts`, `scripts/penyimpanan-node.ts`, `package.json`, `src/types/index.ts` | 1 sesi |
| M5 | **Selesai.** Shell 12 tab (`WarehouseModule.tsx`) + primitif bersama (`gudang/ui.tsx`) + 12 sub-modul (`DasborAuditTab`, `StrukturGudangTab`, `StokFefoTab`, `RantaiDinginTab`, `PengendalianHamaTab`, `PenerimaanInboundTab`, `PengirimanOutboundTab`, `OpnameCycleCountTab`, `OptimasiStokTab`, `ScannerRfidTab`, `KarantinaRecallTab`, `GerbangPemerintahTab`); 3 tab lama (Stok, Rantai Dingin, Pengendalian Hama) dipindah tanpa kehilangan isi fungsional dengan seluruh tipografi dimigrasikan ke token `text-2xs`/`text-xs`/`text-sm`/`text-xl`; **migrasi kepemilikan §0B tuntas** (`SalesModule.tsx` kembali 7 tab & `SalesOrderModule.tsx` menyegarkan stok usai eksekusi FEFO, `PMSModule.tsx` mempertahankan KTD + ringkasan baca-saja recall dengan tombol lompat langsung ke Tab 11 Gudang) | `operations/WarehouseModule.tsx`, `operations/gudang/*.tsx`, `operations/gudang/ui.tsx`, `commercial/SalesModule.tsx`, `commercial/sales/SalesOrderModule.tsx`, `commercial/PMSModule.tsx`, `App.tsx` | 2–3 sesi |
| M6 | **Selesai.** Penjaga permanen `scripts/cek-m6-gudang.ts` (`npm run cek:gudang` & `npm run cek:semua`, 39 pemeriksaan tambahan di atas `cek:benih` + `cek:fefo`) melatih dan mengunci seluruh 12 aturan §3, kesiapan audit CDB 15 poin, area Tab 12 **Kemenkes RI**, integrasi `alokasikanFEFO`/`validasiSalesOrder` Sales, serta invarian statis UI; `KetelusuranSalesModule.tsx` dihapus bersih; 0 pemakaian ukuran huruf arbitrer `text-[10px]`/`text-[11px]` di seluruh 17 berkas modul Gudang, `SalesModule`, `SalesOrderModule`, dan `PMSModule`; `tsc --noEmit` 0 galat; bundel produksi `vite build` terukur **2.051,13 kB JS (441,17 kB gzip)** + **58,44 kB CSS (10,53 kB gzip)** | `scripts/cek-m6-gudang.ts`, `package.json`, `docs/blueprint-warehouse-logistics.md`, `commercial/sales/SalesOrderModule.tsx` | 1 sesi |

Definisi selesai per tab: data terbaca dari seed, aksi menulis localStorage, setiap aksi memunculkan jejak audit old/new, guard menolak dengan sebab yang terlihat, dan tipografi sama dengan modul Sales/HRD.

---

## 6. Risiko & status keputusan

1. ~~**Duplikasi tampilan**~~ — **PUTUSAN: pindah kepemilikan ke Gudang** (lihat §0B). Sales kehilangan tab ketertelusuran, PMS menyimpan KTD + ringkasan recall. Risiko regresinya: modul Sales & PMS yang sudah terbit ikut berubah dan harus diuji ulang sebelum publikasi.
2. ~~**Perubahan jalur FEFO inti**~~ — **PUTUSAN: disetujui.** `catatPengirimanSalesOrder` dijadikan eksekusi FEFO sadar-kunci; wajib ada uji ulang alur order→stok→piutang.
3. **Pertumbuhan bundel** — aplikasi sudah 1,09 MB setelah minifikasi (12 tab gudang menambah estimasi 90–140 kB). `import()` per tab **ditunda**, lihat backlog §7.1.
4. **localStorage** — 12 koleksi baru menaikkan ukuran; perlu kebijakan pembatasan riwayat (pergerakan & scanner dipangkas 300 baris terakhir, mengikuti pola `log_suhu` 50 baris).
5. **Endpoint pemerintah** — payload LKPP/FHIR hanya pratinjau; menyambungkan ke sistem nyata butuh backend terpisah dan tidak bisa dilakukan dari build statis ini.
6. ~~**Label & PDA**~~ — cetak label memakai `PrintModal` yang ada; pustaka barcode asli **ditunda**, lihat backlog §7.2.

---

## 7. Backlog — disetujui untuk dikerjakan kemudian

Disimpulkan 4 November 2026 saat M1 disetujui; keduanya **tidak** masuk cakupan M1–M6.

1. **Pemecahan bundel per tab (`import()` + `React.lazy`)** — hasil ukur M6 pasca-integrasi 12 tab gudang: **2.051,13 kB JS minifikasi (441,17 kB gzip)** dan **58,44 kB CSS (10,53 kB gzip)** dari 1.723 modul. Kerjakan dengan mengubah strip tab `WarehouseModule` (serta modul besar lain seperti Sales/Listmonk) ke lazy chunk per modul/sub-modul plus satu `Suspense` fallback; ukur ulang `vite build` dan catat angka sebelum/sesudah di dokumen ini. Pertimbangkan digabung menjadi satu chunk "gudang" alih-alih 12 chunk kecil supaya permintaan jaringan tidak membengkak.
2. **Cetak barcode/QR asli pada label** — saat ini antrean label (tab 6 Penerimaan) hanya menandai `labelDicetak` dan memakai `PrintModal`. Label sungguhan butuh satu pustaka (mis. `jsbarcode`/`bwip-js` untuk Code128 & GS1-128, `qrcode` untuk QR) — menambah dependensi produksi, sehingga menunggu persetujuan. Isi yang wajib tercetak sudah siap: SKU, nomor bets, tanggal kedaluwarsa, kode bin, dan tag RFID bila terisi.
3. **Kunci bersama `kodeSKU` pada registri izin edar** — `IzinEdarAlkes` hanya menyimpan `namaAlkes` + `tipeModel` tanpa `kodeSKU`, sedangkan kartu stok memakai `ALKES-…`; sejak M4 pencarian nomor izin edar saat posting penerimaan mencocokkan **awalan nama** (`nomorIzinEdarUntuk`). Penamaan yang berubah (mis. model disisipkan di tengah) akan jatuh ke `'-'`. Perbaikan bersih: tambahkan `kodeSKU` pada registri dan pindahkan 7 baris benihnya, lalu cocokkan persis.

Sampai butir 1 dan 2 dikerjakan, tab 6 dan tab 10 tetap berfungsi penuh sebagai alur bisnis + validasi; yang hilang hanya keluaran fisik label.

---

## Lampiran A — potongan tipe yang sudah diterapkan pada M1

Sudah masuk `src/types/index.ts` (blok "4. Gudang & Logistik") bersama 12 interface baru; dipertahankan di sini sebagai rujukan bentuk.

```ts
export type StatusStokFisik = 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED_LOCK';
export type JalurInventaris = 'A' | 'B'; // A = habis pakai (bets & FEFO) | B = alat berat (serial & perawatan)

export interface StokGudang {
  /* ...12 field yang sudah ada... */
  gudangId?: string;
  binId?: string;
  statusStok?: StatusStokFisik;
  qtyDipesan?: number;
  jalur?: JalurInventaris;
  nomorSerial?: string;
  rfidTagId?: string;
  tanggalDikunci?: string;
  alasanKunci?: string;
}

// UnitSerialAlkes juga diperluas (semua opsional):
// tahapSiklusHidup, kalibrasiBerikutnya, tanggalInstalasi, kodeFasyankesSatuSehat
```

## Lampiran B — rujukan kode saat ini

- Shell & 3 tab lama: [WarehouseModule.tsx:17](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/components/modules/operations/WarehouseModule.tsx#L17), strip tab L150-189, tabel stok L211-260.
- Tipe terkait: `StokGudang` [types/index.ts:120](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/types/index.ts#L120), `InspeksiQC` L103, `ProdukKembalian` L88, `PenarikanProduk` L270, `UnitSerialAlkes` L693, `PurchaseOrderAlkes` L203.
- Aturan & data: `alokasikanFEFO` [utils/sales.ts:148](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/utils/sales.ts#L148), `catatPengirimanSalesOrder` [services/pocketbase.ts:1032](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/services/pocketbase.ts#L1032), `cariKetelusuran` L1264, `logAudit` L1086, `bentangPerubahan` L637, seed `INITIAL_STOK_GUDANG` [data/initialData.ts:324](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/data/initialData.ts#L324).
- Primitif desain: [commercial/sales/ui.tsx:41](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/components/modules/commercial/sales/ui.tsx#L41) dst; token ukuran huruf `src/index.css` blok `@theme`.
- Preseden pola "modul mesin luar": [sales/ListmonkModule.tsx](file:///C:/Users/DESKTOP/Documents/Qoder/2026-11-04/6fa62ac9/repo/src/components/modules/commercial/sales/ListmonkModule.tsx).
