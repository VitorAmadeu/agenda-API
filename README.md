# API de Agenda Eletrônica (Projeto 2)

[cite_start]Este projeto é uma API RESTful completa para um sistema de agenda eletrônica, desenvolvida para a disciplina de Programação Web Back-End[cite: 39, 42].

[cite_start]A aplicação utiliza as classes de acesso a dados (Models) do Projeto 1 e constrói sobre elas um servidor web com Express.js[cite: 42]. [cite_start]O sistema implementa uma rotina de autenticação segura com senhas criptografadas, gerenciamento de sessão e endpoints protegidos para criar e gerenciar agendas e eventos[cite: 44, 52]. [cite_start]Todas as respostas são fornecidas no formato JSON[cite: 45].

## Tecnologias Utilizadas

* **Node.js**
* [cite_start]**Express.js:** Gerenciamento do servidor e das rotas (endpoints)[cite: 42].
* **MongoDB:** Banco de dados NoSQL.
* [cite_start]**express-session:** Gerenciamento de sessões de usuário para autenticação[cite: 44].
* **bcrypt:** Criptografia (hash) de senhas para armazenamento seguro.

## Funcionalidades Implementadas

* [cite_start]**Rotina de Login:** Implementação de `POST /registrar` e `POST /login`[cite: 52].
* **Autenticação Segura:** Senhas são salvas no banco usando hash `bcrypt`.
* **Uso de Sessões:** Rotas de "Agendas" e "Eventos" são protegidas e só podem ser acessadas por usuários logados (autenticados).
* **Implementação dos Casos de Uso:** Endpoints para Criar, Listar e Deletar Agendas e Eventos.
* **Validação:** Verificação de campos obrigatórios em todas as rotas que recebem dados.

## Como Executar

1.  **Instalar dependências:**
    ```bash
    npm install
    ```
2.  **Iniciar o servidor:**
    ```bash
    node server.js
    ```
3.  O servidor estará rodando em `http://localhost:3000`.

## Guia de Teste no Postman

Para testar a API, use um cliente como o Postman ou Insomnia.

**Importante:** Esta API usa sessões baseadas em cookies. Após fazer o `POST /login`, o Postman salvará automaticamente o cookie de sessão. Todas as requisições seguintes (para rotas protegidas) usarão esse cookie para provar que você está logado.

---

### 1. Autenticação (Acesso Público)

Estas são as rotas para criar uma conta e iniciar uma sessão.

#### `POST /registrar`
Cria um novo usuário no sistema.

* **URL:** `http://localhost:3000/registrar`
* **Prototipo (Body -> raw -> JSON):**
    ```json
    {
        "nome": "Seu Nome",
        "email": "teste@email.com",
        "senha": "123"
    }
    ```

#### `POST /login`
Autentica um usuário e inicia uma sessão (cria o cookie).

* **URL:** `http://localhost:3000/login`
* **Prototipo (Body -> raw -> JSON):**
    ```json
    {
        "email": "teste@email.com",
        "senha": "123"
    }
    ```
    *Obs: Você deve receber uma mensagem de "Login bem-sucedido!".*

---

### 2. Rotas Protegidas (Requer Login)

Se você tentar acessar qualquer uma destas rotas *antes* de fazer login, receberá um erro `401 Unauthorized`.

#### `POST /agendas`
Cria uma nova agenda (calendário) para o usuário logado.

* **URL:** `http://localhost:3000/agendas`
* **Prototipo (Body -> raw -> JSON):**
    ```json
    {
        "titulo": "Agenda da Faculdade"
    }
    ```

#### `GET /agendas`
Lista todas as agendas que pertencem ao usuário logado.

* **URL:** `http://localhost:3000/agendas`
* *(Não precisa de Body)*
* **Ação:** Copie o `_id` de uma agenda criada para usar no próximo passo.

#### `POST /eventos`
Cria um novo evento dentro de uma das suas agendas.

* **URL:** `http://localhost:3000/eventos`
* **Prototipo (Body -> raw -> JSON):**
    *Use o `_id` da agenda que você copiou no passo anterior.*
    ```json
    {
        "titulo": "Prova de Back-End",
        "data_inicio": "2025-11-20T19:00:00Z",
        "id_agenda": "COLE_O_ID_DA_SUA_AGENDA_AQUI"
    }
    ```

#### `GET /eventos/agenda/:id_agenda`
Lista todos os eventos de uma agenda específica.

* **URL:** `http://localhost:3000/eventos/agenda/COLE_O_ID_DA_SUA_AGENDA_AQUI`
* *(Não precisa de Body)*
* **Ação:** Copie o `_id` de um evento criado para usar no passo de deleção.

#### `DELETE /agendas/:id`
Deleta uma agenda específica (e todos os eventos dentro dela, se você implementou a melhoria).

* **URL:** `http://localhost:3000/agendas/COLE_O_ID_DA_AGENDA_AQUI`
* *(Não precisa de Body)*

#### `DELETE /eventos/:id`
Deleta um evento específico.

* **URL:** `http://localhost:3000/eventos/COLE_O_ID_DO_EVENTO_AQUI`
* *(Não precisa de Body)*

---

### 3. Encerramento

#### `POST /logout`
Encerra a sessão atual e destrói o cookie.

* **URL:** `http://localhost:3000/logout`
* *(Não precisa de Body)*
* *Após rodar este comando, se você tentar acessar `GET /agendas` novamente, receberá o erro 401.*
