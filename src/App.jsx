// App.jsx
import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MapPin, 
  CalendarCog, 
  FileText, 
  CheckCircle, 
  LogOut, 
  Bell, 
  Search, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Settings,
  AlertTriangle,
  ExternalLink,
  Check,
  Trash2
} from 'lucide-react';
import { AppProvider, AppContext } from './context/AppContext';
import { EliminationProvider } from './context/EliminationContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ExamsPage from './pages/ExamsPage';
import RoomsPage from './pages/RoomsPage';
import OrganizationPage from './pages/OrganizationPage';
import AssignmentPage from './pages/AssignmentPage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import EliminationPage from './pages/EliminationPage';
import SettingsPage from './pages/SettingsPage';
import CourseraLinksPage from './pages/CourseraLinksPage';
import Login from './pages/Login';
import Register from './pages/Register';
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AppContext);
  const role = user?.role || 'Student';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/users', icon: Users, label: 'Utilisateurs', roles: ['Admin'] },
    { path: '/exams', icon: BookOpen, label: 'Examens', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/rooms', icon: MapPin, label: 'Salles', roles: ['Admin'] },
    { path: '/organization', icon: CalendarCog, label: 'Organisation', roles: ['Admin'] },
    { path: '/assignment', icon: FileText, label: 'Affectation', roles: ['Admin'] },
    { path: '/grades', icon: CheckCircle, label: 'Notes', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/reports', icon: FileText, label: 'Rapports', roles: ['Admin', 'Teacher'] },
    { path: '/eliminations', icon: AlertTriangle, label: 'Éliminations', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/coursera-links', icon: ExternalLink, label: 'Ressources', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/settings', icon: Settings, label: 'Paramètres', roles: ['Admin', 'Teacher', 'Student'] },
  ];

  return (
    <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-icon">
          <LayoutDashboard size={24} />
        </div>
        {sidebarOpen && <span className="brand-text">ExamAdmin</span>}
      </div>
      
      <nav className="nav-menu">
        {menuItems.map((item) => (
          item.roles.includes(role) && (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          )
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileImageStorageKey = `profileImage:${user?.id || user?._id || user?.email || 'current'}`;
  const [headerProfileImage, setHeaderProfileImage] = useState(() => (
    localStorage.getItem(profileImageStorageKey) || user?.avatar || user?.profileImage || ''
  ));

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const syncProfileImage = () => {
      setHeaderProfileImage(localStorage.getItem(profileImageStorageKey) || user?.avatar || user?.profileImage || '');
    };

    syncProfileImage();

    const handleProfileImageUpdated = (event) => {
      if (event?.detail?.key === profileImageStorageKey) {
        setHeaderProfileImage(event.detail.image || '');
        return;
      }
      syncProfileImage();
    };

    window.addEventListener('profile-image-updated', handleProfileImageUpdated);
    window.addEventListener('storage', syncProfileImage);

    return () => {
      window.removeEventListener('profile-image-updated', handleProfileImageUpdated);
      window.removeEventListener('storage', syncProfileImage);
    };
  }, [profileImageStorageKey, user?.avatar, user?.profileImage]);

  const handleNotificationClick = async (notif, e) => {
    e.stopPropagation();
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.type === 'resource_link') {
      window.location.href = '/coursera-links';
    }
    setShowNotifications(false);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllNotificationsRead();
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Rechercher..." />
        </div>
      </div>
      
      <div className="header-right">
        <div className="notification-wrapper">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="mark-all-read">
                    <Check size={14} /> Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="notification-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={32} color="#94A3B8" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={(e) => handleNotificationClick(notif, e)}
                    >
                      <div className="notification-dot-indicator"></div>
                      <div className="notification-content">
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <button 
                        className="notification-delete"
                        onClick={(e) => handleDeleteNotif(notif.id, e)}
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            {headerProfileImage ? (
              <img src={headerProfileImage} alt="Avatar utilisateur" className="user-avatar-image" />
            ) : (
              user?.name?.[0] || 'A'
            )}
          </div>
          {sidebarOpen && (
            <>
              <div className="user-info">
                <span className="user-name">{user?.name || 'Admin User'}</span>
                <span className="user-role">{user?.role || 'Admin'}</span>
              </div>
              <ChevronDown size={16} />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  // Persist dark mode across reloads
  React.useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);
  
  return (
    <div className="app-container">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-wrapper">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/exams" element={<ExamsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/organization" element={<OrganizationPage />} />
                <Route path="/assignment" element={<AssignmentPage />} />
                <Route path="/Affectation" element={<AssignmentPage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/eliminations" element={<EliminationPage />} />
                <Route path="/coursera-links" element={<CourseraLinksPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AppProvider>
      <EliminationProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#1E293B',
              color: '#fff',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }} 
        />
        <AppContent />
      </EliminationProvider>
    </AppProvider>
  );
}

export default App;