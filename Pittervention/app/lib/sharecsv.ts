// app/lib/shareCsv.ts
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

/**
 * Save CSV to a temp file and open the OS share sheet (OneDrive, Files, etc.)
 * Returns the file path written, in case you want to reuse it.
 */
export async function shareCsvToOneDrive(csv: string, fileName = `export-${Date.now()}.csv`) {
  // 1) Write CSV to a temp file
  const path = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  // 2) Use native share sheet (OneDrive shows as a target if installed)
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    // iOS simulators don’t support Sharing; fall back to “Open in…”
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(path, {
    // iOS uses UTI behind the scenes; Android uses MIME
    mimeType: 'text/csv',
    dialogTitle: 'Save CSV (choose OneDrive)',
    UTI: 'public.comma-separated-values-text',
  });

  return path;
}

/**
 * Optional: email the CSV (pairs well with a Power Automate rule).
 */
export async function emailCsv(csv: string, opts?: { to?: string; subject?: string; body?: string }) {
  const fileName = `export-${Date.now()}.csv`;
  const path = FileSystem.cacheDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const isAvail = await MailComposer.isAvailableAsync();
  if (!isAvail) throw new Error('Mail composer is not available on this device.');

  await MailComposer.composeAsync({
    recipients: [opts?.to ?? ''],
    subject: opts?.subject ?? 'CSV_EXPORT',
    body: opts?.body ?? 'CSV attached.',
    attachments: [path],
  });

  return path;
}
