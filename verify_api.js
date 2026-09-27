const { spawn } = require('child_process');
const prisma = require('./src/prisma');

async function main() {

  await prisma.book.deleteMany({});
  await prisma.author.deleteMany({});

  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: '3001' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const createAuthorResponse = await fetch('http://localhost:3001/authors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'George Orwell',
        biography: 'Escritor britânico conhecido por 1984.'
      })
    });

    const authorBody = await createAuthorResponse.text();
    console.log('CREATE_AUTHOR_STATUS', createAuthorResponse.status);
    console.log('CREATE_AUTHOR_BODY', authorBody);

    const author = await prisma.author.findUnique({ where: { name: 'George Orwell' } });
    if (!author) {
      throw new Error('Autor não foi criado no banco');
    }

    const createBookResponse = await fetch('http://localhost:3001/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '1984',
        release_year: 1949,
        author_id: author.id
      })
    });

    const bookBody = await createBookResponse.text();
    console.log('CREATE_BOOK_STATUS', createBookResponse.status);
    console.log('CREATE_BOOK_BODY', bookBody);

    const book = JSON.parse(bookBody);

    const listResponse = await fetch('http://localhost:3001/books');
    console.log('LIST_STATUS', listResponse.status);
    console.log('LIST_BODY', await listResponse.text());

    const updateResponse = await fetch(`http://localhost:3001/books/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '1984 - Edição atualizada', release_year: 1950 })
    });
    console.log('UPDATE_STATUS', updateResponse.status);
    console.log('UPDATE_BODY', await updateResponse.text());

    const deleteResponse = await fetch(`http://localhost:3001/books/${book.id}`, {
      method: 'DELETE'
    });
    console.log('DELETE_STATUS', deleteResponse.status);
    console.log('DELETE_BODY', await deleteResponse.text());
  } finally {
    server.kill();
    await prisma.$disconnect();
    if (serverOutput) console.log('SERVER_OUTPUT', serverOutput.trim());
  }
}

main().catch((error) => {
  console.error('VERIFY_FAILED', error);
  process.exit(1);
});
