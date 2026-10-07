import React, { useState } from 'react';
import { 
  ShoppingCart, 
  PlusCircle, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  X, 
  Calendar, 
  User, 
  AlertCircle,
  Plus
} from 'lucide-react';
import type { Pedido, Produto, Cliente, NovoPedidoDTO, ItemPedidoDTO, ItemPedido } from '../types';
import { api } from '../services/api';

interface PedidosPageProps {
  pedidos: Pedido[];
  produtos: Produto[];
  clientes: Cliente[];
  carregando: boolean;
  onCriarPedido: (dados: NovoPedidoDTO) => Promise<{ sucesso: boolean; mensagem?: string }>;
  abrirModalNovo: boolean;
  setAbrirModalNovo: (v: boolean) => void;
  aoAtualizarDados: () => void;
}

export const PedidosPage: React.FC<PedidosPageProps> = ({
  pedidos,
  produtos,
  clientes,
  carregando,
  onCriarPedido,
  abrirModalNovo,
  setAbrirModalNovo,
  aoAtualizarDados
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [ordenarPorCliente, setOrdenarPorCliente] = useState(true);
  const [pedidoExpandidoId, setPedidoExpandidoId] = useState<number | null>(null);
  const [itensDoPedido, setItensDoPedido] = useState<Record<number, ItemPedido[]>>({});
  const [carregandoItensId, setCarregandoItensId] = useState<number | null>(null);

  // Estados de Criação de Pedido
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<number | ''>('');
  const [itensNovoPedido, setItensNovoPedido] = useState<ItemPedidoDTO[]>([
    { idProduto: 0, qtdProduto: 1, precoUnit: 0 }
  ]);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  // Estados para Adicionar Item a um Pedido Existente
  const [modalAdicionarItemVendaId, setModalAdicionarItemVendaId] = useState<number | null>(null);
  const [novoItemAvulso, setNovoItemAvulso] = useState<ItemPedidoDTO>({ idProduto: 0, qtdProduto: 1, precoUnit: 0 });

  // Filtragem e ordenação
  const pedidosTratados = [...pedidos].filter((p) => {
    const id = p.idVenda ?? p.id_venda ?? 0;
    const nome = p.nomeCliente ?? p.nome_cliente ?? '';
    return String(id).includes(termoBusca) || nome.toLowerCase().includes(termoBusca.toLowerCase());
  });

  if (ordenarPorCliente) {
    pedidosTratados.sort((a, b) => {
      const nomeA = a.nomeCliente ?? a.nome_cliente ?? '';
      const nomeB = b.nomeCliente ?? b.nome_cliente ?? '';
      return nomeA.localeCompare(nomeB);
    });
  } else {
    // Por ID decrescente
    pedidosTratados.sort((a, b) => {
      const idA = a.idVenda ?? a.id_venda ?? 0;
      const idB = b.idVenda ?? b.id_venda ?? 0;
      return idB - idA;
    });
  }

  const formatarPreco = (valor: number | string) => {
    const num = Number(valor) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const toggleExpandirPedido = async (idVenda: number) => {
    if (pedidoExpandidoId === idVenda) {
      setPedidoExpandidoId(null);
      return;
    }

    setPedidoExpandidoId(idVenda);
    if (!itensDoPedido[idVenda]) {
      setCarregandoItensId(idVenda);
      try {
        const itens = await api.pedidos.itens(idVenda);
        setItensDoPedido((prev) => ({ ...prev, [idVenda]: itens }));
      } catch (err) {
        console.error('Erro ao buscar itens do pedido:', err);
      } finally {
        setCarregandoItensId(null);
      }
    }
  };

  // Gerenciamento de itens no modal de novo pedido
  const handleItemProdutoChange = (index: number, idProduto: number) => {
    const produto = produtos.find((p) => p.idProduto === idProduto);
    const preco = produto ? Number(produto.preco) : 0;
    const novosItens = [...itensNovoPedido];
    novosItens[index] = {
      ...novosItens[index],
      idProduto,
      precoUnit: preco
    };
    setItensNovoPedido(novosItens);
  };

  const handleItemQtdChange = (index: number, qtd: number) => {
    const novosItens = [...itensNovoPedido];
    novosItens[index] = {
      ...novosItens[index],
      qtdProduto: Math.max(1, qtd)
    };
    setItensNovoPedido(novosItens);
  };

  const handleAdicionarLinhaItem = () => {
    setItensNovoPedido([...itensNovoPedido, { idProduto: 0, qtdProduto: 1, precoUnit: 0 }]);
  };

  const handleRemoverLinhaItem = (index: number) => {
    if (itensNovoPedido.length <= 1) return;
    setItensNovoPedido(itensNovoPedido.filter((_, i) => i !== index));
  };

  const calcularTotalNovoPedido = () => {
    return itensNovoPedido.reduce((acc, item) => acc + (item.qtdProduto * item.precoUnit), 0);
  };

  const handleFinalizarNovoPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    if (!clienteSelecionadoId) {
      setErroForm('Selecione o cliente que está realizando o pedido.');
      return;
    }

    const itensValidos = itensNovoPedido.filter((i) => i.idProduto > 0 && i.qtdProduto > 0);
    if (itensValidos.length === 0) {
      setErroForm('Adicione pelo menos um produto válido ao pedido.');
      return;
    }

    setSalvando(true);
    const resultado = await onCriarPedido({
      idCliente: Number(clienteSelecionadoId),
      itens: itensValidos
    });
    setSalvando(false);

    if (resultado.sucesso) {
      setSucessoMsg('Pedido cadastrado com sucesso! O estoque foi baixado automaticamente no banco de dados.');
      setAbrirModalNovo(false);
      setClienteSelecionadoId('');
      setItensNovoPedido([{ idProduto: 0, qtdProduto: 1, precoUnit: 0 }]);
      setTimeout(() => setSucessoMsg(null), 5000);
    } else {
      setErroForm(resultado.mensagem || 'Erro ao criar pedido.');
    }
  };

  // Remover item de pedido existente (Requisito: exclusão ou remoção de registros)
  const handleRemoverItemVenda = async (idVenda: number, idProduto: number) => {
    if (!confirm('Deseja realmente remover este item do pedido?')) return;

    try {
      await api.itens.remover(idVenda, idProduto);
      setSucessoMsg(`Item removido do pedido #${idVenda} com sucesso.`);
      
      // Recarrega os itens deste pedido
      const itensAtualizados = await api.pedidos.itens(idVenda);
      setItensDoPedido((prev) => ({ ...prev, [idVenda]: itensAtualizados }));
      aoAtualizarDados();
      setTimeout(() => setSucessoMsg(null), 4000);
    } catch (err: any) {
      alert(`Erro ao remover item: ${err?.message || err}`);
    }
  };

  // Adicionar item avulso ao pedido existente
  const handleSalvarItemAvulso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAdicionarItemVendaId || !novoItemAvulso.idProduto) return;

    try {
      await api.pedidos.adicionarItem(modalAdicionarItemVendaId, novoItemAvulso);
      setSucessoMsg(`Novo item adicionado ao pedido #${modalAdicionarItemVendaId}!`);
      const itensAtualizados = await api.pedidos.itens(modalAdicionarItemVendaId);
      setItensDoPedido((prev) => ({ ...prev, [modalAdicionarItemVendaId]: itensAtualizados }));
      setModalAdicionarItemVendaId(null);
      setNovoItemAvulso({ idProduto: 0, qtdProduto: 1, precoUnit: 0 });
      aoAtualizarDados();
      setTimeout(() => setSucessoMsg(null), 4000);
    } catch (err: any) {
      alert(`Não foi possível adicionar o item: ${err?.message || err}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCart size={26} color="#059669" />
            Pedidos & Vendas da Farmácia
          </h1>
          <p className="page-subtitle">Acompanhe as vendas, veja itens de cada pedido e realize novas operações.</p>
        </div>

        <button onClick={() => setAbrirModalNovo(true)} className="btn btn-primary">
          <PlusCircle size={18} /> Novo Pedido de Venda
        </button>
      </div>

      {sucessoMsg && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={18} />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* Filtros e Ordenação */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por ID do pedido ou nome do cliente..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        <button
          onClick={() => setOrdenarPorCliente(!ordenarPorCliente)}
          className="btn btn-secondary"
          title="Alternar ordenação"
        >
          {ordenarPorCliente ? '🔤 Ordem Alfabética (Cliente)' : '🔢 Ordem Mais Recente (ID)'}
        </button>
      </div>

      {/* Tabela de Pedidos */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Pedido</th>
              <th>Cliente</th>
              <th>Data da Venda</th>
              <th>Itens</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Carregando pedidos...
                </td>
              </tr>
            ) : pedidosTratados.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  <ShoppingCart size={36} />
                  <p>Nenhum pedido registrado no sistema.</p>
                </td>
              </tr>
            ) : (
              pedidosTratados.map((pedido) => {
                const idVenda = pedido.idVenda ?? pedido.id_venda ?? 0;
                const nomeCli = pedido.nomeCliente ?? pedido.nome_cliente ?? 'Cliente Cadastrado';
                const dataRaw = pedido.dataVenda ?? pedido.data_venda;
                const dataFormatada = dataRaw ? new Date(dataRaw).toLocaleString('pt-BR') : 'Data recente';
                const isExpandido = pedidoExpandidoId === idVenda;
                const itens = itensDoPedido[idVenda] || [];

                return (
                  <React.Fragment key={idVenda}>
                    <tr>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0369a1' }}>#{idVenda}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color="#94a3b8" />
                          {nomeCli}
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="#94a3b8" />
                          {dataFormatada}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleExpandirPedido(idVenda)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.35rem' }}
                        >
                          {isExpandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpandido ? 'Ocultar Itens' : 'Ver Itens do Pedido'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setModalAdicionarItemVendaId(idVenda);
                            setNovoItemAvulso({ idProduto: 0, qtdProduto: 1, precoUnit: 0 });
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Adicionar mais um item a este pedido"
                        >
                          <Plus size={14} /> Adicionar Item
                        </button>
                      </td>
                    </tr>

                    {/* Linha expansível com os itens do pedido */}
                    {isExpandido && (
                      <tr>
                        <td colSpan={5} style={{ backgroundColor: '#f8fafc', padding: '1rem 1.5rem' }}>
                          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                                Itens do Pedido #{idVenda}
                              </h4>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                A trigger do banco de dados já efetuou a baixa destes produtos no estoque.
                              </span>
                            </div>

                            {carregandoItensId === idVenda ? (
                              <p style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.5rem 0' }}>Carregando detalhes dos itens...</p>
                            ) : itens.length === 0 ? (
                              <p style={{ fontSize: '0.85rem', color: '#64748b', padding: '0.5rem 0' }}>Nenhum item listado para este pedido.</p>
                            ) : (
                              <table className="table" style={{ fontSize: '0.825rem', marginBottom: 0 }}>
                                <thead>
                                  <tr>
                                    <th>Cód. Produto</th>
                                    <th>Medicamento / Descrição</th>
                                    <th>Qtd. Vendida</th>
                                    <th>Preço Unitário</th>
                                    <th>Subtotal</th>
                                    <th style={{ textAlign: 'right' }}>Ação</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {itens.map((item, i) => {
                                    const idProd = item.idProduto ?? item.id_produto ?? 0;
                                    const qtd = item.qtdProduto ?? item.qtd_produto ?? 1;
                                    const preco = Number(item.precoUnit ?? item.preco_unit ?? 0);
                                    const subtotal = item.subtotal ? Number(item.subtotal) : (qtd * preco);
                                    const prodDesc = item.descricao || produtos.find(p => p.idProduto === idProd)?.descricao || `Produto #${idProd}`;

                                    return (
                                      <tr key={i}>
                                        <td>#{idProd}</td>
                                        <td style={{ fontWeight: 600 }}>{prodDesc}</td>
                                        <td>{qtd} un</td>
                                        <td>{formatarPreco(preco)}</td>
                                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{formatarPreco(subtotal)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                          <button
                                            onClick={() => handleRemoverItemVenda(idVenda, idProd)}
                                            className="btn btn-danger btn-sm"
                                            title="Excluir este item da venda"
                                            style={{ padding: '0.2rem 0.5rem' }}
                                          >
                                            <Trash2 size={13} /> Remover
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Pedido */}
      {abrirModalNovo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="#059669" />
                Registrar Novo Pedido de Venda
              </h3>
              <button onClick={() => setAbrirModalNovo(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFinalizarNovoPedido}>
              <div className="modal-body">
                {erroForm && (
                  <div className="alert-box alert-danger">
                    <AlertCircle size={18} />
                    <span>{erroForm}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Cliente que está comprando *</label>
                  <select
                    className="form-control"
                    required
                    value={clienteSelecionadoId}
                    onChange={(e) => setClienteSelecionadoId(Number(e.target.value) || '')}
                  >
                    <option value="">-- Selecione o Cliente --</option>
                    {clientes.map((c) => {
                      const id = c.idCliente ?? c.id_cliente;
                      return (
                        <option key={id} value={id}>
                          {c.nome} (CPF: {c.cpf})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                      Medicamentos e Itens do Pedido *
                    </label>
                    <button
                      type="button"
                      onClick={handleAdicionarLinhaItem}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> Adicionar outro item
                    </button>
                  </div>

                  {itensNovoPedido.map((linha, idx) => {
                    const prodSelecionado = produtos.find((p) => p.idProduto === linha.idProduto);
                    const estoqueDisp = prodSelecionado ? prodSelecionado.qtdEstoque : null;

                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '3fr 1fr 1.5fr auto', 
                          gap: '0.5rem', 
                          alignItems: 'end',
                          marginBottom: '0.75rem',
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Produto</label>
                          <select
                            className="form-control"
                            required
                            value={linha.idProduto || ''}
                            onChange={(e) => handleItemProdutoChange(idx, Number(e.target.value))}
                          >
                            <option value="">Selecione o produto</option>
                            {produtos.map((p) => (
                              <option key={p.idProduto} value={p.idProduto}>
                                {p.descricao} (Estoque: {p.qtdEstoque} un)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Qtd.</label>
                          <input
                            type="number"
                            min="1"
                            max={estoqueDisp !== null ? estoqueDisp : undefined}
                            required
                            className="form-control"
                            value={linha.qtdProduto}
                            onChange={(e) => handleItemQtdChange(idx, parseInt(e.target.value, 10) || 1)}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem' }}>Preço Unit.</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="form-control"
                            value={linha.precoUnit}
                            onChange={(e) => {
                              const novos = [...itensNovoPedido];
                              novos[idx].precoUnit = parseFloat(e.target.value) || 0;
                              setItensNovoPedido(novos);
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoverLinhaItem(idx)}
                          className="btn btn-danger btn-sm"
                          style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remover linha"
                          disabled={itensNovoPedido.length <= 1}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                    Total da Venda: {formatarPreco(calcularTotalNovoPedido())}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setAbrirModalNovo(false)}
                  className="btn btn-secondary"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Processando Venda...' : 'Finalizar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Item Avulso a Pedido Existente */}
      {modalAdicionarItemVendaId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar Item ao Pedido #{modalAdicionarItemVendaId}</h3>
              <button onClick={() => setModalAdicionarItemVendaId(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarItemAvulso}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Produto</label>
                  <select
                    className="form-control"
                    required
                    value={novoItemAvulso.idProduto || ''}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const prod = produtos.find(p => p.idProduto === id);
                      setNovoItemAvulso({
                        ...novoItemAvulso,
                        idProduto: id,
                        precoUnit: prod ? Number(prod.preco) : 0
                      });
                    }}
                  >
                    <option value="">Selecione o produto</option>
                    {produtos.map(p => (
                      <option key={p.idProduto} value={p.idProduto}>
                        {p.descricao} (Estoque: {p.qtdEstoque})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-control"
                      value={novoItemAvulso.qtdProduto}
                      onChange={(e) => setNovoItemAvulso({ ...novoItemAvulso, qtdProduto: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control"
                      value={novoItemAvulso.precoUnit}
                      onChange={(e) => setNovoItemAvulso({ ...novoItemAvulso, precoUnit: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalAdicionarItemVendaId(null)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Adicionar ao Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
