import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type Member, type Bill, type SwingStatus } from "@shared/schema";

// ProPublica API Configuration
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY;
const API_BASE = "https://api.propublica.org/congress/v1";

async function fetchFromProPublica(endpoint: string) {
  if (!PROPUBLICA_API_KEY) {
    console.warn("Missing PROPUBLICA_API_KEY, using mock data mode.");
    return null;
  }
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "X-API-Key": PROPUBLICA_API_KEY }
    });
    
    if (!res.ok) {
      throw new Error(`ProPublica API Error: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch from ProPublica:", error);
    return null;
  }
}

async function syncData() {
  console.log("Syncing data from ProPublica...");
  
  // 1. Fetch Senate Members
  const membersData = await fetchFromProPublica("/118/senate/members.json");
  if (membersData) {
    const members = membersData.results[0].members;
    for (const m of members) {
      await storage.createMember({
        id: m.id,
        firstName: m.first_name,
        lastName: m.last_name,
        party: m.party,
        state: m.state,
        votesWithPartyPct: m.votes_with_party_pct || 0,
      });
    }
  } else {
    // Mock Members if API fails/missing
    await storage.createMember({
      id: "M001183", firstName: "Joe", lastName: "Manchin", party: "D", state: "WV", votesWithPartyPct: 88.5
    });
    await storage.createMember({
      id: "S001191", firstName: "Kyrsten", lastName: "Sinema", party: "I", state: "AZ", votesWithPartyPct: 92.1
    });
    await storage.createMember({
        id: "L001234", firstName: "Loyal", lastName: "Republican", party: "R", state: "TX", votesWithPartyPct: 99.0
    });
    await storage.createMember({
        id: "L001235", firstName: "Loyal", lastName: "Democrat", party: "D", state: "CA", votesWithPartyPct: 98.0
    });
     await storage.createMember({
        id: "S001236", firstName: "Susan", lastName: "Collins", party: "R", state: "ME", votesWithPartyPct: 75.0
    });
  }

  // 2. Fetch Recent Bills
  const billsData = await fetchFromProPublica("/118/both/bills/introduced.json");
  if (billsData) {
    const bills = billsData.results[0].bills;
    for (const b of bills) {
      await storage.createBill({
        id: b.bill_id,
        billSlug: b.bill_slug,
        title: b.title,
        shortTitle: b.short_title || b.title,
        summary: b.summary || b.title,
        latestAction: b.latest_major_action,
        volatilityScore: 0 // Will calculate later
      });
    }
  } else {
    // Mock Bills
    await storage.createBill({
      id: "hr1", billSlug: "hr1", title: "For the People Act", shortTitle: "For the People Act", 
      summary: "To expand Americans' access to the ballot box, reduce the influence of big money in politics, strengthen ethics rules for public servants, and implement other anti-corruption measures for the purpose of fortifying our democracy, and for other purposes.",
      latestAction: "Introduced in House", volatilityScore: 0
    });
    await storage.createBill({
        id: "s1", billSlug: "s1", title: "Wait for it Act", shortTitle: "Wait for it Act",
        summary: "A bill to wait for things to happen.",
        latestAction: "Introduced in Senate", volatilityScore: 0
    });
  }
}

// Logic: Swing Detection & Strategy Generation
function analyzeSenator(member: Member): { status: SwingStatus, strategy: string } {
    let status: SwingStatus = "Loyalist";
    
    // Algorithm:
    // > 95%: Loyalist
    // 80-95%: Leaning
    // < 80%: TRUE SWING
    
    if (member.votesWithPartyPct > 95) {
        status = "Loyalist";
    } else if (member.votesWithPartyPct >= 80) {
        status = "Leaning";
    } else {
        status = "Swing";
    }

    let strategy = "Maintain standard outreach.";
    
    // Strategy Generator
    if (status === "Swing" || status === "Leaning") {
        if (member.state === "WV" || member.state === "AZ") {
            strategy = "HIGH VALUE. Requires direct donor outreach.";
        } else if (member.party === "R") {
            strategy = "Angle: Economic Liberty & District Jobs. Contact via Chamber of Commerce.";
        } else if (member.party === "D") {
            strategy = "Angle: Social Protection & Union Support. Contact via Local Labor Leaders.";
        } else if (member.party === "I") {
            strategy = "Angle: Independence & Bipartisanship. Focus on specific bill merits.";
        }
    } else {
        strategy = "Loyalist. Focus resources elsewhere unless key committee member.";
    }

    return { status, strategy };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed / Sync on startup
  syncData().catch(console.error);

  app.get(api.bills.list.path, async (req, res) => {
    const bills = await storage.getBills();
    res.json(bills);
  });

  app.get(api.bills.get.path, async (req, res) => {
    const bill = await storage.getBill(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  });

  app.get(api.bills.analyze.path, async (req, res) => {
    const bill = await storage.getBill(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const allMembers = await storage.getMembers();
    
    const senatorsAnalysis = allMembers.map(member => {
        const { status, strategy } = analyzeSenator(member);
        return {
            member,
            status,
            strategy
        };
    });

    // Mock Whip Count based on party + swing
    // In reality this needs bill-specific vote data, but per spec "mock a 'predicted vote' scenario"
    // We'll assume Loyalists vote with party. Swings are unknown.
    // Simplifying assumption: Bill is supported by Democrats (if HR1) or purely split by party line for demo.
    // Let's just count Status types for the "Volatility"
    
    let yes = 0;
    let no = 0;
    let swing = 0;

    senatorsAnalysis.forEach(s => {
        if (s.status === "Swing") {
            swing++;
        } else if (s.member.party === "D") {
            yes++; // Assume Dem bill for demo
        } else {
            no++;
        }
    });

    res.json({
        bill,
        whipCount: { yes, no, swing },
        senators: senatorsAnalysis
    });
  });

  app.post(api.bills.sync.path, async (req, res) => {
      await syncData();
      res.json({ message: "Sync complete" });
  });

  return httpServer;
}
