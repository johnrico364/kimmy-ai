import "dotenv/config";
import { connectMongoDB, disconnectMongoDB } from "../config/mongodb.js";
import { seedUsers } from "./userSeeder.js";
import { seedLeads } from "./leadSeeder.js";
import { seedOutlook } from "./outloookSeeder.js";

const seeders = {
  user: seedUsers,
  lead: seedLeads,
  outlook: seedOutlook,
};

const runAll = async () => {
  for (const [name, seed] of Object.entries(seeders)) {
    console.log(`\n--- ${name} seeder ---`);
    await seed();
  }
};

async function main() {
  const target = process.argv[2]?.toLowerCase();

  if (target && !seeders[target]) {
    console.error(
      `Unknown seeder "${target}". Available seeders: ${Object.keys(seeders).join(", ")}`,
    );
    process.exit(1);
  }

  try {
    await connectMongoDB();

    if (target) {
      console.log(`\n--- ${target} seeder ---`);
      await seeders[target]();
    } else {
      console.log("Running all seeders...");
      await runAll();
    }

    console.log("\nSeeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectMongoDB();
    process.exit(process.exitCode ?? 0);
  }
}

main();
