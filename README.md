# 💊 Farmácia Didática - Frontend

Aplicação frontend desenvolvida para gerenciamento de estoque, clientes e pedidos da **Farmácia Didática**, consumindo os serviços da API REST (`farmacia-backend-didatica`).

---

## 📋 Requisitos do Frontend

O Frontend permite ao usuário utilizar as principais funcionalidades disponibilizadas pela API:

- **Visualização dos registros**:
  - Listagem completa de produtos com status de estoque (normal / alerta crítico).
  - Listagem de clientes cadastrados no sistema.
  - Listagem detalhada de pedidos realizados com histórico de itens e valores.
  - Painel dedicado de alertas de estoque mínimo em tempo real.
- **Cadastro de novos registros**:
  - Cadastro de novos medicamentos/produtos (descrição, preço, estoque inicial, estoque mínimo, validade).
  - Cadastro de novos clientes com validação de nome e CPF.
  - Criação de novos pedidos com múltiplos produtos e quantidades.
- **Edição dos registros existentes**:
  - Atualização dos dados do produto (descrição, preço, quantidade em estoque, estoque mínimo e validade).
  - Edição de itens vinculados a pedidos.
- **Exclusão ou remoção de registros**:
  - Remoção de itens de venda/pedido com feedback visual instantâneo.
- **Navegação entre as diferentes funcionalidades da aplicação**:
  - Barra de navegação com transição entre Dashboard, Produtos, Clientes, Pedidos e Alertas.
  - Indicador de status de conexão com o backend.
  - Simulação de sessão com login/logout e exibição do usuário ativo.
- **Apresentação adequada das informações retornadas pela API**:
  - Formatação monetária (R$), datas no padrão brasileiro e badges informativos.
  - Tratamento e exibição de mensagens de erro claras (ex.: aviso de *estoque insuficiente* emitido pela trigger do banco de dados).
- **Interface e Usabilidade**:
  - Layout limpo, responsivo, intuitivo e com foco na facilidade de testes para avaliação didática.

---

## 🛠️ Tecnologias Utilizadas (Stack)

- **React 18**: Biblioteca para construção de interfaces reativas e modulares.
- **TypeScript**: Tipagem estática garantindo robustez e prevenção de erros em tempo de desenvolvimento.
- **Vite**: Ferramenta de build ultrarrápida para desenvolvimento moderno.
- **Lucide Icons**: Pacote de ícones consistente e leve.
- **CSS Modular Moderno**: Estilização responsiva com variáveis CSS, suporte a temas e layout flexível.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
1. **Node.js** (versão 18 ou superior instalada).
2. **Backend da Farmácia** (`farmacia-backend-didatica`) rodando na porta `3333` com PostgreSQL ativo.

### Passo a Passo

1. **Clone ou navegue até o diretório do frontend:**
   ```bash
   cd farmacia-frontend-didatica
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador:**
   - Abra [http://localhost:5173](http://localhost:5173).

5. **Para gerar o build de produção:**
   ```bash
   npm run build
   ```

---

## 🔗 Integração com as Rotas da API (`http://localhost:3333`)

| Módulo | Método | Rota | Descrição |
|---|---|---|---|
| **Clientes** | `GET` | `/clientes` | Lista todos os clientes cadastrados |
| | `POST` | `/clientes` | Cadastra um novo cliente |
| **Produtos** | `GET` | `/produtos` | Lista todos os produtos com status de alerta |
| | `GET` | `/produtos/alerta` | Lista apenas produtos com estoque $\le$ mínimo |
| | `POST` | `/produtos` | Cadastra um novo medicamento/produto |
| | `PUT` | `/produtos/:idProduto` | Atualiza dados e estoque de um produto |
| **Pedidos** | `GET` | `/pedidos` | Lista todos os pedidos cadastrados |
| | `GET` | `/pedidos/:id` | Obtém os detalhes de um pedido específico |
| | `GET` | `/pedidos/:id/itens` | Lista os itens de um pedido |
| | `POST` | `/pedidos` | Registra novo pedido com lista de itens |
| | `POST` | `/pedidos/:id/itens` | Adiciona um item avulso a um pedido existente |
| **Itens de Venda** | `GET` | `/itens/:idVenda` | Lista itens de uma venda específica |
| | `POST` | `/itens` | Insere novo item em uma venda |
| | `PUT` | `/itens/:idVenda/:idProduto` | Atualiza quantidade/preço de item do pedido |
| | `DELETE` | `/itens/:idVenda/:idProduto` | Remove item da venda |

---

## 📦 Instruções para Entrega

Ao final da atividade, entregue o link do seu repositório no GitHub para cada Stack:
- O projeto funcionando (de cada Stack).
- O histórico de commits realizados durante o desenvolvimento.
- As alterações enviadas para o seu próprio Fork.
- A aplicação funcionando localmente seguindo as instruções acima.
