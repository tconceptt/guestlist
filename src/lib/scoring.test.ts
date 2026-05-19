import { describe, expect, it } from "vitest";
import {
  clampScale,
  getInviteScore,
  getScoreBand,
  getInviteSummary,
} from "./scoring";

describe("invite scoring", () => {
  it("weights importance more heavily than likelihood", () => {
    expect(getInviteScore({ importance: 5, likelihood: 5 })).toBe(10);
    expect(getInviteScore({ importance: 5, likelihood: 1 })).toBe(7.6);
    expect(getInviteScore({ importance: 1, likelihood: 5 })).toBe(4.4);
  });

  it("clamps scale values to the 1-5 range", () => {
    expect(clampScale(7)).toBe(5);
    expect(clampScale(-4)).toBe(1);
    expect(clampScale(Number.NaN)).toBe(3);
  });

  it("maps scores to decision bands", () => {
    expect(getScoreBand(8.5).label).toBe("Must invite");
    expect(getScoreBand(7).label).toBe("Strong candidate");
    expect(getScoreBand(5).label).toBe("Maybe");
    expect(getScoreBand(4.9).label).toBe("Low priority");
  });

  it("summarizes records by side and status using party size", () => {
    const summary = getInviteSummary([
      { side: "Bride", status: "candidate", partySize: 2, importance: 5, likelihood: 5 },
      { side: "Groom", status: "confirmed", partySize: 3, importance: 4, likelihood: 4 },
      { side: "Both", status: "confirmed", partySize: 1, importance: 5, likelihood: 4 },
    ]);

    expect(summary.candidateGuests).toBe(2);
    expect(summary.confirmedGuests).toBe(4);
    expect(summary.brideGuests).toBe(2);
    expect(summary.groomGuests).toBe(3);
    expect(summary.sharedGuests).toBe(1);
    expect(summary.highScoreCandidates).toBe(1);
  });
});
