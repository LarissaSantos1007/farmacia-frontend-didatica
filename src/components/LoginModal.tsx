import React, { useState } from 'react';
import { Pill, Lock, User, LogIn } from 'lucide-react';

interface LoginModalProps {
  onLogin: (usuario: string) => void;
  onCancelar?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onCancelar }) => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onLogin(nome.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto' }}>
            <Pill size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>Acesso à Farmácia Didática</h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Entre com suas credenciais para gerenciar o sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Nome do Farmacêutico / Operador *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Ex: Farmacêutico Larissa"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha de Acesso (Didática)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            {onCancelar ? (
              <button type="button" onClick={onCancelar} className="btn btn-secondary">
                Entrar como Convidado
              </button>
            ) : <span />}
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} /> Entrar no Sistema
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
