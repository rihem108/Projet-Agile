import React, { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  GraduationCap, 
  Users,
  ArrowRight,
  User,
  Book
} from 'lucide-react';
import toast from 'react-hot-toast';

const logo = '/logo.png';

const Register = () => {
  const { register, isAuthenticated, user } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');
  const [className, setClassName] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (selectedRole === 'Student' && !className) {
      toast.error('La classe est obligatoire pour un étudiant');
      return;
    }

    setLoading(true);
    await register(name, email, password, selectedRole, className);
    setLoading(false);
  };

  const roles = [
    { id: 'Student', icon: GraduationCap, color: '#F59E0B' },
    { id: 'Teacher', icon: Users, color: '#10B981' },
    { id: 'Admin', icon: Shield, color: '#3B82F6' },
  ];

  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      if (!container) return;
      
      container.innerHTML = '';
      
      for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = 8 + Math.random() * 12 + 's';
        particle.style.width = 2 + Math.random() * 6 + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = 0.3 + Math.random() * 0.5;
        container.appendChild(particle);
      }
    };
    
    createParticles();
    
    window.addEventListener('resize', createParticles);
    return () => window.removeEventListener('resize', createParticles);
  }, []);

  return (
    <div className="login-page">
      {/* Animated Gradient Background */}
      <div className="animated-gradient-bg">
        <div className="gradient-layer layer-1"></div>
        <div className="gradient-layer layer-2"></div>
        <div className="gradient-layer layer-3"></div>
      </div>
      
      {/* Particles Container */}
      <div className="particles-container"></div>
      
      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
        <div className="orb orb-5"></div>
      </div>
      
      {/* Dark Overlay for better text visibility */}
      <div className="login-overlay"></div>

      <div className="login-container-glass">
        {/* Left Side - Branding Section */}
        <div className="brand-section">
          <div className="brand-content-glass">
            {/* Logo Section */}
            <div className="logo-wrapper">
              <img 
                src={logo}
                alt="Horizon University" 
                className="logo-image-large"
              />
              <div className="logo-glow"></div>
            </div>
            
            {/* Stats Showcase */}
            <div className="stats-showcase">
              <div className="stat-item-glass">
                <div className="stat-number">500+</div>
                <div className="stat-label">Étudiants</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item-glass">
                <div className="stat-number">50+</div>
                <div className="stat-label">Examens</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item-glass">
                <div className="stat-number">15+</div>
                <div className="stat-label">Enseignants</div>
              </div>
            </div>

            {/* Login Link */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#fff', marginBottom: '1rem' }}>Vous avez déjà un compte ?</p>
              <Link to="/login" style={{ 
                color: '#3B82F6', 
                textDecoration: 'none', 
                fontWeight: '600',
                transition: 'color 0.3s',
                borderBottom: '2px solid #3B82F6',
                paddingBottom: '0.25rem'
              }}>
                Se connecter
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="form-section">
          <div className="form-container-glass">
            <div className="form-header-glass">
              <div className="welcome-badge">
                <span>✨ Créer un compte</span>
              </div>
              <h2>Rejoignez-nous<br />dès maintenant</h2>
              <p>Accédez à votre espace personnalisé</p>
            </div>

            {/* Role Selection Cards */}
            <div className="role-cards">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    if (role.id !== 'Student') setClassName('');
                  }}
                  className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
                  style={{
                    '--role-color': role.color,
                  }}
                >
                  <div className="role-card-icon">
                    <role.icon size={22} />
                  </div>
                  <span className="role-card-label">{role.id}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="login-form-glass">
              {/* Name Field */}
              <div className="input-group-glass">
                <div className="input-icon-glass">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field-glass"
                  required
                />
                <div className="input-focus-bg"></div>
              </div>

              {/* Email Field */}
              <div className="input-group-glass">
                <div className="input-icon-glass">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="input-field-glass"
                  required
                />
                <div className="input-focus-bg"></div>
              </div>

              {/* Class Field (only for Students) */}
              {selectedRole === 'Student' && (
                <div className="input-group-glass">
                  <div className="input-icon-glass">
                    <Book size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Votre classe (ex: L1 Tech, L2 Business)"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="input-field-glass"
                    required
                  />
                  <div className="input-focus-bg"></div>
                </div>
              )}

              {/* Password Field */}
              <div className="input-group-glass">
                <div className="input-icon-glass">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="input-field-glass"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-glass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="input-focus-bg"></div>
              </div>

              {/* Confirm Password Field */}
              <div className="input-group-glass">
                <div className="input-icon-glass">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="input-field-glass"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-glass"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="input-focus-bg"></div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-btn-glass"
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-loader">
                    <div className="loader-spinner"></div>
                    <span>Inscription...</span>
                  </div>
                ) : (
                  <>
                    <span>S'inscrire</span>
                    <ArrowRight size={18} className="btn-arrow" />
                  </>
                )}
              </button>
            </form>

            {/* Link to Login */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                Vous avez déjà un compte ?
              </p>
              <Link 
                to="/login" 
                style={{ 
                  color: '#3B82F6', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  transition: 'color 0.3s'
                }}
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
