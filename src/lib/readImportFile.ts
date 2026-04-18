export type ReadImportFileResult =
  | { ok: true; text: string }
  | { ok: false }

/** Membaca teks berkas impor; gagal jika IO error. */
export async function readImportFileText(
  file: File,
): Promise<ReadImportFileResult> {
  try {
    return { ok: true, text: await file.text() }
  } catch {
    return { ok: false }
  }
}
