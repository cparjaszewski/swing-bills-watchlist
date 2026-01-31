import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type Member, type Bill, type SwingStatus } from "@shared/schema";
import OpenAI from "openai";

const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY;
const API_BASE = "https://api.propublica.org/congress/v1";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

async function seedTopics() {
  const defaultTopics = [
    { name: "Healthcare", description: "Medical care, insurance, and public health policies", icon: "heart", category: "Social" },
    { name: "Education", description: "Schools, universities, and student policies", icon: "graduation-cap", category: "Social" },
    { name: "Environment", description: "Climate change, conservation, and green energy", icon: "leaf", category: "Environment" },
    { name: "Economy", description: "Jobs, taxes, trade, and financial regulations", icon: "trending-up", category: "Economic" },
    { name: "Immigration", description: "Border policy, visas, and citizenship", icon: "globe", category: "Social" },
    { name: "Defense", description: "Military, veterans, and national security", icon: "shield", category: "Security" },
    { name: "Civil Rights", description: "Equality, voting rights, and discrimination", icon: "scale", category: "Social" },
    { name: "Infrastructure", description: "Roads, bridges, broadband, and public works", icon: "building", category: "Economic" },
    { name: "Technology", description: "Privacy, AI regulation, and digital policy", icon: "cpu", category: "Technology" },
    { name: "Criminal Justice", description: "Policing, courts, and prison reform", icon: "gavel", category: "Social" },
    { name: "Gun Policy", description: "Second Amendment and firearm regulations", icon: "target", category: "Security" },
    { name: "Agriculture", description: "Farming, food security, and rural development", icon: "wheat", category: "Economic" },
  ];

  for (const topic of defaultTopics) {
    await storage.createTopic(topic);
  }
}

async function syncData() {
  console.log("Syncing data from ProPublica...");
  
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
        volatilityScore: 0,
        topics: []
      });
    }
  } else {
    await storage.createBill({
      id: "hr1", billSlug: "hr1", title: "For the People Act", shortTitle: "For the People Act", 
      summary: "To expand Americans' access to the ballot box, reduce the influence of big money in politics, strengthen ethics rules for public servants, and implement other anti-corruption measures for the purpose of fortifying our democracy, and for other purposes.",
      latestAction: "Introduced in House", volatilityScore: 0.65,
      topics: ["Civil Rights", "Democracy"]
    });
    await storage.createBill({
        id: "s1", billSlug: "s1", title: "Climate Action Now Act", shortTitle: "Climate Action Now Act",
        summary: "A bill to address climate change through renewable energy investments and emissions reduction targets.",
        latestAction: "Introduced in Senate", volatilityScore: 0.72,
        topics: ["Environment", "Economy"]
    });
    await storage.createBill({
        id: "hr2", billSlug: "hr2", title: "Healthcare Expansion Act", shortTitle: "Healthcare Expansion Act",
        summary: "To expand Medicare eligibility and reduce prescription drug costs for all Americans.",
        latestAction: "Committee Review", volatilityScore: 0.45,
        topics: ["Healthcare"]
    });
  }
}

function analyzeSenator(member: Member): { status: SwingStatus, strategy: string } {
    let status: SwingStatus = "Loyalist";
    
    if (member.votesWithPartyPct > 95) {
        status = "Loyalist";
    } else if (member.votesWithPartyPct >= 80) {
        status = "Leaning";
    } else {
        status = "Swing";
    }

    let strategy = "Maintain standard outreach.";
    
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

const hasOpenAICredentials = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL);

