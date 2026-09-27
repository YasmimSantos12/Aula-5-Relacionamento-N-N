const prisma = require('../prisma');

async function createAuthor(req, res) {
  const { name, biography } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'O campo name é obrigatório.' });
  }

  try {
    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        biography: biography?.trim() || null
      }
    });

    return res.status(201).json(author);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um autor com esse nome.' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar autor.' });
  }
}

module.exports = {
  createAuthor
};
