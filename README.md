# Game Recharge — Next.js + TypeScript

Local dev quick start:

1. Copy .env.example to .env and fill values.
2. Start local Postgres:
   - Using Docker Compose: docker-compose up -d
3. Install dependencies: npm install
4. Generate prisma client: npx prisma generate
5. Run migrations: npx prisma migrate dev --name init
6. Seed DB: npm run db:seed (requires ADMIN_EMAIL and ADMIN_PASSWORD in .env)
7. Run dev server: npm run dev
8. Admin panel: http://localhost:3000/admin (requires login)

See full README in repo for more details.
