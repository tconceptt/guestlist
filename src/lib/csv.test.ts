import { describe, expect, it } from "vitest";
import { parseInviteCsv } from "./csv";

describe("parseInviteCsv", () => {
  it("imports canonical and common alias headers", () => {
    const result = parseInviteCsv(
      "full name,side,party size,chance\nAda,Bride,2,5\n,Groom,1,3",
    );

    expect(result.imports[0]).toMatchObject({
      name: "Ada",
      side: "Bride",
      partySize: 2,
      likelihood: 5,
      importance: 3,
      status: "candidate",
    });
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe("Missing name");
  });

  it("defaults optional values and clamps invalid numbers", () => {
    const result = parseInviteCsv("name,importance_score,likelihood,status\nMina,9,-2,confirmed");

    expect(result.imports).toEqual([
      {
        name: "Mina",
        side: "Both",
        partySize: 1,
        relationship: "",
        importance: 5,
        likelihood: 1,
        notes: "",
        status: "confirmed",
      },
    ]);
  });

  it("normalizes side and status values", () => {
    const result = parseInviteCsv("name,side,status\nSam,grooms,candidate\nLiya,shared,confirmed");

    expect(result.imports.map((invite) => invite.side)).toEqual(["Groom", "Both"]);
    expect(result.imports.map((invite) => invite.status)).toEqual(["candidate", "confirmed"]);
  });
});
