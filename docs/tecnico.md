# Documento Técnico — Painel OS (Octek)

## Índice

1. [Visão geral da arquitetura](#1-visão-geral-da-arquitetura)
2. [Servidores e infraestrutura](#2-servidores-e-infraestrutura)
3. [Frontend](#3-frontend)
4. [Backend — n8n e MySQL](#4-backend--n8n-e-mysql)
5. [Firebase](#5-firebase)
6. [Estrutura de dados — Firestore](#6-estrutura-de-dados--firestore)
7. [Regras de segurança — Firestore](#7-regras-de-segurança--firestore)
8. [Sistema de permissões](#8-sistema-de-permissões)
9. [Estrutura do código-fonte](#9-estrutura-do-código-fonte)
10. [Deploy e publicação](#10-deploy-e-publicação)
11. [Workflows n8n](#11-workflows-n8n)
12. [Banco de dados MySQL](#12-banco-de-dados-mysql)

---

## 1. Visão geral da arquitetura

```
Usuário (browser)
      │
      ▼
painel.octek.com.br          ← Frontend React (Nginx + SSL)
      │
      ├── Firebase Auth       ← Autenticação Google
      ├── Cloud Firestore     ← Dados em tempo real (fila, atribuições, config, logs)
      │
      └── automacao.octek.com.br  ← n8n webhooks (dados MySQL)
                │
                └── MySQL    ← Banco de dados principal (OS, chamados, etc.)
```

O frontend consome dois tipos de dados:
- **Firestore** — dados operacionais em tempo real (ordem da fila, atribuições, configurações, logs de atividade)
- **n8n webhooks** — dados do MySQL (lista de OS, chamados do dia, tipos de protocolo)

---

## 2. Servidores e infraestrutura

### Servidor do Painel (Frontend)

| Item | Valor |
|---|---|
| Domínio | painel.octek.com.br |
| Protocolo | HTTPS (SSL via Certbot / Let's Encrypt) |
| Servidor web | Nginx |
| Conteúdo servido | Arquivos estáticos do build React (`dist/`) |
| Deploy | Cópia manual do `dist/` para o diretório do Nginx |

Configuração básica do Nginx:
```nginx
server {
    listen 443 ssl;
    server_name painel.octek.com.br;
    root /var/www/painel-os/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Servidor de Automação (Backend)

| Item | Valor |
|---|---|
| Domínio | automacao.octek.com.br |
| Protocolo | HTTPS |
| Servidor web | Caddy (reverse proxy para n8n) |
| Aplicação | n8n (self-hosted) |
| Banco de dados | MySQL (acesso interno pelo n8n) |

---

## 3. Frontend

### Stack

| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Interface de usuário |
| Vite | 8 | Bundler e dev server |
| Tailwind CSS | 4 | Estilização |
| Firebase SDK | 12 | Auth + Firestore |
| @dnd-kit | 6/10 | Drag-and-drop na Fila de OS |
| echarts-for-react | 3 | Gráficos (Dashboard, Falta d'água) |
| xlsx | 0.18 | Exportação Excel |
| jspdf + jspdf-autotable | 4/5 | Exportação PDF |

### Variáveis de ambiente

O Firebase é configurado diretamente em `src/firebase.js` com as credenciais do projeto Firebase (não utiliza `.env` — as chaves do Firebase SDK são públicas por design, a segurança é feita pelas Firestore Rules).

### Build e desenvolvimento

```bash
npm run dev       # Servidor de desenvolvimento (localhost:5173)
npm run build     # Gera build de produção em dist/
npm run preview   # Preview do build localmente
```

---

## 4. Backend — n8n e MySQL

O n8n atua como middleware entre o frontend e o MySQL. Cada funcionalidade tem um webhook dedicado:

| Endpoint | Método | Descrição |
|---|---|---|
| `/webhook/os/fila` | GET | Lista todas as OS abertas da fila |
| `/webhook/chamados/dia` | GET | Chamados do dia (por tipo, bairro, hora) |
| `/webhook/chamados/resumo` | GET | Resumo de chamados por período |
| `/webhook/chamados/tipos` | GET | Lista de tipos de protocolo disponíveis |
| `/webhook/ordens` | GET | Lista geral de ordens de serviço |

> **Atenção de segurança:** Os webhooks não têm autenticação atualmente. Qualquer pessoa com o endereço pode consultá-los. Recomenda-se adicionar Header Auth ou Basic Auth no n8n em um momento futuro.

---

## 5. Firebase

### Projeto Firebase

- **Autenticação:** Google Sign-In (único provedor ativo)
- **Banco de dados:** Cloud Firestore (modo nativo)

### Autenticação

O fluxo de login:
1. Usuário clica em "Entrar com Google" → Firebase Auth abre popup OAuth
2. Firebase retorna o objeto `user` com `uid`, `email`, `displayName`, `photoURL`
3. `buscarOuCriarUsuario(user)` consulta `usuarios/{uid}` no Firestore
4. Se não existir, cria o documento com `roleId: 'visualizador'`
5. Busca `roles/{roleId}` para obter `permissoes` e `servicos_fila`
6. Registra log de login na coleção `logs`

---

## 6. Estrutura de dados — Firestore

### Coleção `usuarios/{uid}`

```json
{
  "uid": "abc123",
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "roleId": "tecnico_agua",
  "criadoEm": "Timestamp"
}
```

### Coleção `roles/{roleId}`

```json
{
  "nome": "Técnico Água",
  "cor": "blue",
  "permissoes": {
    "fila_os": { "ver": true, "aceitar_atribuicao": true },
    "minhas_os": { "ver": true }
  },
  "servicos_fila": ["MANUTENÇÃO DE REDE", "LIGAÇÃO DE ÁGUA"]
}
```

> `servicos_fila` vazio (`[]`) significa que o perfil vê todos os serviços.

### Coleção `convites/{email}`

```json
{
  "roleId": "tecnico_agua",
  "criadoPor": "uid_do_admin",
  "criadoEm": "Timestamp"
}
```

### Coleção `config/{docId}`

| Documento | Conteúdo |
|---|---|
| `falta_agua` | `{ ids: [1, 3, 7] }` — IDs dos tipos de protocolo selecionados |
| `fila_os` | `{ ordem: [1042, 1038, 1055, ...] }` — códigos das OS em ordem |
| `fila_os_atribuicao` | `{ "1042": { uid: "abc", nome: "João" }, ... }` |

### Coleção `logs/{docId}`

```json
{
  "uid": "abc123",
  "nome": "João Silva",
  "acao": "atribuiu_os",
  "detalhes": { "os": "10425", "para": "Carlos" },
  "criadoEm": "Timestamp (serverTimestamp)"
}
```

**Ações registradas:** `login`, `atribuiu_os`, `removeu_atribuicao`, `reordenou_fila`, `alterou_role`, `criou_usuario`, `deletou_convite`, `alterou_perfil`, `configurou_falta_agua`

---

## 7. Regras de segurança — Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.roleId == 'admin';
    }

    match /usuarios/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow delete: if request.auth != null && isAdmin();
    }

    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }

    match /convites/{email} {
      allow read: if request.auth != null && (request.auth.token.email == email || isAdmin());
      allow create: if request.auth != null && isAdmin();
      allow update: if request.auth != null;
      allow delete: if request.auth != null && isAdmin();
    }

    match /config/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }

    match /logs/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 8. Sistema de permissões

### Fluxo de verificação

```
Login → buscarOuCriarUsuario()
      → roles/{roleId} → { permissoes, servicos_fila }
      → AuthContext disponibiliza:
          usuario         → objeto Firebase Auth
          role            → string (ex: "tecnico_agua")
          permissoes      → objeto com permissões por página
          servicosPermitidos → array de serviços
          podeVer(pagina) → boolean
          temPermissao(pagina, acao) → boolean
```

### Admin bypass

O `roleId = 'admin'` retorna `true` em todas as chamadas de `podeVer()` e `temPermissao()`, sem consultar o objeto de permissões.

### Filtragem de serviços (Fila de OS)

```
servicosPermitidos = role.servicos_fila
se vazio → usuário vê todas as OS
se preenchido → filtra lista de OS por os.servico ∈ servicosPermitidos
```

O mesmo filtro é aplicado no `ModalAtribuir`: um técnico só aparece como opção de atribuição se o serviço da OS estiver no `servicos_fila` do perfil dele.

---

## 9. Estrutura do código-fonte

```
src/
├── App.jsx                  # Roteamento entre páginas
├── firebase.js              # Todas as funções de acesso ao Firebase
├── constants.js             # PAGINAS_CONFIG, permissões padrão, utilitários
├── contexts/
│   └── AuthContext.jsx      # Estado de autenticação e permissões
├── components/
│   ├── Sidebar.jsx          # Menu lateral com navegação
│   └── Toast.jsx            # Notificações temporárias
└── pages/
    ├── Login.jsx            # Tela de login Google
    ├── Home.jsx             # Atalhos rápidos por permissão
    ├── Dashboard.jsx        # Gráficos e indicadores de OS
    ├── Lista.jsx            # Listagem geral de OS
    ├── FilaOS.jsx           # Fila com drag-and-drop, filtros, atribuição, export
    ├── MinhasOS.jsx         # OS atribuídas ao usuário logado
    ├── ProtocolosDia.jsx    # Dashboard Falta d'água
    ├── Protocolos.jsx       # Dashboard de chamados por período
    ├── Logs.jsx             # Log de atividades com filtros e export
    ├── Usuarios.jsx         # Gestão de usuários e perfis
    └── Perfil.jsx           # Perfil do usuário logado

db/
└── callCenterSQL.sql        # Schema da tabela Ordem_Servico

n8n-workflows/
├── os-fila.json             # Workflow: lista OS abertas
├── chamados-dia.json        # Workflow: chamados do dia por tipo/bairro
├── chamados-resumo.json     # Workflow: resumo por período
├── chamados-tipos.json      # Workflow: tipos de protocolo
└── ordens.json              # Workflow: listagem geral de OS

docs/
├── manual-usuario.md        # Este manual
└── tecnico.md               # Este documento
```

---

## 10. Deploy e publicação

### Processo atual (manual)

```bash
# 1. Gerar build de produção
npm run build

# 2. Copiar dist/ para o servidor via SCP ou FTP
# 3. Substituir os arquivos no diretório do Nginx
```

### Variáveis de ambiente de build

Não há `.env` — as credenciais do Firebase estão em `src/firebase.js`. Isso é aceitável pois as Firebase API keys são projetadas para serem públicas; a segurança real está nas Firestore Rules.

---

## 11. Workflows n8n

### os-fila

**Endpoint:** `GET /webhook/os/fila`

```sql
SELECT codigo, numero, data_abertura, descricao, servico, endereco_final
FROM Ordem_Servico
WHERE encerrado = 'n'
ORDER BY data_abertura ASC
```

### chamados-dia

**Endpoint:** `GET /webhook/chamados/dia?ids=1,3,7`

Executa 3 queries em paralelo (por tipo, por bairro, por hora) com filtro `AND c.id_tipo IN (ids)`. Retorna os três conjuntos de dados mesclados em um único response via nó Merge.

### chamados-tipos

**Endpoint:** `GET /webhook/chamados/tipos`

Retorna a lista de tipos de protocolo disponíveis no call center para seleção na configuração do Falta d'água.

---

## 12. Banco de dados MySQL

### Tabela principal: `Ordem_Servico`

Campos relevantes para o painel:

| Campo | Tipo | Descrição |
|---|---|---|
| `codigo` | INT PK | Identificador único da OS |
| `numero` | VARCHAR | Número de exibição |
| `data_abertura` | DATETIME | Data de abertura |
| `encerrado` | CHAR(1) | `'n'` = aberta, `'s'` = encerrada |
| `descricao` | TEXT | Descrição do problema |
| `servico` | VARCHAR | Tipo de serviço |
| `endereco_final` | VARCHAR | Endereço do atendimento |
| `solicitante` | VARCHAR | Nome do solicitante |
| `executor` | VARCHAR | Técnico executor |
| `situacao_descricao` | VARCHAR | Status atual |
| `latitude` / `longitude` | DECIMAL | Geolocalização |
| `data_criacao_cogesan` | DATETIME | Data de criação no sistema externo |
| `data_limite_execucao` | DATETIME | Prazo de execução |
| `data_inicio_execucao` | DATETIME | Início do atendimento |
| `data_fim_execucao` | DATETIME | Conclusão do atendimento |
| `cogesan_os` | VARCHAR | Referência no sistema Cogesan |
| `uc` | VARCHAR | Unidade consumidora |
| `hidrometro` | VARCHAR | Número do hidrômetro |

> O schema completo está em `db/callCenterSQL.sql`.

---

*Octek — Painel OS — Documento Técnico*
