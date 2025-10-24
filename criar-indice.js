const { connectToDb, getDb } = require('./db');

async function criarIndiceUnico() {
  try {
    // Conecta ao banco de dados
    await connectToDb();
    console.log('Conectado ao banco de dados para criar o índice.');

    // Pega a instância do banco
    const db = getDb();

    // Comando para criar o índice único no campo 'email'
    const resultado = await db.collection('usuarios').createIndex(
      { "email": 1 },
      { unique: true }
    );

    console.log(`Índice criado com sucesso: ${resultado}`);
    console.log("Agora o campo 'email' não permitirá valores duplicados.");

  } catch (error) {
    console.error('Ocorreu um erro ao criar o índice:', error);
  } finally {
    // É uma boa prática fechar a conexão, mas para este script simples,
    // vamos deixar que o Node encerre o processo.
    process.exit(0);
  }
}

// Executa a função
criarIndiceUnico();