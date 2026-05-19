export const SIDES = ["Bride", "Groom", "Both"] as const;
export type InviteSide = (typeof SIDES)[number];

export const STATUSES = ["candidate", "confirmed"] as const;
export type InviteStatus = (typeof STATUSES)[number];

export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export const importanceLabels: Record<ScaleValue, string> = {
  1: "Obligation",
  2: "Nice to include",
  3: "Meaningful",
  4: "Very dear",
  5: "Non-negotiable",
};

export const likelihoodLabels: Record<ScaleValue, string> = {
  1: "Unlikely",
  2: "Possible",
  3: "Maybe",
  4: "Likely",
  5: "Almost certain",
};

export type ScoreBandKey = "must" | "strong" | "maybe" | "low";

export type ScoreBand = {
  key: ScoreBandKey;
  label: string;
  className: string;
  tone: string;
};

export const scoreBands: Record<ScoreBandKey, ScoreBand> = {
  must: {
    key: "must",
    label: "Must invite",
    className: "scoreMust",
    tone: "Deep rose",
  },
  strong: {
    key: "strong",
    label: "Strong candidate",
    className: "scoreStrong",
    tone: "Gold",
  },
  maybe: {
    key: "maybe",
    label: "Maybe",
    className: "scoreMaybe",
    tone: "Sage",
  },
  low: {
    key: "low",
    label: "Low priority",
    className: "scoreLow",
    tone: "Slate",
  },
};

export function normalizeSide(value: unknown): InviteSide {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (["bride", "brides", "bride side", "bride-side"].includes(normalized)) {
    return "Bride";
  }

  if (["groom", "grooms", "groom side", "groom-side"].includes(normalized)) {
    return "Groom";
  }

  return "Both";
}

export function normalizeStatus(value: unknown): InviteStatus {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return normalized === "confirmed" ? "confirmed" : "candidate";
}
