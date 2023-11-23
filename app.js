const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.static('html'));

const PORT = 3000;

const db = new sqlite3.Database('db.sqlite');
db.run('CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, amount REAL, date TEXT, type TEXT)');

app.use(express.json());

app.get('/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', (err, transactions) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(transactions);
  });
});

app.post('/transactions', async (req, res) => {
  try {
    const { description, amount, date, type } = req.body;

    // Ajusta o sinal do valor com base no tipo de transação
    const adjustedAmount = type === 'receita' ? amount : -amount;

    await db.run('INSERT INTO transactions (description, amount, date, type) VALUES (?, ?, ?, ?)', [description, adjustedAmount, date, type]);

    res.json({ message: 'Transação adicionada com sucesso.' });
  } catch (error) {
    console.error('Erro ao adicionar transação:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor ao adicionar transação.' });
  }
});

app.delete('/transactions/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const result = await db.run('DELETE FROM transactions WHERE id=?', [id]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Transação não encontrada.' });
      return;
    }

    res.json({ message: 'Transação excluída com sucesso.', deletedTransactionId: id });
  } catch (error) {
    console.error('Erro ao excluir transação:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir transação.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
