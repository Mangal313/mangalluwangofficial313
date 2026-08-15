import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const games = await prisma.game.findMany({
    where: { active: true },
    include: {
      products: { where: { active: true }, orderBy: { sortOrder: "asc" } }
    },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ success: true, data: games });
}
