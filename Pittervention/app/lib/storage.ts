// lib/storage.ts
import * as FileSystem from 'expo-file-system';
import { shareCsvToOneDrive } from './sharecsv'; // your Expo-based share helper

// --- File location/name ---
const FILE_NAME = 'surveyData.csv';
const FILE_URI = (FileSystem.documentDirectory ?? FileSystem.cacheDirectory!) + FILE_NAME;

// --- Schema (column order must match everywhere) ---
const HEADERS = [
  'id',
  'date',
  'wentToACTC',
  'peerTutoring',
  'writingCenter',
  'mathCenter',
  'trio',
  'facultyOfficeHours',
  'informalStudyGroup',
  'exercise',
  'meditation',
  'sleepHours',
  'tao',
  'togetherAll',
  'meds',
  'therapy',
] as const;

type HeaderKey = (typeof HEADERS)[number];

export type SurveyEntry = {
  id: number;
  date: string;
  wentToACTC: boolean;
  peerTutoring: boolean;
  writingCenter: boolean;
  mathCenter: boolean;
  trio: boolean;
  facultyOfficeHours: boolean;
  informalStudyGroup: boolean;
  exercise: string;
  meditation: boolean;
  sleepHours: string;
  tao: boolean;
  togetherAll: boolean;
  meds: string;
  therapy: boolean;
};

// --- CSV helpers ---
function csvEscape(val: string) {
  // Wrap in quotes if value contains comma, quote, or newline; escape quotes as ""
  if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}
function toYN(b: boolean) {
  return b ? 'Y' : 'N';
}
function fromYN(s: string) {
  return (s || '').trim().toUpperCase() === 'Y';
}

// very small CSV splitter (handles quoted fields + commas/newlines)
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ',') {
        out.push(cur);
        cur = '';
      } else if (ch === '"') {
        inQ = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

// --- File primitives ---
async function ensureFileWithHeader(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILE_URI);
  if (!info.exists) {
    const header = HEADERS.join(',') + '\n';
    await FileSystem.writeAsStringAsync(FILE_URI, header, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  }
}

async function appendLine(line: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILE_URI);
  if (!info.exists) {
    await ensureFileWithHeader();
  }
  // Expo FS has no append flag; read + write back is simplest/portable
  const existing = await FileSystem.readAsStringAsync(FILE_URI, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const content = existing.endsWith('\n') ? existing + line : existing + '\n' + line;
  await FileSystem.writeAsStringAsync(FILE_URI, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

// --- Public API (no backend) ---

// Save a survey entry (append a CSV row)
export async function saveSurveyDataAsync(newEntry: SurveyEntry): Promise<void> {
  await ensureFileWithHeader();
  const row = [
    String(newEntry.id),
    csvEscape(newEntry.date),
    toYN(newEntry.wentToACTC),
    toYN(newEntry.peerTutoring),
    toYN(newEntry.writingCenter),
    toYN(newEntry.mathCenter),
    toYN(newEntry.trio),
    toYN(newEntry.facultyOfficeHours),
    toYN(newEntry.informalStudyGroup),
    csvEscape(newEntry.exercise ?? ''),
    toYN(newEntry.meditation),
    csvEscape(newEntry.sleepHours ?? ''),
    toYN(newEntry.tao),
    toYN(newEntry.togetherAll),
    csvEscape(newEntry.meds ?? ''),
    toYN(newEntry.therapy),
  ].join(',');
  await appendLine(row);
}

// Load all entries (parse CSV back into objects)
export async function loadEntriesAsync(): Promise<SurveyEntry[]> {
  const info = await FileSystem.getInfoAsync(FILE_URI);
  if (!info.exists) return [];

  const text = await FileSystem.readAsStringAsync(FILE_URI, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return []; // only header present or empty

  // Validate header order (best effort)
  const header = splitCsvLine(lines[0]);
  const headerOk = HEADERS.every((h, i) => header[i] === h);
  if (!headerOk) {
    // If header mismatches, you could handle remapping here. For now we assume exact match.
    // eslint-disable-next-line no-console
    console.warn('CSV header mismatch; expected:', HEADERS.join(','));
  }

  const entries: SurveyEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < HEADERS.length) continue;

    const obj: Partial<SurveyEntry> = {};
    const get = (key: HeaderKey) => cols[HEADERS.indexOf(key)];

    obj.id = Number(get('id'));
    obj.date = get('date');
    obj.wentToACTC = fromYN(get('wentToACTC'));
    obj.peerTutoring = fromYN(get('peerTutoring'));
    obj.writingCenter = fromYN(get('writingCenter'));
    obj.mathCenter = fromYN(get('mathCenter'));
    obj.trio = fromYN(get('trio'));
    obj.facultyOfficeHours = fromYN(get('facultyOfficeHours'));
    obj.informalStudyGroup = fromYN(get('informalStudyGroup'));
    obj.exercise = get('exercise');
    obj.meditation = fromYN(get('meditation'));
    obj.sleepHours = get('sleepHours');
    obj.tao = fromYN(get('tao'));
    obj.togetherAll = fromYN(get('togetherAll'));
    obj.meds = get('meds');
    obj.therapy = fromYN(get('therapy'));

    entries.push(obj as SurveyEntry);
  }
  return entries;
}

// Clear all entries (delete the CSV file)
export async function clearDataAsync(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILE_URI);
  if (info.exists) {
    await FileSystem.deleteAsync(FILE_URI, { idempotent: true });
  }
  // Recreate with header (optional)
  await ensureFileWithHeader();
}

// Export/share CSV (ensures file exists, then opens native Share Sheet)
export async function exportSurveyDataAsync(): Promise<string> {
  await ensureFileWithHeader();

  // Optional sanity: verify there’s at least one data row
  const text = await FileSystem.readAsStringAsync(FILE_URI, { encoding: FileSystem.EncodingType.UTF8 });
  const hasData = text.split(/\r?\n/).filter((l) => l.trim().length > 0).length > 1;
  if (!hasData) throw new Error('No survey data to export.');

  // Use your existing OneDrive share helper (Expo Sharing under the hood)
  await shareCsvToOneDrive(text, FILE_NAME);
  return FILE_URI;
}

export default {
  saveSurveyDataAsync,
  loadEntriesAsync,
  clearDataAsync,
  exportSurveyDataAsync,
};
