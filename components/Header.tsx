import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">GameRecharge</Link>
        <nav className="flex gap-4">
          <Link href="/games" className="text-gray-300">Games</Link>
          <Link href="/dashboard" className="text-gray-300">Dashboard</Link>
          <Link href="/admin" className="text-gray-300">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
