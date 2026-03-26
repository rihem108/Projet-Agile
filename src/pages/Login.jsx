import React, { useState, useContext } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const { login } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <ShieldCheck className="login-icon" />
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Espace Administration</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email Professionnel</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@exam.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <label className="form-label">Mot de passe</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Se Connecter
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          (Utilisez n'importe quel email/mot de passe)
        </p>
      </div>
    </div>
  );
};

export default Login;

