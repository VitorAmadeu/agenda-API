const Usuario = require('./Usuario'); 
const Agenda = require('./Agenda'); 
const Evento = require('./Evento'); 
const { connectToDb } = require('./db'); 

async function main() {
  let usuarioCriado;
  let agendaCriada;

  try {
    await connectToDb();
    
    // CRIAR USUÁRIO E AGENDA 
    console.log('--- 1. Criando usuário e agenda ---');
    const novoUsuario = new Usuario('Ana Paula', 'ana.paula@example.com');
    await novoUsuario.salvar();
    usuarioCriado = await Usuario.buscarPorEmail('ana.paula@example.com');
    if (!usuarioCriado) throw new Error('Falha ao criar usuário.');
    
    const novaAgenda = new Agenda('Faculdade', usuarioCriado._id);
    await novaAgenda.salvar();
    const agendas = await Agenda.buscarPorUsuario(usuarioCriado._id);
    agendaCriada = agendas[0];
    if (!agendaCriada) throw new Error('Falha ao criar agenda.');

    //ADICIONAR E LISTAR EVENTOS 
    console.log(`\n--- 2. Adicionando evento na agenda "${agendaCriada.titulo}" ---`);
    const novoEvento = new Evento('Prova de Back-end', '2025-10-10T19:00:00Z', agendaCriada._id);
    await novoEvento.salvar();

    console.log('\n--- 3. Listando todos os eventos da agenda ---');
    const eventos = await Evento.buscarPorAgenda(agendaCriada._id);
    console.log('Eventos encontrados:', eventos);

  } catch (error) {
    console.error('\n!!!UM ERRO OCORREU NO TESTE PRINCIPAL!!!');
    console.error(error.message);
  } finally {
    //LIMPEZA DO BANCO DE DADOS
    if (agendaCriada) {
      console.log('\n--- 4. Limpando dados de teste ---');
      // Deleta os eventos
      const eventos = await Evento.buscarPorAgenda(agendaCriada._id);
      for (const evento of eventos) {
        const eventoParaDeletar = new Evento(evento.titulo, evento.data_inicio, evento.id_agenda, evento._id);
        await eventoParaDeletar.deletar();
      }
    }
    if (usuarioCriado) {
      // Deleta a agenda
      const agendaParaDeletar = new Agenda(agendaCriada.titulo, agendaCriada.id_usuario, agendaCriada._id);
      await agendaParaDeletar.deletar();
      // Deleta o usuário
      const usuarioParaDeletar = new Usuario(usuarioCriado.nome, usuarioCriado.email, usuarioCriado._id);
      await usuarioParaDeletar.deletar();
    }
    console.log('\n--- Fim dos testes ---');
    process.exit(0);
  }
}

main();
