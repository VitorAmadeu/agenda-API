const { getDb } = require('../config/db');
const { logError } = require('../utils/logger');
const { ObjectId } = require('mongodb');

class Evento {
  // CONSTRUTOR
  constructor(titulo, data_inicio, id_agenda, id = null) {
    this.id = id;
    this.titulo = titulo;
    this.data_inicio = data_inicio; // A data do evento
    this.id_agenda = id_agenda;   // Chave estrangeira para a agenda
  }

  // MÉTODO SALVAR
  async salvar() {
    // Validação de campos obrigatórios
    if (!this.titulo || !this.data_inicio || !this.id_agenda) {
      throw new Error('Título, data de início e ID da agenda são obrigatórios.');
    }

    try {
      const db = getDb();
      // Acessa a coleção 'eventos'
      const collection = db.collection('eventos');

      const result = await collection.insertOne({
        titulo: this.titulo,
        data_inicio: new Date(this.data_inicio), // Armazena como formato de data
        id_agenda: new ObjectId(this.id_agenda),
        criado_em: new Date(),
      });

      console.log('Evento inserido com sucesso:', result.insertedId);
      return result;

    } catch (error) {
      console.error('Erro ao inserir evento:', error.message);
      logError(`Falha ao inserir evento na agenda ${this.id_agenda}: ${error.message}`);
      throw error;
    }
  }

  // MÉTODO DE BUSCA
  static async buscarPorAgenda(id_agenda) {
    if (!id_agenda) {
      throw new Error('O ID da agenda é obrigatório para a busca.');
    }
    try {
      const db = getDb();
      const eventos = await db.collection('eventos').find({ 
        id_agenda: new ObjectId(id_agenda) 
      }).toArray();
      return eventos;
    } catch (error) {
      logError(`Falha ao buscar eventos da agenda ${id_agenda}: ${error.message}`);
      throw error;
    }
  }

  // MÉTODO DELETAR
  async deletar() {
    if (!this.id) {
      throw new Error('O ID do evento é necessário para a deleção.');
    }
    try {
      const db = getDb();
      const resultado = await db.collection('eventos').deleteOne({ _id: new ObjectId(this.id) });
      
      if (resultado.deletedCount === 0) {
        console.warn(`Nenhum evento encontrado com o ID: ${this.id} para deletar.`);
      } else {
        console.log(`Evento com ID: ${this.id} deletado com sucesso.`);
      }
      return resultado;

    } catch (error) {
      logError(`Falha ao deletar evento com ID ${this.id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Evento;