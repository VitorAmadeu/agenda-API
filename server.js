const express = require('express');
const session = require('express-session');
const { connectToDb, getDb } = require('./db'); // Importa nossa conexão
const { ObjectId } = require('mongodb');

// Importa nossas classes do Projeto 1
const Usuario = require('./Usuario');
const Agenda = require('./Agenda');
const Evento = require('./Evento');

const app = express();
const port = 3000;

// --- Configuração dos Middlewares ---

// 1. Permite que o Express leia JSON no corpo das requisições
app.use(express.json());
// 2. Permite que o Express leia dados de formulários (para GET/POST)
app.use(express.urlencoded({ extended: true }));

// 3. Configuração da SESSÃO (Requisito do Projeto 2)
app.use(session({
  secret: 'seu_segredo_super_secreto_aqui', // Troque por uma string aleatória
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Para testes (HTTP). Mude para 'true' se usar HTTPS
}));

// --- Início do Servidor ---

// Função principal assíncrona para conectar ao DB antes de ligar o servidor
async function startServer() {
  try {
    // Conecta ao banco de dados
    await connectToDb();
    
    // Liga o servidor
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  }
}

// --- Rotas da Aplicação ---
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API da Agenda Eletrônica!' });
});

/*
  AQUI VAMOS ADICIONAR AS ROTAS DE LOGIN, AGENDAS, EVENTOS...
*/
// --- Rotas de Autenticação ---

// Rota para REGISTRAR um novo usuário
app.post('/registrar', async (req, res) => {
  // Recebe os dados do corpo da requisição (JSON)
  const { nome, email, senha } = req.body;

  // Verificação de campos obrigatórios (Requisito do Projeto 2)
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  try {
    const novoUsuario = new Usuario(nome, email, senha);
    await novoUsuario.salvar();
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    // Trata o erro de e-mail duplicado que tem no projeto 1
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
  }
});

// Rota de LOGIN
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const usuario = await Usuario.login(email, senha);
    
    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // SESSÃO: Salva o ID do usuário na sessão (Requisito do Projeto 2)
    req.session.usuario_id = usuario._id;
    
    res.status(200).json({ message: 'Login bem-sucedido!', usuario: { nome: usuario.nome, email: usuario.email } });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.', details: error.message });
  }
});


// 4. Middleware de Autenticação (Requisito do Projeto 2)
// Esta função verifica se o usuário está logado antes de permitir o acesso
const checkAuth = (req, res, next) => {
  // Se não existir a ID do usuário na sessão, ele não está logado
  if (!req.session.usuario_id) {
    return res.status(401).json({ error: 'Acesso negado. Por favor, faça o login.' });
  }
  // Se estiver logado, continua para a próxima função (a rota)
  next();
};

/**
 * Rota para CRIAR uma nova agenda.
 * Protegida pelo middleware 'checkAuth'.
 */
app.post('/agendas', checkAuth, async (req, res) => {
  const { titulo } = req.body;
  const id_usuario = req.session.usuario_id; // Pega o ID do usuário logado na sessão

  // Verificação de preenchimento de campos obrigatórios 
  if (!titulo) {
    return res.status(400).json({ error: 'O título da agenda é obrigatório.' });
  }

  try {
    const novaAgenda = new Agenda(titulo, id_usuario);
    await novaAgenda.salvar();
    res.status(201).json({ message: 'Agenda criada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agenda.', details: error.message });
  }
});

/**
 * Rota para LISTAR as agendas do usuário logado.
 * Protegida pelo middleware 'checkAuth'.
 */
app.get('/agendas', checkAuth, async (req, res) => {
  const id_usuario = req.session.usuario_id; // Pega o ID do usuário da sessão

  try {
    const agendas = await Agenda.buscarPorUsuario(id_usuario);
    res.status(200).json(agendas); // Retorna a lista de agendas em JSON 
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendas.', details: error.message });
  }
});

/**
 * Rota para CRIAR um novo evento em uma agenda.
 * Protegida pelo middleware 'checkAuth'.
 */
