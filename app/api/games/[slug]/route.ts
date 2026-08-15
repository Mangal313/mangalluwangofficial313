import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { products: { orderBy: { sortOrder: "asc" } } }
  });
  if (!game) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Game not found" } }, { status: 404 });
  return NextResponse.json({ success: true, data: game });
}
