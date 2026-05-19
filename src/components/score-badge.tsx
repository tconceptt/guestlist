import { getInviteScore, getScoreBand } from "@/lib/scoring";

type ScoreBadgeProps = {
  importance: number;
  likelihood: number;
};

export function ScoreBadge({ importance, likelihood }: ScoreBadgeProps) {
  const score = getInviteScore({ importance, likelihood });
  const band = getScoreBand(score);

  return (
    <div className={`scoreBadge ${band.className}`}>
      <strong>{score.toFixed(1)}</strong>
      <span>{band.label}</span>
    </div>
  );
}
