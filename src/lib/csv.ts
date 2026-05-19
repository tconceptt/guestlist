import Papa from "papaparse";
import {
  normalizeSide,
  normalizeStatus,
  type InviteSide,
  type InviteStatus,
} from "./labels";
import { clampPartySize, clampScale } from "./scoring";

export type ParsedInvite = {
  name: string;
  side: InviteSide;
  partySize: number;
  relationship: string;
  importance: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  notes: string;
  status: InviteStatus;
};

export type SkippedCsvRow = {
  row: number;
  reason: string;
};

type RawRow = Record<string, unknown>;

const headerAliases: Record<string, keyof ParsedInvite> = {
  name: "name",
  fullname: "name",
  guest: "name",
  guestname: "name",
  side: "side",
  partysize: "partySize",
  guests: "partySize",
  inviteslots: "partySize",
  relationship: "relationship",
  group: "relationship",
  category: "relationship",
  importance: "importance",
  importancescore: "importance",
  priority: "importance",
  likelihood: "likelihood",
  chance: "likelihood",
  chanceofcoming: "likelihood",
  attendancechance: "likelihood",
  notes: "notes",
  note: "notes",
  status: "status",
};

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[\s_-]/g, "");
}

function normalizeRow(row: RawRow) {
  const normalized: Partial<Record<keyof ParsedInvite, unknown>> = {};

  for (const [key, value] of Object.entries(row)) {
    const canonical = headerAliases[normalizeHeader(key)];
    if (canonical) {
      normalized[canonical] = value;
    }
  }

  return normalized;
}

function asString(value: unknown) {
  return String(value ?? "").trim();
}

function asNumber(value: unknown) {
  const parsed = Number.parseFloat(asString(value));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseInviteCsv(csv: string) {
  const parsed = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const imports: ParsedInvite[] = [];
  const skipped: SkippedCsvRow[] = [];

  parsed.data.forEach((rawRow, index) => {
    const row = normalizeRow(rawRow);
    const name = asString(row.name);

    if (!name) {
      skipped.push({ row: index + 2, reason: "Missing name" });
      return;
    }

    imports.push({
      name,
      side: normalizeSide(row.side),
      partySize: clampPartySize(asNumber(row.partySize)),
      relationship: asString(row.relationship),
      importance: clampScale(asNumber(row.importance)),
      likelihood: clampScale(asNumber(row.likelihood)),
      notes: asString(row.notes),
      status: normalizeStatus(row.status),
    });
  });

  return {
    imports,
    skipped,
    errors: parsed.errors.map((error) => error.message),
  };
}
