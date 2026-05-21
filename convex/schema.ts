import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  invites: defineTable({
    name: v.string(),
    side: v.union(v.literal("Bride"), v.literal("Groom"), v.literal("Both")),
    partySize: v.number(),
    relationship: v.string(),
    importance: v.number(),
    likelihood: v.number(),
    notes: v.string(),
    status: v.union(v.literal("candidate"), v.literal("confirmed")),
    invitationDelivered: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_side", ["side"]),
});
