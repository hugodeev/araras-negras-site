const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuração do MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'araras_negras',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware de autenticação
const auth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'Acesso negado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// ========== ROTAS PÚBLICAS ==========

// GET notícias
app.get('/api/noticias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM noticias ORDER BY criado_em DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET slides
app.get('/api/slides', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM slides ORDER BY criado_em ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET galeria
app.get('/api/galeria', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM galeria');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET serviços
app.get('/api/servicos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM servicos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET depoimentos
app.get('/api/depoimentos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM depoimentos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET configurações
app.get('/api/config', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM configuracoes LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== AUTENTICAÇÃO ==========

// Registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;
        
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'E-mail já cadastrado' });
        }
        
        const senha_hash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash, avatar) VALUES (?, ?, ?, ?)',
            [name, email, senha_hash, avatar || '']
        );
        
        const token = jwt.sign(
            { id: result.insertId, name, email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ token, user: { id: result.insertId, name, email, avatar } });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }
        
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.senha_hash);
        if (!isValid) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }
        
        const token = jwt.sign(
            { id: user.id, name: user.nome, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: user.id, name: user.nome, email: user.email, avatar: user.avatar } });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// ========== ROTAS ADMIN (com autenticação) ==========

// POST notícia
app.post('/api/noticias', auth, async (req, res) => {
    try {
        const { title, description, category, image, date, author } = req.body;
        const [result] = await pool.query(
            'INSERT INTO noticias (titulo, descricao, categoria, imagem, data_publicacao, autor) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, category, image, date || new Date().toLocaleDateString('pt-BR'), author || 'Equipe Araras Negras']
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE notícia
app.delete('/api/noticias/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM noticias WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notícia excluída' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST slide
app.post('/api/slides', auth, async (req, res) => {
    try {
        const { tagline, title, subtitle, image, buttonText, buttonLink } = req.body;
        const [result] = await pool.query(
            'INSERT INTO slides (tagline, titulo, subtitulo, imagem, botao_texto, botao_link) VALUES (?, ?, ?, ?, ?, ?)',
            [tagline, title, subtitle, image, buttonText, buttonLink]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE slide
app.delete('/api/slides/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM slides WHERE id = ?', [req.params.id]);
        res.json({ message: 'Slide excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST galeria
app.post('/api/galeria', auth, async (req, res) => {
    try {
        const { title, description, category, src } = req.body;
        const [result] = await pool.query(
            'INSERT INTO galeria (titulo, descricao, categoria, src) VALUES (?, ?, ?, ?)',
            [title, description, category, src]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE galeria
app.delete('/api/galeria/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM galeria WHERE id = ?', [req.params.id]);
        res.json({ message: 'Item excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT serviço
app.put('/api/servicos/:id', auth, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        await pool.query(
            'UPDATE servicos SET icone = ?, titulo = ?, descricao = ? WHERE id = ?',
            [icon, title, description, req.params.id]
        );
        res.json({ id: req.params.id, icon, title, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST serviço
app.post('/api/servicos', auth, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO servicos (icone, titulo, descricao) VALUES (?, ?, ?)',
            [icon, title, description]
        );
        res.status(201).json({ id: result.insertId, icon, title, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE serviço
app.delete('/api/servicos/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM servicos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Serviço excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST depoimento
app.post('/api/depoimentos', auth, async (req, res) => {
    try {
        const { name, role, text, image } = req.body;
        const [result] = await pool.query(
            'INSERT INTO depoimentos (nome, funcao, texto, imagem) VALUES (?, ?, ?, ?)',
            [name, role, text, image]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT depoimento
app.put('/api/depoimentos/:id', auth, async (req, res) => {
    try {
        const { name, role, text, image } = req.body;
        await pool.query(
            'UPDATE depoimentos SET nome = ?, funcao = ?, texto = ?, imagem = ? WHERE id = ?',
            [name, role, text, image, req.params.id]
        );
        res.json({ id: req.params.id, name, role, text, image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE depoimento
app.delete('/api/depoimentos/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM depoimentos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Depoimento excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT configurações
app.put('/api/config', auth, async (req, res) => {
    try {
        const { emergencyPhone, contactEmail, contactAddress, whatsappNumber } = req.body;
        await pool.query(
            'UPDATE configuracoes SET telefone_emergencia = ?, email_contato = ?, endereco = ?, whatsapp = ? WHERE id = 1',
            [emergencyPhone, contactEmail, contactAddress, whatsappNumber]
        );
        res.json({ emergencyPhone, contactEmail, contactAddress, whatsappNumber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});