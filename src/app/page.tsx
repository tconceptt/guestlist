"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { CalendarHeart, Gem, Loader2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { CandidateForm, type InviteFormValues } from "@/components/candidate-form";
import { CsvImporter } from "@/components/csv-importer";
import { InviteTable } from "@/components/invite-table";
import { SummaryBar } from "@/components/summary-bar";
import type { ParsedInvite } from "@/lib/csv";

export default function CandidatesPage() {
  const invites = useQuery(api.invites.listInvites);
  const createInvite = useMutation(api.invites.createInvite);
  const createManyInvites = useMutation(api.invites.createManyInvites);
  const updateInvite = useMutation(api.invites.updateInvite);
  const setInviteStatus = useMutation(api.invites.setInviteStatus);
  const deleteInvite = useMutation(api.invites.deleteInvite);

  const candidateInvites = (invites ?? []).filter((invite) => invite.status === "candidate");
  const confirmedInvites = (invites ?? []).filter((invite) => invite.status === "confirmed");

  async function handleCreate(values: InviteFormValues) {
    await createInvite(values);
  }

  async function handleImport(values: ParsedInvite[]) {
    await createManyInvites({ invites: values });
  }

  async function handleUpdate(id: Id<"invites">, patch: Partial<InviteFormValues>) {
    await updateInvite({ id, patch });
  }

  return (
    <main className="appShell">
      <header className="topBar">
        <div>
          <span className="eyebrow">1000 person wedding</span>
          <h1>Invite candidate studio</h1>
          <p>
            Score the people you are considering, balance Bride and Groom sides, and
            promote the right names into the final list.
          </p>
        </div>
        <nav className="navTabs" aria-label="Invite pages">
          <Link className="active" href="/">
            Candidates
          </Link>
          <Link href="/confirmed">Confirmed ({confirmedInvites.length})</Link>
        </nav>
      </header>

      {invites === undefined ? (
        <section className="loadingState">
          <Loader2 className="spin" size={22} />
          Loading invite list
        </section>
      ) : (
        <>
          <SummaryBar invites={invites} />

          <section className="workspaceGrid">
            <aside className="sidePanel">
              <div className="panelHeader">
                <CalendarHeart size={20} />
                <h2>Add candidate</h2>
              </div>
              <CandidateForm onSubmit={handleCreate} />
              <div className="panelDivider" />
              <CsvImporter onImport={handleImport} />
            </aside>

            <section className="mainPanel">
              <div className="panelTitleRow">
                <div>
                  <span className="eyebrow">Decision list</span>
                  <h2>{candidateInvites.length} candidates</h2>
                </div>
                <div className="capacityPill">
                  <Gem size={16} />
                  Confirmed guests:{" "}
                  {confirmedInvites.reduce((total, invite) => total + invite.partySize, 0)}
                </div>
              </div>
              <InviteTable
                invites={candidateInvites}
                mode="candidate"
                onUpdate={handleUpdate}
                onStatusChange={async (id, status) => {
                  await setInviteStatus({ id, status });
                }}
                onDelete={async (id) => {
                  await deleteInvite({ id });
                }}
              />
            </section>
          </section>
        </>
      )}
    </main>
  );
}
