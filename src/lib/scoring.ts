import { scoreBands, type InviteSide, type InviteStatus, type ScaleValue } from "./labels";

export type ScoreInput = {
  importance: number;
  likelihood: number;
};

export type SummaryInvite = ScoreInput & {
  side: InviteSide;
  status: InviteStatus;
  partySize: number;
};

export function clampScale(value: number, fallback = 3): ScaleValue {
  if (!Number.isFinite(value)) {
    return fallback as ScaleValue;
  }

  return Math.min(5, Math.max(1, Math.round(value))) as ScaleValue;
}

export function clampPartySize(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(20, Math.max(1, Math.round(value)));
}

export function getInviteScore(input: ScoreInput): number {
  const importance = clampScale(input.importance);
  const likelihood = clampScale(input.likelihood);
  return Math.round((((importance * 0.7 + likelihood * 0.3) / 5) * 10) * 10) / 10;
}

export function getScoreBand(score: number) {
  if (score >= 8.5) {
    return scoreBands.must;
  }

  if (score >= 7) {
    return scoreBands.strong;
  }

  if (score >= 5) {
    return scoreBands.maybe;
  }

  return scoreBands.low;
}

export function getInviteSummary(invites: SummaryInvite[]) {
  return invites.reduce(
    (summary, invite) => {
      const partySize = clampPartySize(invite.partySize);
      const score = getInviteScore(invite);

      if (invite.status === "candidate") {
        summary.candidateCount += 1;
        summary.candidateGuests += partySize;
        if (score >= 8.5) {
          summary.highScoreCandidates += 1;
        }
      } else {
        summary.confirmedCount += 1;
        summary.confirmedGuests += partySize;
      }

      if (invite.side === "Bride") {
        summary.brideGuests += partySize;
      } else if (invite.side === "Groom") {
        summary.groomGuests += partySize;
      } else {
        summary.sharedGuests += partySize;
      }

      summary.totalGuests += partySize;
      summary.totalRecords += 1;

      return summary;
    },
    {
      totalRecords: 0,
      totalGuests: 0,
      candidateCount: 0,
      candidateGuests: 0,
      confirmedCount: 0,
      confirmedGuests: 0,
      brideGuests: 0,
      groomGuests: 0,
      sharedGuests: 0,
      highScoreCandidates: 0,
    },
  );
}
