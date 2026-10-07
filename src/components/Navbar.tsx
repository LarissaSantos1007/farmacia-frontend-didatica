import React from 'react';
import { Pill, LayoutDashboard, Package, Users, ShoppingCart, AlertTriangle, LogIn, LogOut, CheckCircle2, XCircle } from 'lucide-react';

export type NavTab = 'dashboard' | 'produtos' | 'clientes' | 'pedidos' | 'alertas';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertaCount: number;
  apiOnline: boolean;
  usuario: string | null;
  onLogout: () => void;
  onLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  alertaCount,
  apiOnline,
  usuario,
  onLogout,
  onLogin
}) => {
  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button 
          onClick={() => onSelectTab('dashboard')} 
          className="nav-brand"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <div className="brand-icon">
            <Pill size={22} />
          </div>
          <span>Farmácia Didática</span>
        </button>

        <nav className="nav-links">
          <button
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button
            className={`nav-item ${currentTab === 'produtos' ? 'active' : ''}`}
            onClick={() => onSelectTab('produtos')}
          >
            <Package size={18} />
            Produtos
          </button>

          <button
            className={`nav-item ${currentTab === 'clientes' ? 'active' : ''}`}
            onClick={() => onSelectTab('clientes')}
          >
            <Users size={18} />
            Clientes
          </button>

          <button
            className={`nav-item ${currentTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => onSelectTab('pedidos')}
          >
            <ShoppingCart size={18} />
            Pedidos & Vendas
          </button>

          <button
            className={`nav-item ${currentTab === 'alertas' ? 'active' : ''}`}
            onClick={() => onSelectTab('alertas')}
          >
            <AlertTriangle size={18} />
            Alertas de Estoque
            {alertaCount > 0 && (
              <span className="badge-alert">{alertaCount}</span>
            )}
          </button>
        </nav>
      </div>

      <div className="nav-user">
        <div className={`status-pill ${apiOnline ? 'status-online' : 'status-offline'}`}>
          <span className={`dot ${apiOnline ? 'dot-online' : 'dot-offline'}`} />
          {apiOnline ? 'API Conectada' : 'API Desconectada'}
        </div>

        {usuario ? (
          <div className="user-tag">
            <span>👤 <strong>{usuario}</strong></span>
            <button 
              onClick={onLogout} 
              title="Sair do sistema" 
              style={{ color: '#ef4444', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onLogin} className="btn btn-secondary btn-sm">
            <LogIn size={15} /> Entrar
          </button>
        )}
      </div>
    </header>
  );
};
