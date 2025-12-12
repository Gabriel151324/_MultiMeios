// server.js

// 1. IMPORTAÇÃO DE MÓDULOS
const express = require('express');
const { Pool } = require('pg'); // Usamos o Pool para gerenciar múltiplas conexões de forma eficiente
const app = express();
const port = 3000;

// Middleware para que o Express entenda requisições JSON
app.use(express.json());

// 2. CONFIGURAÇÃO DO BANCO DE DADOS (POSTGRESQL)
// *****************************************************************
// IMPORTANTE: VOCÊ DEVE SUBSTITUIR ESTES VALORES PELOS SEUS REAIS!
// *****************************************************************
const pool = new Pool({
    user: 'postgres',     // Ex: postgres
    host: 'localhost',                // Onde o seu banco está rodando
    database: 'biblioteca',    // Ex: biblioteca_db
    password: '123456',    // Sua senha
    port: 5433,                       // Porta padrão do PostgreSQL
});

// Teste de Conexão com o Banco de Dados
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao adquirir cliente do pool:', err.stack);
    }
    console.log('✅ Conexão bem-sucedida com o PostgreSQL!');
    release(); // Libera o cliente de volta para o pool
});

// =================================================================
// 3. ROTAS DA API
// =================================================================

// --- ROTA GET: BUSCAR TODOS OS LIVROS ---
/**
 * @method GET
 * @path /livros
 * @description Busca e retorna todos os registros da tabela 'livros'.
 */
app.get('/livros', async (req, res) => {
    try {
        // Consulta SQL para selecionar todos os campos da tabela 'livros'
        const result = await pool.query('SELECT * FROM livros ORDER BY id ASC');
        
        // Retorna o resultado como JSON com status 200 (OK)
        res.status(200).json(result.rows);
    } catch (err) {
        // Em caso de erro, retorna status 500 (Internal Server Error)
        console.error('Erro na rota GET /livros:', err);
        res.status(500).json({ 
            erro: 'Erro ao buscar livros no banco de dados', 
            detalhe: err.message 
        });
    }
});


// --- ROTA POST: INSERIR UM NOVO LIVRO ---
/**
 * @method POST
 * @path /livros
 * @description Insere um novo registro na tabela 'livros' com os dados fornecidos no corpo da requisição.
 */
app.post('/livros', async (req, res) => {
    // 3.1. EXTRAÇÃO DE DADOS DO CORPO DA REQUISIÇÃO
    // req.body contém os dados JSON enviados pelo cliente
    const { 
        autor, livro, estante, volume, exemplar, 
        cidade, editora, ano, origem, codigo, data, adaptado_por 
    } = req.body;

    // 3.2. VALIDAÇÃO SIMPLES (Exemplo: verifica se os campos obrigatórios existem)
    if (!autor || !livro || !editora) {
        return res.status(400).json({ 
            erro: 'Campos obrigatórios ausentes',
            necessario: ['autor', 'livro', 'editora']
        });
    }

    try {
        // 3.3. CONSTRUÇÃO DA QUERY SQL COM PARÂMETROS
        // Usamos $1, $2, etc., para prevenir ataques de SQL Injection (segurança!)
        const queryText = `
            INSERT INTO livros (
                autor, livro, estante, volume, exemplar, 
                cidade, editora, ano, origem, codigo, data, adaptado_por
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *; -- Retorna o registro recém-inserido
        `;
        
        const values = [
            autor, livro, estante, volume, exemplar, 
            cidade, editora, ano, origem, codigo, data, adaptado_por
        ];

        // 3.4. EXECUÇÃO DA QUERY
        const result = await pool.query(queryText, values);

        // Retorna o registro inserido com status 201 (Created)
        res.status(201).json({
            mensagem: 'Livro inserido com sucesso!',
            livro: result.rows[0]
        });

    } catch (err) {
        console.error('Erro na rota POST /livros:', err);
        // Retorna status 500 em caso de erro na execução da query
        res.status(500).json({ 
            erro: 'Erro ao inserir o livro no banco de dados', 
            detalhe: err.message 
        });
    }
});


// 4. INICIALIZAÇÃO DO SERVIDOR
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`Rotas disponíveis:`);
    console.log(`- GET  /livros (Para buscar todos)`);
    console.log(`- POST /livros (Para inserir um novo)`);
});