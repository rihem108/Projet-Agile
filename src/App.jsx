import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, MapPin, CalendarCog, FileText, CheckCircle, LogOut } from 'lucide-react';
import { AppProvider, AppContext } from './context/AppContext';
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
import Login from './pages/Login';

const Sidebar = () => {
  const { user, logout } = useContext(AppContext);
  const role = user?.role || 'Student';

  return (
    <aside className="sidebar">
      <div className="brand">
        <LayoutDashboard size={28} color="#0ea5e9" />
        ExamAdmin
      </div>
      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard /> Tableau de Bord
        </NavLink>
        {role === 'Admin' && (
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users /> Utilisateurs
          </NavLink>
        )}
        <NavLink to="/exams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <BookOpen /> Examens
        </NavLink>
        {role === 'Admin' && (
          <NavLink to="/rooms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <MapPin /> Salles
          </NavLink>
        )}
        {role === 'Admin' && (
          <NavLink to="/organization" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarCog /> Organisation
          </NavLink>
        )}
        <NavLink to="/grades" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <CheckCircle /> Notes
        </NavLink>
        {(role === 'Admin' || role === 'Teacher') && (
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText /> Rapports
          </NavLink>
        )}
         {(role === 'Admin') && (
          <NavLink to="/assignment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText /> Affectation
          </NavLink>
        )}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <button onClick={logout} className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut color="var(--danger)" /> 
          <span style={{ color: 'var(--danger)' }}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const MainLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

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
                <Route path="/assignment" element={<AssignmentPage />} />
                <Route path="/Affectation" element={<AssignmentPage />} />
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
      <Toaster position="top-right" toastOptions={{
        style: {
          borderRadius: '10px',
          background: '#0F172A',
          color: '#fff',
        },
      }} />
      <AppContent />
    </AppProvider>
  );
}

export default App;

