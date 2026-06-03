import { readFileSync } from "node:fs";

const localDateSource = readFileSync("lib/local-date.ts", "utf8");
const routinesSource = readFileSync("hooks/use-routines.ts", "utf8");
const logsSource = readFileSync("hooks/use-activity-logs.ts", "utf8");
const missionSource = readFileSync("lib/child-progression.ts", "utf8");

if (!localDateSource.includes("export function getLocalIsoDate")) {
  throw new Error("Missing shared getLocalIsoDate helper.");
}

if (!routinesSource.includes("date: getLocalIsoDate()")) {
  throw new Error("Routine progress is not scoped to the local calendar day.");
}

if (logsSource.includes('toISOString().split("T")[0]')) {
  throw new Error("Activity logs still derive their date from UTC toISOString().");
}

if (missionSource.includes('toISOString().split("T")[0]')) {
  throw new Error("Daily mission date still derives from UTC toISOString().");
}

console.log("Local-day routine progress and shared date source are wired correctly.");
