import { db } from "./db";
import { members, bills, type Member, type InsertMember, type Bill, type InsertBill } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member>;
  
  getBills(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: string, bill: Partial<InsertBill>): Promise<Bill>;
}

export class DatabaseStorage implements IStorage {
  async getMembers(): Promise<Member[]> {
    return await db.select().from(members);
  }

  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const [member] = await db.insert(members).values(insertMember).onConflictDoUpdate({
        target: members.id,
        set: insertMember
    }).returning();
    return member;
  }

  async updateMember(id: string, updates: Partial<InsertMember>): Promise<Member> {
    const [updated] = await db.update(members)
      .set(updates)
      .where(eq(members.id, id))
      .returning();
    return updated;
  }

  async getBills(): Promise<Bill[]> {
    return await db.select().from(bills);
  }

  async getBill(id: string): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const [bill] = await db.insert(bills).values(insertBill).onConflictDoUpdate({
        target: bills.id,
        set: insertBill
    }).returning();
    return bill;
  }

  async updateBill(id: string, updates: Partial<InsertBill>): Promise<Bill> {
    const [updated] = await db.update(bills)
      .set(updates)
      .where(eq(bills.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
