import React, { useState } from 'react';
import { Users, Search, PlusCircle, CheckCircle2, X, UserPlus, CreditCard } from 'lucide-react';
import type { Cliente, NovoClienteDTO } from '../types';

interface ClientesPageProps {
  clientes: Cliente[];
  carregando: boolean;
  onCadastrar: (dados: NovoClienteDTO) => Promise<boolean>;
  abrirModalNovo: boolean;
  setAbrirModalNovo: (v: boolean) => void;
}

export const ClientesPage: React.FC<ClientesPageProps> = ({
  clientes,
  carregando,
  onCadastrar,
  abrirModalNovo,
  setAbrirModalNovo
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [formNovo, setFormNovo] = useState<NovoClienteDTO>({ nome: '', cpf: '' });
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const clientesFiltrados = clientes.filter((c) => {
    const nomeMatch = c.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const cpfMatch = c.cpf.includes(termoBusca);
    const id = c.idCliente ?? c.id_cliente;
    const idMatch = id ? String(id).includes(termoBusca) : false;
    return nomeMatch || cpfMatch || idMatch;
  });

  const formatarCpf = (v: string) => {
    const limpo = v.replace(/\D/g, '').slice(0, 11);
    if (limpo.length <= 3) return limpo;
    if (limpo.length <= 6) return `${limpo.slice(0, 3)}.${limpo.slice(3)}`;
    if (limpo.length <= 9) return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6)}`;
    return `${limpo.slice(0, 3)}.${limpo.slice(3, 6)}.${limpo.slice(6, 9)}-${limpo.slice(9, 11)}`;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro(null);

    if (!formNovo.nome.trim()) {
      setMensagemErro('O nome do cliente é obrigatório.');
      return;
    }

    if (!formNovo.cpf.trim() || formNovo.cpf.length < 11) {
      setMensagemErro('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setSalvando(true);
    const ok = await onCadastrar({
      nome: formNovo.nome.trim(),
      cpf: formNovo.cpf.trim()
    });
    setSalvando(false);

    if (ok) {
      setMensagemSucesso('Cliente cadastrado com sucesso!');
      setAbrirModalNovo(false);
      setFormNovo({ nome: '', cpf: '' });
      setTimeout(() => setMensagemSucesso(null), 4000);
    } else {
      setMensagemErro('Não foi possível cadastrar o cliente. Verifique se o CPF já está em uso.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={26} color="#9333ea" />
            Cadastro e Gestão de Clientes
          </h1>
          <p className="page-subtitle">Consulte clientes para emissão de pedidos e realize novos cadastros.</p>
        </div>

        <button onClick={() => setAbrirModalNovo(true)} className="btn btn-primary">
          <PlusCircle size={18} /> Novo Cliente
        </button>
      </div>

      {mensagemSucesso && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={18} />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Busca */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome, CPF ou ID do cliente..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome Completo</th>
              <th>CPF</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  Carregando clientes...
                </td>
              </tr>
            ) : clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  <Users size={36} />
                  <p>Nenhum cliente encontrado.</p>
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((c, idx) => {
                const id = c.idCliente ?? c.id_cliente ?? idx + 1;
                return (
                  <tr key={id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#64748b' }}>#{id}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                      <CreditCard size={15} color="#94a3b8" />
                      {c.cpf}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-success">Ativo</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cadastro de Cliente */}
      {abrirModalNovo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="#9333ea" />
                Cadastrar Novo Cliente
              </h3>
              <button onClick={() => setAbrirModalNovo(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="modal-body">
                {mensagemErro && (
                  <div className="alert-box alert-danger">
                    <span>{mensagemErro}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Nome Completo do Cliente *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Ex: Maria dos Santos Silva"
                    value={formNovo.nome}
                    onChange={(e) => setFormNovo({ ...formNovo, nome: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    className="form-control"
                    placeholder="000.000.000-00"
                    value={formNovo.cpf}
                    onChange={(e) => setFormNovo({ ...formNovo, cpf: formatarCpf(e.target.value) })}
                  />
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
                  {salvando ? 'Cadastrando...' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
