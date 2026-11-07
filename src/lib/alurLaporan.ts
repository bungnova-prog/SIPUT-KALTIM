import type { StatusLaporan } from '../types/domain';

/**
 * Aturan transisi status laporan (AGENTS.md §8, SCHEMA.md §5).
 * Alur baku: `draf` -> `menunggu` -> `terverifikasi` | `ditolak`.
 * Laporan `terverifikasi` tidak dapat dikembalikan ke draf/menunggu oleh alur biasa;
 * perubahan harus melalui `ubahLaporanTerverifikasi` dengan catatan.
 */
export type AksiAlurLaporan = 'simpan_draf' | 'publikasikan' | 'verifikasi';

export interface PermintaanTransisiStatus {
  statusSaatIni: StatusLaporan | null;
  aksi: AksiAlurLaporan;
  keputusan?: 'terverifikasi' | 'ditolak';
}

export interface HasilTransisiStatus {
  diizinkan: boolean;
  statusBaru?: StatusLaporan;
  pesan?: string;
}

export function transisiStatusLaporan(
  permintaan: PermintaanTransisiStatus
): HasilTransisiStatus {
  const { statusSaatIni, aksi, keputusan } = permintaan;

  if (aksi === 'simpan_draf') {
    if (statusSaatIni === null || statusSaatIni === 'draf') {
      return { diizinkan: true, statusBaru: 'draf' };
    }
    if (statusSaatIni === 'terverifikasi') {
      return {
        diizinkan: false,
        pesan:
          'Laporan terverifikasi tidak dapat diubah menjadi draf. Gunakan perubahan laporan terverifikasi dengan catatan.',
      };
    }
    return {
      diizinkan: false,
      pesan:
        'Laporan berstatus menunggu/ditolak tidak dapat disimpan sebagai draf. Perbaiki isian lalu publikasikan ulang.',
    };
  }

  if (aksi === 'publikasikan') {
    if (statusSaatIni === 'terverifikasi') {
      return {
        diizinkan: false,
        pesan:
          'Laporan terverifikasi tidak dapat dipublikasikan ulang. Gunakan perubahan laporan terverifikasi dengan catatan.',
      };
    }
    return { diizinkan: true, statusBaru: 'menunggu' };
  }

  if (!keputusan) {
    return {
      diizinkan: false,
      pesan: 'Keputusan verifikasi wajib ditentukan (terverifikasi atau ditolak).',
    };
  }

  if (statusSaatIni === 'menunggu') {
    return { diizinkan: true, statusBaru: keputusan };
  }

  if (statusSaatIni === 'terverifikasi' && keputusan === 'ditolak') {
    return { diizinkan: true, statusBaru: 'ditolak' };
  }

  if (statusSaatIni === 'terverifikasi') {
    return { diizinkan: false, pesan: 'Laporan tersebut sudah berstatus terverifikasi.' };
  }

  return {
    diizinkan: false,
    pesan:
      'Verifikasi hanya dapat dilakukan pada laporan berstatus menunggu. Laporan draf harus dipublikasikan terlebih dahulu.',
  };
}