async function generateEmailDraft(
  senator: Member, 
  bill: Bill, 
  voteIntention: "YES" | "NO",
  customInterests?: string | null
): Promise<{ subject: string; body: string }> {
  const partyName = senator.party === "D" ? "Democrat" : senator.party === "R" ? "Republican" : "Independent";
  const loyaltyDescription = senator.votesWithPartyPct > 95 
    ? "highly partisan" 
    : senator.votesWithPartyPct >= 80 
      ? "moderately independent" 
      : "notably independent and persuadable";

  if (!hasOpenAICredentials) {
    return {
      subject: `Urging Your ${voteIntention} Vote on ${bill.shortTitle || bill.title}`,
      body: `Dear Senator ${senator.lastName},

I am writing to respectfully urge you to vote ${voteIntention} on ${bill.title}.

As a constituent from ${senator.state}, this bill is of great importance to our community. ${voteIntention === "YES" 
  ? "This legislation would bring meaningful benefits to our state and address critical needs." 
  : "I have serious concerns about the potential negative impacts of this legislation on our state."}

Your vote on this matter is crucial, and I trust you will carefully consider the perspectives of your constituents.

Thank you for your service and your time.

Respectfully,
A Concerned Constituent`
    };
  }

  const prompt = `You are a political strategist drafting a persuasive email to a US Senator.

SENATOR PROFILE:
- Name: Senator ${senator.firstName} ${senator.lastName}
- Party: ${partyName}
- State: ${senator.state}
- Voting Pattern: ${loyaltyDescription} (votes with party ${senator.votesWithPartyPct}% of the time)

BILL INFORMATION:
- Title: ${bill.title}
- Summary: ${bill.summary || "No summary available"}

YOUR GOAL: Convince the Senator to vote ${voteIntention} on this bill.
${customInterests ? `
ADDITIONAL CONTEXT FROM SENDER:
The sender has expressed these personal interests and concerns: "${customInterests}"
Incorporate these interests into your persuasive argument where relevant.
` : ''}
Write a professional, persuasive email that:
1. Opens with a respectful greeting appropriate for a Senator
2. Acknowledges their known positions or concerns based on their party and state
3. Makes a compelling case for voting ${voteIntention} using arguments that would resonate with their constituency
4. Includes specific talking points relevant to their state (${senator.state})
5. Closes with a clear call to action
6. Is concise but thorough (about 200-300 words)

Format your response as:
SUBJECT: [subject line]

[email body]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content || "";
    
    const subjectMatch = content.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Regarding ${bill.shortTitle || bill.title}`;
    const body = content.replace(/SUBJECT:\s*.+?\n/i, "").trim();

    return { subject, body };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      subject: `Urging Your ${voteIntention} Vote on ${bill.shortTitle || bill.title}`,
      body: `Dear Senator ${senator.lastName},

I am writing to respectfully urge you to vote ${voteIntention} on ${bill.title}.

As a constituent from ${senator.state}, this bill is of great importance to our community. ${voteIntention === "YES" 
  ? "This legislation would bring meaningful benefits to our state and address critical needs." 
  : "I have serious concerns about the potential negative impacts of this legislation on our state."}

Your vote on this matter is crucial, and I trust you will carefully consider the perspectives of your constituents.

Thank you for your service and your time.

Respectfully,
A Concerned Constituent`
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  await seedTopics();
  syncData().catch(console.error);

  app.get(api.bills.list.path, async (req, res) => {
    const bills = await storage.getBills();
    res.json(bills);
  });

  app.get(api.bills.get.path, async (req, res) => {
    const id = req.params.id as string;
    const bill = await storage.getBill(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  });

  app.get(api.bills.analyze.path, async (req, res) => {
    const id = req.params.id as string;
    const bill = await storage.getBill(id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    const allMembers = await storage.getMembers();
    
    const senatorsAnalysis = allMembers.map(member => {
        const { status, strategy } = analyzeSenator(member);
        return { member, status, strategy };
    });

    let yes = 0;
    let no = 0;
    let swing = 0;

    senatorsAnalysis.forEach(s => {
        if (s.status === "Swing") {
            swing++;
        } else if (s.member.party === "D") {
            yes++;
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

  app.get(api.topics.list.path, async (req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.get(api.preferences.get.path, async (req, res) => {
    const sessionId = req.headers['x-session-id'] as string || 'default';
    const prefs = await storage.getPreferences(sessionId);
    res.json(prefs || null);
  });

  app.post(api.preferences.save.path, async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string || 'default';
      const input = api.preferences.save.input.parse(req.body);
      const prefs = await storage.savePreferences({
        sessionId,
        selectedTopics: input.selectedTopics,
        customInterests: input.customInterests,
        votePreference: input.votePreference,
        onboardingComplete: input.onboardingComplete,
      });
      res.json(prefs);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.email.draft.path, async (req, res) => {
    try {
      const input = api.email.draft.input.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string || 'default';
      
      const senator = await storage.getMember(input.senatorId);
      if (!senator) {
        return res.status(404).json({ message: "Senator not found" });
      }

      const bill = await storage.getBill(input.billId);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      const prefs = await storage.getPreferences(sessionId);
      const { subject, body } = await generateEmailDraft(senator, bill, input.voteIntention, prefs?.customInterests);

      res.json({
        subject,
        body,
        senatorName: `${senator.firstName} ${senator.lastName}`,
        billTitle: bill.shortTitle || bill.title,
      });
    } catch (err) {
      console.error("Email draft error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to generate email draft" });
    }
  });

  return httpServer;
}
