# API Routes Documentation

## Public Routes (Sem autenticação)

### Authentication
- **POST** `/auth/register` - Registrar novo usuário
  - Body: `{ username, email, password }`
  - Response: `{ id, username, email }`

- **POST** `/auth/login` - Login com credenciais
  - Body: FormData `{ username, password }`
  - Response: `{ access_token, token_type }`

- **POST** `/token` - Alias para `/auth/login` (compatibilidade)
  - Body: FormData `{ username, password }`
  - Response: `{ access_token, token_type }`

### Chat
- **POST** `/chat/public` - Chat sem autenticação (para demo/testes)
  - Body: `{ message }`
  - Response: `{ chat_id, reply, message_id }`

### Health
- **GET** `/health` - Status da API
  - Response: `{ status, service, version }`

---

## Protected Routes (Requer autenticação com Bearer token)

### User
- **GET** `/me` - Obter usuário atual
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ id, username, email }`

### Chat Management
- **GET** `/chats` - Listar todos os chats do usuário
  - Headers: `Authorization: Bearer {token}`
  - Response: `[{ id, user_id, created_at, messages }]`

- **GET** `/chats/{chat_id}` - Obter chat específico
  - Headers: `Authorization: Bearer {token}`
  - Response: `{ id, user_id, created_at, messages }`

- **POST** `/chat` - Enviar mensagem (cria novo chat se necessário)
  - Headers: `Authorization: Bearer {token}`
  - Body: `{ message, chat_id? }`
  - Response: `{ chat_id, reply, message_id }`

---

## CORS Configuration

✅ Aceita todas as origens: `["*"]`
✅ Métodos permitidos: `GET, POST, PUT, DELETE, OPTIONS`
✅ Headers permitidos: `["*"]`
