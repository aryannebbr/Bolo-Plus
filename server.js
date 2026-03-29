const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = './receitas.json';

const lerBanco = () => {
    try {
        const dados = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(dados);
    } catch (err) { return []; }
};

const salvarNoBanco = (dados) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(dados, null, 2));
};

app.get('/api/receitas', (req, res) => {
    res.json(lerBanco());
});

app.post('/api/receitas', (req, res) => {
    const receitas = lerBanco();
    const novaReceita = req.body;
    const ultimoId = receitas.length > 0 ? receitas[receitas.length - 1].id : 0;
    novaReceita.id = ultimoId + 1;
    novaReceita.fixo = false; // Novos cadastros nunca são fixos
    receitas.push(novaReceita);
    salvarNoBanco(receitas);
    res.status(201).json(novaReceita);
});

app.delete('/api/receitas/:id', (req, res) => {
    const { id } = req.params;
    let receitas = lerBanco();
    const receitaParaDeletar = receitas.find(b => b.id === parseInt(id));

    if (receitaParaDeletar && receitaParaDeletar.fixo === true) {
        return res.status(403).json({ erro: "Proibido excluir receitas fixas." });
    }

    receitas = receitas.filter(b => b.id !== parseInt(id));
    salvarNoBanco(receitas);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`🍰 Servidor Protegido em http://localhost:${PORT}`);
});