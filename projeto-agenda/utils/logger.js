const fs = require('fs');
const path = require('path');

// Cria o caminho para o arquivo de log na raiz do projeto
const logFilePath = path.join(__dirname, '..', 'errors.log');

/**
 * Função para registrar uma mensagem de erro no arquivo de log.
 * @param {string} errorMessage - A mensagem de erro a ser registrada.
 */
function logError(errorMessage) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ERRO: ${errorMessage}\n`;

  // 'fs.appendFileSync' adiciona o texto ao final do arquivo.
  // Se o arquivo não existir, ele é criado.
  fs.appendFileSync(logFilePath, logMessage);
}

module.exports = { logError };