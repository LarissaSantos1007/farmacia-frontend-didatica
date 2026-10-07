import React, { useState } from 'react';
import { Package, Search, PlusCircle, Edit2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { Produto, NovoProdutoDTO, AtualizarProdutoDTO } from '../types';

interface ProdutosPageProps {
  produtos: Produto[];
  carregando: boolean;
  onCadastrar: (dados: NovoProdutoDTO) => Promise<boolean>;
  onAtualizar: (idProduto: number, dados: AtualizarProdutoDTO) => Promise<boolean>;
  abrirModalNovo: boolean;
  setAbrirModalNovo: (v: boolean) => void;
}

export const ProdutosPage: React.FC<ProdutosPageProps> = ({
  produtos,
  carregando,
  onCadastrar,
  onAtualizar,
  abrirModalNovo,
  setAbrirModalNovo
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAlertaApenas, setFiltroAlertaApenas] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  // Form states para criação
  const [formNovo, setFormNovo] = useState<NovoProdutoDTO>({
    descricao: '',
    preco: 0,
    qtdEstoque: 0,
    qtdMinEstoque: 0,
    validade: ''
  });

  // Form states para edição
  const [formEdicao, setFormEdicao] = useState<AtualizarProdutoDTO>({
    descricao: '',
    preco: 0,
    qtdEstoque: 0,
    qtdMinEstoque: 0,
    validade: ''
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Filtragem
  const produtosFiltrados = produtos.filter((prod) => {
    const correspondeBusca = prod.descricao.toLowerCase().includes(termoBusca.toLowerCase()) ||
                             String(prod.idProduto).includes(termoBusca);
    if (filtroAlertaApenas) {
      return correspondeBusca && (prod.emAlerta || prod.qtdEstoque <= prod.qtdMinEstoque);
    }
    return correspondeBusca;
  });

  const handleSalvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);

    if (!formNovo.descricao.trim()) {
      setMensagemErro('A descrição do produto é obrigatória.');
      return;
    }
    if (formNovo.preco < 0 || formNovo.qtdEstoque < 0) {
      setMensagemErro('Preço e estoque não podem ser negativos.');
      return;
    }

    setSalvando(true);
    const ok = await onCadastrar({
      ...formNovo,
      descricao: formNovo.descricao.trim().toUpperCase(),
      validade: formNovo.validade ? formNovo.validade : null
    });
    setSalvando(false);

    if (ok) {
      setMensagemSucesso('Medicamento cadastrado com sucesso!');
      setAbrirModalNovo(false);
      setFormNovo({ descricao: '', preco: 0, qtdEstoque: 0, qtdMinEstoque: 0, validade: '' });
      setTimeout(() => setMensagemSucesso(null), 4000);
    } else {
      setMensagemErro('Não foi possível cadastrar o medicamento. Verifique a conexão com a API.');
    }
  };

  const handleIniciarEdicao = (prod: Produto) => {
    setProdutoEditando(prod);
    setFormEdicao({
      descricao: prod.descricao,
      preco: Number(prod.preco),
      qtdEstoque: prod.qtdEstoque,
      qtdMinEstoque: prod.qtdMinEstoque,
      validade: prod.validade ? prod.validade.split('T')[0] : ''
    });
    setMensagemErro(null);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEditando) return;
    setMensagemErro(null);

    setSalvando(true);
    const ok = await onAtualizar(produtoEditando.idProduto, {
      ...formEdicao,
      descricao: formEdicao.descricao?.trim().toUpperCase(),
      validade: formEdicao.validade ? formEdicao.validade : null
    });
    setSalvando(false);

    if (ok) {
      setMensagemSucesso(`Produto #${produtoEditando.idProduto} atualizado com sucesso!`);
      setProdutoEditando(null);
      setTimeout(() => setMensagemSucesso(null), 4000);
    } else {
      setMensagemErro('Erro ao atualizar produto.');
    }
  };

  const formatarPreco = (valor: number | string) => {
    const num = Number(valor) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={26} color="#0284c7" />
            Catálogo de Medicamentos & Produtos
          </h1>
          <p className="page-subtitle">Consulte o estoque, cadastre novos medicamentos e gerencie limites de estoque.</p>
        </div>

        <button onClick={() => setAbrirModalNovo(true)} className="btn btn-primary">
          <PlusCircle size={18} /> Novo Medicamento
        </button>
      </div>

      {mensagemSucesso && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por descrição ou código do produto..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>

        <button
          onClick={() => setFiltroAlertaApenas(!filtroAlertaApenas)}
          className={`btn ${filtroAlertaApenas ? 'btn-danger' : 'btn-secondary'}`}
        >
          <AlertTriangle size={16} />
          {filtroAlertaApenas ? 'Mostrando apenas Alertas' : 'Filtrar em Alerta'}
        </button>
      </div>

      {/* Tabela de Produtos */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descrição</th>
              <th>Preço Unitário</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Validade</th>
              <th>Status do Estoque</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Carregando lista de produtos...
                </td>
              </tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  <Package size={36} />
                  <p>Nenhum produto encontrado com os filtros aplicados.</p>
                </td>
              </tr>
            ) : (
              produtosFiltrados.map((prod) => {
                const isAlerta = prod.emAlerta || prod.qtdEstoque <= prod.qtdMinEstoque;
                return (
                  <tr key={prod.idProduto}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>#{prod.idProduto}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{prod.descricao}</td>
                    <td style={{ color: '#0369a1', fontWeight: 600 }}>
                      {formatarPreco(prod.preco)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: isAlerta ? '#dc2626' : 'inherit' }}>
                        {prod.qtdEstoque}
                      </strong>{' '}
                      un
                    </td>
                    <td style={{ color: '#64748b' }}>{prod.qtdMinEstoque} un</td>
                    <td style={{ fontSize: '0.825rem' }}>
                      {prod.validade ? new Date(prod.validade).toLocaleDateString('pt-BR') : 'Não informada'}
                    </td>
                    <td>
                      {isAlerta ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={12} /> Estoque Crítico
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Estoque Normal
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleIniciarEdicao(prod)}
                        className="btn btn-secondary btn-sm"
                        title="Editar Medicamento"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro de Produto */}
      {abrirModalNovo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Cadastrar Novo Medicamento</h3>
              <button onClick={() => setAbrirModalNovo(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovo}>
              <div className="modal-body">
                {mensagemErro && (
                  <div className="alert-box alert-danger">
                    <span>{mensagemErro}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Descrição do Produto / Remédio *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Ex: DIPIRONA MONOIDRATADA 500MG"
                    value={formNovo.descricao}
                    onChange={(e) => setFormNovo({ ...formNovo, descricao: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preço Unitário (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-control"
                      value={formNovo.preco}
                      onChange={(e) => setFormNovo({ ...formNovo, preco: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data de Validade (Opcional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formNovo.validade || ''}
                      onChange={(e) => setFormNovo({ ...formNovo, validade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantidade em Estoque *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-control"
                      value={formNovo.qtdEstoque}
                      onChange={(e) => setFormNovo({ ...formNovo, qtdEstoque: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estoque Mínimo de Alerta *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-control"
                      value={formNovo.qtdMinEstoque}
                      onChange={(e) => setFormNovo({ ...formNovo, qtdMinEstoque: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
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
                  {salvando ? 'Salvando...' : 'Salvar Medicamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição de Produto */}
      {produtoEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Medicamento #{produtoEditando.idProduto}</h3>
              <button onClick={() => setProdutoEditando(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao}>
              <div className="modal-body">
                {mensagemErro && (
                  <div className="alert-box alert-danger">
                    <span>{mensagemErro}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Descrição do Produto</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formEdicao.descricao || ''}
                    onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="form-control"
                      value={formEdicao.preco ?? 0}
                      onChange={(e) => setFormEdicao({ ...formEdicao, preco: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Validade</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formEdicao.validade || ''}
                      onChange={(e) => setFormEdicao({ ...formEdicao, validade: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantidade em Estoque</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-control"
                      value={formEdicao.qtdEstoque ?? 0}
                      onChange={(e) => setFormEdicao({ ...formEdicao, qtdEstoque: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estoque Mínimo de Alerta</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="form-control"
                      value={formEdicao.qtdMinEstoque ?? 0}
                      onChange={(e) => setFormEdicao({ ...formEdicao, qtdMinEstoque: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setProdutoEditando(null)}
                  className="btn btn-secondary"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Atualizando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
