import Link from "next/link";
export default function GameCard({ game }: any) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:scale-[1.01] transition">
      <img src={game.image || "/placeholder-game.png"} alt={game.name} className="w-full h-40 object-cover rounded" />
      <h3 className="text-xl font-semibold mt-3">{game.name}</h3>
      <p className="text-sm text-gray-300 mt-1">{game.description}</p>
      <div className="mt-3">
        <Link href={`/games/${game.slug}`} className="px-3 py-2 bg-indigo-600 rounded">View</Link>
      </div>
    </div>
  );
}
