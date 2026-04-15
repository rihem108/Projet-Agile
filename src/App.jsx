// App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, MapPin, CalendarCog, FileText, CheckCircle, LogOut, Bell, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { AppProvider, AppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ExamsPage from './pages/ExamsPage';
import RoomsPage from './pages/RoomsPage';
import OrganizationPage from './pages/OrganizationPage';
import GradesPage from './pages/GradesPage';
import ReportsPage from './pages/ReportsPage';
import Login from './pages/Login';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useContext(AppContext);
  const role = user?.role || 'Student';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/users', icon: Users, label: 'Utilisateurs', roles: ['Admin'] },
    { path: '/exams', icon: BookOpen, label: 'Examens', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/rooms', icon: MapPin, label: 'Salles', roles: ['Admin'] },
    { path: '/organization', icon: CalendarCog, label: 'Organisation', roles: ['Admin'] },
    { path: '/grades', icon: CheckCircle, label: 'Notes', roles: ['Admin', 'Teacher', 'Student'] },
    { path: '/reports', icon: FileText, label: 'Rapports', roles: ['Admin', 'Teacher'] },
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
  const { user } = useContext(AppContext);
  
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
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name?.[0] || 'A'}
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
        
        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/exams" element={<ExamsPage />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/organization" element={<OrganizationPage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
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
    </AppProvider>
  );
}

export default App;