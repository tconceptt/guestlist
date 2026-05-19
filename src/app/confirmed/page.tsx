"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2, PartyPopper } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { InviteTable } from "@/components/invite-table";
import { SummaryBar } from "@/components/summary-bar";
import type { InviteFormValues } from "@/components/candidate-form";

export default function ConfirmedPage() {
  const invites = useQuery(api.invites.listInvites);
  const updateInvite = useMutation(api.invites.updateInvite);
  const setInviteStatus = useMutation(api.invites.setInviteStatus);
  const deleteInvite = useMutation(api.invites.deleteInvite);
  const confirmedInvites = (invites ?? []).filter((invite) => invite.status === "confirmed");
  const candidateCount = (invites ?? []).filter((invite) => invite.status === "candidate").length;

  async function handleUpdate(id: Id<"invites">, patch: Partial<InviteFormValues>) {
    await updateInvite({ id, patch });
  }

  return (
    <main className="appShell">
      <header className="topBar confirmedHero">
        <div>
          <Link className="backLink" href="/">
            <ArrowLeft size={16} />
            Back to candidates
          </Link>
          <span className="eyebrow">Final list</span>
          <h1>Confirmed invites</h1>
          <p>
            Review the people who have made the list, with totals split across Bride,
            Groom, and shared sides.
          </p>
        </div>
        <nav className="navTabs" aria-label="Invite pages">
          <Link href="/">Candidates ({candidateCount})</Link>
          <Link className="active" href="/confirmed">
            Confirmed
          </Link>
        </nav>
      </header>

      {invites === undefined ? (
        <section className="loadingState">
          <Loader2 className="spin" size={22} />
          Loading confirmed list
        </section>
      ) : (
        <>
          <SummaryBar invites={invites} mode="confirmed" />
          <section className="mainPanel fullWidth">
            <div className="panelTitleRow">
              <div>
                <span className="eyebrow">Guest count</span>
                <h2>{confirmedInvites.length} confirmed records</h2>
              </div>
              <div className="capacityPill">
                <PartyPopper size={16} />
                Confirmed guests:{" "}
                {confirmedInvites.reduce((total, invite) => total + invite.partySize, 0)}
              </div>
            </div>
            <InviteTable
              invites={confirmedInvites}
              mode="confirmed"
              onUpdate={handleUpdate}
              onStatusChange={async (id, status) => {
                await setInviteStatus({ id, status });
              }}
              onDelete={async (id) => {
                await deleteInvite({ id });
              }}
            />
          </section>
        </>
      )}
    </main>
  );
}
