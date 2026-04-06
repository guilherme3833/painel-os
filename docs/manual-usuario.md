# Manual do Usuário — Painel OS (Octek)

## Índice

1. [Acesso ao sistema](#1-acesso-ao-sistema)
2. [Página inicial (Home)](#2-página-inicial-home)
3. [Dashboard](#3-dashboard)
4. [Lista de OS](#4-lista-de-os)
5. [Fila de OS](#5-fila-de-os)
6. [Minhas OS](#6-minhas-os)
7. [Falta d'água](#7-falta-dágua)
8. [Log de Atividades](#8-log-de-atividades)
9. [Usuários e Perfis](#9-usuários-e-perfis)
10. [Meu Perfil](#10-meu-perfil)

---

## 1. Acesso ao sistema

**Endereço:** https://painel.octek.com.br

O login é feito com conta Google (Gmail). Ao acessar pela primeira vez, o sistema solicita autorização da conta Google e cria automaticamente o cadastro do usuário.

> Um administrador deve atribuir um perfil ao usuário antes que ele consiga acessar as páginas do sistema.

---

## 2. Página inicial (Home)

Após o login, o usuário é direcionado para a Home. A página exibe atalhos rápidos para todas as páginas que o perfil do usuário tem permissão de acessar.

Caso nenhum perfil tenha sido atribuído, a mensagem **"Nenhuma página disponível"** é exibida — contate o administrador.

---

## 3. Dashboard

Visão geral das ordens de serviço com gráficos e indicadores:

- Total de OS abertas e encerradas
- Distribuição por status
- OS abertas por período

Use o botão **Atualizar** para recarregar os dados manualmente.

---

## 4. Lista de OS

Listagem completa de ordens de serviço com filtros por status (aberta/encerrada), período e outros campos. Permite visualizar os detalhes de cada OS.

---

## 5. Fila de OS

Página principal de gestão da fila de atendimento de ordens de serviço abertas.

### 5.1 Visualização

Cada card exibe:
- **Nº da OS** — número de identificação
- **Serviço** — tipo de serviço
- **Endereço** — local do atendimento
- **Descrição** — clique para expandir o texto completo
- **Dias de espera** — badge colorido (azul < 15 dias, âmbar 15–30 dias, vermelho > 30 dias)
- **Atribuído a** — técnico responsável (quando houver)

### 5.2 Filtros

O card de filtros (topo da página) permite combinar:

| Filtro | Descrição |
|---|---|
| Nº OS | Busca pelo número da OS |
| Endereço | Busca parcial por rua ou bairro |
| Serviço | Multi-seleção de tipos de serviço |
| Atribuído a | Todos / Não atribuído / Por técnico |

O badge **"X ativos"** indica quantos filtros estão em uso. O botão **Limpar tudo** remove todos os filtros de uma vez.

### 5.3 Reordenação (requer permissão)

Usuários com permissão de reordenar podem:
- **Arrastar** os cards para qualquer posição
- Usar os botões laterais de cada card:
  - ↑↑ Mover para o topo da fila
  - ↑ Subir uma posição
  - ↓ Descer uma posição
  - ↓↓ Mover para o fim da fila

A ordem é salva automaticamente e refletida em tempo real para todos os usuários com a página aberta.

> A fila recarrega automaticamente a cada **1 minuto** para incluir OS novas ou encerradas no sistema de origem.

### 5.4 Atribuição de OS (requer permissão)

O botão de pessoa (ícone à direita do card) abre o modal de atribuição. São listados apenas os técnicos cujo perfil:
- Tem a permissão **"Receber atribuições"**
- Tem o serviço da OS incluído na sua lista de serviços permitidos

Para remover uma atribuição, abra o modal e clique em **Remover atribuição**.

### 5.5 Exportar

Botões **Excel** e **PDF** no cabeçalho exportam a lista atual **com os filtros aplicados**. O arquivo inclui: posição, nº OS, serviço, endereço, descrição, dias de espera e técnico atribuído.

---

## 6. Minhas OS

Página exclusiva para técnicos. Exibe apenas as OS atribuídas ao usuário logado, na mesma ordem de prioridade da Fila de OS.

A lista atualiza em tempo real quando uma nova OS é atribuída ou a ordem da fila muda.

---

## 7. Falta d'água

Dashboard de chamados do dia relacionados a falta d'água, agrupados por bairro e por tipo de protocolo.

### Configurar tipos (requer permissão)

O ícone de engrenagem (⚙️) no cabeçalho abre a tela de configuração. Marque os tipos de protocolo que devem ser considerados nos indicadores do dia.

> O painel recarrega automaticamente a cada **5 minutos**. Usuários sem permissão de configuração não visualizam a opção de intervalo de atualização.

---

## 8. Log de Atividades

Registro histórico de todas as ações realizadas pelos usuários nos últimos **300 dias**.

### Ações registradas

| Ação | Quando ocorre |
|---|---|
| Login | Ao entrar no sistema |
| Atribuiu OS | Ao atribuir uma OS a um técnico |
| Removeu atribuição | Ao remover a atribuição de uma OS |
| Reordenou fila | Ao alterar a ordem da fila |
| Alterou perfil de usuário | Ao mudar o perfil de um usuário |
| Alterou permissões | Ao salvar alterações em um perfil |
| Criou usuário | Ao cadastrar novo usuário |
| Deletou convite | Ao remover um convite |
| Configurou Falta d'água | Ao salvar os tipos configurados |

### Filtros

- **Busca** — por nome de usuário ou detalhe da ação
- **Usuário** — filtra por um usuário específico
- **Ação** — filtra por tipo de ação

### Exportar

Os botões **Excel** e **PDF** no rodapé do card de filtros exportam os registros com os filtros ativos aplicados.

---

## 9. Usuários e Perfis

> Acesso restrito a administradores.

### Aba Usuários

Lista todos os usuários cadastrados. O administrador pode alterar o perfil de cada usuário pelo seletor na linha correspondente.

Para cadastrar um novo usuário, informe o e-mail e selecione um perfil. O usuário receberá acesso ao fazer login com a conta Google correspondente.

### Aba Perfis

Gerencia os perfis de acesso. Cada perfil define:

- **Nome e cor** de identificação
- **Permissões por página** — quais páginas o perfil pode acessar e quais ações pode realizar
- **Serviços da fila** — lista de serviços que o perfil pode visualizar na Fila de OS (vazio = vê todos)

#### Permissões disponíveis por página

| Página | Permissões |
|---|---|
| Dashboard | Ver |
| Lista de OS | Ver |
| Fila de OS | Ver, Reordenar, Atribuir OS, Receber atribuições |
| Minhas OS | Ver |
| Falta d'água | Ver, Configurar tipos |
| Log de Atividades | Ver |
| Usuários | Ver |

---

## 10. Meu Perfil

Acesso pelo botão com foto/inicial no rodapé do menu lateral. Permite alterar o nome de exibição.

---

*Octek — Painel OS*
