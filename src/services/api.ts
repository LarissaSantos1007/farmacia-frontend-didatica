import type {
  Produto,
  NovoProdutoDTO,
  AtualizarProdutoDTO,
  Cliente,
  NovoClienteDTO,
  Pedido,
  NovoPedidoDTO,
  ItemPedido,
  ItemPedidoDTO
} from "../types";

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3333";

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.mensagem || data?.erro || data?.message || `Erro na requisição (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Teste de conexão
  async testarConexao(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // PRODUTOS
  produtos: {
    async listar(): Promise<Produto[]> {
      const res = await fetch(`${API_BASE_URL}/produtos`);
      return handleResponse<Produto[]>(res);
    },

    async listarAlerta(): Promise<Produto[]> {
      const res = await fetch(`${API_BASE_URL}/produtos/alerta`);
      return handleResponse<Produto[]>(res);
    },

    async cadastrar(produto: NovoProdutoDTO): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto)
      });
      return handleResponse<{ mensagem: string }>(res);
    },

    async atualizar(idProduto: number, campos: AtualizarProdutoDTO): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/produtos/${idProduto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos)
      });
      return handleResponse<{ mensagem: string }>(res);
    }
  },

  // CLIENTES
  clientes: {
    async listar(): Promise<Cliente[]> {
      const res = await fetch(`${API_BASE_URL}/clientes`);
      return handleResponse<Cliente[]>(res);
    },

    async cadastrar(cliente: NovoClienteDTO): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
      });
      return handleResponse<{ mensagem: string }>(res);
    }
  },

  // PEDIDOS
  pedidos: {
    async listar(): Promise<Pedido[]> {
      const res = await fetch(`${API_BASE_URL}/pedidos`);
      return handleResponse<Pedido[]>(res);
    },

    async obter(id: number): Promise<Pedido> {
      const res = await fetch(`${API_BASE_URL}/pedidos/${id}`);
      return handleResponse<Pedido>(res);
    },

    async itens(id: number): Promise<ItemPedido[]> {
      const res = await fetch(`${API_BASE_URL}/pedidos/${id}/itens`);
      return handleResponse<ItemPedido[]>(res);
    },

    async criar(pedido: NovoPedidoDTO): Promise<{ idVenda: number; mensagem: string; totalItens: number }> {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
      return handleResponse<{ idVenda: number; mensagem: string; totalItens: number }>(res);
    },

    async adicionarItem(idVenda: number, item: ItemPedidoDTO): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/pedidos/${idVenda}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      return handleResponse<{ mensagem: string }>(res);
    }
  },

  // ITENS DE VENDA
  itens: {
    async listarPorVenda(idVenda: number): Promise<ItemPedido[]> {
      const res = await fetch(`${API_BASE_URL}/itens/${idVenda}`);
      return handleResponse<ItemPedido[]>(res);
    },

    async atualizar(idVenda: number, idProduto: number, dados: { quantidade: number; precoUnit: number }): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/itens/${idVenda}/${idProduto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      return handleResponse<{ mensagem: string }>(res);
    },

    async remover(idVenda: number, idProduto: number): Promise<{ mensagem: string }> {
      const res = await fetch(`${API_BASE_URL}/itens/${idVenda}/${idProduto}`, {
        method: "DELETE"
      });
      return handleResponse<{ mensagem: string }>(res);
    }
  }
};
