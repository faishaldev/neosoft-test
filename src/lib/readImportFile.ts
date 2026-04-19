export type ReadImportFileResult =
  | { ok: true; text: string }
  | { ok: false }

export async function readImportFileText(
  file: File,
): Promise<ReadImportFileResult> {
  try {
    return { ok: true, text: await file.text() }
  } catch {
    return { ok: false }
  }
}
