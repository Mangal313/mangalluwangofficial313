import prisma from "@/lib/db";
import GameCard from "@/components/GameCard";

export default async function GamesPage() {
  const games = await prisma.game.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-4">Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((g) => <GameCard key={g.id} game={g} />)}
      </div>
    </div>
  );
}
