const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://vitorsilva2022_db_user:1234@cluster0.77xopb3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

let db;

async function connectToDb() {
  if (db) {
    return db;
  }
  try {
    await client.connect();
    console.log("Conectado ao MongoDB Atlas com sucesso!");
    // O nome do banco de dados será "agenda_db"
    db = client.db("agenda_db"); 
    return db;
  } catch (error) {
    console.error("Não foi possível conectar ao MongoDB", error);
    process.exit(1); 
  }
}

function getDb() {
  if (!db) {
    throw new Error('A conexão com o banco de dados não foi estabelecida.');
  }
  return db;
}

module.exports = { connectToDb, getDb };