import bcrypt from "bcryptjs";
import User from "../module/user/user.model.js";

const users = [
  {
    name: "Kimmy Admin",
    email: "admin@kimmy.ai",
    password: "password123",
    companyName: "Kimmy AI",
    companyValueProp:
      "AI-powered sales assistant that helps teams research leads, draft outreach, and close deals faster.",
  },
  {
    name: "Demo User",
    email: "demo@kimmy.ai",
    password: "password123",
    companyName: "Acme Corp",
    companyValueProp:
      "Cloud-based project management software for mid-market B2B teams.",
  },
  {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@northline.io",
    password: "password123",
    companyName: "Northline Analytics",
    companyValueProp:
      "Real-time business intelligence dashboards for retail and e-commerce brands.",
  },
  {
    name: "James Rodriguez",
    email: "james.rodriguez@brightpath.co",
    password: "password123",
    companyName: "BrightPath HR",
    companyValueProp:
      "Employee onboarding and performance management platform for growing companies.",
  },
  {
    name: "Emily Chen",
    email: "emily.chen@vertexlabs.com",
    password: "password123",
    companyName: "Vertex Labs",
    companyValueProp:
      "Cybersecurity monitoring and threat detection for small and mid-sized businesses.",
  },
  {
    name: "Michael Thompson",
    email: "michael.thompson@greenfield.co",
    password: "password123",
    companyName: "Greenfield Logistics",
    companyValueProp:
      "Last-mile delivery optimization software for regional freight carriers.",
  },
  {
    name: "Olivia Bennett",
    email: "olivia.bennett@harborhealth.com",
    password: "password123",
    companyName: "Harbor Health",
    companyValueProp:
      "Patient scheduling and telehealth tools for independent medical practices.",
  },
];

export async function seedUsers() {
  console.log("Seeding users...");

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const result = await User.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        companyName: user.companyName,
        companyValueProp: user.companyValueProp,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    console.log(`  ✓ ${result.email}`);
  }

  console.log(`Seeded ${users.length} user(s).`);
}
