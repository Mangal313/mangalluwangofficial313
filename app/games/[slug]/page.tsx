import prisma from "@/lib/db";
import Link from "next/link";

export default async function GameDetail({ params }: { params: { slug: string } }) {
  const game = await prisma.game.findUnique({
    where: { slug: params.slug },
    include: { products: { orderBy: { sortOrder: "asc" } } }
  });
  if (!game) {
    return <div>Game not found</div>;
  }
  return (
    <div className="container mx-auto">
      <div className="flex gap-6">
        <img src={game.image || "/placeholder-game.png"} alt={game.name} className="w-48 h-48 object-cover rounded" />
        <div>
          <h1 className="text-3xl font-bold">{game.name}</h1>
          <p className="mt-2 text-gray-300">{game.description}</p>
          <div className="mt-4">
            <h2 className="text-xl">Recharge Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {game.products.map((p: any) => (
                <div key={p.id} className="bg-gray-800 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-400">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₹{(p.sellingPrice / 100).toFixed(2)}</div>
                      <Link href={`/recharge/checkout?game=${game.id}&product=${p.id}`} className="mt-2 inline-block bg-indigo-600 px-3 py-1 rounded">Recharge</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
