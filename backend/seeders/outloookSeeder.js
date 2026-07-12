import User from "../module/user/user.model.js";
import Lead from "../module/lead/lead.model.js";
import OutreachLog from "../module/outlook/outlook.model.js";

const outreachLogs = [
  {
    userEmail: "demo@kimmy.ai",
    leadEmail: "daniel.brooks@northpeak.com",
    type: "initial_pitch",
    subject: "Quick idea for Northpeak's outbound workflow",
    body: "Hi Daniel,\n\nI noticed Northpeak helps professional services firms modernize their sales operations. Teams like yours often spend hours researching prospects before every outreach.\n\nKimmy AI automates lead research and drafts personalized pitches so your team can focus on conversations that close.\n\nWould you be open to a 15-minute call next week?\n\nBest,\nDemo User",
    aiMetadata: {
      promptTokens: 412,
      completionTokens: 186,
      modelUsed: "gpt-4o",
    },
  },
  {
    userEmail: "demo@kimmy.ai",
    leadEmail: "daniel.brooks@northpeak.com",
    type: "follow_up",
    subject: "Re: Quick idea for Northpeak's outbound workflow",
    body: "Hi Daniel,\n\nJust bumping this in case it got buried. Happy to share how similar consulting firms cut prospecting time by 40%.\n\nLet me know if Tuesday or Thursday works for a quick chat.\n\nBest,\nDemo User",
    aiMetadata: {
      promptTokens: 298,
      completionTokens: 94,
      modelUsed: "gpt-4o",
    },
  },
  {
    userEmail: "demo@kimmy.ai",
    leadEmail: "rachel.kim@blueharbor.co",
    type: "initial_pitch",
    subject: "Partnership outreach at scale",
    body: "Hi Rachel,\n\nSaw your work building fintech partnerships at Blue Harbor Finance. Kimmy AI helps BD teams research targets and draft tailored outreach in minutes.\n\nIf you're evaluating tools to speed up partner prospecting, I'd love to show you a quick demo.\n\nBest,\nDemo User",
    aiMetadata: {
      promptTokens: 385,
      completionTokens: 172,
      modelUsed: "gpt-4o",
    },
  },
  {
    userEmail: "demo@kimmy.ai",
    leadEmail: "rachel.kim@blueharbor.co",
    type: "inbound_reply",
    subject: "Re: Partnership outreach at scale",
    body: "Hi Demo,\n\nThanks for reaching out. This sounds interesting — we're reviewing a few sales tools this quarter. Can you send over pricing and a short case study?\n\nRachel",
    aiMetadata: {
      promptTokens: 256,
      completionTokens: 88,
      modelUsed: "gpt-4o",
      sentimentAnalysis: {
        sentiment: "positive",
        urgency: "medium",
        summary: "Lead is interested and requested pricing plus a case study.",
      },
    },
  },
  {
    userEmail: "demo@kimmy.ai",
    leadEmail: "marcus.webb@ironcladops.com",
    type: "initial_pitch",
    subject: "Helping Ironclad Ops shorten the sales cycle",
    body: "Hi Marcus,\n\nAs COO overseeing revenue at Ironclad Ops, you likely see bottlenecks when reps prep for outreach. Kimmy AI researches leads and drafts first-touch emails based on your value prop.\n\nWorth a quick look?\n\nBest,\nDemo User",
    aiMetadata: {
      promptTokens: 368,
      completionTokens: 165,
      modelUsed: "gpt-4o",
    },
  },
  {
    userEmail: "admin@kimmy.ai",
    leadEmail: "laura.henderson@cloudspire.com",
    type: "initial_pitch",
    subject: "Scaling Cloudspire's enterprise motion with AI",
    body: "Hi Laura,\n\nCongrats on the Series C. As you scale enterprise sales, Kimmy AI can help reps research accounts faster and personalize outreach at volume.\n\nI'd welcome 20 minutes to walk through how teams post-fundraise are using it.\n\nBest,\nKimmy Admin",
    aiMetadata: {
      promptTokens: 441,
      completionTokens: 198,
      modelUsed: "gpt-4o",
    },
  },
  {
    userEmail: "sarah.mitchell@northline.io",
    leadEmail: "nina.patel@retailpulse.com",
    type: "initial_pitch",
    subject: "Faster prospect research for RetailPulse",
    body: "Hi Nina,\n\nYour analytics work at RetailPulse is impressive. Kimmy AI helps sales teams turn public signals into personalized outreach — useful when targeting retail and e-commerce brands.\n\nOpen to a brief intro call?\n\nBest,\nSarah Mitchell",
    aiMetadata: {
      promptTokens: 392,
      completionTokens: 181,
      modelUsed: "gpt-4o",
    },
  },
];

export async function seedOutlook() {
  console.log("Seeding outreach logs...");

  let seededCount = 0;

  for (const log of outreachLogs) {
    const user = await User.findOne({ email: log.userEmail });
    if (!user) {
      console.warn(`  ⚠ Skipping outreach — user not found: ${log.userEmail}`);
      continue;
    }

    const lead = await Lead.findOne({ userId: user._id, email: log.leadEmail });
    if (!lead) {
      console.warn(`  ⚠ Skipping outreach — lead not found: ${log.leadEmail}`);
      continue;
    }

    const result = await OutreachLog.findOneAndUpdate(
      { leadId: lead._id, userId: user._id, type: log.type, subject: log.subject },
      {
        leadId: lead._id,
        userId: user._id,
        type: log.type,
        subject: log.subject,
        body: log.body,
        aiMetadata: log.aiMetadata,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    console.log(`  ✓ ${result.type} → ${log.leadEmail}`);
    seededCount += 1;
  }

  console.log(`Seeded ${seededCount} outreach log(s).`);
}
