const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuração do PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});


// FUNÇÃO PARA CRIAR TABELAS AUTOMATICAMENTE
async function criarTabelas() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS servicos (
            id SERIAL PRIMARY KEY,
            icone VARCHAR(50) NOT NULL,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `INSERT INTO servicos (icone, titulo, descricao)
        SELECT * FROM (VALUES
            ('fa-fire', 'Combate a Incêndios', 'Atuação rápida e eficiente no combate a princípios de incêndio.'),
            ('fa-heartbeat', 'Primeiros Socorros', 'Atendimento pré-hospitalar qualificado.'),
            ('fa-mountain', 'Resgate em Altura', 'Operações de resgate em locais de difícil acesso.'),
            ('fa-chalkboard-teacher', 'Treinamentos', 'Capacitação para empresas e comunidade.')
        ) AS v(icone, titulo, descricao)
        WHERE NOT EXISTS (SELECT 1 FROM servicos LIMIT 1)`,
        
        `CREATE TABLE IF NOT EXISTS depoimentos (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            funcao VARCHAR(100) NOT NULL,
            texto TEXT NOT NULL,
            imagem TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS noticias (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao TEXT NOT NULL,
            categoria VARCHAR(50) NOT NULL,
            imagem TEXT,
            data_publicacao VARCHAR(20),
            autor VARCHAR(100) DEFAULT 'Equipe Araras Negras',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS slides (
            id SERIAL PRIMARY KEY,
            tagline VARCHAR(100) DEFAULT 'Bem-vindo à',
            titulo VARCHAR(255) NOT NULL,
            subtitulo VARCHAR(255),
            imagem TEXT NOT NULL,
            botao_texto VARCHAR(50) DEFAULT 'Conheça-nos',
            botao_link VARCHAR(100) DEFAULT '#institucional',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS galeria (
            id SERIAL PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descricao VARCHAR(255),
            categoria VARCHAR(50) NOT NULL,
            src TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            avatar TEXT,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS configuracoes (
            id INTEGER PRIMARY KEY DEFAULT 1,
            telefone_emergencia VARCHAR(20) DEFAULT '(83) 99999-9999',
            email_contato VARCHAR(100) DEFAULT 'contato@ararasnegras.com.br',
            endereco TEXT DEFAULT 'Rua Principal, 123 - Centro, Araruna - PB',
            whatsapp VARCHAR(20) DEFAULT '5583999999999'
        )`
    ];
    
    for (const query of queries) {
        try {
            await pool.query(query);
            console.log('✅ Query executada com sucesso');
        } catch (err) {
            console.log('⚠️ Query ignorada (já existe):', err.message);
        }
    }
}

// Testar conexão e criar tabelas
pool.connect(async (err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    } else {
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        await criarTabelas();
        release();
    }
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

// GET serviços
app.get('/api/servicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM servicos ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET depoimentos
app.get('/api/depoimentos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM depoimentos ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET notícias
app.get('/api/noticias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM noticias ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET slides
app.get('/api/slides', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM slides ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET galeria
app.get('/api/galeria', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM galeria ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET configurações
app.get('/api/config', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM configuracoes LIMIT 1');
        res.json(result.rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== AUTENTICAÇÃO ==========

// Registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;
        
        const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'E-mail já cadastrado' });
        }
        
        const senha_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha_hash, avatar) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, avatar',
            [name, email, senha_hash, avatar || '']
        );
        
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, name: user.nome, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ token, user: { id: user.id, name: user.nome, email: user.email, avatar: user.avatar } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }
        
        const user = result.rows[0];
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

// ========== ROTAS ADMIN ==========

// POST serviço
app.post('/api/servicos', auth, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        const result = await pool.query(
            'INSERT INTO servicos (icone, titulo, descricao) VALUES ($1, $2, $3) RETURNING *',
            [icon, title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT serviço
app.put('/api/servicos/:id', auth, async (req, res) => {
    try {
        const { icon, title, description } = req.body;
        await pool.query(
            'UPDATE servicos SET icone = $1, titulo = $2, descricao = $3 WHERE id = $4',
            [icon || '', title || '', description || '', req.params.id]);
        res.json({ id: req.params.id, icon, title, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE serviço
app.delete('/api/servicos/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM servicos WHERE id = $1', [req.params.id]);
        res.json({ message: 'Serviço excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST depoimento
app.post('/api/depoimentos', auth, async (req, res) => {
    try {
        const { name, role, text, image } = req.body;
        const result = await pool.query(
            'INSERT INTO depoimentos (nome, funcao, texto, imagem) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, role, text, image || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT depoimento
app.put('/api/depoimentos/:id', auth, async (req, res) => {
    try {
        const { name, role, text, image } = req.body;
        await pool.query(
            'UPDATE depoimentos SET nome = $1, funcao = $2, texto = $3, imagem = $4 WHERE id = $5',
            [name, role, text, image || '', req.params.id]
        );
        res.json({ id: req.params.id, name, role, text, image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE depoimento
app.delete('/api/depoimentos/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM depoimentos WHERE id = $1', [req.params.id]);
        res.json({ message: 'Depoimento excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST notícia
app.post('/api/noticias', auth, async (req, res) => {
    try {
        const { title, description, category, image, date, author } = req.body;
        const result = await pool.query(
            'INSERT INTO noticias (titulo, descricao, categoria, imagem, data_publicacao, autor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, category, image || '', date || new Date().toLocaleDateString('pt-BR'), author || 'Equipe Araras Negras']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE notícia
app.delete('/api/noticias/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM noticias WHERE id = $1', [req.params.id]);
        res.json({ message: 'Notícia excluída' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST slide
app.post('/api/slides', auth, async (req, res) => {
    try {
        const { tagline, title, subtitle, image, buttonText, buttonLink } = req.body;
        const result = await pool.query(
            'INSERT INTO slides (tagline, titulo, subtitulo, imagem, botao_texto, botao_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [tagline || 'Bem-vindo à', title, subtitle || '', image, buttonText || 'Conheça-nos', buttonLink || '#institucional']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE slide
app.delete('/api/slides/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM slides WHERE id = $1', [req.params.id]);
        res.json({ message: 'Slide excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST galeria
app.post('/api/galeria', auth, async (req, res) => {
    try {
        const { title, description, category, src } = req.body;
        const result = await pool.query(
            'INSERT INTO galeria (titulo, descricao, categoria, src) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description || '', category, src]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE galeria
app.delete('/api/galeria/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM galeria WHERE id = $1', [req.params.id]);
        res.json({ message: 'Item excluído' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT configurações
app.put('/api/config', auth, async (req, res) => {
    try {
        const { emergencyPhone, contactEmail, contactAddress, whatsappNumber } = req.body;
        await pool.query(
            'UPDATE configuracoes SET telefone_emergencia = $1, email_contato = $2, endereco = $3, whatsapp = $4 WHERE id = 1',
            [emergencyPhone, contactEmail, contactAddress, whatsappNumber]
        );
        res.json({ emergencyPhone, contactEmail, contactAddress, whatsappNumber });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET usuário atual
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome, email, avatar FROM usuarios WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});