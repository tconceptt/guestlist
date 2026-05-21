import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Doc } from "../../convex/_generated/dataModel";
import { InviteTable } from "./invite-table";

function invite(overrides: Partial<Doc<"invites">>): Doc<"invites"> {
  return {
    _id: `invite-${overrides.name ?? "guest"}`,
    _creationTime: overrides.createdAt ?? 0,
    name: "Guest",
    side: "Both",
    partySize: 1,
    relationship: "",
    importance: 3,
    likelihood: 3,
    notes: "",
    status: "candidate",
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  } as Doc<"invites">;
}

describe("InviteTable", () => {
  it("sorts invites by latest added first", () => {
    render(
      <InviteTable
        invites={[
          invite({ name: "Older guest", createdAt: 1000, updatedAt: 3000 }),
          invite({ name: "Newest guest", createdAt: 5000, updatedAt: 1000 }),
          invite({ name: "Middle guest", createdAt: 3000, updatedAt: 2000 }),
        ]}
        mode="candidate"
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Sort by score"), {
      target: { value: "createdAt" },
    });

    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Newest guest",
      "Middle guest",
      "Older guest",
    ]);
  });

  it("lets confirmed invites be marked as delivered", () => {
    const onDeliveryChange = vi.fn();

    render(
      <InviteTable
        invites={[
          invite({
            name: "Delivered guest",
            status: "confirmed",
            invitationDelivered: true,
          }),
          invite({
            name: "Pending guest",
            status: "confirmed",
            invitationDelivered: false,
          }),
        ]}
        mode="confirmed"
        onDelete={vi.fn()}
        onDeliveryChange={onDeliveryChange}
        onStatusChange={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Invitation delivered for Delivered guest")).toBeChecked();
    expect(screen.getByLabelText("Invitation delivered for Pending guest")).not.toBeChecked();

    fireEvent.click(screen.getByLabelText("Invitation delivered for Pending guest"));

    expect(onDeliveryChange).toHaveBeenCalledWith("invite-Pending guest", true);
  });
});
