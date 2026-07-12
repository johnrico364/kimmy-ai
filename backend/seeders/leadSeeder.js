import User from "../module/user/user.model.js";
import Lead from "../module/lead/lead.model.js";

const leads = [
  {
    userEmail: "demo@kimmy.ai",
    firstName: "Alex",
    lastName: "Turner",
    email: "alex.turner@meridiansoftware.com",
    company: "Meridian Software",
    linkedinBio:
      "VP of Sales at Meridian Software. 12+ years in B2B SaaS. Focused on scaling outbound teams and improving pipeline velocity across mid-market accounts.",
    status: "new",
  },
  {
    userEmail: "demo@kimmy.ai",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@stackline.io",
    company: "Stackline",
    linkedinBio:
      "Head of Growth at Stackline. Previously led demand gen at two Series B startups. Interested in AI tools that reduce manual prospecting work.",
    status: "pitch_ready",
  },
  {
    userEmail: "demo@kimmy.ai",
    firstName: "Daniel",
    lastName: "Brooks",
    email: "daniel.brooks@northpeak.com",
    company: "Northpeak Consulting",
    linkedinBio:
      "Managing Partner at Northpeak Consulting. Helps professional services firms modernize sales operations and CRM workflows.",
    status: "emailed",
  },
  {
    userEmail: "demo@kimmy.ai",
    firstName: "Rachel",
    lastName: "Kim",
    email: "rachel.kim@blueharbor.co",
    company: "Blue Harbor Finance",
    linkedinBio:
      "Director of Business Development at Blue Harbor Finance. Building partnerships with fintech vendors serving regional banks.",
    status: "replied",
  },
  {
    userEmail: "demo@kimmy.ai",
    firstName: "Marcus",
    lastName: "Webb",
    email: "marcus.webb@ironcladops.com",
    company: "Ironclad Ops",
    linkedinBio:
      "COO at Ironclad Ops. Oversees revenue, customer success, and internal tooling for a 40-person industrial services company.",
    status: "unresponsive",
  },
  {
    userEmail: "admin@kimmy.ai",
    firstName: "Laura",
    lastName: "Henderson",
    email: "laura.henderson@cloudspire.com",
    company: "Cloudspire",
    linkedinBio:
      "Chief Revenue Officer at Cloudspire. Scaling enterprise sales motion after recent $18M Series C. Open to evaluating sales AI platforms.",
    status: "pitch_ready",
  },
  {
    userEmail: "admin@kimmy.ai",
    firstName: "Ethan",
    lastName: "Morales",
    email: "ethan.morales@signalpath.dev",
    company: "SignalPath",
    linkedinBio:
      "Founder & CEO at SignalPath. Building developer observability tools. Handles early enterprise deals personally.",
    status: "new",
  },
  {
    userEmail: "sarah.mitchell@northline.io",
    firstName: "Nina",
    lastName: "Patel",
    email: "nina.patel@retailpulse.com",
    company: "RetailPulse",
    linkedinBio:
      "VP of Analytics at RetailPulse. Leads a team of data analysts supporting e-commerce brands with real-time merchandising insights.",
    status: "emailed",
  },
];

export async function seedLeads() {
  console.log("Seeding leads...");

  let seededCount = 0;

  for (const lead of leads) {
    const user = await User.findOne({ email: lead.userEmail });

    if (!user) {
      console.warn(`  ⚠ Skipping ${lead.email} — user not found: ${lead.userEmail}`);
      continue;
    }

    const result = await Lead.findOneAndUpdate(
      { userId: user._id, email: lead.email },
      {
        userId: user._id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.company,
        linkedinBio: lead.linkedinBio,
        status: lead.status,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    console.log(`  ✓ ${result.email} (${result.status})`);
    seededCount += 1;
  }

  console.log(`Seeded ${seededCount} lead(s).`);
}
