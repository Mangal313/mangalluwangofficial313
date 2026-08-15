import prisma from "@/lib/db";
import Link from "next/link";
import GameCard from "@/components/GameCard";

export default async function HomePage() {
  const games = await prisma.game.findMany({ where: { active: true }, take: 8 });
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-6">Game Recharge</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </section>
    </div>
  );
}
