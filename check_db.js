const prisma = require('./src/prisma');

async function main() {
  try {
    await prisma.$connect();
    console.log('db-ok');
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
