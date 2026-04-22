// src/pages/SettingsPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  User, 
  Bell, 
  Lock, 
  Moon, 
  Sun, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Edit2,
  CheckCircle,
  AlertCircle,
  Monitor,
  Palette,
  Eye,
  EyeOff,
  X,
  LogOut,
  Sparkles,
  Rocket,
  Shield,
  Zap,
  Crown,
  Star,
  Heart,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateProfile, logout } = useContext(AppContext);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex@horizon-university.tn',
    phone: '+216 73 232 901',
    address: '1 Route ceinture Sahloul, Sousse, 4000, Tunisie',
    bio: '🌟 Passionné par l\'éducation et l\'innovation technologique'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    examReminders: true,
    gradeAlerts: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    compactMode: false,
    reducedAnimations: false,
    fontSize: 'medium',
    glassEffect: true
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      toast.success('✨ Mode sombre activé !');
    } else {
      document.body.classList.remove('dark-mode');
      toast.success('☀️ Mode clair activé !');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setIsEditing(false);
    toast.success('🎉 Profil mis à jour avec succès !');
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('❌ Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('⚠️ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    toast.success('🔒 Mot de passe mis à jour avec succès !');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationUpdate = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    toast.success(value ? '🔔 Notification activée' : '🔕 Notification désactivée');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { id: 'security', label: 'Sécurité', icon: Shield, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { id: 'appearance', label: 'Apparence', icon: Palette, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  ];

  return (
    <div className="settings-page-modern">
      {/* Hero Section */}
      <div className="settings-hero">
        <div className="settings-hero-content">
          <div className="hero-icon">
            <Crown size={32} />
          </div>
          <div>
            <h1>Paramètres</h1>
            <p>Personnalisez votre expérience</p>
          </div>
        </div>
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Compte Premium</span>
        </div>
      </div>

      <div className="settings-modern-container">
        {/* Sidebar - Modern Cards */}
        <div className="settings-modern-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`modern-tab ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                '--tab-color': tab.color,
                '--tab-bg': tab.bg
              }}
            >
              <div className="tab-icon-wrapper">
                <tab.icon size={20} />
              </div>
              <span>{tab.label}</span>
              {activeTab === tab.id && <div className="tab-active-indicator"></div>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="settings-modern-content">
          {/* Profile Tab - Modern Card Design */}
          {activeTab === 'profile' && (
            <div className="modern-card profile-card">
              <div className="card-header-glow">
                <div className="card-title">
                  <div className="title-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h2>Informations du profil</h2>
                    <p>Modifiez vos informations personnelles</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button className="glow-button edit" onClick={() => setIsEditing(true)}>
                    <Edit2 size={16} />
                    Modifier
                  </button>
                ) : (
                  <button className="glow-button cancel" onClick={() => setIsEditing(false)}>
                    <X size={16} />
                    Annuler
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="profile-modern-view">
                  <div className="avatar-modern">
                    <div className="avatar-ring">
                      <div className="avatar-inner">
                        {profileForm.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="avatar-badge">
                      <Crown size={12} />
                    </div>
                  </div>
                  <div className="profile-modern-grid">
                    <div className="info-modern-card">
                      <div className="info-icon"><User size={16} /></div>
                      <div>
                        <label>Nom complet</label>
                        <p>{profileForm.name}</p>
                      </div>
                    </div>
                    <div className="info-modern-card">
                      <div className="info-icon"><Mail size={16} /></div>
                      <div>
                        <label>Email</label>
                        <p>{profileForm.email}</p>
                      </div>
                    </div>
                    <div className="info-modern-card">
                      <div className="info-icon"><Phone size={16} /></div>
                      <div>
                        <label>Téléphone</label>
                        <p>{profileForm.phone}</p>
                      </div>
                    </div>
                    <div className="info-modern-card">
                      <div className="info-icon"><MapPin size={16} /></div>
                      <div>
                        <label>Adresse</label>
                        <p>{profileForm.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="modern-form">
                  <div className="form-grid">
                    <div className="form-group-modern">
                      <label>Nom complet</label>
                      <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                    </div>
                    <div className="form-group-modern">
                      <label>Email</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                    </div>
                    <div className="form-group-modern">
                      <label>Téléphone</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>
                    <div className="form-group-modern">
                      <label>Adresse</label>
                      <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                    </div>
                    <div className="form-group-modern full-width">
                      <label>Bio</label>
                      <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows="3" />
                    </div>
                  </div>
                  <button type="submit" className="save-button">
                    <Save size={16} />
                    Enregistrer
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="modern-card security-card-modern">
              <div className="card-header-glow">
                <div className="card-title">
                  <div className="title-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h2>Sécurité du compte</h2>
                    <p>Protégez votre compte</p>
                  </div>
                </div>
              </div>

              {/* Dark Mode Toggle - Featured */}
              <div className="feature-card" onClick={toggleDarkMode}>
                <div className="feature-icon" style={{ background: darkMode ? 'linear-gradient(135deg, #1E293B, #0F172A)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)' }}>
                  {darkMode ? <Moon size={28} /> : <Sun size={28} />}
                </div>
                <div className="feature-content">
                  <h3>{darkMode ? 'Mode sombre activé' : 'Mode clair activé'}</h3>
                  <p>Basculer entre les thèmes</p>
                </div>
                <div className={`feature-toggle ${darkMode ? 'active' : ''}`}>
                  <div className="toggle-ball"></div>
                </div>
              </div>

              {/* Password Change */}
              <div className="feature-card">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}>
                  <Lock size={28} />
                </div>
                <div className="feature-content">
                  <h3>Changer le mot de passe</h3>
                  <p>Mettez à jour votre mot de passe</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="password-modern-form">
                <div className="password-input-modern">
                  <input type={showPasswords ? 'text' : 'password'} placeholder="Mot de passe actuel" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                </div>
                <div className="password-input-modern">
                  <input type={showPasswords ? 'text' : 'password'} placeholder="Nouveau mot de passe" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </div>
                <div className="password-input-modern">
                  <input type={showPasswords ? 'text' : 'password'} placeholder="Confirmer" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  <button type="button" className="eye-toggle" onClick={() => setShowPasswords(!showPasswords)}>
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button type="submit" className="save-button">
                  <Zap size={16} />
                  Mettre à jour
                </button>
              </form>

              <div className="session-modern">
                <h3>📱 Appareils connectés</h3>
                <div className="device-card">
                  <Monitor size={20} />
                  <div>
                    <p>Cet appareil</p>
                    <span>Windows • Chrome • Sousse</span>
                  </div>
                  <span className="device-badge">Actuel</span>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="modern-card notifications-card">
              <div className="card-header-glow">
                <div className="card-title">
                  <div className="title-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2>Préférences de notification</h2>
                    <p>Choisissez ce que vous voulez recevoir</p>
                  </div>
                </div>
              </div>

              <div className="notifications-modern-list">
                <div className="notification-modern-item">
                  <div className="notif-icon"><Mail size={20} /></div>
                  <div className="notif-info">
                    <h4>Notifications par email</h4>
                    <p>Recevez des notifications par email</p>
                  </div>
                  <label className="modern-toggle">
                    <input type="checkbox" checked={notificationSettings.emailNotifications} onChange={(e) => handleNotificationUpdate('emailNotifications', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </label>
                </div>
                <div className="notification-modern-item">
                  <div className="notif-icon"><Bell size={20} /></div>
                  <div className="notif-info">
                    <h4>Notifications push</h4>
                    <p>Recevez des notifications push</p>
                  </div>
                  <label className="modern-toggle">
                    <input type="checkbox" checked={notificationSettings.pushNotifications} onChange={(e) => handleNotificationUpdate('pushNotifications', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </label>
                </div>
                <div className="notification-modern-item">
                  <div className="notif-icon"><CheckCircle size={20} /></div>
                  <div className="notif-info">
                    <h4>Rappels d'examens</h4>
                    <p>Recevez des rappels avant les examens</p>
                  </div>
                  <label className="modern-toggle">
                    <input type="checkbox" checked={notificationSettings.examReminders} onChange={(e) => handleNotificationUpdate('examReminders', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </label>
                </div>
                <div className="notification-modern-item">
                  <div className="notif-icon"><AlertCircle size={20} /></div>
                  <div className="notif-info">
                    <h4>Alertes de notes</h4>
                    <p>Recevez des alertes pour les notes</p>
                  </div>
                  <label className="modern-toggle">
                    <input type="checkbox" checked={notificationSettings.gradeAlerts} onChange={(e) => handleNotificationUpdate('gradeAlerts', e.target.checked)} />
                    <span className="toggle-track"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="modern-card appearance-card-modern">
              <div className="card-header-glow">
                <div className="card-title">
                  <div className="title-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #F43F5E)' }}>
                    <Palette size={20} />
                  </div>
                  <div>
                    <h2>Apparence</h2>
                    <p>Personnalisez l'apparence</p>
                  </div>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="theme-preview" onClick={toggleDarkMode}>
                <div className={`theme-preview-window ${darkMode ? 'dark' : 'light'}`}>
                  <div className="preview-header">
                    <div className="preview-dots"><span></span><span></span><span></span></div>
                  </div>
                  <div className="preview-body">
                    <div className="preview-side"></div>
                    <div className="preview-main-area">
                      <div className="preview-line"></div>
                      <div className="preview-line short"></div>
                    </div>
                  </div>
                </div>
                <div className="theme-label">
                  {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{darkMode ? 'Mode sombre actif' : 'Mode clair actif'}</span>
                </div>
              </div>

              <div className="appearance-options-modern">
                <div className="option-modern">
                  <div>
                    <label>📏 Taille de police</label>
                    <p>Ajustez la taille du texte</p>
                  </div>
                  <select value={appearanceSettings.fontSize} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}>
                    <option value="small">Petite</option>
                    <option value="medium">Moyenne</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div className="option-modern">
                  <div>
                    <label>✨ Animations réduites</label>
                    <p>Réduire les animations</p>
                  </div>
                  <label className="modern-toggle">
                    <input type="checkbox" checked={appearanceSettings.reducedAnimations} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, reducedAnimations: e.target.checked })} />
                    <span className="toggle-track"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;