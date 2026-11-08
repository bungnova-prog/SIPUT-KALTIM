import {
  CheckCircle2,
  KeyRound,
  Power,
  ShieldAlert,
  Sliders,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import {
  KerangkaMuat,
  KotakDataKosong,
  KotakGalatData,
} from '../components/StatusMuatData';
import ModalUbahKataSandi from '../components/ModalUbahKataSandi';
import { tampilkanNipSesuaiPeran } from '../lib/format';
import {
  KONFIGURASI_KLASIFIKASI_BAWAAN,
  KONFIGURASI_PERINGATAN_FORM_BAWAAN,
} from '../lib/konfigurasi';
import { useAppStore } from '../lib/storeAplikasi';
import {
  konfigurasiRepository,
  penggunaRepository,
  wilayahRepository,
} from '../services';
import type {
  KonfigurasiSistem,
  Peran,
  ProfilPengguna,
  Wilayah,
} from '../types/domain';

export default function HalamanPengguna() {
  const { profilAktif, tambahToast } = useAppStore();

  const [pengguna, setPengguna] = useState<ProfilPengguna[]>([]);
  const [daftarKabupaten, setDaftarKabupaten] = useState<Wilayah[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  // Konfigurasi Ambang Terpusat (GIS & Peringatan Form Terpisah — AGENTS.md §8)
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSistem>({
    klasifikasi: { ...KONFIGURASI_KLASIFIKASI_BAWAAN },
    peringatanForm: { ...KONFIGURASI_PERINGATAN_FORM_BAWAAN },
  });
  const [sedangSimpanKonfig, setSedangSimpanKonfig] = useState(false);

  // Form Tambah Pengguna Baru
  const [bukaFormTambah, setBukaFormTambah] = useState(false);
  const [emailBaru, setEmailBaru] = useState('');
  const [kataSandiBaru, setKataSandiBaru] = useState('Perlindungan.1!');
  const [namaBaru, setNamaBaru] = useState('');
  const [nipBaru, setNipBaru] = useState('');
  const [jabatanBaru, setJabatanBaru] = useState('');
  const [peranBaru, setPeranBaru] = useState<Peran>('petugas');
  const [wilayahBaruId, setWilayahBaruId] = useState('');
  const [wkppBaru, setWkppBaru] = useState('');
  const [sedangMenambah, setSedangMenambah] = useState(false);
  const [idSedangDiubahStatus, setIdSedangDiubahStatus] = useState<string | null>(null);

  // Modal Hapus & Modal Ubah Sandi
  const [penggunaMauDihapus, setPenggunaMauDihapus] = useState<ProfilPengguna | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);
  const [modalGantiSandiBuka, setModalGantiSandiBuka] = useState(false);

  const muatData = useCallback(() => {
    setMemuat(true);
    setGalat(null);
    Promise.all([
      penggunaRepository.daftar(profilAktif),
      wilayahRepository.daftarKabupaten(),
      konfigurasiRepository.ambil(),
    ]).then(([resPengguna, resKab, resKonfig]) => {
      if (!resPengguna.ok) {
        setGalat(resPengguna.pesan);
      } else {
        setPengguna(resPengguna.data);
      }
      if (resKab.ok) {
        setDaftarKabupaten(resKab.data);
        setWilayahBaruId((sebelum) => sebelum || resKab.data[0]?.id || '');
      }
      if (resKonfig.ok) setKonfigurasi(resKonfig.data);
      setMemuat(false);
    });
  }, [profilAktif]);

  useEffect(() => {
    muatData();
    const berhenti = penggunaRepository.langganan(muatData);
    return berhenti;
  }, [muatData]);

  const tanganiTambahPengguna = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSedangMenambah(true);
    const hasil = await penggunaRepository.tambahSimulasi(
      {
        email: emailBaru,
        kataSandi: kataSandiBaru,
        nama: namaBaru,
        nip: nipBaru,
        jabatan: jabatanBaru,
        peran: peranBaru,
        wilayahId: peranBaru === 'admin' ? null : wilayahBaruId,
        wkpp: wkppBaru,
      },
      profilAktif
    );
    setSedangMenambah(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Menyimpan Pengguna',
        pesan: hasil.pesan,
      });
      return;
    }

    setEmailBaru('');
    setKataSandiBaru('Perlindungan.1!');
    setNamaBaru('');
    setNipBaru('');
    setJabatanBaru('');
    setWkppBaru('');
    setBukaFormTambah(false);
    tambahToast({
      jenis: 'sukses',
      judul: 'Akun Pengguna Berhasil Disimpan',
      pesan: `${hasil.data.nama} (${hasil.data.peran.toUpperCase()}) telah terdaftar dan siap digunakan untuk masuk.`,
    });
  };

  const tanganiHapusPengguna = async () => {
    if (!penggunaMauDihapus) return;
    setSedangMenghapus(true);
    const hasil = await penggunaRepository.hapus(penggunaMauDihapus.id, profilAktif);
    setSedangMenghapus(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Menghapus Pengguna',
        pesan: hasil.pesan,
      });
      return;
    }

    tambahToast({
      jenis: 'sukses',
      judul: 'Pengguna Berhasil Dihapus',
      pesan: `Akun ${penggunaMauDihapus.nama} telah berhasil dihapus dari sistem.`,
    });
    setPenggunaMauDihapus(null);
    muatData();
  };

  const tanganiUbahStatusAktif = async (target: ProfilPengguna) => {
    setIdSedangDiubahStatus(target.id);
    const hasil = await penggunaRepository.ubahStatusAktif(
      target.id,
      !target.aktif,
      profilAktif
    );
    setIdSedangDiubahStatus(null);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Mengubah Status Akun',
        pesan: hasil.pesan,
      });
      return;
    }

    tambahToast({
      jenis: 'info',
      judul: 'Status Akun Diperbarui',
      pesan: `${hasil.data.nama} kini berstatus ${hasil.data.aktif ? 'Aktif' : 'Nonaktif'}.`,
    });
  };

  const tanganiSimpanKonfigurasi = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSedangSimpanKonfig(true);
    const hasil = await konfigurasiRepository.perbarui(konfigurasi, profilAktif);
    setSedangSimpanKonfig(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Konfigurasi Ambang Ditolak',
        pesan: hasil.pesan,
      });
      return;
    }

    setKonfigurasi(hasil.data);
    tambahToast({
      jenis: 'sukses',
      judul: 'Konfigurasi Ambang Diperbarui',
      pesan: 'Klasifikasi tingkat serangan GIS dan peringatan dini formulir telah disinkronkan.',
    });
  };

  return (
    <div className="space-y-5">
      {/* Kepala Halaman */}
      <header className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-900">
              Otorisasi RLS &amp; Akun Resmi
            </span>
            <h1 className="mt-1.5 text-xl font-extrabold text-brand-900 sm:text-2xl">
              Manajemen Pengguna &amp; Konfigurasi Ambang Proteksi
            </h1>
            <p className="mt-0.5 text-xs text-ink-600 sm:text-sm">
              Pengelolaan akun terautentikasi tiga peran (Admin Provinsi, Operator UPTD, Petugas
              POPT) serta konfigurasi terpusat ambang klasifikasi serangan OPT.
            </p>
          </div>

          {profilAktif.peran === 'admin' && (
            <button
              type="button"
              onClick={() => setBukaFormTambah((v) => !v)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-surface hover:bg-brand-700"
            >
              <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
              <span>{bukaFormTambah ? 'Tutup Form' : 'Tambah Pengguna Baru'}</span>
            </button>
          )}
        </div>

        {profilAktif.peran !== 'admin' && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-gold-500 bg-gold-100 p-3.5 text-xs text-ink-900"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-ink-900" aria-hidden />
            <p>
              Anda masuk dengan peran <strong>{profilAktif.peran.toUpperCase()}</strong>. Sesuai
              kebijakan privasi dan Row Level Security (<strong>SECURITY.md §5 &amp; §9</strong>),
              hanya profil dalam cakupan kewenangan wilayah Anda yang ditampilkan.
            </p>
          </div>
        )}

        {/* Form Undang Pengguna Baru */}
        {bukaFormTambah && profilAktif.peran === 'admin' && (
          <form
            onSubmit={(e) => {
              void tanganiTambahPengguna(e);
            }}
            className="mt-5 space-y-4 rounded-xl border border-brand-700/25 bg-brand-100/35 p-4"
          >
            <h2 className="text-sm font-bold text-brand-900">
              Tambah & Daftarkan Akun Pengguna Langsung
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="input-usr-email"
                  className="block text-xs font-bold text-ink-900"
                >
                  Alamat Email Dinas <span className="text-danger-600">*</span>
                </label>
                <input
                  id="input-usr-email"
                  type="email"
                  required
                  value={emailBaru}
                  onChange={(e) => setEmailBaru(e.target.value)}
                  placeholder="petugas@disbun.kaltimprov.go.id"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="input-usr-nama"
                  className="block text-xs font-bold text-ink-900"
                >
                  Nama Lengkap <span className="text-danger-600">*</span>
                </label>
                <input
                  id="input-usr-nama"
                  type="text"
                  required
                  value={namaBaru}
                  onChange={(e) => setNamaBaru(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.P."
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="input-usr-peran"
                  className="block text-xs font-bold text-ink-900"
                >
                  Peran Sistem <span className="text-danger-600">*</span>
                </label>
                <select
                  id="input-usr-peran"
                  value={peranBaru}
                  onChange={(e) => setPeranBaru(e.target.value as Peran)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900"
                >
                  <option value="petugas">Petugas POPT Lapangan</option>
                  <option value="operator">Operator UPTD / Wilayah</option>
                  <option value="admin">Admin (Provinsi)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="input-usr-wilayah"
                  className="block text-xs font-bold text-ink-900"
                >
                  Wilayah Kabupaten / Kota
                </label>
                <select
                  id="input-usr-wilayah"
                  value={wilayahBaruId}
                  disabled={peranBaru === 'admin'}
                  onChange={(e) => setWilayahBaruId(e.target.value)}
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-900 disabled:bg-canvas disabled:text-ink-600"
                >
                  {peranBaru === 'admin' ? (
                    <option value="">Provinsi Kalimantan Timur (Lintas Wilayah)</option>
                  ) : (
                    daftarKabupaten.map((kab) => (
                      <option key={kab.id} value={kab.id}>
                        {kab.nama}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="input-usr-nip"
                  className="block text-xs font-bold text-ink-900"
                >
                  NIP (Opsional)
                </label>
                <input
                  id="input-usr-nip"
                  type="text"
                  value={nipBaru}
                  onChange={(e) => setNipBaru(e.target.value)}
                  placeholder="198501012010011001"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="input-usr-jabatan"
                  className="block text-xs font-bold text-ink-900"
                >
                  Jabatan Fungsional
                </label>
                <input
                  id="input-usr-jabatan"
                  type="text"
                  value={jabatanBaru}
                  onChange={(e) => setJabatanBaru(e.target.value)}
                  placeholder="Pengendali OPT Ahli Pertama"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="input-usr-wkpp"
                  className="block text-xs font-bold text-ink-900"
                >
                  WKPP / Unit Kerja
                </label>
                <input
                  id="input-usr-wkpp"
                  type="text"
                  value={wkppBaru}
                  onChange={(e) => setWkppBaru(e.target.value)}
                  placeholder="Contoh: WKPP Loa Janan"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink-900"
                />
              </div>

              <div>
                <label
                  htmlFor="input-usr-sandi"
                  className="block text-xs font-bold text-ink-900"
                >
                  Kata Sandi Akun Petugas <span className="text-danger-600">*</span>
                </label>
                <input
                  id="input-usr-sandi"
                  type="text"
                  required
                  value={kataSandiBaru}
                  onChange={(e) => setKataSandiBaru(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 font-mono text-xs text-ink-900"
                />
                <p className="mt-1 text-[11px] text-ink-600">
                  Kata sandi awal bawaan: <code className="font-mono font-bold text-brand-900">Perlindungan.1!</code> (Petugas dapat mengubahnya secara mandiri setelah masuk).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBukaFormTambah(false)}
                className="min-h-[44px] rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-900 hover:bg-canvas"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={sedangMenambah}
                className="min-h-[44px] rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
              >
                {sedangMenambah ? 'Menyimpan Akun...' : 'Simpan Akun Pengguna'}
              </button>
            </div>
          </form>
        )}
      </header>

      {galat && <KotakGalatData pesan={galat} onCobaLagi={muatData} />}

      {memuat && pengguna.length === 0 ? (
        <KerangkaMuat pesan="Memuat daftar profil pengguna..." jumlahBaris={4} />
      ) : (
        <>
          {/* Daftar Pengguna: Tabel Desktop + Kartu Ponsel 360px */}
          <section
            aria-labelledby="judul-daftar-pengguna"
            className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 border-b border-line pb-3.5">
              <Users className="h-5 w-5 shrink-0 text-brand-900" aria-hidden />
              <h2
                id="judul-daftar-pengguna"
                className="text-base font-bold text-ink-900 sm:text-lg"
              >
                Daftar Profil Pengguna ({pengguna.length} Akun)
              </h2>
            </div>

            {pengguna.length === 0 ? (
              <div className="mt-4">
                <KotakDataKosong pesan="Tidak ada profil pengguna yang dapat ditampilkan untuk peran ini." />
              </div>
            ) : (
              <>
                {/* Tabel Desktop */}
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-canvas text-[11px] font-bold uppercase tracking-wider text-ink-600">
                      <tr className="border-b border-line">
                        <th className="px-3 py-3">Nama & Jabatan</th>
                        <th className="px-3 py-3">Peran</th>
                        <th className="px-3 py-3">Wilayah Kerja / WKPP</th>
                        <th className="px-3 py-3">NIP</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {pengguna.map((p) => {
                        const sedangDipakai = p.id === profilAktif.id;
                        return (
                          <tr key={p.id} className="hover:bg-canvas/50">
                            <td className="px-3 py-3.5">
                              <p className="font-bold text-ink-900">{p.nama}</p>
                              <p className="text-[11px] text-ink-600">{p.jabatan}</p>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-900">
                                {p.peran}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <p className="font-semibold text-ink-900">{p.namaWilayah}</p>
                              <p className="text-[11px] text-ink-600">{p.wkpp}</p>
                            </td>
                            <td className="px-3 py-3.5 font-mono text-[11px] text-ink-900">
                              {tampilkanNipSesuaiPeran(
                                p.nip,
                                p.id,
                                p.wilayahId,
                                profilAktif
                              )}
                            </td>
                            <td className="px-3 py-3.5">
                              {p.aktif ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-ok-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-900">
                                  <CheckCircle2
                                    className="h-3.5 w-3.5 text-ok-500"
                                    aria-hidden
                                  />
                                  <span>Aktif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 text-[11px] font-bold text-danger-600">
                                  <XCircle className="h-3.5 w-3.5" aria-hidden />
                                  <span>Nonaktif</span>
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <div className="inline-flex flex-wrap justify-end gap-1.5">
                                {sedangDipakai && (
                                  <>
                                    <span className="inline-flex min-h-[44px] items-center rounded-lg bg-gold-100 px-3 py-1.5 font-bold text-ink-900">
                                      Sesi Anda
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setModalGantiSandiBuka(true)}
                                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-surface px-3 py-1.5 font-bold text-brand-900 hover:bg-canvas"
                                    >
                                      <KeyRound className="h-3.5 w-3.5" aria-hidden />
                                      <span>Ubah Sandi</span>
                                    </button>
                                  </>
                                )}
                                {profilAktif.peran === 'admin' && !sedangDipakai && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={idSedangDiubahStatus === p.id}
                                      onClick={() => {
                                        void tanganiUbahStatusAktif(p);
                                      }}
                                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-line bg-canvas px-3 py-1.5 font-bold text-ink-900 hover:bg-canvas disabled:opacity-60"
                                    >
                                      <Power className="h-3.5 w-3.5" aria-hidden />
                                      <span>{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setPenggunaMauDihapus(p)}
                                      className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-danger-600/30 bg-danger-100/40 px-3 py-1.5 font-bold text-danger-600 hover:bg-danger-100"
                                      title={`Hapus akun ${p.nama}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                      <span>Hapus</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Kartu Responsif Ponsel (< 768px — Lebar 360px) */}
                <div className="mt-4 space-y-3 md:hidden">
                  {pengguna.map((p) => {
                    const sedangDipakai = p.id === profilAktif.id;
                    return (
                      <article
                        key={p.id}
                        className="space-y-2.5 rounded-xl border border-line bg-canvas/50 p-3.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-ink-900">{p.nama}</p>
                            <p className="text-[11px] text-ink-600">{p.jabatan}</p>
                          </div>
                          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-900">
                            {p.peran}
                          </span>
                        </div>

                        <div className="rounded-lg bg-surface p-2.5">
                          <p className="font-semibold text-ink-900">
                            {p.namaWilayah} · {p.wkpp}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-ink-600">
                            NIP:{' '}
                            {tampilkanNipSesuaiPeran(
                              p.nip,
                              p.id,
                              p.wilayahId,
                              profilAktif
                            )}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {p.aktif ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ok-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-900">
                              <CheckCircle2 className="h-3.5 w-3.5 text-ok-500" aria-hidden />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2.5 py-0.5 text-[11px] font-bold text-danger-600">
                              <XCircle className="h-3.5 w-3.5" aria-hidden />
                              <span>Nonaktif</span>
                            </span>
                          )}
                          {sedangDipakai && (
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-gold-100 px-2.5 py-1 text-[11px] font-bold text-ink-900">
                                Sesi Anda
                              </span>
                              <button
                                type="button"
                                onClick={() => setModalGantiSandiBuka(true)}
                                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-brand-900"
                              >
                                <KeyRound className="h-3 w-3" aria-hidden />
                                <span>Ubah Sandi</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {profilAktif.peran === 'admin' && !sedangDipakai && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              disabled={idSedangDiubahStatus === p.id}
                              onClick={() => {
                                void tanganiUbahStatusAktif(p);
                              }}
                              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-900"
                            >
                              <Power className="h-4 w-4" aria-hidden />
                              <span>{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPenggunaMauDihapus(p)}
                              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-danger-600/30 bg-danger-100/40 px-3 py-2 text-xs font-bold text-danger-600 hover:bg-danger-100"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          {/* Konfigurasi Ambang Terpusat (GIS vs Peringatan Dini Formulir Terpisah — AGENTS.md §8) */}
          {profilAktif.peran === 'admin' && (
            <section
              aria-labelledby="judul-konfigurasi-ambang"
              className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            >
              <div className="flex items-start gap-2.5 border-b border-line pb-3.5">
                <Sliders className="mt-0.5 h-5 w-5 shrink-0 text-brand-900" aria-hidden />
                <div>
                  <h2
                    id="judul-konfigurasi-ambang"
                    className="text-base font-bold text-ink-900 sm:text-lg"
                  >
                    Konfigurasi Ambang Tingkat Serangan & Peringatan Dini (Admin)
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-600">
                    Disimpan terpisah antara klasifikasi tingkat serangan GIS (bawaan 25% / 50%)
                    dan ambang peringatan dini formulir (bawaan 15% / 30%) sesuai AGENTS.md §8.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  void tanganiSimpanKonfigurasi(e);
                }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Kotak Klasifikasi GIS */}
                  <div className="space-y-3 rounded-xl border border-line bg-canvas/60 p-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
                      1. Ambang Klasifikasi Tingkat Serangan GIS (%)
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="konfig-sedang-min"
                          className="block text-xs font-bold text-ink-900"
                        >
                          Batas Bawah Sedang (%)
                        </label>
                        <input
                          id="konfig-sedang-min"
                          type="number"
                          min={1}
                          max={99}
                          step="0.5"
                          value={konfigurasi.klasifikasi.ambangSedangMin}
                          onChange={(e) =>
                            setKonfigurasi((s) => ({
                              ...s,
                              klasifikasi: {
                                ...s.klasifikasi,
                                ambangSedangMin: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold tabular-nums text-ink-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="konfig-berat-min"
                          className="block text-xs font-bold text-ink-900"
                        >
                          Batas Atas Sedang / Berat &gt; (%)
                        </label>
                        <input
                          id="konfig-berat-min"
                          type="number"
                          min={2}
                          max={99}
                          step="0.5"
                          value={konfigurasi.klasifikasi.ambangBeratMin}
                          onChange={(e) =>
                            setKonfigurasi((s) => ({
                              ...s,
                              klasifikasi: {
                                ...s.klasifikasi,
                                ambangBeratMin: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold tabular-nums text-danger-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kotak Peringatan Dini Form */}
                  <div className="space-y-3 rounded-xl border border-line bg-canvas/60 p-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
                      2. Ambang Peringatan Dini Formulir POPT (%)
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="konfig-form-waspada"
                          className="block text-xs font-bold text-ink-900"
                        >
                          Pemberitahuan Dini &gt; (%)
                        </label>
                        <input
                          id="konfig-form-waspada"
                          type="number"
                          min={1}
                          max={99}
                          step="0.5"
                          value={konfigurasi.peringatanForm.ambangPeringatan}
                          onChange={(e) =>
                            setKonfigurasi((s) => ({
                              ...s,
                              peringatanForm: {
                                ...s.peringatanForm,
                                ambangPeringatan: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold tabular-nums text-ink-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="konfig-form-eksplosif"
                          className="block text-xs font-bold text-ink-900"
                        >
                          Laporan Eksplosif &gt; (%)
                        </label>
                        <input
                          id="konfig-form-eksplosif"
                          type="number"
                          min={1}
                          max={99}
                          step="0.5"
                          value={konfigurasi.peringatanForm.ambangEksplosif}
                          onChange={(e) =>
                            setKonfigurasi((s) => ({
                              ...s,
                              peringatanForm: {
                                ...s.peringatanForm,
                                ambangEksplosif: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-bold tabular-nums text-danger-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sedangSimpanKonfig}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
                  >
                    {sedangSimpanKonfig
                      ? 'Menyimpan Konfigurasi...'
                      : 'Simpan Konfigurasi Ambang'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {/* Modal Konfirmasi Hapus Akun Pengguna */}
      {penggunaMauDihapus && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-konfirmasi-hapus"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
                  <Trash2 className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="judul-konfirmasi-hapus" className="text-base font-bold text-ink-900 sm:text-lg">
                    Hapus Akun Pengguna
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-600 sm:text-sm">
                    Apakah Anda yakin ingin menghapus akun{' '}
                    <strong className="text-ink-900">{penggunaMauDihapus.nama}</strong> ({penggunaMauDihapus.peran.toUpperCase()} · {penggunaMauDihapus.namaWilayah})?
                  </p>
                  <div className="mt-3 rounded-xl border border-gold-500 bg-gold-100/70 p-3 text-xs text-ink-900">
                    <p className="font-semibold text-ink-900">Ketentuan Keamanan Data:</p>
                    <p className="mt-0.5 leading-relaxed text-ink-600">
                      Akun yang telah memiliki riwayat pelaporan OPT tidak dapat dihapus permanen demi integritas audit dinas, namun dapat dinonaktifkan statusnya.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={sedangMenghapus}
                onClick={() => setPenggunaMauDihapus(null)}
                aria-label="Tutup konfirmasi hapus"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-ink-600 hover:bg-canvas disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                disabled={sedangMenghapus}
                onClick={() => setPenggunaMauDihapus(null)}
                className="min-h-[44px] rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-900 hover:bg-canvas disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={sedangMenghapus}
                onClick={() => void tanganiHapusPengguna()}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-danger-600 px-5 py-2 text-xs font-bold text-surface hover:bg-danger-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                <span>{sedangMenghapus ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Kata Sandi Mandiri */}
      <ModalUbahKataSandi
        terbuka={modalGantiSandiBuka}
        onTutup={() => setModalGantiSandiBuka(false)}
        namaPengguna={profilAktif.nama}
      />
    </div>
  );
}
