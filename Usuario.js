const { getDb } = require('./db');
const { logError } = require('./logger');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

class Usuario {
  constructor(nome, email, senha, id = null) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha; 
  }

  async salvar() {
    //Validação de senha
    if (!this.nome || !this.email || !this.senha) {
      throw new Error('Nome, e-mail e senha são campos obrigatórios.');
    }

    //Hashear a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(this.senha, salt);

    try {
      const db = getDb();
      const collection = db.collection('usuarios');

      const result = await collection.insertOne({
        nome: this.nome,
        email: this.email,
        senha: senhaHash, // NOVO: Salva a senha hasheada
        criado_em: new Date(),
      });

      console.log('Usuário inserido com sucesso:', result.insertedId);
      return result;

    } catch (error) {
      console.error('Erro ao inserir usuário:', error.message);
      logError(`Falha ao inserir usuário ${this.email}: ${error.message}`);
      throw error;
    }
  }

  static async buscarPorEmail(email) {
    // ... (este método continua igual) ...
    if (!email) {
      throw new Error('O e-mail é obrigatório para a busca.');
    }
    try {
      const db = getDb();
      const usuario = await db.collection('usuarios').findOne({ email: email });
      return usuario;
    } catch (error) {
      logError(`Falha ao buscar usuário pelo e-mail ${email}: ${error.message}`);
      throw error;
    }
  }

  //Método de Login
  /**
   * Verifica se o e-mail e a senha correspondem a um usuário.
   * @param {string} email
   * @param {string} senha
   * @returns {Promise<object|null>} - Retorna o usuário se o login for válido, senão null.
   */
  static async login(email, senha) {
    try {
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return null; // Usuário não encontrado
      }

      // Compara a senha fornecida com a senha hasheada no banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (senhaValida) {
        return usuario; // Login bem-sucedido
      } else {
        return null; // Senha incorreta
      }
    } catch (error) {
      logError(`Erro durante tentativa de login para ${email}: ${error.message}`);
      throw error;
    }
  }

  async deletar() {
    if (!this.id) {
      throw new Error('O ID do usuário é necessário para a deleção.');
    }
    try {
      const db = getDb();
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