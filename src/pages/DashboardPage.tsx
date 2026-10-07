import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, PlusCircle, CheckCircle } from 'lucide-react';
import type { Produto, Cliente, Pedido } from '../types';
import type { NavTab } from '../components/Navbar';

interface DashboardPageProps {
  produtos: Produto[];
  clientes: Cliente[];
  pedidos: Pedido[];
  alertas: Produto[];
  onNavigate: (tab: NavTab) => void;
  onNovoProduto: () => void;
  onNovoCliente: () => void;
  onNovoPedido: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  produtos,
  clientes,
  pedidos,
  alertas,
  onNavigate,
  onNovoProduto,
  onNovoCliente,
  onNovoPedido
}) => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visão Geral da Farmácia</h1>
          <p className="page-subtitle">Acompanhe métricas em tempo real do estoque, clientes e pedidos realizados.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onNovoPedido} className="btn btn-primary">
            <PlusCircle size={17} /> Nova Venda / Pedido
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => onNavigate('produtos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="kpi-value">{produtos.length}</div>
            <div className="kpi-label">Produtos Cadastrados</div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('alertas')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: alertas.length > 0 ? '#ef4444' : 'inherit' }}>
              {alertas.length}
            </div>
            <div className="kpi-label">Estoque em Alerta (Crítico)</div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('clientes')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="kpi-value">{clientes.length}</div>
            <div className="kpi-label">Clientes Registrados</div>
          </div>
        </div>

        <div className="kpi-card" onClick={() => onNavigate('pedidos')} style={{ cursor: 'pointer' }}>
          <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div className="kpi-value">{pedidos.length}</div>
            <div className="kpi-label">Pedidos Concluídos</div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas & Alertas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card Alerta de Estoque */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} color="#ef4444" />
              Medicamentos Abaixo do Mínimo
            </h2>
            <button 
              onClick={() => onNavigate('alertas')} 
              style={{ fontSize: '0.8rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </div>

          {alertas.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#059669' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontWeight: 600 }}>Tudo sob controle!</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Nenhum produto está com estoque abaixo do limite mínimo configurado.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Estoque Atual</th>
                    <th>Mínimo</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.slice(0, 5).map((p) => (
                    <tr key={p.idProduto}>
                      <td style={{ fontWeight: 600 }}>{p.descricao}</td>
                      <td>
                        <span className="badge badge-danger">{p.qtdEstoque} un</span>
                      </td>
                      <td>{p.qtdMinEstoque} un</td>
                      <td>
                        <button 
                          onClick={() => onNavigate('produtos')} 
                          className="btn btn-secondary btn-sm"
                        >
                          Repor
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card de Ações Rápidas do Sistema */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Ações Rápidas de Gestão
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              onClick={onNovoProduto}
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#0284c7" />
                Cadastrar Novo Medicamento
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={onNovoCliente}
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} color="#9333ea" />
                Cadastrar Novo Cliente
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={onNovoPedido}
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={18} color="#059669" />
                Realizar Novo Pedido de Venda
              </span>
              <ArrowRight size={16} />
            </button>
          </div>

          
        </div>

      </div>
    </div>
  );
};
