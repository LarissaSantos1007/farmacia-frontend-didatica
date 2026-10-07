export interface Produto {
  idProduto: number;
  descricao: string;
  preco: number | string;
  qtdEstoque: number;
  qtdMinEstoque: number;
  validade?: string | null;
  emAlerta?: boolean;
}

export interface NovoProdutoDTO {
  descricao: string;
  preco: number;
  qtdEstoque: number;
  qtdMinEstoque: number;
  validade?: string | null;
}

export interface AtualizarProdutoDTO {
  descricao?: string;
  preco?: number;
  qtdEstoque?: number;
  qtdMinEstoque?: number;
  validade?: string | null;
}

export interface Cliente {
  idCliente?: number;
  id_cliente?: number;
  nome: string;
  cpf: string;
}

export interface NovoClienteDTO {
  nome: string;
  cpf: string;
}

export interface ItemPedido {
  idVenda?: number;
  id_venda?: number;
  idProduto?: number;
  id_produto?: number;
  descricao?: string;
  qtdProduto?: number;
  qtd_produto?: number;
  precoUnit?: number | string;
  preco_unit?: number | string;
  subtotal?: number;
}

export interface ItemPedidoDTO {
  idProduto: number;
  qtdProduto: number;
  precoUnit: number;
}

export interface Pedido {
  idVenda?: number;
  id_venda?: number;
  idCliente?: number;
  id_cliente?: number;
  nomeCliente?: string;
  nome_cliente?: string;
  dataVenda?: string;
  data_venda?: string;
  total?: number;
  itens?: ItemPedido[];
}

export interface NovoPedidoDTO {
  idCliente: number;
  itens: ItemPedidoDTO[];
}
