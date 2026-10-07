import React, { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2, PackageCheck, RefreshCw } from 'lucide-react';
import type { Produto, AtualizarProdutoDTO } from '../types';

interface AlertasPageProps {
  alertas: Produto[];
  carregando: boolean;
  onAtualizarEstoque: (idProduto: number, dados: AtualizarProdutoDTO) => Promise<boolean>;
  onRecarregar: () => void;
}

export const AlertasPage: React.FC<AlertasPageProps> = ({
  alertas,
  carregando,
  onAtualizarEstoque,
  onRecarregar
}) => {
  const [repondoId, setRepondoId] = useState<number | null>(null);
  const [qtdAdicionar, setQtdAdicionar] = useState<number>(20);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  const handleRepor = async (p: Produto) => {
    setRepondoId(p.idProduto);
    const novoEstoque = p.qtdEstoque + qtdAdicionar;

    const ok = await onAtualizarEstoque(p.idProduto, {
      qtdEstoque: novoEstoque
    });
    setRepondoId(null);

    if (ok) {
      setSucessoMsg(`Estoque de "${p.descricao}" reposto com sucesso para ${novoEstoque} unidades!`);
      setTimeout(() => setSucessoMsg(null), 4000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#dc2626' }}>
            <AlertTriangle size={26} color="#dc2626" />
            Alertas de Estoque Crítico
          </h1>
          <p className="page-subtitle">
            Medicamentos com estoque igual ou abaixo do limite mínimo configurado (consultado na VIEW do PostgreSQL).
          </p>
        </div>

        <button onClick={onRecarregar} className="btn btn-secondary">
          <RefreshCw size={16} /> Atualizar Alertas
        </button>
      </div>

      {sucessoMsg && (
        <div className="alert-box alert-success">
          <CheckCircle2 size={18} />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {/* explicação removida a pedido do usuário */}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Medicamento / Descrição</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Déficit Estimado</th>
              <th style={{ textAlign: 'right' }}>Reposição Imediata</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Carregando alertas...
                </td>
              </tr>
            ) : alertas.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state" style={{ color: '#059669' }}>
                  <PackageCheck size={42} color="#059669" />
                  <p style={{ fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem' }}>Nenhum produto em alerta!</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Todos os medicamentos possuem estoque acima do limite mínimo.</p>
                </td>
              </tr>
            ) : (
              alertas.map((p) => {
                const deficit = Math.max(0, p.qtdMinEstoque - p.qtdEstoque);
                return (
                  <tr key={p.idProduto}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>#{p.idProduto}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.descricao}</td>
                    <td>
                      <span className="badge badge-danger">
                        {p.qtdEstoque} un
                      </span>
                    </td>
                    <td>{p.qtdMinEstoque} un</td>
                    <td style={{ color: '#dc2626', fontWeight: 600 }}>
                      {deficit > 0 ? `Faltam ${deficit} un` : 'No limite mínimo'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          style={{ width: '65px', padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                          value={qtdAdicionar}
                          onChange={(e) => setQtdAdicionar(parseInt(e.target.value, 10) || 1)}
                        />
                        <button
                          onClick={() => handleRepor(p)}
                          className="btn btn-primary btn-sm"
                          disabled={repondoId === p.idProduto}
                          title="Adicionar quantidade ao estoque atual"
                        >
                          <Plus size={14} /> Repor
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
