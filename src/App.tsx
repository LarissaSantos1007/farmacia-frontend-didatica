import { useState, useEffect, useCallback } from 'react';
import { Navbar, type NavTab } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { ClientesPage } from './pages/ClientesPage';
import { PedidosPage } from './pages/PedidosPage';
import { AlertasPage } from './pages/AlertasPage';
import { LoginModal } from './components/LoginModal';
import { api } from './services/api';
import type { Produto, Cliente, Pedido, NovoProdutoDTO, AtualizarProdutoDTO, NovoClienteDTO, NovoPedidoDTO } from './types';

export function App() {
  const [tabAtual, setTabAtual] = useState<NavTab>('dashboard');
  const [usuario, setUsuario] = useState<string | null>(() => {
    return localStorage.getItem('farmacia_usuario') || 'Farmacêutico Responsável';
  });
  const [mostrarLogin, setMostrarLogin] = useState<boolean>(false);
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  // Dados globais
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [alertas, setAlertas] = useState<Produto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Estados de loading
  const [carregandoProdutos, setCarregandoProdutos] = useState<boolean>(false);
  const [carregandoClientes, setCarregandoClientes] = useState<boolean>(false);
  const [carregandoPedidos, setCarregandoPedidos] = useState<boolean>(false);

  // Modais de atalho rápido
  const [modalNovoProduto, setModalNovoProduto] = useState<boolean>(false);
  const [modalNovoCliente, setModalNovoCliente] = useState<boolean>(false);
  const [modalNovoPedido, setModalNovoPedido] = useState<boolean>(false);

  // Carregamento de dados da API
  const carregarProdutos = useCallback(async () => {
    setCarregandoProdutos(true);
    try {
      const [lista, listaAlerta] = await Promise.all([
        api.produtos.listar(),
        api.produtos.listarAlerta()
      ]);
      setProdutos(lista || []);
      setAlertas(listaAlerta || []);
      setApiOnline(true);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setApiOnline(false);
    } finally {
      setCarregandoProdutos(false);
    }
  }, []);

  const carregarClientes = useCallback(async () => {
    setCarregandoClientes(true);
    try {
      const lista = await api.clientes.listar();
      setClientes(lista || []);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setCarregandoClientes(false);
    }
  }, []);

  const carregarPedidos = useCallback(async () => {
    setCarregandoPedidos(true);
    try {
      const lista = await api.pedidos.listar();
      setPedidos(lista || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setCarregandoPedidos(false);
    }
  }, []);

  const carregarTodosDados = useCallback(() => {
    carregarProdutos();
    carregarClientes();
    carregarPedidos();
  }, [carregarProdutos, carregarClientes, carregarPedidos]);

  useEffect(() => {
    carregarTodosDados();
    // Teste de conexão periódico
    const timer = setInterval(() => {
      api.testarConexao().then(setApiOnline);
    }, 15000);
    return () => clearInterval(timer);
  }, [carregarTodosDados]);

  // Ações de Produtos
  const handleCadastrarProduto = async (dados: NovoProdutoDTO): Promise<boolean> => {
    try {
      await api.produtos.cadastrar(dados);
      await carregarProdutos();
      return true;
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      return false;
    }
  };

  const handleAtualizarProduto = async (idProduto: number, dados: AtualizarProdutoDTO): Promise<boolean> => {
    try {
      await api.produtos.atualizar(idProduto, dados);
      await carregarProdutos();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      return false;
    }
  };

  // Ações de Clientes
  const handleCadastrarCliente = async (dados: NovoClienteDTO): Promise<boolean> => {
    try {
      await api.clientes.cadastrar(dados);
      await carregarClientes();
      return true;
    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
      return false;
    }
  };

  // Ações de Pedidos
  const handleCriarPedido = async (dados: NovoPedidoDTO): Promise<{ sucesso: boolean; mensagem?: string }> => {
    try {
      await api.pedidos.criar(dados);
      await carregarPedidos();
      await carregarProdutos(); // Atualiza estoque que baixou via trigger
      return { sucesso: true };
    } catch (err: any) {
      console.error('Erro ao criar pedido:', err);
      return { sucesso: false, mensagem: err?.message || 'Erro ao realizar venda' };
    }
  };

  const handleLogin = (novoNome: string) => {
    setUsuario(novoNome);
    localStorage.setItem('farmacia_usuario', novoNome);
    setMostrarLogin(false);
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('farmacia_usuario');
    setMostrarLogin(true);
  };

  return (
    <div className="app-container">
      <Navbar
        currentTab={tabAtual}
        onSelectTab={setTabAtual}
        alertaCount={alertas.length}
        apiOnline={apiOnline}
        usuario={usuario}
        onLogin={() => setMostrarLogin(true)}
        onLogout={handleLogout}
      />

      <main className="main-wrapper">
        {!apiOnline && (
          <div className="alert-box alert-danger">
            <span>
              ⚠️ <strong>Backend desconectado:</strong> Certifique-se de que o servidor da API (<code>farmacia-backend-didatica</code>) está rodando na porta <strong>3333</strong> (<code>npm run dev</code>).
            </span>
          </div>
        )}

        {tabAtual === 'dashboard' && (
          <DashboardPage
            produtos={produtos}
            clientes={clientes}
            pedidos={pedidos}
            alertas={alertas}
            onNavigate={setTabAtual}
            onNovoProduto={() => {
              setTabAtual('produtos');
              setModalNovoProduto(true);
            }}
            onNovoCliente={() => {
              setTabAtual('clientes');
              setModalNovoCliente(true);
            }}
            onNovoPedido={() => {
              setTabAtual('pedidos');
              setModalNovoPedido(true);
            }}
          />
        )}

        {tabAtual === 'produtos' && (
          <ProdutosPage
            produtos={produtos}
            carregando={carregandoProdutos}
            onCadastrar={handleCadastrarProduto}
            onAtualizar={handleAtualizarProduto}
            abrirModalNovo={modalNovoProduto}
            setAbrirModalNovo={setModalNovoProduto}
          />
        )}

        {tabAtual === 'clientes' && (
          <ClientesPage
            clientes={clientes}
            carregando={carregandoClientes}
            onCadastrar={handleCadastrarCliente}
            abrirModalNovo={modalNovoCliente}
            setAbrirModalNovo={setModalNovoCliente}
          />
        )}

        {tabAtual === 'pedidos' && (
          <PedidosPage
            pedidos={pedidos}
            produtos={produtos}
            clientes={clientes}
            carregando={carregandoPedidos}
            onCriarPedido={handleCriarPedido}
            abrirModalNovo={modalNovoPedido}
            setAbrirModalNovo={setModalNovoPedido}
            aoAtualizarDados={carregarTodosDados}
          />
        )}

        {tabAtual === 'alertas' && (
          <AlertasPage
            alertas={alertas}
            carregando={carregandoProdutos}
            onAtualizarEstoque={handleAtualizarProduto}
            onRecarregar={carregarProdutos}
          />
        )}
      </main>

      {mostrarLogin && (
        <LoginModal
          onLogin={handleLogin}
          onCancelar={() => setMostrarLogin(false)}
        />
      )}
    </div>
  );
}
export default App;
