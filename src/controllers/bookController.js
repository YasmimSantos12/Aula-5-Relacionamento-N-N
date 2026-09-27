const prisma = require('../prisma');

async function createBook(req, res) {
  const { title, release_year, author_id } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'O campo title é obrigatório.' });
  }

  if (!author_id || typeof author_id !== 'string') {
    return res.status(400).json({ error: 'O campo author_id é obrigatório.' });
  }

  if (!Number.isInteger(release_year) || release_year < 0) {
    return res.status(400).json({ error: 'O campo release_year deve ser um inteiro válido.' });
  }

  try {
    const authorExists = await prisma.author.findUnique({
      where: { id: author_id }
    });

    if (!authorExists) {
      return res.status(404).json({ error: 'Autor não encontrado.' });
    }

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        release_year,
        author_id
      },
      include: {
        author: true
      }
    });

    return res.status(201).json(book);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao criar livro.' });
  }
}

async function listBooks(req, res) {
  try {
    const books = await prisma.book.findMany({
      include: {
        author: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    return res.json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar livros.' });
  }
}

async function updateBook(req, res) {
  const { id } = req.params;
  const { title, release_year, author_id } = req.body;

  try {
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    if (author_id) {
      const authorExists = await prisma.author.findUnique({ where: { id: author_id } });
      if (!authorExists) {
        return res.status(404).json({ error: 'Autor não encontrado.' });
      }
    }

    const data = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'O campo title deve ser um texto válido.' });
      }
      data.title = title.trim();
    }

    if (release_year !== undefined) {
      if (!Number.isInteger(release_year) || release_year < 0) {
        return res.status(400).json({ error: 'O campo release_year deve ser um inteiro válido.' });
      }
      data.release_year = release_year;
    }

    if (author_id !== undefined) {
      data.author_id = author_id;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data,
      include: { author: true }
    });

    return res.json(updatedBook);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar livro.' });
  }
}

async function deleteBook(req, res) {
  const { id } = req.params;

  try {
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    await prisma.book.delete({ where: { id } });

    return res.json({ message: 'Livro excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir livro.' });
  }
}

module.exports = {
  createBook,
  listBooks,
  updateBook,
  deleteBook
};
