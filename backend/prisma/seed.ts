import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const USER_ID = "11111111-1111-1111-1111-111111111111";
const SCHEDULE_ID = "22222222-2222-2222-2222-222222222222";

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 1. Default user ───────────────────────────────────────────────
  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      name: "Alice Demo",
      email: "alice@karyakram.com",
      timezone: "Asia/Kolkata",
      slug: "alice",
    },
  });
  console.log("✅ User: Alice Demo (alice)");

  // ─── 2. Default schedule: Mon–Fri, 09:00–17:00 IST ────────────────
  await prisma.schedule.upsert({
    where: { id: SCHEDULE_ID },
    update: {},
    create: {
      id: SCHEDULE_ID,
      userId: USER_ID,
      name: "Work Hours",
      timezone: "Asia/Kolkata",
    },
  });

  // Delete existing rules to avoid duplicates on re-seed
  await prisma.availabilityRule.deleteMany({ where: { scheduleId: SCHEDULE_ID } });

  // Mon(1) through Fri(5), 09:00–17:00
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilityRule.create({
      data: {
        scheduleId: SCHEDULE_ID,
        dayOfWeek: day,
        startTime: timeToDate("09:00"),
        endTime: timeToDate("17:00"),
      },
    });
  }
  console.log("✅ Schedule: Work Hours (Mon–Fri, 09:00–17:00 IST)");

  // ─── 3. Event types ────────────────────────────────────────────────
  const eventTypes = [
    { title: "30-min Coffee Chat", slug: "30min", duration: 30, bufferAfter: 10 },
    { title: "60-min Strategy Call", slug: "60min", duration: 60, bufferAfter: 15 },
    { title: "15-min Quick Sync", slug: "15min", duration: 15, bufferAfter: 5 },
  ];

  for (const et of eventTypes) {
    await prisma.eventType.upsert({
      where: { userId_slug: { userId: USER_ID, slug: et.slug } },
      update: {},
      create: {
        userId: USER_ID,
        scheduleId: SCHEDULE_ID,
        title: et.title,
        slug: et.slug,
        durationMinutes: et.duration,
        bufferAfterMin: et.bufferAfter,
        isActive: true,
      },
    });
    console.log(`Event Type: ${et.title} (/${et.slug})`);
  }

  // ─── 4. Sample custom question ─────────────────────────────────────
  const coffeeChat = await prisma.eventType.findFirst({
    where: { userId: USER_ID, slug: "30min" },
  });

  if (coffeeChat) {
    const existingQ = await prisma.customQuestion.findFirst({
      where: { eventTypeId: coffeeChat.id },
    });
    if (!existingQ) {
      await prisma.customQuestion.create({
        data: {
          eventTypeId: coffeeChat.id,
          label: "What would you like to discuss?",
          fieldType: "textarea",
          required: true,
          sortOrder: 1,
        },
      });
      console.log(" Custom Question added to 30-min Coffee Chat");
    }
  }

  console.log("\n Seeding complete!");
}

function timeToDate(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(0);
  d.setUTCHours(hours!, minutes!, 0, 0);
  return d;
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
