import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in env to run seed.");
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(adminPassword, salt);

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Administrator",
        email: adminEmail,
        passwordHash: hash,
        role: "ADMIN"
      }
    });
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin user already exists:", adminEmail);
  }

  // Example games and packages
  const exampleGame = await prisma.game.upsert({
    where: { slug: "example-game" },
    update: {},
    create: {
      name: "Example Game",
      slug: "example-game",
      description: "Demo game for local testing",
      image: "/placeholder-game.png",
      active: true,
      requiredFields: {
        playerId: { label: "Player ID", required: true },
        serverId: { label: "Server ID", required: false }
      }
    }
  });

  const packages = [
    { name: "100 Diamonds", amount: 100, sellingPrice: 10000 },
    { name: "310 Diamonds", amount: 310, sellingPrice: 29900 },
    { name: "520 Diamonds", amount: 520, sellingPrice: 49900 },
    { name: "1060 Diamonds", amount: 1060, sellingPrice: 99900 }
  ];

  for (const [i, p] of packages.entries()) {
    await prisma.rechargeProduct.upsert({
      where: { name: p.name },
      update: {},
      create: {
        gameId: exampleGame.id,
        name: p.name,
        amount: p.amount,
        sellingPrice: p.sellingPrice,
        currency: "INR",
        active: true,
        sortOrder: i
      }
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
