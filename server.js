require('dotenv').config();
const express = require('express');
const authorRoutes = require('./src/routes/authorRoutes');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API DevBooks funcionando corretamente.',
    endpoints: {
      authors: '/authors',
      books: '/books'
    }
  });
});

app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
