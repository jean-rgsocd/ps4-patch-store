const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));

// String de conexão oficial do MongoDB Atlas
const MONGO_URI = 'mongodb+srv://jeanrgsocd_db_user:jean12345@patchpes.dd9tn7z.mongodb.net/?retryWrites=true&w=majority&appName=patchpes';

mongoose.connect(MONGO_URI)
    .then(() => console.log('>> Conectado ao MongoDB Atlas com sucesso!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema do Utilizador no MongoDB
const userSchema = new mongoose.Schema({
    telefone: { type: String, unique: true, required: true },
    senha: { type: String, required: true },
    ativo: { type: Number, default: 1 }
});

const User = mongoose.model('User', userSchema);

// Regista o teu utilizador principal automaticamente se ainda não existir
async function criarAdminInicial() {
    try {
        const meuTelefone = '11984970539';
        const minhaSenhaPura = '123456'; // Podes alterar aqui para a tua senha da loja

        const user = await User.findOne({ telefone: meuTelefone });
        if (!user) {
            const hashedPassword = await bcrypt.hash(minhaSenhaPura, 10);
            await User.create({ telefone: meuTelefone, senha: hashedPassword });
            console.log(`>> Utilizador principal criado com sucesso! Telefone: ${meuTelefone}`);
        } else {
            console.log('>> Utilizador principal já existe na base de dados.');
        }
    } catch (e) {
        console.error('Erro ao criar utilizador inicial:', e);
    }
}
criarAdminInicial();

// Rota para CRIAR novos utilizadores na base de dados (para os teus clientes)
app.post('/api/criar-usuario', async (req, res) => {
    const { telefone, senha } = req.body;

    try {
        if (!telefone || !senha) {
            return res.status(400).json({ error: 'Telefone e senha são obrigatórios.' });
        }

        const existe = await User.findOne({ telefone });
        if (existe) {
            return res.status(400).json({ error: 'Este número de telefone já está cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await User.create({ telefone, senha: hashedPassword, ativo: 1 });

        res.json({ success: true, message: `Utilizador ${telefone} criado com sucesso no MongoDB!` });
    } catch (e) {
        console.error('Erro ao criar utilizador:', e);
        res.status(500).json({ error: 'Erro no servidor ao criar utilizador.' });
    }
});

// Rota de Login validando no MongoDB
app.post('/api/login', async (req, res) => {
    const { telefone, senha } = req.body;

    try {
        const user = await User.findOne({ telefone });
        if (!user) return res.status(401).json({ error: 'Utilizador não encontrado.' });
        if (user.ativo === 0) return res.status(403).json({ error: 'Assinatura inativa.' });

        const senhaValidada = await bcrypt.compare(senha, user.senha);
        if (!senhaValidada) return res.status(401).json({ error: 'Senha incorreta.' });

        res.json({
            success: true,
            message: 'Login bem-sucedido!',
            links: {
                infinity: {
                    base: 'https://seu-link-r2.dev/BASE-INFINITY.pkg',
                    patch: 'https://seu-link-r2.dev/PATCH-INFINITY.pkg'
                },
                legends: {
                    base: 'https://seu-link-r2.dev/BASE-LEGENDS.pkg',
                    patch: 'https://seu-link-r2.dev/PATCH-LEGENDS.pkg'
                },
                worldcup: {
                    base: 'https://seu-link-r2.dev/BASE-WORLDCUP.pkg',
                    patch: 'https://seu-link-r2.dev/PATCH-WORLDCUP.pkg'
                }
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});