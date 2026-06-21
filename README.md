# 🧩 Associa! — Jogo de Associação de Conceitos

Jogo educacional onde você arrasta itens para a categoria certa antes do tempo
acabar. Resultado do TCC do curso de Sistemas para Internet (IFB).

Crie temas com categorias e itens, defina temas públicos ou privados (com senha)
e dispute o recorde de pontuação. ✅ acertos + ⏱️ tempo restante − ❌ erros.

## ✨ Stack

- **Backend:** Flask + Gunicorn (produção)
- **Banco:** MongoDB (local via Docker; MongoDB Atlas em produção)
- **Frontend:** HTML/Jinja + CSS moderno + JavaScript puro (sem jQuery)
- **Drag & drop:** Pointer Events nativos — funciona em desktop **e** mobile/touch

## 🚀 Rodar com Docker Compose (recomendado)

Sobe a aplicação **e** um MongoDB local de uma vez:

```bash
docker compose up --build
```

Acesse: <http://localhost:3000>

## 🧑‍💻 Rodar localmente (sem Docker)

Requer um MongoDB acessível (defina `MONGO_URI`).

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # ajuste MONGO_URI se necessário
python runserver.py             # servidor de desenvolvimento na porta 3000
```

## ⚙️ Variáveis de ambiente

| Variável    | Descrição                                   | Padrão                      |
| ----------- | ------------------------------------------- | --------------------------- |
| `MONGO_URI` | String de conexão do MongoDB                | `mongodb://localhost:27017` |
| `MONGO_DB`  | Nome do banco                               | `project-game`              |
| `PORT`      | Porta HTTP (o Render injeta automaticamente) | `3000`                      |

## ☁️ Deploy no Render

O repositório já inclui `render.yaml` e um `Dockerfile` de produção (Gunicorn,
respeitando a env `$PORT` do Render).

1. **New → Blueprint** e aponte para este repositório (lê o `render.yaml`), ou
   crie um **Web Service** do tipo **Docker**.
2. Em **Environment**, defina `MONGO_URI` com a string do seu cluster
   **MongoDB Atlas** (TLS é detectado automaticamente).
3. Deploy. O Render usa o `Dockerfile` e o comando
   `gunicorn --bind 0.0.0.0:$PORT runserver:app`.

## 🔒 Segurança

- Senhas de temas privados são armazenadas com **hash** (`werkzeug.security`).
- A verificação de senha acontece **no servidor** (`POST /verify_password/<id>`),
  sem expor o hash ao navegador.

## 🗺️ Rotas principais

| Método | Rota                    | Descrição                  |
| ------ | ----------------------- | -------------------------- |
| GET    | `/`                     | Lista de temas             |
| GET    | `/tema/<id>`            | Tela de jogo               |
| GET    | `/formulario/novo`      | Criar tema                 |
| GET    | `/formulario/<id>`      | Editar tema                |
| POST   | `/create_theme`         | Cria tema                  |
| PUT    | `/update_theme/<id>`    | Atualiza tema              |
| DELETE | `/delete_theme/<id>`    | Remove tema                |
| POST   | `/verify_password/<id>` | Valida senha de tema privado |
| POST   | `/save_score`           | Salva pontuação            |
