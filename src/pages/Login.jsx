import React, { useState, useContext } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const { login, register } = useContext(AppContext);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [className, setClassName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      if (name && email && password && (role !== 'Student' || className)) {
        register(name, email, password, role, className);
      }
    } else {
      if (email && password) {
        login(email, password);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="glass-card login-card">
        <ShieldCheck className="login-icon" />
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {isRegistering ? "Créer un Compte" : "Espace Administration"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Nom complet</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@exam.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
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

          {isRegistering && (
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label className="form-label">Rôle</label>
              <select 
                className="form-input" 
                value={role} 
                onChange={(e) => {
                  const nextRole = e.target.value;
                  setRole(nextRole);
                  if (nextRole !== 'Student') {
                    setClassName('');
                  }
                }}
              >
                <option value="Student">Étudiant</option>
                <option value="Teacher">Enseignant</option>
                <option value="Admin">Administrateur</option>
              </select>
            </div>
          )}

          {isRegistering && role === 'Student' && (
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label className="form-label">Classe</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: L1 INFO A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {isRegistering ? "S'inscrire" : "Se Connecter"}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isRegistering ? "Vous avez déjà un compte ?" : "Vous n'avez pas de compte ?"}
          <button 
            type="button" 
            className="btn-ghost" 
            style={{ padding: 0, marginLeft: '0.5rem', color: 'var(--primary)' }} 
            onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "Se connecter" : "S'inscrire"}
          </button>
        </p>

        {!isRegistering && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Démos avec mot de passe '123456' : admin@exam.com, alice@exam.com (Teacher), bob@exam.com (Student).
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

