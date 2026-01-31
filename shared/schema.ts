import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  party: text("party").notNull(),
  state: text("state").notNull(),
  votesWithPartyPct: real("votes_with_party_pct").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const bills = pgTable("bills", {
  id: text("id").primaryKey(),
  billSlug: text("bill_slug").notNull(),
  title: text("title").notNull(),
  shortTitle: text("short_title"),
  summary: text("summary"),
  latestAction: text("latest_action"),
  volatilityScore: real("volatility_score"),
  topics: text("topics").array(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  selectedTopics: text("selected_topics").array(),
  votePreference: text("vote_preference"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members);
export const insertBillSchema = createInsertSchema(bills);
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

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

export interface DraftEmailRequest {
  senatorId: string;
  billId: string;
  voteIntention: "YES" | "NO";
}

export interface DraftEmailResponse {
  subject: string;
  body: string;
  senatorName: string;
  billTitle: string;
}
