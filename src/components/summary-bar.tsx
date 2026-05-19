import { Users, Crown, HeartHandshake, Sparkles } from "lucide-react";
import { getInviteSummary, type SummaryInvite } from "@/lib/scoring";

type SummaryBarProps = {
  invites: SummaryInvite[];
  mode?: "candidate" | "confirmed";
};

export function SummaryBar({ invites, mode = "candidate" }: SummaryBarProps) {
  const summary = getInviteSummary(invites);
  const primaryLabel = mode === "candidate" ? "Candidate guests" : "Confirmed guests";
  const primaryValue = mode === "candidate" ? summary.candidateGuests : summary.confirmedGuests;

  return (
    <section className="summaryGrid" aria-label="Invite summary">
      <article className="summaryMetric primary">
        <Users size={20} />
        <span>{primaryLabel}</span>
        <strong>{primaryValue}</strong>
      </article>
      <article className="summaryMetric">
        <Crown size={20} />
        <span>Bride side</span>
        <strong>{summary.brideGuests}</strong>
      </article>
      <article className="summaryMetric">
        <HeartHandshake size={20} />
        <span>Groom side</span>
        <strong>{summary.groomGuests}</strong>
      </article>
      <article className="summaryMetric">
        <Sparkles size={20} />
        <span>Shared</span>
        <strong>{summary.sharedGuests}</strong>
      </article>
    </section>
  );
}
