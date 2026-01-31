import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: text("id").primaryKey(), // ProPublica ID
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  party: text("party").notNull(),
  state: text("state").notNull(),
  votesWithPartyPct: real("votes_with_party_pct").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const bills = pgTable("bills", {
  id: text("id").primaryKey(), // ProPublica Bill ID e.g. "hr123"
  billSlug: text("bill_slug").notNull(),
  title: text("title").notNull(),
  shortTitle: text("short_title"),
  summary: text("summary"),
  latestAction: text("latest_action"),
  volatilityScore: real("volatility_score"), // Calculated
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members);
export const insertBillSchema = createInsertSchema(bills);

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

// Types for the strategy/analysis
export type SwingStatus = "Loyalist" | "Leaning" | "Swing";

export interface SenatorAnalysis {
  member: Member;
  status: SwingStatus;
  strategy: string;
}

export interface BillAnalysis {
  bill: Bill;
  whipCount: {
    yes: number;
    no: number;
    swing: number;
  };
  senators: SenatorAnalysis[];
}
