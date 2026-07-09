import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { email: 'carlo@example.com', password: 'password123', name: 'Carlo' },
    { email: 'lance@example.com', password: 'password123', name: 'Lance' },
    { email: 'mark@example.com', password: 'password123', name: 'Mark' },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: randomUUID(),
        email: u.email,
        password: hashedPassword,
        name: u.name,
      },
    });

    console.log(`Seeded user: ${u.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });