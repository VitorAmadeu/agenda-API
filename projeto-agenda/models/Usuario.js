const { getDb } = require('../config/db');
const { logError } = require('../utils/logger');
const { ObjectId } = require('mongodb'); // Importante: Precisamos do ObjectId para buscar e deletar por ID

class Usuario {
  constructor(nome, email, id = null) {
    this.id = id;
    this.nome = nome;
    this.email = email;
  }

  async salvar() {
    //Verificação de preenchimento 
    if (!this.nome || !this.email) {
      throw new Error('Nome e e-mail são campos obrigatórios.');
    }

    try {
      const db = getDb();
      const collection = db.collection('usuarios');

      const result = await collection.insertOne({
        nome: this.nome,
        email: this.email,
        criado_em: new Date(),
      });

      console.log('Usuário inserido com sucesso:', result.insertedId);
      return result;

    } catch (error) {
      // 2. Tratamento de exceções (continua igual)
      console.error('Erro ao inserir usuário:', error.message);
      logError(`Falha ao inserir usuário ${this.email}: ${error.message}`);
      throw error;
    }
  }

  //MÉTODO DE BUSCA
  /**
   * Busca um usuário pelo e-mail.
   * @param {string} email - O e-mail do usuário a ser buscado.
   * @returns {Promise<object|null>} - Retorna o documento do usuário ou null se não for encontrado.
   */
  static async buscarPorEmail(email) {
    if (!email) {
      throw new Error('O e-mail é obrigatório para a busca.');
    }
    try {
      const db = getDb();
      // O método findOne retorna o primeiro documento que corresponde à busca
      const usuario = await db.collection('usuarios').findOne({ email: email });
      return usuario;
    } catch (error) {
      logError(`Falha ao buscar usuário pelo e-mail ${email}: ${error.message}`);
      throw error;
    }
  }

  // MÉTODO DELETAR
  /**
   * Deleta o usuário do banco de dados com base no seu ID.
   * @returns {Promise<object>} - Retorna o resultado da operação de deleção.
   */
  async deletar() {
    if (!this.id) {
      throw new Error('O ID do usuário é necessário para a deleção.');
    }
    try {
      const db = getDb();
      // Usamos 'new ObjectId(this.id)' para converter a string do ID para o formato do MongoDB
      const resultado = await db.collection('usuarios').deleteOne({ _id: new ObjectId(this.id) });
      
      if (resultado.deletedCount === 0) {
        console.warn(`Nenhum usuário encontrado com o ID: ${this.id} para deletar.`);
      } else {
        console.log(`Usuário com ID: ${this.id} deletado com sucesso.`);
      }
      return resultado;

    } catch (error) {
      logError(`Falha ao deletar usuário com ID ${this.id}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = Usuario;