app.post('/eventos', checkAuth, async (req, res) => {
  // Recebe os dados do corpo (JSON)
  const { titulo, data_inicio, id_agenda } = req.body;

  // Verificação de preenchimento 
  if (!titulo || !data_inicio || !id_agenda) {
    return res.status(400).json({ error: 'Título, data de início e ID da agenda são obrigatórios.' });
  }

  try {
    const novoEvento = new Evento(titulo, data_inicio, id_agenda);
    await novoEvento.salvar();
    res.status(201).json({ message: 'Evento criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento.', details: error.message });
  }
});

/**
 * Rota para LISTAR os eventos de uma agenda específica.
 * Protegida pelo middleware 'checkAuth'.
 */
app.get('/eventos/agenda/:id_agenda', checkAuth, async (req, res) => {
  // Recebe o ID da agenda pela URL (parâmetro GET) 
  const { id_agenda } = req.params; 

  try {
    const eventos = await Evento.buscarPorAgenda(id_agenda);
    res.status(200).json(eventos); // Retorna a lista de eventos 
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar eventos.', details: error.message });
  }
});

/**
 * Rota para DELETAR uma agenda específica.
 * Protegida pelo middleware 'checkAuth'.
 */
app.delete('/agendas/:id', checkAuth, async (req, res) => {
  const { id } = req.params; // Pega o ID da agenda pela URL
  const id_usuario = req.session.usuario_id; // Pega o ID do usuário logado

  try {
    // 1. (Verificação de segurança) Buscar a agenda para ver se ela pertence ao usuário
    const db = getDb();
    const agenda = await db.collection('agendas').findOne({ 
      _id: new ObjectId(id),
      id_usuario: new ObjectId(id_usuario) // Garante que a agenda é do usuário
    });

    if (!agenda) {
      return res.status(404).json({ error: 'Agenda não encontrada ou não pertence a este usuário.' });
    }
    // 2. Se a verificação passar, deleta a agenda
    // (Nota: Idealmente, deveríamos deletar todos os eventos desta agenda primeiro)
    const agendaParaDeletar = new Agenda(agenda.titulo, agenda.id_usuario, agenda._id);
    await agendaParaDeletar.deletar();

    res.status(200).json({ message: 'Agenda deletada com sucesso.' });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agenda.', details: error.message });
  }
});


/**
 * Rota para DELETAR um evento específico.
 * Protegida pelo middleware 'checkAuth'.
 */
app.delete('/eventos/:id', checkAuth, async (req, res) => {
  const { id } = req.params; // Pega o ID do evento pela URL
  const id_usuario = req.session.usuario_id; // Pega o ID do usuário logado

  try {
    const db = getDb();

    // 1. (Verificação de segurança)
    // Para saber se o evento pertence ao usuário, precisamos
    // verificar se a agenda do evento pertence ao usuário.
    const evento = await db.collection('eventos').findOne({ _id: new ObjectId(id) });
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    // Busca a agenda-pai do evento
    const agenda = await db.collection('agendas').findOne({ 
      _id: new ObjectId(evento.id_agenda),
      id_usuario: new ObjectId(id_usuario) // O usuário logado é o dono da agenda?
    });

    if (!agenda) {
      return res.status(403).json({ error: 'Acesso negado. Você não é o dono deste evento.' });
    }

    // 2.deleta o evento
    const eventoParaDeletar = new Evento(evento.titulo, evento.data_inicio, evento.id_agenda, evento._id);
    await eventoParaDeletar.deletar();

    res.status(200).json({ message: 'Evento deletado com sucesso.' });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar evento.', details: error.message });
  }
});
// Rota de LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Falha ao fazer logout.' });
    }
    // Limpa o cookie do cliente
    res.clearCookie('connect.sid'); 
    res.status(200).json({ message: 'Logout bem-sucedido.' });
  });
});


/*
  AQUI VAMOS ADICIONAR AS ROTAS DE LOGIN, AGENDAS, EVENTOS...
*/


// Inicia o servidor
startServer();