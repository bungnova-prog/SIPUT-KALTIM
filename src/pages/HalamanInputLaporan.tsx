import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertOctagon,
  ArrowRight,
  BadgeCheck,
  Bug,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coffee,
  Droplets,
  FileText,
  Flower2,
  Leaf,
  LocateFixed,
  MapPin,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sprout,
  TreePalm,
  Trees,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { LencanaStatusVerifikasi } from '../components/LencanaStatus';
import { KerangkaMuat, KotakGalatData } from '../components/StatusMuatData';
import { BagianDokumentasiFoto } from '../components/formulir/BagianDokumentasiFoto';
import { KartuCincinIntensitas } from '../components/formulir/KartuCincinIntensitas';
import { PanelPratinjauLaporan } from '../components/formulir/PanelPratinjauLaporan';
import { PetaPratinjauPin } from '../components/formulir/PetaPratinjauPin';
import {
  formatTanggalPanjang,
  formatWaktuWita,
  tampilkanNipSesuaiPeran,
} from '../lib/format';
import {
  evaluasiPeringatanForm,
  hitungIntensitas,
  klasifikasiTingkat,
  periodeBawaanSistem,
  semesterDariTriwulan,
  validasiKoordinatKaltim,
  validasiLuas,
} from '../lib/klasifikasi';
import {
  KONFIGURASI_KLASIFIKASI_BAWAAN,
  KONFIGURASI_PERINGATAN_FORM_BAWAAN,
} from '../lib/konfigurasi';
import { validasiBerkasFoto } from '../lib/sanitasi';
import {
  kompresFotoKlien,
  skemaFormLaporan,
  type NilaiFormLaporan,
} from '../lib/skemaFormLaporan';
import { useAppStore } from '../lib/storeAplikasi';
import {
  hapusDrafLokalForm,
  komoditasOptRepository,
  konfigurasiRepository,
  laporanRepository,
  muatDrafLokalForm,
  simpanDrafLokalForm,
  wilayahRepository,
} from '../services';
import type {
  FaseTanaman,
  FotoInput,
  Komoditas,
  KonfigurasiSistem,
  Laporan,
  Opt,
  Wilayah,
} from '../types/domain';

const IKON_KOMODITAS: Record<Komoditas['kodeIkon'], LucideIcon> = {
  lada: Sprout,
  sawit: Trees,
  kakao: Flower2,
  karet: Droplets,
  aren: TreePalm,
  kelapa_dalam: Leaf,
  kopi: Coffee,
};

const OPSI_TRIWULAN: readonly { nilai: 1 | 2 | 3 | 4; label: string }[] = [
  { nilai: 1, label: 'Triwulan I (Januari – Maret)' },
  { nilai: 2, label: 'Triwulan II (April – Juni)' },
  { nilai: 3, label: 'Triwulan III (Juli – September)' },
  { nilai: 4, label: 'Triwulan IV (Oktober – Desember)' },
];

const OPSI_FASE: readonly { nilai: FaseTanaman; kode: string; keterangan: string }[] = [
  { nilai: 'tbm', kode: 'TBM', keterangan: 'Tanaman Belum Menghasilkan' },
  { nilai: 'tm', kode: 'TM', keterangan: 'Tanaman Menghasilkan' },
  { nilai: 'ttm_tr', kode: 'TTM / TR', keterangan: 'Tua / Rusak' },
];

function angkaAman(nilai: unknown, cadangan = 0): number {
  return typeof nilai === 'number' && Number.isFinite(nilai) ? nilai : cadangan;
}

