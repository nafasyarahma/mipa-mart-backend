const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const id = `admin-${nanoid(16)}`;
  const username = 'admin';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.create({
    data: {
      id,
      username,
      password: hashedPassword,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
