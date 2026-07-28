import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getLocalIsoDate } from "@/lib/local-date";
import { KEYS, storage } from "@/lib/storage";

/**
 * Local data export.
 *
 * Everything this household owns lives in AsyncStorage, so a backup is simply a
 * JSON dump of every `KEYS` entry. The file is written to the cache directory —
 * it only has to survive long enough for the share sheet to copy it — handed to
 * `expo-sharing`, and removed again afterwards.
 *
 * Two things are deliberately *not* in the file:
 *   - avatar photos, which are image files under `<documentDirectory>/avatar-photos/`
 *     and would have to be inlined as base64 to travel with a JSON export
 *   - the parent PIN: the current one lives in SecureStore (outside `storage`)
 *     and the legacy `parentPinHash` is unsalted, so a shared file would hand a
 *     four-digit PIN to anyone who receives it
 *
 * Both exclusions are spelled out in the `hinweis` field so the file explains
 * itself without this comment.
 */

/** Never leaves the device inside a shareable file. See the module comment. */
const EXCLUDED_KEYS: readonly string[] = [KEYS.PARENT_PIN_HASH];

const EXPORT_NOTE =
  "Dieser Export enthält nur die lokal gespeicherten Daten als JSON. " +
  "Avatar-Fotos sind nicht enthalten — sie bleiben als Bilddateien auf dem Gerät. " +
  "Die Eltern-PIN ist aus Sicherheitsgründen ebenfalls nicht enthalten.";

interface ExportPayload {
  schemaVersion: string | null;
  exportedAt: string;
  hinweis: string;
  data: Record<string, unknown>;
}

/**
 * Writes every stored key into a JSON file and opens the system share sheet.
 *
 * Never throws — failures come back as `{ ok: false, error }` with a German
 * message the caller can drop straight into a toast. Note that on iOS a
 * cancelled share sheet still resolves, so `ok: true` means "the sheet opened",
 * not "the parent saved the file somewhere".
 */
export async function exportAppData(): Promise<{ ok: boolean; error?: string }> {
  let isSharingAvailable = false;

  try {
    isSharingAvailable = await Sharing.isAvailableAsync();
  } catch (error) {
    console.error("Failed to query sharing availability:", error);
  }

  if (!isSharingAvailable) {
    return {
      ok: false,
      error: "Teilen ist auf diesem Gerät nicht verfügbar.",
    };
  }

  let file: File;

  try {
    file = writeExportFile(await collectExportPayload());
  } catch (error) {
    console.error("Failed to write the export file:", error);
    return {
      ok: false,
      error: "Die Exportdatei konnte nicht erstellt werden.",
    };
  }

  try {
    await Sharing.shareAsync(file.uri, {
      UTI: "public.json",
      mimeType: "application/json",
      dialogTitle: "Routine Stars Datenexport",
    });

    return { ok: true };
  } catch (error) {
    console.error("Failed to share the export file:", error);
    return {
      ok: false,
      error: "Der Export konnte nicht geteilt werden.",
    };
  } finally {
    deleteTempFile(file);
  }
}

/**
 * Reads every non-excluded key. Keys that were never written stay in the file
 * as `null` so the export always has the same shape — an importer can then tell
 * "not set" apart from "unknown key".
 */
async function collectExportPayload(): Promise<ExportPayload> {
  const keys = Object.values(KEYS).filter((key) => !EXCLUDED_KEYS.includes(key));

  const entries = await Promise.all(
    keys.map(async (key) => [key, await storage.getItem<unknown>(key)] as const)
  );

  const data: Record<string, unknown> = {};

  for (const [key, value] of entries) {
    data[key] = value;
  }

  return {
    schemaVersion: toSchemaVersion(data[KEYS.SCHEMA_VERSION]),
    exportedAt: new Date().toISOString(),
    hinweis: EXPORT_NOTE,
    data,
  };
}

/** The marker is stored unquoted, so it parses back as a number, not a string. */
function toSchemaVersion(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return null;
}

function writeExportFile(payload: ExportPayload): File {
  const file = new File(Paths.cache, `routine-stars-export-${getLocalIsoDate()}.json`);

  // A second export on the same day would otherwise hit yesterday's leftovers.
  file.create({ intermediates: true, overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  return file;
}

/**
 * Best effort — the share sheet has already taken its copy by the time this
 * runs, and the cache directory is disposable, so a leftover file is harmless.
 */
function deleteTempFile(file: File): void {
  try {
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error("Failed to remove the temporary export file:", error);
  }
}
