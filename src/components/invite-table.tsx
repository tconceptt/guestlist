"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { SIDES, scoreBands, type InviteSide, type ScoreBandKey } from "@/lib/labels";
import { clampScale, getInviteScore, getScoreBand } from "@/lib/scoring";
import { CandidateForm, type InviteFormValues } from "./candidate-form";
import { ScoreBadge } from "./score-badge";

type InviteTableProps = {
  invites: Doc<"invites">[];
  mode: "candidate" | "confirmed";
  onUpdate: (id: Id<"invites">, patch: Partial<InviteFormValues>) => Promise<void>;
  onStatusChange: (id: Id<"invites">, status: "candidate" | "confirmed") => Promise<void>;
  onDelete: (id: Id<"invites">) => Promise<void>;
};

type SortKey = "score" | "name" | "side" | "partySize";

export function InviteTable({
  invites,
  mode,
  onUpdate,
  onStatusChange,
  onDelete,
}: InviteTableProps) {
  const [search, setSearch] = useState("");
  const [side, setSide] = useState<InviteSide | "All">("All");
  const [band, setBand] = useState<ScoreBandKey | "All">("All");
  const [relationship, setRelationship] = useState("All");
  const [sort, setSort] = useState<SortKey>("score");
  const [editingId, setEditingId] = useState<Id<"invites"> | null>(null);

  const relationships = useMemo(() => {
    const values = new Set(invites.map((invite) => invite.relationship).filter(Boolean));
    return ["All", ...Array.from(values).sort()];
  }, [invites]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return invites
      .filter((invite) => {
        const scoreBand = getScoreBand(getInviteScore(invite)).key;
        const matchesSearch =
          !needle ||
          invite.name.toLowerCase().includes(needle) ||
          invite.relationship.toLowerCase().includes(needle) ||
          invite.notes.toLowerCase().includes(needle);

        return (
          matchesSearch &&
          (side === "All" || invite.side === side) &&
          (band === "All" || scoreBand === band) &&
          (relationship === "All" || invite.relationship === relationship)
        );
      })
      .sort((a, b) => {
        if (sort === "score") {
          return getInviteScore(b) - getInviteScore(a);
        }
        if (sort === "partySize") {
          return b.partySize - a.partySize;
        }
        return String(a[sort]).localeCompare(String(b[sort]));
      });
  }, [band, invites, relationship, search, side, sort]);

  return (
    <section className="tableSection">
      <div className="filterBar">
        <label className="searchField">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search names, groups, notes"
          />
        </label>
        <select value={side} onChange={(event) => setSide(event.target.value as InviteSide | "All")}>
          <option value="All">All sides</option>
          {SIDES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={relationship}
          onChange={(event) => setRelationship(event.target.value)}
        >
          {relationships.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All groups" : option}
            </option>
          ))}
        </select>
        <select value={band} onChange={(event) => setBand(event.target.value as ScoreBandKey | "All")}>
          <option value="All">All scores</option>
          {Object.values(scoreBands).map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          <option value="score">Sort by score</option>
          <option value="name">Sort by name</option>
          <option value="side">Sort by side</option>
          <option value="partySize">Sort by party size</option>
        </select>
      </div>

      <div className="inviteList">
        {filtered.map((invite) => {
          const isEditing = editingId === invite._id;

          return (
            <article className="inviteRow" key={invite._id}>
              {isEditing ? (
                <CandidateForm
                  compact
                  submitLabel="Save changes"
                  initialValues={{
                    name: invite.name,
                    side: invite.side,
                    partySize: invite.partySize,
                    relationship: invite.relationship,
                    importance: clampScale(invite.importance),
                    likelihood: clampScale(invite.likelihood),
                    notes: invite.notes,
                    status: invite.status,
                  }}
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (values) => {
                    await onUpdate(invite._id, values);
                    setEditingId(null);
                  }}
                />
              ) : (
                <>
                  <div className="inviteMain">
                    <ScoreBadge importance={invite.importance} likelihood={invite.likelihood} />
                    <div>
                      <h3>{invite.name}</h3>
                      <p>
                        {invite.side} side · {invite.partySize} guest
                        {invite.partySize === 1 ? "" : "s"}
                        {invite.relationship ? ` · ${invite.relationship}` : ""}
                      </p>
                      {invite.notes ? <span>{invite.notes}</span> : null}
                    </div>
                  </div>
                  <div className="inviteScales">
                    <span>Importance {invite.importance}/5</span>
                    <span>Chance {invite.likelihood}/5</span>
                  </div>
                  <div className="rowActions">
                    <button
                      className="iconButton"
                      type="button"
                      title="Edit"
                      onClick={() => setEditingId(invite._id)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="iconButton"
                      type="button"
                      title={mode === "candidate" ? "Promote to confirmed" : "Move back to candidates"}
                      onClick={() =>
                        onStatusChange(
                          invite._id,
                          mode === "candidate" ? "confirmed" : "candidate",
                        )
                      }
                    >
                      {mode === "candidate" ? <Check size={16} /> : <RotateCcw size={16} />}
                    </button>
                    <button
                      className="iconButton danger"
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(invite._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="emptyState">
          <h2>No invites match this view</h2>
          <p>Adjust the filters or add someone new to bring the list back to life.</p>
        </div>
      ) : null}
    </section>
  );
}