export default function HalamanInputLaporan() {
  const profilAktif = useAppStore((s) => s.profilAktif);
  const tambahToast = useAppStore((s) => s.tambahToast);

  const [waktuSekarang, setWaktuSekarang] = useState<Date>(() => new Date());
  const [memuatReferensi, setMemuatReferensi] = useState(true);
  const [galatReferensi, setGalatReferensi] = useState<string | null>(null);

  const [semuaWilayah, setSemuaWilayah] = useState<Wilayah[]>([]);
  const [daftarKomoditas, setDaftarKomoditas] = useState<Komoditas[]>([]);
  const [semuaOpt, setSemuaOpt] = useState<Opt[]>([]);
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiSistem>({
    klasifikasi: { ...KONFIGURASI_KLASIFIKASI_BAWAAN },
    peringatanForm: { ...KONFIGURASI_PERINGATAN_FORM_BAWAAN },
  });

  const [fotos, setFotos] = useState<FotoInput[]>([]);
  const [sedangMemprosesFoto, setSedangMemprosesFoto] = useState(false);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);

  const [waktuSimpanDrafLokal, setWaktuSimpanDrafLokal] = useState<string | null>(null);
  const [infoPulihDraf, setInfoPulihDraf] = useState<string | null>(null);
  const [sedangMenyimpanDraf, setSedangMenyimpanDraf] = useState(false);
  const [sedangMempublikasikan, setSedangMempublikasikan] = useState(false);
  const [sedangMengambilGps, setSedangMengambilGps] = useState(false);
  const [laporanTerpublikasi, setLaporanTerpublikasi] = useState<Laporan | null>(null);

  const sudahInisialisasiRef = useRef(false);

  const periodeSistem = useMemo(() => periodeBawaanSistem(), []);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    trigger,
    formState: { errors, isValid, submitCount },
  } = useForm<NilaiFormLaporan>({
    resolver: zodResolver(skemaFormLaporan),
    mode: 'onChange',
    defaultValues: {
      tahun: periodeSistem.tahun,
      triwulan: periodeSistem.triwulan,
      semester: periodeSistem.semester,
      kabupatenId: profilAktif.wilayahId ?? 'kab-kukar',
      kecamatanId: '',
      desaId: '',
      namaBlok: 'Poktan Harapan Makmur Blok A-04',
      lat: -0.7124,
      lng: 117.0411,
      komoditasId: 'kom-lada',
      optId: '',
      faseTanaman: 'tm',
      luasAmatan: 25,
      luasRingan: 3.5,
      luasBerat: 1.2,
      luasTerkendali: 8,
      rekomendasiKultur: '',
      rekomendasiHayati: '',
      rekomendasiKimiawi: '',
    },
  });

  const nilaiForm = watch();

  // Jam WITA berjalan tiap detik (AGENTS.md §8)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setWaktuSekarang(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Menyusun nilai bawaan berdasarkan katalog referensi dan wilayah kerja profil aktif
  const buatNilaiBawaanSegar = useCallback(
    (
      wilayahList: Wilayah[],
      komoditasList: Komoditas[],
      optList: Opt[],
      targetKabupatenId?: string | null
    ): NilaiFormLaporan => {
      const p = periodeBawaanSistem();
      const kabupatenTersedia = wilayahList.filter((w) => w.tipe === 'kabupaten');
      const kabTerpilih =
        kabupatenTersedia.find((k) => k.id === targetKabupatenId) ??
        kabupatenTersedia.find((k) => k.id === 'kab-kukar') ??
        kabupatenTersedia[0];

      const kecamatanList = wilayahList.filter(
        (w) => w.tipe === 'kecamatan' && w.parentId === kabTerpilih?.id
      );
      const kecTerpilih = kecamatanList[0];
      const desaList = wilayahList.filter(
        (w) => w.tipe === 'desa' && w.parentId === kecTerpilih?.id
      );
      const desaTerpilih = desaList[0];

      const komTerpilih = komoditasList[0];
      const optTerpilih =
        optList.find((o) => o.komoditasId === komTerpilih?.id) ?? optList[0];

      return {
        id: undefined,
        tahun: p.tahun,
        triwulan: p.triwulan,
        semester: p.semester,
        kabupatenId: kabTerpilih?.id ?? '',
        kecamatanId: kecTerpilih?.id ?? '',
        desaId: desaTerpilih?.id ?? '',
        namaBlok: 'Poktan Harapan Makmur Blok A-04',
        lat: desaTerpilih?.latPusat ?? kabTerpilih?.latPusat ?? -0.5021,
        lng: desaTerpilih?.lngPusat ?? kabTerpilih?.lngPusat ?? 117.1536,
        komoditasId: komTerpilih?.id ?? '',
        optId: optTerpilih?.id ?? '',
        faseTanaman: 'tm',
        luasAmatan: 25,
        luasRingan: 3.5,
        luasBerat: 1.2,
        luasTerkendali: 8,
        rekomendasiKultur:
          'Sanitasi kebun berkala, pemangkasan tajuk rimbun, dan pemeliharaan saluran drainase.',
        rekomendasiHayati:
          'Aplikasi agens hayati Trichoderma sp. pada perakaran sesuai dosis anjuran UPTD.',
        rekomendasiKimiawi:
          'Eradikasi selektif bagian tanaman terserang berat untuk mencegah penularan tular tanah.',
      };
    },
    []
  );

  const muatDataReferensi = useCallback(async () => {
    setMemuatReferensi(true);
    setGalatReferensi(null);

    const [hasilWilayah, hasilKomoditas, hasilOpt, hasilKonfig] = await Promise.all([
      wilayahRepository.semuaWilayah(),
      komoditasOptRepository.daftarKomoditas(),
      komoditasOptRepository.daftarOpt(),
      konfigurasiRepository.ambil(),
    ]);

    if (!hasilWilayah.ok) {
      setGalatReferensi(hasilWilayah.pesan);
      setMemuatReferensi(false);
      return;
    }
    if (!hasilKomoditas.ok) {
      setGalatReferensi(hasilKomoditas.pesan);
      setMemuatReferensi(false);
      return;
    }
    if (!hasilOpt.ok) {
      setGalatReferensi(hasilOpt.pesan);
      setMemuatReferensi(false);
      return;
    }

    const wilayahData = hasilWilayah.data;
    const komoditasData = hasilKomoditas.data.filter((k) => k.aktif);
    const optData = hasilOpt.data;

    setSemuaWilayah(wilayahData);
    setDaftarKomoditas(komoditasData);
    setSemuaOpt(optData);
    if (hasilKonfig.ok) {
      setKonfigurasi(hasilKonfig.data);
    }

    if (!sudahInisialisasiRef.current) {
      const bawaan = buatNilaiBawaanSegar(
        wilayahData,
        komoditasData,
        optData,
        profilAktif.peran === 'admin' ? null : profilAktif.wilayahId
      );

      const drafTersimpan = muatDrafLokalForm();
      if (drafTersimpan) {
        const desaDraf = wilayahData.find(
          (w) => w.id === drafTersimpan.nilai.desaId && w.tipe === 'desa'
        );
        const kecDraf = desaDraf
          ? wilayahData.find((w) => w.id === desaDraf.parentId && w.tipe === 'kecamatan')
          : undefined;
        const kabDraf = kecDraf
          ? wilayahData.find((w) => w.id === kecDraf.parentId && w.tipe === 'kabupaten')
          : undefined;

        const bolehPakaiWilayahDraf =
          Boolean(desaDraf && kecDraf && kabDraf) &&
          (profilAktif.peran === 'admin' || profilAktif.wilayahId === kabDraf?.id);

        if (bolehPakaiWilayahDraf && desaDraf && kecDraf && kabDraf) {
          const optCocok = optData.some(
            (o) =>
              o.id === drafTersimpan.nilai.optId &&
              o.komoditasId === drafTersimpan.nilai.komoditasId
          );
          const optPengganti = optData.find(
            (o) => o.komoditasId === drafTersimpan.nilai.komoditasId
          );

          reset({
            id: drafTersimpan.nilai.id,
            tahun: drafTersimpan.nilai.tahun,
            triwulan: drafTersimpan.nilai.triwulan,
            semester: drafTersimpan.nilai.semester,
            kabupatenId: kabDraf.id,
            kecamatanId: kecDraf.id,
            desaId: desaDraf.id,
            namaBlok: drafTersimpan.nilai.namaBlok,
            lat: drafTersimpan.nilai.lat,
            lng: drafTersimpan.nilai.lng,
            komoditasId: drafTersimpan.nilai.komoditasId,
            optId: optCocok ? drafTersimpan.nilai.optId : optPengganti?.id ?? bawaan.optId,
            faseTanaman: drafTersimpan.nilai.faseTanaman,
            luasAmatan: drafTersimpan.nilai.luasAmatan,
            luasRingan: drafTersimpan.nilai.luasRingan,
            luasBerat: drafTersimpan.nilai.luasBerat,
            luasTerkendali: drafTersimpan.nilai.luasTerkendali,
            rekomendasiKultur: drafTersimpan.nilai.rekomendasiKultur,
            rekomendasiHayati: drafTersimpan.nilai.rekomendasiHayati,
            rekomendasiKimiawi: drafTersimpan.nilai.rekomendasiKimiawi,
          });
          setFotos([]);
          setWaktuSimpanDrafLokal(formatWaktuWita(drafTersimpan.disimpanPada));
          setInfoPulihDraf(
            `Draf lokal dipulihkan otomatis (${formatWaktuWita(drafTersimpan.disimpanPada)}).`
          );
          sudahInisialisasiRef.current = true;
          setMemuatReferensi(false);
          return;
        }
      }

      reset(bawaan);
      setFotos([]);
      sudahInisialisasiRef.current = true;
    }

    setMemuatReferensi(false);
  }, [buatNilaiBawaanSegar, profilAktif.peran, profilAktif.wilayahId, reset]);

  useEffect(() => {
    void muatDataReferensi();
    const berhentiKatalog = komoditasOptRepository.langganan(() => {
      komoditasOptRepository.daftarOpt().then((res) => {
        if (res.ok) setSemuaOpt(res.data);
      });
    });
    const berhentiLaporan = laporanRepository.langganan({}, (perubahan) => {
      if (perubahan.jenis === 'reset') {
        sudahInisialisasiRef.current = false;
        setWaktuSimpanDrafLokal(null);
        setInfoPulihDraf(null);
        setLaporanTerpublikasi(null);
        void muatDataReferensi();
      }
    });
    return () => {
      berhentiKatalog();
      berhentiLaporan();
    };
  }, [muatDataReferensi]);

  // Sinkronisasi wilayah kabupaten saat tab portal peran diganti ke Operator/Petugas
  useEffect(() => {
    if (!sudahInisialisasiRef.current || semuaWilayah.length === 0) return;
    if (profilAktif.peran !== 'admin' && profilAktif.wilayahId) {
      if (nilaiForm.kabupatenId !== profilAktif.wilayahId) {
        const kecList = semuaWilayah.filter(
          (w) => w.tipe === 'kecamatan' && w.parentId === profilAktif.wilayahId
        );
        const kecPertama = kecList[0];
        const desaPertama = semuaWilayah.find(
          (w) => w.tipe === 'desa' && w.parentId === kecPertama?.id
        );

        setValue('id', undefined);
        setValue('kabupatenId', profilAktif.wilayahId, { shouldValidate: true });
        setValue('kecamatanId', kecPertama?.id ?? '', { shouldValidate: true });
        setValue('desaId', desaPertama?.id ?? '', { shouldValidate: true });
        if (desaPertama?.latPusat !== undefined && desaPertama?.lngPusat !== undefined) {
          setValue('lat', desaPertama.latPusat, { shouldValidate: true });
          setValue('lng', desaPertama.lngPusat, { shouldValidate: true });
        }
      }
    }
  }, [
    nilaiForm.kabupatenId,
    profilAktif.peran,
    profilAktif.wilayahId,
    semuaWilayah,
    setValue,
  ]);

  // Simpan otomatis ke draf lokal peramban (tanpa berkas foto — SECURITY.md §6)
  useEffect(() => {
    if (!sudahInisialisasiRef.current) return;

    const timer = window.setTimeout(() => {
      const angkaWajib = [
        nilaiForm.lat,
        nilaiForm.lng,
        nilaiForm.tahun,
        nilaiForm.luasAmatan,
        nilaiForm.luasRingan,
        nilaiForm.luasBerat,
        nilaiForm.luasTerkendali,
      ];
      if (!angkaWajib.every((n) => typeof n === 'number' && Number.isFinite(n))) {
        return;
      }
      if (!nilaiForm.desaId || !nilaiForm.komoditasId || !nilaiForm.optId) {
        return;
      }

      simpanDrafLokalForm({
        id: nilaiForm.id,
        kabupatenId: nilaiForm.kabupatenId,
        kecamatanId: nilaiForm.kecamatanId,
        desaId: nilaiForm.desaId,
        namaBlok: nilaiForm.namaBlok ?? '',
        lat: nilaiForm.lat,
        lng: nilaiForm.lng,
        komoditasId: nilaiForm.komoditasId,
        optId: nilaiForm.optId,
        faseTanaman: nilaiForm.faseTanaman,
        tahun: nilaiForm.tahun,
        triwulan: nilaiForm.triwulan,
        semester: nilaiForm.semester,
        luasAmatan: nilaiForm.luasAmatan,
        luasRingan: nilaiForm.luasRingan,
        luasBerat: nilaiForm.luasBerat,
        luasTerkendali: nilaiForm.luasTerkendali,
        rekomendasiKultur: nilaiForm.rekomendasiKultur ?? '',
        rekomendasiHayati: nilaiForm.rekomendasiHayati ?? '',
        rekomendasiKimiawi: nilaiForm.rekomendasiKimiawi ?? '',
      });
      setWaktuSimpanDrafLokal(formatWaktuWita(new Date()));
    }, 450);

    return () => window.clearTimeout(timer);
  }, [nilaiForm]);

  // Daftar bertingkat Wilayah & OPT
  const daftarKabupaten = useMemo(
    () => semuaWilayah.filter((w) => w.tipe === 'kabupaten'),
    [semuaWilayah]
  );

  const daftarKecamatan = useMemo(
    () =>
      semuaWilayah.filter(
        (w) => w.tipe === 'kecamatan' && w.parentId === nilaiForm.kabupatenId
      ),
    [nilaiForm.kabupatenId, semuaWilayah]
  );

  const daftarDesa = useMemo(
    () =>
      semuaWilayah.filter(
        (w) => w.tipe === 'desa' && w.parentId === nilaiForm.kecamatanId
      ),
    [nilaiForm.kecamatanId, semuaWilayah]
  );

  const daftarOptTersaring = useMemo(
    () => semuaOpt.filter((o) => o.komoditasId === nilaiForm.komoditasId),
    [nilaiForm.komoditasId, semuaOpt]
  );

  const kabupatenTerpilih = useMemo(
    () => daftarKabupaten.find((k) => k.id === nilaiForm.kabupatenId) ?? null,
    [daftarKabupaten, nilaiForm.kabupatenId]
  );
  const kecamatanTerpilih = useMemo(
    () => daftarKecamatan.find((k) => k.id === nilaiForm.kecamatanId) ?? null,
    [daftarKecamatan, nilaiForm.kecamatanId]
  );
  const desaTerpilih = useMemo(
    () => daftarDesa.find((d) => d.id === nilaiForm.desaId) ?? null,
    [daftarDesa, nilaiForm.desaId]
  );
  const komoditasTerpilih = useMemo(
    () => daftarKomoditas.find((k) => k.id === nilaiForm.komoditasId) ?? null,
    [daftarKomoditas, nilaiForm.komoditasId]
  );
  const optTerpilih = useMemo(
    () => daftarOptTersaring.find((o) => o.id === nilaiForm.optId) ?? null,
    [daftarOptTersaring, nilaiForm.optId]
  );

  // Kalkulasi domain real-time (AGENTS.md §8)
  const luasAmatanAman = angkaAman(nilaiForm.luasAmatan);
  const luasRinganAman = angkaAman(nilaiForm.luasRingan);
  const luasBeratAman = angkaAman(nilaiForm.luasBerat);
  const luasTerkendaliAman = angkaAman(nilaiForm.luasTerkendali);

  const intensitasPersen = useMemo(
    () => hitungIntensitas(luasRinganAman, luasBeratAman, luasAmatanAman),
    [luasAmatanAman, luasBeratAman, luasRinganAman]
  );

  const tingkatSerangan = useMemo(
    () => klasifikasiTingkat(intensitasPersen, konfigurasi.klasifikasi),
    [intensitasPersen, konfigurasi.klasifikasi]
  );

  const statusPeringatanForm = useMemo(
    () => evaluasiPeringatanForm(intensitasPersen, konfigurasi.peringatanForm),
    [intensitasPersen, konfigurasi.peringatanForm]
  );

  const hasilValidasiLuas = useMemo(
    () =>
      validasiLuas(
        nilaiForm.luasAmatan,
        nilaiForm.luasRingan,
        nilaiForm.luasBerat,
        nilaiForm.luasTerkendali
      ),
    [
      nilaiForm.luasAmatan,
      nilaiForm.luasBerat,
      nilaiForm.luasRingan,
      nilaiForm.luasTerkendali,
    ]
  );

  // Penangan perubahan berjenjang Lokasi & Komoditas
  const tanganiPilihKabupaten = (kabId: string) => {
    const kecList = semuaWilayah.filter(
      (w) => w.tipe === 'kecamatan' && w.parentId === kabId
    );
    const kecPertama = kecList[0];
    const desaPertama = semuaWilayah.find(
      (w) => w.tipe === 'desa' && w.parentId === kecPertama?.id
    );

    setValue('kabupatenId', kabId, { shouldValidate: true, shouldDirty: true });
    setValue('kecamatanId', kecPertama?.id ?? '', { shouldValidate: true, shouldDirty: true });
    setValue('desaId', desaPertama?.id ?? '', { shouldValidate: true, shouldDirty: true });
    if (desaPertama?.latPusat !== undefined && desaPertama?.lngPusat !== undefined) {
      setValue('lat', desaPertama.latPusat, { shouldValidate: true, shouldDirty: true });
      setValue('lng', desaPertama.lngPusat, { shouldValidate: true, shouldDirty: true });
    }
  };

  const tanganiPilihKecamatan = (kecId: string) => {
    const desaPertama = semuaWilayah.find(
      (w) => w.tipe === 'desa' && w.parentId === kecId
    );
    setValue('kecamatanId', kecId, { shouldValidate: true, shouldDirty: true });
    setValue('desaId', desaPertama?.id ?? '', { shouldValidate: true, shouldDirty: true });
    if (desaPertama?.latPusat !== undefined && desaPertama?.lngPusat !== undefined) {
      setValue('lat', desaPertama.latPusat, { shouldValidate: true, shouldDirty: true });
      setValue('lng', desaPertama.lngPusat, { shouldValidate: true, shouldDirty: true });
    }
  };

  const tanganiPilihDesa = (desaId: string) => {
    const desa = semuaWilayah.find((w) => w.id === desaId && w.tipe === 'desa');
    setValue('desaId', desaId, { shouldValidate: true, shouldDirty: true });
    if (desa?.latPusat !== undefined && desa?.lngPusat !== undefined) {
      setValue('lat', desa.latPusat, { shouldValidate: true, shouldDirty: true });
      setValue('lng', desa.lngPusat, { shouldValidate: true, shouldDirty: true });
    }
  };

  const tanganiPilihKomoditas = (komId: string) => {
    const optPertama = semuaOpt.find((o) => o.komoditasId === komId);
    setValue('komoditasId', komId, { shouldValidate: true, shouldDirty: true });
    setValue('optId', optPertama?.id ?? '', { shouldValidate: true, shouldDirty: true });
  };

  const tanganiAmbilKoordinatOtomatis = () => {
    const pakaiKoordinatDesaSimulasi = (alasan: string) => {
      const latAcuan = desaTerpilih?.latPusat ?? kabupatenTerpilih?.latPusat ?? -0.5021;
      const lngAcuan = desaTerpilih?.lngPusat ?? kabupatenTerpilih?.lngPusat ?? 117.1536;
      const latSim = Math.round((latAcuan + 0.0018) * 10000) / 10000;
      const lngSim = Math.round((lngAcuan - 0.0014) * 10000) / 10000;
      setValue('lat', latSim, { shouldValidate: true, shouldDirty: true });
      setValue('lng', lngSim, { shouldValidate: true, shouldDirty: true });
      setSedangMengambilGps(false);
      tambahToast({
        jenis: 'info',
        judul: 'Koordinat Geotagging Diisi (Simulasi Desa)',
        pesan: `${alasan} Menggunakan titik referensi ${desaTerpilih?.nama ?? 'wilayah kerja'} di Kaltim.`,
      });
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      pakaiKoordinatDesaSimulasi('Sensor GPS perangkat tidak tersedia.');
      return;
    }

    setSedangMengambilGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latGps = Math.round(pos.coords.latitude * 10000) / 10000;
        const lngGps = Math.round(pos.coords.longitude * 10000) / 10000;
        const cekKaltim = validasiKoordinatKaltim(latGps, lngGps);
        if (cekKaltim.valid) {
          setValue('lat', latGps, { shouldValidate: true, shouldDirty: true });
          setValue('lng', lngGps, { shouldValidate: true, shouldDirty: true });
          setSedangMengambilGps(false);
          tambahToast({
            jenis: 'sukses',
            judul: 'Koordinat GPS Berhasil Diambil',
            pesan: `Titik perangkat terverifikasi berada di wilayah Kalimantan Timur (${latGps}, ${lngGps}).`,
          });
        } else {
          pakaiKoordinatDesaSimulasi(
            'Lokasi fisik perangkat saat ini berada di luar Kalimantan Timur.'
          );
        }
      },
      () => {
        pakaiKoordinatDesaSimulasi('Izin lokasi peramban tidak diberikan atau waktu habis.');
      },
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 15000 }
    );
  };

  // Penangan Foto Dokumentasi (Bagian V)
  const tanganiUnggahFoto = async (slot: 1 | 2 | 3, berkas: File) => {
    setGalatFoto(null);
    const jumlahTanpaSlotIni = fotos.filter((f) => f.urutan !== slot).length;
    const hasilCek = validasiBerkasFoto(
      berkas.name,
      berkas.type,
      berkas.size,
      jumlahTanpaSlotIni
    );
    if (!hasilCek.valid) {
      setGalatFoto(hasilCek.pesan ?? 'Berkas foto tidak memenuhi syarat.');
      return;
    }

    setSedangMemprosesFoto(true);
    try {
      const dataUrlBersih = await kompresFotoKlien(berkas);
      const latFoto = angkaAman(nilaiForm.lat, -0.5021);
      const lngFoto = angkaAman(nilaiForm.lng, 117.1536);
      setFotos((sebelum) => {
        const lainnya = sebelum.filter((f) => f.urutan !== slot);
        return [
          ...lainnya,
          {
            namaBerkas: berkas.name,
            pratinjauUrl: dataUrlBersih,
            geotagLat: latFoto,
            geotagLng: lngFoto,
            urutan: slot,
          },
        ].sort((a, b) => a.urutan - b.urutan);
      });
      tambahToast({
        jenis: 'sukses',
        judul: `Foto Slot #${slot} Siap`,
        pesan: 'Citra dikompresi di peramban dan metadata EXIF pribadi telah dibersihkan.',
      });
    } catch (err) {
      setGalatFoto(
        err instanceof Error ? err.message : 'Gagal memproses berkas gambar di peramban.'
      );
    } finally {
      setSedangMemprosesFoto(false);
    }
  };

  const tanganiHapusFoto = (slot: 1 | 2 | 3) => {
    setGalatFoto(null);
    setFotos((sebelum) => sebelum.filter((f) => f.urutan !== slot));
  };

  const tanganiSalinRekomendasiOpt = () => {
    if (!optTerpilih) return;
    setValue(
      'rekomendasiKultur',
      `Sanitasi petak terserang ${optTerpilih.namaLokal} dan pengaturan kelembapan kebun.`,
      { shouldDirty: true, shouldValidate: true }
    );
    setValue('rekomendasiHayati', optTerpilih.rekomendasi, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      'rekomendasiKimiawi',
      'Eradikasi selektif bagian tanaman terinfeksi berat sesuai SOP UPTD Proteksi Kaltim.',
      { shouldDirty: true, shouldValidate: true }
    );
    tambahToast({
      jenis: 'info',
      judul: 'Acuan Katalog OPT Diterapkan',
      pesan: `Rekomendasi standar untuk ${optTerpilih.namaLokal} telah diisikan ke Bagian V.`,
    });
  };

  // Aksi: Batal / Reset, Simpan Draf, dan Publikasikan GIS
  const tanganiResetFormulir = () => {
    hapusDrafLokalForm();
    const segar = buatNilaiBawaanSegar(
      semuaWilayah,
      daftarKomoditas,
      semuaOpt,
      profilAktif.peran === 'admin' ? null : profilAktif.wilayahId
    );
    reset(segar);
    setFotos([]);
    setWaktuSimpanDrafLokal(null);
    setInfoPulihDraf(null);
    setGalatFoto(null);
    tambahToast({
      jenis: 'info',
      judul: 'Formulir Direset',
      pesan: 'Draf lokal dihapus dan formulir dikembalikan ke nilai bawaan sistem.',
    });
  };

  const tanganiSimpanDraf = async () => {
    const validSekarang = await trigger(['desaId', 'luasAmatan']);
    if (!validSekarang || angkaAman(nilaiForm.luasAmatan) <= 0 || !nilaiForm.desaId) {
      tambahToast({
        jenis: 'peringatan',
        judul: 'Draf Memerlukan Desa & Luas Amatan',
        pesan: 'Pilih Desa/Kelurahan dan isi Luas Pengamatan (> 0 Ha) sebelum menyimpan draf.',
      });
      return;
    }

    setSedangMenyimpanDraf(true);
    const hasil = await laporanRepository.simpanDraf(
      {
        id: nilaiForm.id,
        petugasId: profilAktif.id,
        desaId: nilaiForm.desaId,
        namaBlok: nilaiForm.namaBlok?.trim() || 'Blok Draf Pengamatan',
        lat: angkaAman(nilaiForm.lat, -0.5021),
        lng: angkaAman(nilaiForm.lng, 117.1536),
        komoditasId: nilaiForm.komoditasId,
        optId: nilaiForm.optId,
        faseTanaman: nilaiForm.faseTanaman,
        tahun: angkaAman(nilaiForm.tahun, periodeSistem.tahun),
        triwulan: nilaiForm.triwulan,
        semester: nilaiForm.semester,
        luasAmatan: angkaAman(nilaiForm.luasAmatan),
        luasRingan: angkaAman(nilaiForm.luasRingan),
        luasBerat: angkaAman(nilaiForm.luasBerat),
        luasTerkendali: angkaAman(nilaiForm.luasTerkendali),
        rekomendasiKultur: nilaiForm.rekomendasiKultur ?? '',
        rekomendasiHayati: nilaiForm.rekomendasiHayati ?? '',
        rekomendasiKimiawi: nilaiForm.rekomendasiKimiawi ?? '',
        fotos,
      },
      profilAktif
    );
    setSedangMenyimpanDraf(false);

    if (!hasil.ok) {
      tambahToast({
        jenis: 'gagal',
        judul: 'Gagal Menyimpan Draf',
        pesan: hasil.pesan,
        labelCobaLagi: 'Coba lagi',
        onCobaLagi: () => {
          void tanganiSimpanDraf();
        },
      });
      return;
    }

    setValue('id', hasil.data.id);
    setWaktuSimpanDrafLokal(formatWaktuWita(new Date()));
    tambahToast({
      jenis: 'sukses',
      judul: 'Draf Laporan Disimpan',
      pesan: `Kode draf ${hasil.data.kode} tersimpan di memori simulasi dan draf lokal peramban.`,
    });
  };

  const kirimPublikasiGis = handleSubmit(
    async (dataTervalidasi) => {
      setSedangMempublikasikan(true);
      const hasil = await laporanRepository.publikasikan(
        {
          id: dataTervalidasi.id,
          petugasId: profilAktif.id,
          desaId: dataTervalidasi.desaId,
          namaBlok: dataTervalidasi.namaBlok.trim(),
          lat: dataTervalidasi.lat,
          lng: dataTervalidasi.lng,
          komoditasId: dataTervalidasi.komoditasId,
          optId: dataTervalidasi.optId,
          faseTanaman: dataTervalidasi.faseTanaman,
          tahun: dataTervalidasi.tahun,
          triwulan: dataTervalidasi.triwulan,
          semester: dataTervalidasi.semester,
          luasAmatan: dataTervalidasi.luasAmatan,
          luasRingan: dataTervalidasi.luasRingan,
          luasBerat: dataTervalidasi.luasBerat,
          luasTerkendali: dataTervalidasi.luasTerkendali,
          rekomendasiKultur: dataTervalidasi.rekomendasiKultur,
          rekomendasiHayati: dataTervalidasi.rekomendasiHayati,
          rekomendasiKimiawi: dataTervalidasi.rekomendasiKimiawi,
          fotos,
        },
        profilAktif
      );
      setSedangMempublikasikan(false);

      if (!hasil.ok) {
        tambahToast({
          jenis: 'gagal',
          judul: 'Publikasi GIS Ditolak',
          pesan: hasil.pesan,
          labelCobaLagi: 'Coba lagi',
          onCobaLagi: () => {
            void kirimPublikasiGis();
          },
        });
        return;
      }

      hapusDrafLokalForm();
      setLaporanTerpublikasi(hasil.data);
      setInfoPulihDraf(null);
      setWaktuSimpanDrafLokal(null);

      // Siapkan formulir baru tanpa menimpa laporan yang sudah dipublikasikan
      const segar = buatNilaiBawaanSegar(
        semuaWilayah,
        daftarKomoditas,
        semuaOpt,
        profilAktif.peran === 'admin' ? null : profilAktif.wilayahId
      );
      reset(segar);
      setFotos([]);

      tambahToast({
        jenis: 'sukses',
        judul: 'Laporan Dipublikasikan ke GIS',
        pesan: `${hasil.data.kode} aktif dengan status Menunggu Validasi di Dashboard & Peta GIS.`,
      });
    },
    () => {
      tambahToast({
        jenis: 'peringatan',
        judul: 'Periksa Kembali Isian Formulir',
        pesan: 'Masih terdapat kolom wajib atau aturan validasi luas/periode/koordinat yang belum sesuai.',
      });
    }
  );

  // Kumpulan pesan galat untuk kotak ringkasan di atas bilah aksi (DESIGN.md §4.3)
  const daftarPesanGalat = useMemo(() => {
    const pesan: string[] = [];
    for (const nilaiGalat of Object.values(errors)) {
      if (nilaiGalat?.message && !pesan.includes(nilaiGalat.message)) {
        pesan.push(nilaiGalat.message);
      }
    }
    return pesan;
  }, [errors]);

  const nipTampil = tampilkanNipSesuaiPeran(
    profilAktif.nip,
    profilAktif.id,
    profilAktif.wilayahId,
    profilAktif
  );

  if (memuatReferensi) {
    return (
      <KerangkaMuat
        pesan="Menyiapkan formulir pengamatan POPT, katalog OPT Kaltim, dan draf lokal..."
        jumlahBaris={5}
      />
    );
  }

  if (galatReferensi) {
    return (
      <KotakGalatData
        pesan={galatReferensi}
        onCobaLagi={() => {
          void muatDataReferensi();
        }}
      />
    );
  }

  return (
    <div className="space-y-5 pb-4">
      {/* KEPALA FORMULIR (DESIGN.md §4.3) */}
      <header className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-surface">
              <ClipboardCheck className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-brand-100 px-2.5 py-0.5 font-mono text-xs font-bold text-brand-900">
                  SIPUT KALTIM · FORM-POPT-04
                </span>
                <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-900">
                  Data Simulasi
                </span>
              </div>
              <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-brand-900 sm:text-2xl">
                Formulir Laporan Pengamatan Serangan OPT Perkebunan
              </h1>
              <p className="mt-1 text-xs text-ink-600 sm:text-sm">
                Pencatatan petak contoh lapangan, perhitungan intensitas otomatis, dan pengiriman
                titik geospasial ke pusat komando UPTD Proteksi Tanaman Perkebunan.
              </p>
            </div>
          </div>

          {/* Waktu Input Real-Time (Kanan) */}
          <div className="flex shrink-0 flex-col items-start rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-xs lg:items-end">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ink-600">
              <span className="h-2 w-2 rounded-full bg-danger-600" aria-hidden />
              <span>Waktu Input Real-Time</span>
            </span>
            <p className="mt-1 font-mono text-sm font-bold tabular-nums text-ink-900">
              {formatWaktuWita(waktuSekarang)}
            </p>
            <p className="text-[11px] text-ink-600">{formatTanggalPanjang(waktuSekarang)}</p>
          </div>
        </div>

        {/* Empat Kotak Info Petugas */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              NIP Petugas (Simulasi)
            </p>
            <p className="mt-1 font-mono text-xs font-bold text-ink-900">{nipTampil}</p>
          </div>

          <div className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              Nama Petugas Pelapor
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink-900">
              <UserCheck className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
              <span className="truncate">{profilAktif.nama}</span>
            </p>
          </div>

          <div className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              WKPP / Wilayah Kerja
            </p>
            <p className="mt-1 truncate text-xs font-bold text-ink-900" title={profilAktif.wkpp}>
              {profilAktif.wkpp} · {profilAktif.namaWilayah}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              Status Integritas Data
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-brand-900">
              {isValid ? (
                <>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-ok-500" aria-hidden />
                  <span>Tervalidasi · Siap Publikasi GIS</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 shrink-0 text-ink-600" aria-hidden />
                  <span>Menunggu Kelengkapan Validasi</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Pita Pemulihan Draf Lokal */}
        {infoPulihDraf && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-700/20 bg-brand-100/70 px-3.5 py-2.5 text-xs text-brand-900">
            <span className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4 shrink-0" aria-hidden />
              <span>{infoPulihDraf}</span>
            </span>
            <button
              type="button"
              onClick={tanganiResetFormulir}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 font-semibold text-brand-900 hover:bg-canvas"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              <span>Mulai Formulir Baru</span>
            </button>
          </div>
        )}

        {/* Konfirmasi Publikasi Terakhir */}
        {laporanTerpublikasi && (
          <div
            role="status"
            className="mt-4 flex flex-col gap-3 rounded-xl border border-ok-500/40 bg-ok-100/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-ok-500" aria-hidden />
                <span className="text-sm font-bold text-ink-900">
                  Laporan {laporanTerpublikasi.kode} Berhasil Dipublikasikan
                </span>
                <LencanaStatusVerifikasi status={laporanTerpublikasi.status} />
              </div>
              <p className="text-xs text-ink-600">
                Data langsung tercatat pada repository tunggal untuk {laporanTerpublikasi.namaDesa},{' '}
                {laporanTerpublikasi.namaKabupaten} ({laporanTerpublikasi.namaKomoditas} —{' '}
                {laporanTerpublikasi.namaOptLokal}).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/dashboard"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-brand-900 px-3.5 py-2 text-xs font-semibold text-surface hover:bg-brand-700"
              >
                <span>Lihat di Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link
                to="/peta"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-brand-900 hover:bg-canvas"
              >
                <span>Buka Peta GIS</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* FORMULIR DUA KOLOM (Kiri: Bagian I–V, Kanan: Live Preview Menempel) */}
      <form onSubmit={kirimPublikasiGis} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* KOLOM KIRI: LIMA KARTU BERNOMOR I–V */}
          <div className="space-y-5 lg:col-span-8">
            {/* BAGIAN I — PERIODE PENGAMATAN */}
            <section
              aria-labelledby="judul-bagian-1"
              className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            >
              <div className="flex items-start gap-3 border-b border-line pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-surface">
                  I
                </span>
                <div>
                  <h2 id="judul-bagian-1" className="text-base font-bold text-ink-900 sm:text-lg">
                    Periode Pengamatan & Tahun Anggaran
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-600">
                    Nilai bawaan mengikuti tanggal sistem zona waktu WITA. Kombinasi Triwulan dan
                    Semester wajib konsisten.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Pilihan Triwulan */}
                <div>
                  <label
                    htmlFor="input-triwulan"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Triwulan Pengamatan <span className="text-danger-600">*</span>
                  </label>
                  <select
                    id="input-triwulan"
                    value={nilaiForm.triwulan}
                    onChange={(e) => {
                      const tw = Number.parseInt(e.target.value, 10) as 1 | 2 | 3 | 4;
                      setValue('triwulan', tw, { shouldValidate: true, shouldDirty: true });
                      setValue('semester', semesterDariTriwulan(tw), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-700"
                  >
                    {OPSI_TRIWULAN.map((opsi) => (
                      <option key={opsi.nilai} value={opsi.nilai}>
                        {opsi.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tombol Semester 1 / 2 */}
                <div>
                  <span
                    id="label-semester-form"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Semester Pelaporan <span className="text-danger-600">*</span>
                  </span>
                  <div
                    role="group"
                    aria-labelledby="label-semester-form"
                    className="mt-1.5 grid grid-cols-2 gap-2"
                  >
                    {([1, 2] as const).map((sem) => {
                      const aktif = nilaiForm.semester === sem;
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() =>
                            setValue('semester', sem, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          aria-pressed={aktif}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                            aktif
                              ? 'border-brand-900 bg-brand-900 text-surface'
                              : 'border-line bg-surface text-ink-900 hover:bg-brand-100/50'
                          }`}
                        >
                          Semester {sem}
                        </button>
                      );
                    })}
                  </div>
                  {errors.semester && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-600">
                      {errors.semester.message}
                    </p>
                  )}
                </div>

                {/* Tahun Anggaran */}
                <div>
                  <label
                    htmlFor="input-tahun-anggaran"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Tahun Anggaran <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <Calendar
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
                      aria-hidden
                    />
                    <input
                      id="input-tahun-anggaran"
                      type="number"
                      min={2020}
                      max={2100}
                      step={1}
                      {...register('tahun', { valueAsNumber: true })}
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-9 pr-3 py-2 text-sm font-semibold tabular-nums text-ink-900 focus:border-brand-700"
                    />
                  </div>
                  {errors.tahun && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-600">
                      {errors.tahun.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* BAGIAN II — LOKASI & KOORDINAT GEOSPASIAL */}
            <section
              aria-labelledby="judul-bagian-2"
              className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-surface">
                    II
                  </span>
                  <div>
                    <h2
                      id="judul-bagian-2"
                      className="text-base font-bold text-ink-900 sm:text-lg"
                    >
                      Lokasi Administratif & Koordinat Geospasial
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-600">
                      Pilih wilayah bertingkat hingga desa/kelurahan dan pastikan titik WGS84 berada
                      di dalam Provinsi Kalimantan Timur.
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-canvas px-2.5 py-1 font-mono text-[11px] font-semibold text-ink-600">
                  WGS84 · EPSG:4326
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Kabupaten / Kota */}
                <div>
                  <label
                    htmlFor="input-kabupaten"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Kabupaten / Kota <span className="text-danger-600">*</span>
                  </label>
                  <select
                    id="input-kabupaten"
                    value={nilaiForm.kabupatenId}
                    disabled={profilAktif.peran !== 'admin' && Boolean(profilAktif.wilayahId)}
                    onChange={(e) => tanganiPilihKabupaten(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-700 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-600"
                  >
                    {daftarKabupaten.map((kab) => (
                      <option key={kab.id} value={kab.id}>
                        {kab.nama}
                      </option>
                    ))}
                  </select>
                  {profilAktif.peran !== 'admin' && profilAktif.wilayahId && (
                    <p className="mt-1 text-[11px] text-ink-600">
                      Dikunci sesuai wilayah kerja {profilAktif.namaWilayah} (ganti ke Portal Admin
                      untuk lintas kabupaten/kota).
                    </p>
                  )}
                  {errors.kabupatenId && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.kabupatenId.message}
                    </p>
                  )}
                </div>

                {/* Kecamatan */}
                <div>
                  <label
                    htmlFor="input-kecamatan"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Kecamatan <span className="text-danger-600">*</span>
                  </label>
                  <select
                    id="input-kecamatan"
                    value={nilaiForm.kecamatanId}
                    onChange={(e) => tanganiPilihKecamatan(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-700"
                  >
                    {daftarKecamatan.length === 0 && (
                      <option value="">-- Pilih Kecamatan --</option>
                    )}
                    {daftarKecamatan.map((kec) => (
                      <option key={kec.id} value={kec.id}>
                        {kec.nama}
                      </option>
                    ))}
                  </select>
                  {errors.kecamatanId && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.kecamatanId.message}
                    </p>
                  )}
                </div>

                {/* Desa / Kelurahan */}
                <div>
                  <label
                    htmlFor="input-desa"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Desa / Kelurahan <span className="text-danger-600">*</span>
                  </label>
                  <select
                    id="input-desa"
                    value={nilaiForm.desaId}
                    onChange={(e) => tanganiPilihDesa(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-700"
                  >
                    {daftarDesa.length === 0 && (
                      <option value="">-- Pilih Desa/Kelurahan --</option>
                    )}
                    {daftarDesa.map((desa) => (
                      <option key={desa.id} value={desa.id}>
                        {desa.nama}
                      </option>
                    ))}
                  </select>
                  {errors.desaId && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.desaId.message}
                    </p>
                  )}
                </div>

                {/* Nama Blok / Poktan */}
                <div>
                  <label
                    htmlFor="input-nama-blok"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Nama Blok / Kelompok Tani <span className="text-danger-600">*</span>
                  </label>
                  <input
                    id="input-nama-blok"
                    type="text"
                    placeholder="Contoh: Poktan Harapan Makmur Blok A-04"
                    {...register('namaBlok')}
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-900 placeholder:text-ink-600/60 focus:border-brand-700"
                  />
                  {errors.namaBlok && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.namaBlok.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Kotak Koordinat + Tombol Ambil Koordinat Otomatis */}
              <div className="mt-5 rounded-xl border border-line bg-canvas/50 p-3.5 sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label
                      htmlFor="input-lat"
                      className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                    >
                      Lintang (Latitude) <span className="text-danger-600">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <MapPin
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700"
                        aria-hidden
                      />
                      <input
                        id="input-lat"
                        type="number"
                        step="0.0001"
                        placeholder="-0.7124"
                        {...register('lat', { valueAsNumber: true })}
                        className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-9 pr-3 py-2 font-mono text-sm font-semibold text-ink-900 focus:border-brand-700"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label
                      htmlFor="input-lng"
                      className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                    >
                      Bujur (Longitude) <span className="text-danger-600">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <MapPin
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700"
                        aria-hidden
                      />
                      <input
                        id="input-lng"
                        type="number"
                        step="0.0001"
                        placeholder="117.0411"
                        {...register('lng', { valueAsNumber: true })}
                        className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-9 pr-3 py-2 font-mono text-sm font-semibold text-ink-900 focus:border-brand-700"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={sedangMengambilGps}
                    onClick={tanganiAmbilKoordinatOtomatis}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60"
                  >
                    <LocateFixed className="h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      {sedangMengambilGps ? 'Mencari Titik...' : 'Ambil Koordinat Otomatis'}
                    </span>
                  </button>
                </div>

                {(errors.lat || errors.lng) && (
                  <p role="alert" className="mt-2 text-xs font-semibold text-danger-600">
                    {errors.lat?.message ?? errors.lng?.message}
                  </p>
                )}

                {/* Peta Pratinjau dengan Pin */}
                <div className="mt-4">
                  <PetaPratinjauPin
                    lat={nilaiForm.lat}
                    lng={nilaiForm.lng}
                    namaWilayahTerpilih={
                      desaTerpilih
                        ? `${desaTerpilih.nama}, ${kabupatenTerpilih?.nama ?? ''}`
                        : kabupatenTerpilih?.nama ?? 'Titik Amatan'
                    }
                    onPilihKoordinat={(latBaru, lngBaru) => {
                      setValue('lat', latBaru, { shouldValidate: true, shouldDirty: true });
                      setValue('lng', lngBaru, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
                </div>
              </div>
            </section>

            {/* BAGIAN III — KOMODITAS & IDENTIFIKASI OPT */}
            <section
              aria-labelledby="judul-bagian-3"
              className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-surface">
                    III
                  </span>
                  <div>
                    <h2
                      id="judul-bagian-3"
                      className="text-base font-bold text-ink-900 sm:text-lg"
                    >
                      Komoditas Perkebunan & Identifikasi OPT
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-600">
                      Tujuh komoditas utama perkebunan Kalimantan Timur tercatat terpisah sesuai
                      katalog baku.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-ink-900">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-900" aria-hidden />
                  <span>Katalog Khusus Kaltim</span>
                </span>
              </div>

              {/* Tujuh Ubin Komoditas */}
              <div className="mt-5">
                <span
                  id="label-ubin-komoditas"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                >
                  Pilih Komoditas Perkebunan <span className="text-danger-600">*</span>
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="label-ubin-komoditas"
                  className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7"
                >
                  {daftarKomoditas.map((kom) => {
                    const aktif = nilaiForm.komoditasId === kom.id;
                    const IkonKom = IKON_KOMODITAS[kom.kodeIkon] ?? Leaf;
                    return (
                      <button
                        key={kom.id}
                        type="button"
                        role="radio"
                        aria-checked={aktif}
                        onClick={() => tanganiPilihKomoditas(kom.id)}
                        className={`flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-center transition-colors ${
                          aktif
                            ? 'border-brand-900 bg-brand-900 text-surface shadow-sm'
                            : 'border-line bg-surface text-ink-900 hover:bg-brand-100/50'
                        }`}
                      >
                        <IkonKom
                          className={`h-5 w-5 shrink-0 ${
                            aktif ? 'text-gold-500' : 'text-brand-700'
                          }`}
                          aria-hidden
                        />
                        <span className="text-xs font-bold leading-tight">{kom.nama}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.komoditasId && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-600">
                    {errors.komoditasId.message}
                  </p>
                )}
              </div>

              {/* Pilihan Jenis Hama/OPT & Fase Tanaman */}
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="input-opt"
                      className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                    >
                      Jenis Hama / Penyakit (OPT) <span className="text-danger-600">*</span>
                    </label>
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-900">
                      Katalog Khusus Kaltim
                    </span>
                  </div>
                  <select
                    id="input-opt"
                    value={nilaiForm.optId}
                    onChange={(e) =>
                      setValue('optId', e.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-900 focus:border-brand-700"
                  >
                    {daftarOptTersaring.length === 0 && (
                      <option value="">-- Pilih Jenis OPT --</option>
                    )}
                    {daftarOptTersaring.map((itemOpt) => (
                      <option key={itemOpt.id} value={itemOpt.id}>
                        {itemOpt.namaLokal} ({itemOpt.namaIlmiah}) —{' '}
                        {itemOpt.jenis === 'hama' ? 'Hama' : 'Penyakit'}
                      </option>
                    ))}
                  </select>
                  {errors.optId && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.optId.message}
                    </p>
                  )}

                  {optTerpilih && (
                    <div className="mt-2.5 rounded-xl border border-line bg-canvas/70 px-3 py-2.5 text-xs">
                      <p className="flex items-center gap-1.5 font-bold text-ink-900">
                        <Bug className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden />
                        <span>{optTerpilih.namaLokal}</span>
                        <span className="font-normal italic text-ink-600">
                          ({optTerpilih.namaIlmiah})
                        </span>
                      </p>
                      <p className="mt-1 text-ink-600">
                        <strong className="text-ink-900">Ciri Gejala:</strong> {optTerpilih.gejala}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tiga Tombol Fase Tanaman */}
                <div>
                  <span
                    id="label-fase-tanaman"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Fase Pertumbuhan Tanaman <span className="text-danger-600">*</span>
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="label-fase-tanaman"
                    className="mt-1.5 grid grid-cols-3 gap-2"
                  >
                    {OPSI_FASE.map((opsi) => {
                      const aktif = nilaiForm.faseTanaman === opsi.nilai;
                      return (
                        <button
                          key={opsi.nilai}
                          type="button"
                          role="radio"
                          aria-checked={aktif}
                          onClick={() =>
                            setValue('faseTanaman', opsi.nilai, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className={`flex min-h-[60px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition-colors ${
                            aktif
                              ? 'border-brand-900 bg-brand-900 text-surface'
                              : 'border-line bg-surface text-ink-900 hover:bg-brand-100/50'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{opsi.kode}</span>
                          <span
                            className={`mt-0.5 text-[10px] leading-tight ${
                              aktif ? 'text-brand-100' : 'text-ink-600'
                            }`}
                          >
                            {opsi.keterangan}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.faseTanaman && (
                    <p role="alert" className="mt-1.5 text-xs font-semibold text-danger-600">
                      {errors.faseTanaman.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* BAGIAN IV — LUAS AMATAN & INTENSITAS SERANGAN */}
            <section
              aria-labelledby="judul-bagian-4"
              className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            >
              <div className="flex items-start gap-3 border-b border-line pb-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-sm font-bold text-surface">
                  IV
                </span>
                <div>
                  <h2 id="judul-bagian-4" className="text-base font-bold text-ink-900 sm:text-lg">
                    Luas Pengamatan & Kalkulasi Intensitas (Ha)
                  </h2>
                  <p className="mt-0.5 text-xs text-ink-600">
                    Intensitas dihitung otomatis dari (Luas Ringan + Luas Berat) ÷ Luas Pengamatan
                    × 100. Jumlah rincian tidak boleh melebihi Luas Pengamatan.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Luas Pengamatan */}
                <div>
                  <label
                    htmlFor="input-luas-amatan"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Luas Pengamatan <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="input-luas-amatan"
                      type="number"
                      min={0.01}
                      step="0.01"
                      {...register('luasAmatan', { valueAsNumber: true })}
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-3 pr-10 py-2 text-sm font-bold tabular-nums text-ink-900 focus:border-brand-700"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-600">
                      Ha
                    </span>
                  </div>
                  {errors.luasAmatan && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.luasAmatan.message}
                    </p>
                  )}
                </div>

                {/* Serangan Ringan */}
                <div>
                  <label
                    htmlFor="input-luas-ringan"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Serangan Ringan <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="input-luas-ringan"
                      type="number"
                      min={0}
                      step="0.01"
                      {...register('luasRingan', { valueAsNumber: true })}
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-3 pr-10 py-2 text-sm font-bold tabular-nums text-ink-900 focus:border-brand-700"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-600">
                      Ha
                    </span>
                  </div>
                  {errors.luasRingan && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.luasRingan.message}
                    </p>
                  )}
                </div>

                {/* Serangan Berat */}
                <div>
                  <label
                    htmlFor="input-luas-berat"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Serangan Berat <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="input-luas-berat"
                      type="number"
                      min={0}
                      step="0.01"
                      {...register('luasBerat', { valueAsNumber: true })}
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-3 pr-10 py-2 text-sm font-bold tabular-nums text-danger-600 focus:border-brand-700"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-600">
                      Ha
                    </span>
                  </div>
                  {errors.luasBerat && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.luasBerat.message}
                    </p>
                  )}
                </div>

                {/* Luas Terkendali */}
                <div>
                  <label
                    htmlFor="input-luas-terkendali"
                    className="block text-xs font-bold uppercase tracking-wider text-ink-900"
                  >
                    Terkendali / Eradikasi <span className="text-danger-600">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="input-luas-terkendali"
                      type="number"
                      min={0}
                      step="0.01"
                      {...register('luasTerkendali', { valueAsNumber: true })}
                      className="min-h-[44px] w-full rounded-xl border border-line bg-surface pl-3 pr-10 py-2 text-sm font-bold tabular-nums text-brand-900 focus:border-brand-700"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-600">
                      Ha
                    </span>
                  </div>
                  {errors.luasTerkendali && (
                    <p role="alert" className="mt-1 text-xs font-semibold text-danger-600">
                      {errors.luasTerkendali.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Kartu Hasil Cincin Persen & Klasifikasi */}
              <div className="mt-5">
                <KartuCincinIntensitas
                  luasAmatan={luasAmatanAman}
                  luasRingan={luasRinganAman}
                  luasBerat={luasBeratAman}
                  luasTerkendali={luasTerkendaliAman}
                  intensitasPersen={intensitasPersen}
                  tingkat={tingkatSerangan}
                  statusPeringatan={statusPeringatanForm}
                  konfigurasiPeringatan={konfigurasi.peringatanForm}
                  validLuas={hasilValidasiLuas.valid}
                />
              </div>
            </section>

            {/* BAGIAN V — DOKUMENTASI FOTO & REKOMENDASI */}
            <BagianDokumentasiFoto
              fotos={fotos}
              sedangMemprosesFoto={sedangMemprosesFoto}
              galatFoto={galatFoto}
              onUnggahBerkas={(slot, berkas) => {
                void tanganiUnggahFoto(slot, berkas);
              }}
              onHapusFoto={tanganiHapusFoto}
              register={register}
              errors={errors}
              rekomendasiKatalogOpt={optTerpilih?.rekomendasi ?? null}
              onSalinRekomendasiOpt={tanganiSalinRekomendasiOpt}
            />
          </div>

          {/* KOLOM KANAN: PANEL RINGKASAN VALIDASI LIVE PREVIEW */}
          <div className="lg:col-span-4">
            <PanelPratinjauLaporan
              nilai={nilaiForm}
              namaKabupaten={kabupatenTerpilih?.nama ?? '-'}
              namaKecamatan={kecamatanTerpilih?.nama ?? '-'}
              namaDesa={desaTerpilih?.nama ?? '-'}
              namaKomoditas={komoditasTerpilih?.nama ?? '-'}
              optTerpilih={optTerpilih}
              intensitasPersen={intensitasPersen}
              tingkat={tingkatSerangan}
              fotos={fotos}
              konfigurasi={konfigurasi}
            />
          </div>
        </div>

        {/* RINGKASAN GALAT DI ATAS BILAH AKSI (DESIGN.md §4.3) */}
        {daftarPesanGalat.length > 0 && (submitCount > 0 || !hasilValidasiLuas.valid) && (
          <div
            role="alert"
            className="rounded-2xl border border-danger-600/40 bg-danger-100 p-4 text-xs text-danger-600"
          >
            <div className="flex items-center gap-2 font-bold">
              <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                Terdapat {daftarPesanGalat.length} ketidaksesuaian validasi yang harus diperbaiki
                sebelum publikasi GIS:
              </span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-900">
              {daftarPesanGalat.map((pesan) => (
                <li key={pesan}>{pesan}</li>
              ))}
            </ul>
          </div>
        )}

        {/* BILAH AKSI BAWAH (Menempel di Ponsel — DESIGN.md §4.3) */}
        <div className="sticky bottom-0 z-20 rounded-2xl border border-line bg-surface/95 p-3.5 shadow-sm backdrop-blur sm:static sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-xs text-ink-600">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-ok-500" aria-hidden />
              <span>
                Laporan tersimpan otomatis dalam draf lokal browser
                {waktuSimpanDrafLokal ? ` (${waktuSimpanDrafLokal})` : ''}.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={tanganiResetFormulir}
                disabled={sedangMenyimpanDraf || sedangMempublikasikan}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-900 hover:bg-canvas disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
                <span>Batal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  void tanganiSimpanDraf();
                }}
                disabled={sedangMenyimpanDraf || sedangMempublikasikan}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-brand-100 px-4 py-2.5 text-xs font-bold text-brand-900 hover:bg-brand-100/80 disabled:opacity-60"
              >
                <Save className="h-4 w-4 shrink-0" aria-hidden />
                <span>{sedangMenyimpanDraf ? 'Menyimpan...' : 'Simpan Draf'}</span>
              </button>

              <button
                type="submit"
                disabled={sedangMempublikasikan || sedangMenyimpanDraf}
                className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-surface hover:bg-brand-700 disabled:opacity-60 sm:col-span-1"
              >
                <Send className="h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {sedangMempublikasikan
                    ? 'Mempublikasikan ke GIS...'
                    : 'Simpan & Publikasikan GIS'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
