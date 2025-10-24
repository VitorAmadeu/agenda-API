const { getDb } = require('./db'); 
const { logError } = require('./logger'); 
const { ObjectId } = require('mongodb');

class Agenda {
  //CONSTRUTOR
  constructor(titulo, id_usuario, id = null) {
    this.id = id;
    this.titulo = titulo;
    this.id_usuario = id_usuario;
  }

  //MÉTODO SALVAR
  async salvar() {
    // Validação de campos obrigatórios
    if (!this.titulo || !this.id_usuario) {
      throw new Error('Título e ID do usuário são campos obrigatórios.');
    }

    try {
      const db = getDb();
      // Acessa a coleção 'agendas'
      const collection = db.collection('agendas');

      const result = await collection.insertOne({
        titulo: this.titulo,
        id_usuario: new ObjectId(this.id_usuario), // Armazena como ObjectId
        criado_em: new Date(),
      });

      console.log('Agenda inserida com sucesso:', result.insertedId);
      return result;

    } catch (error) {
      console.error('Erro ao inserir agenda:', error.message);
      logError(`Falha ao inserir agenda para o usuário ${this.id_usuario}: ${error.message}`);
      throw error;
    }
  }

  //MÉTODO DE BUSCA
  static async buscarPorUsuario(id_usuario) {
    if (!id_usuario) {
      throw new Error('O ID do usuário é obrigatório para a busca.');
    }
    try {
      const db = getDb();
      // O método find retorna uma lista de documentos
      const agendas = await db.collection('agendas').find({ 
        id_usuario: new ObjectId(id_usuario) 
      }).toArray(); // toArray() converte o cursor para um array
      return agendas;
    } catch (error) {
      logError(`Falha ao buscar agendas do usuário ${id_usuario}: ${error.message}`);
      throw error;
    }
  }

  //MÉTODO DELETAR
  async deletar() {
    if (!this.id) {
      throw new Error('O ID da agenda é necessário para a deleção.');
    }
    try {
      const db = getDb();
      const resultado = await db.collection('agendas').deleteOne({ _id: new ObjectId(this.id) });
      
      if (resultado.deletedCount === 0) {
        console.warn(`Nenhuma agenda encontrada com o ID: ${this.id} para deletar.`);
      } else {
        console.log(`Agenda com ID: ${this.id} deletada com sucesso.`);
      }
      return resultado;

    } catch (error) {
      logError(`Falha ao deletar agenda com ID ${this.id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Agenda;