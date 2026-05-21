import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

const sideValidator = v.union(v.literal("Bride"), v.literal("Groom"), v.literal("Both"));
const statusValidator = v.union(v.literal("candidate"), v.literal("confirmed"));

const inviteFields = {
  name: v.string(),
  side: sideValidator,
  partySize: v.number(),
  relationship: v.optional(v.string()),
  importance: v.number(),
  likelihood: v.number(),
  notes: v.optional(v.string()),
  status: v.optional(statusValidator),
};

type InviteInput = {
  name: string;
  side: Doc<"invites">["side"];
  partySize: number;
  relationship?: string;
  importance: number;
  likelihood: number;
  notes?: string;
  status?: Doc<"invites">["status"];
  invitationDelivered?: boolean;
};

function clampScale(value: number) {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(value)));
}

function clampPartySize(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(20, Math.max(1, Math.round(value)));
}

function cleanText(value: string | undefined) {
  return (value ?? "").trim();
}

function cleanInvite(input: InviteInput) {
  const name = cleanText(input.name);

  if (!name) {
    throw new Error("Invite name is required");
  }

  return {
    name,
    side: input.side,
    partySize: clampPartySize(input.partySize),
    relationship: cleanText(input.relationship),
    importance: clampScale(input.importance),
    likelihood: clampScale(input.likelihood),
    notes: cleanText(input.notes),
    status: input.status ?? "candidate",
    invitationDelivered: input.invitationDelivered ?? false,
  };
}

const patchValidator = {
  name: v.optional(v.string()),
  side: v.optional(sideValidator),
  partySize: v.optional(v.number()),
  relationship: v.optional(v.string()),
  importance: v.optional(v.number()),
  likelihood: v.optional(v.number()),
  notes: v.optional(v.string()),
  status: v.optional(statusValidator),
  invitationDelivered: v.optional(v.boolean()),
};

export const listInvites = query({
  args: {},
  handler: async (ctx) => {
    const invites = await ctx.db.query("invites").collect();
    return invites.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const createInvite = mutation({
  args: inviteFields,
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("invites", {
      ...cleanInvite(args),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createManyInvites = mutation({
  args: {
    invites: v.array(v.object(inviteFields)),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const inserted: Id<"invites">[] = [];

    for (const invite of args.invites) {
      inserted.push(
        await ctx.db.insert("invites", {
          ...cleanInvite(invite),
          createdAt: now,
          updatedAt: now,
        }),
      );
    }

    return inserted;
  },
});

export const updateInvite = mutation({
  args: {
    id: v.id("invites"),
    patch: v.object(patchValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Invite not found");
    }

    const next = cleanInvite({
      name: args.patch.name ?? existing.name,
      side: args.patch.side ?? existing.side,
      partySize: args.patch.partySize ?? existing.partySize,
      relationship: args.patch.relationship ?? existing.relationship,
      importance: args.patch.importance ?? existing.importance,
      likelihood: args.patch.likelihood ?? existing.likelihood,
      notes: args.patch.notes ?? existing.notes,
      status: args.patch.status ?? existing.status,
      invitationDelivered: args.patch.invitationDelivered ?? existing.invitationDelivered,
    });

    await ctx.db.patch(args.id, {
      ...next,
      updatedAt: Date.now(),
    });
  },
});

export const setInviteStatus = mutation({
  args: {
    id: v.id("invites"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const deleteInvite = mutation({
  args: {
    id: v.id("invites"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
