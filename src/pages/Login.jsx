// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { api } from '../api';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  GraduationCap, 
  Users, 
  Sparkles,
  ArrowRight,
  Star,
  Award,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Logo is in public folder - use direct path
const logo = '/logo.png';

const Login = () => {
  const { login, isAuthenticated, user } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Student');

  if (isAuthenticated && user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    await login(email, password, selectedRole);
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      toast.error('Entrez votre email puis réessayez.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      toast.error('Veuillez saisir une adresse email valide.');
      return;
    }

    try {
      await api.postPublic('/auth/forgot-password', { email: normalizedEmail });
      toast.success('Code de vérification envoyé par email.');

      const code = window.prompt('Entrez le code reçu par email :');
      if (!code) {
        toast.error('Réinitialisation annulée.');
        return;
      }

      const newPassword = window.prompt('Entrez votre nouveau mot de passe (min 6 caractères) :');
      if (!newPassword) {
        toast.error('Réinitialisation annulée.');
        return;
      }

      await api.postPublic('/auth/reset-password', {
        email: normalizedEmail,
        code: code.trim(),
        newPassword: newPassword.trim()
      });

      setPassword('');
      toast.success('Mot de passe réinitialisé. Vous pouvez vous connecter.');
    } catch (err) {
      toast.error(err.message || 'Impossible de réinitialiser le mot de passe');
    }
  };

  const roles = [
    { id: 'Admin', icon: Shield, gradient: 'from-blue-500 to-blue-600', color: '#3B82F6' },
    { id: 'Teacher', icon: Users, gradient: 'from-emerald-500 to-emerald-600', color: '#10B981' },
    { id: 'Student', icon: GraduationCap, gradient: 'from-amber-500 to-yellow-500', color: '#F59E0B' },
  ];

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      if (!container) return;
      
      // Clear existing particles
      container.innerHTML = '';
      
      // Create new particles
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
    
    // Recreate particles on window resize
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

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-element elem-1">
          <Star className="text-yellow-400" size={20} />
        </div>
        <div className="floating-element elem-2">
          <Award className="text-blue-400" size={24} />
        </div>
        <div className="floating-element elem-3">
          <Clock className="text-emerald-400" size={18} />
        </div>
        <div className="floating-element elem-4">
          <CheckCircle className="text-purple-400" size={22} />
        </div>
      </div>

      <div className="login-container-glass">
        {/* Left Side - Branding Section */}
        <div className="brand-section">
          <div className="brand-content-glass">
            {/* Logo Section - Only logo, no text underneath */}
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

            {/* Contact Information */}
            <div className="contact-info-glass">
              <div className="contact-header">
                <Building2 size={20} />
                <span>Nous contacter</span>
              </div>
              <div className="contact-details">
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>1 Route ceinture Sahloul, Sousse, 4000, Tunisie</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>+216 73 232 901</span>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>contact@horizon-university.tn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="form-section">
          <div className="form-container-glass">
            <div className="form-header-glass">
              <div className="welcome-badge">
                <span>✨ Bienvenue</span>
              </div>
              <h2>Connectez-vous à<br />votre espace</h2>
              <p>Accédez à votre tableau de bord personnalisé</p>
            </div>

            {/* Role Selection Cards */}
            <div className="role-cards">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`role-card ${selectedRole === role.id ? 'active' : ''}`}
                  style={{
                    '--role-color': role.color,
                  }}
                >
                  <div className="role-card-icon">
                    <role.icon size={22} />
                  </div>
                  <span className="role-card-label">{role.id}</span>
                  {selectedRole === role.id && (
                    <div className="role-check">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="login-form-glass">
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
                />
                <div className="input-focus-bg"></div>
              </div>

              <div className="input-group-glass">
                <div className="input-icon-glass">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="input-field-glass"
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

              <div className="form-options-glass">
                <label className="checkbox-glass">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <button type="button" className="forgot-link-glass" onClick={handleForgotPassword}>
                  Mot de passe oublié ?
                </button>
              </div>

              <button 
                type="submit" 
                className="login-btn-glass"
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-loader">
                    <div className="loader-spinner"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={18} className="btn-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="demo-section">
              <div className="demo-divider">
                <span>Pas encore inscrit ?</span>
              </div>
              <Link to="/register" style={{ textAlign: 'center', display: 'block', marginBottom: '1.5rem' }}>
                <button type="button" className="login-btn-glass" style={{ width: '100%' }}>
                  <span>Créer un compte</span>
                  <ArrowRight size={18} className="btn-arrow" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;