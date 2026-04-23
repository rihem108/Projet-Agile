// src/pages/UsersPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Star,
  Award
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const { users, addUser, updateUser, deleteUser } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    status: 'active',
    phone: '',
    address: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  // Mock users if empty
  const [localUsers, setLocalUsers] = useState([
    { id: 1, name: 'Dr. Mohamed Ben Ali', email: 'mohamed.benali@univ.tn', role: 'Admin', status: 'active', phone: '+216 98 123 456', address: 'Sousse, Tunisie', department: 'Administration', joinDate: '2020-09-01', avatar: 'MB', examsCount: 24, studentsCount: 450 },
    { id: 2, name: 'Prof. Sarah Williams', email: 'sarah.williams@univ.tn', role: 'Teacher', status: 'active', phone: '+216 98 234 567', address: 'Monastir, Tunisie', department: 'Mathématiques', joinDate: '2019-09-01', avatar: 'SW', examsCount: 18, studentsCount: 120 },
    { id: 3, name: 'M. Karim Ben Ali', email: 'karim.benali@univ.tn', role: 'Teacher', status: 'active', phone: '+216 98 345 678', address: 'Sfax, Tunisie', department: 'Informatique', joinDate: '2021-09-01', avatar: 'KB', examsCount: 15, studentsCount: 95 },
    { id: 4, name: 'Ahmed Mansouri', email: 'ahmed.mansouri@univ.tn', role: 'Student', status: 'active', phone: '+216 98 456 789', address: 'Tunis, Tunisie', department: 'Informatique', joinDate: '2023-09-01', avatar: 'AM', examsCount: 0, studentsCount: 0 },
    { id: 5, name: 'Leila Trabelsi', email: 'leila.trabelsi@univ.tn', role: 'Student', status: 'inactive', phone: '+216 98 567 890', address: 'Nabeul, Tunisie', department: 'Mathématiques', joinDate: '2022-09-01', avatar: 'LT', examsCount: 0, studentsCount: 0 },
  ]);

  useEffect(() => {
    if (users && users.length > 0) {
      setLocalUsers(users);
    }
  }, [users]);

  const filteredUsers = localUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: localUsers.length,
    admins: localUsers.filter(u => u.role === 'Admin').length,
    teachers: localUsers.filter(u => u.role === 'Teacher').length,
    students: localUsers.filter(u => u.role === 'Student').length,
    active: localUsers.filter(u => u.status === 'active').length,
    inactive: localUsers.filter(u => u.status === 'inactive').length,
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Student',
      status: 'active',
      phone: '',
      address: '',
      department: '',
      joinDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      address: user.address || '',
      department: user.department || '',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setLocalUsers(localUsers.filter(u => u.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetails(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingUser) {
      setLocalUsers(localUsers.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      toast.success('Utilisateur modifié avec succès');
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        examsCount: 0,
        studentsCount: 0
      };
      setLocalUsers([...localUsers, newUser]);
      toast.success('Utilisateur ajouté avec succès');
    }
    setShowModal(false);
  };

  const getRoleBadge = (role) => {
    const styles = {
      Admin: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', icon: Crown },
      Teacher: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', icon: Star },
      Student: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', icon: Award }
    };
    const style = styles[role] || styles.Student;
    const Icon = style.icon;
    return (
      <span className="role-badge" style={{ background: style.bg, color: style.color }}>
        <Icon size={12} />
        {role}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="status-badge active">
          <CheckCircle size={12} />
          Actif
        </span>
      );
    }
    return (
      <span className="status-badge inactive">
        <XCircle size={12} />
        Inactif
      </span>
    );
  };

  return (
    <div className="users-page">
      {/* Hero Section */}
      <div className="users-hero">
        <div className="users-hero-content">
          <div className="users-hero-icon">
            <Users size={28} />
          </div>
          <div>
            <h1>Gestion des Utilisateurs</h1>
            <p>Gérez les comptes administrateurs, enseignants et étudiants</p>
          </div>
        </div>
        <button className="users-add-btn" onClick={handleAdd}>
          <Plus size={18} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="users-stats-grid">
        <div className="users-stat-card">
          <div className="users-stat-icon total">
            <Users size={20} />
          </div>
          <div className="users-stat-info">
            <span className="users-stat-value">{stats.total}</span>
            <span className="users-stat-label">Total</span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon admins">
            <Crown size={20} />
          </div>
          <div className="users-stat-info">
            <span className="users-stat-value">{stats.admins}</span>
            <span className="users-stat-label">Administrateurs</span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon teachers">
            <Star size={20} />
          </div>
          <div className="users-stat-info">
            <span className="users-stat-value">{stats.teachers}</span>
            <span className="users-stat-label">Enseignants</span>
          </div>
        </div>
        <div className="users-stat-card">
          <div className="users-stat-icon students">
            <Award size={20} />
          </div>
          <div className="users-stat-info">
            <span className="users-stat-value">{stats.students}</span>
            <span className="users-stat-label">Étudiants</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="users-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="users-filter-group">
          <Filter size={18} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tous les rôles</option>
            <option value="Admin">Administrateurs</option>
            <option value="Teacher">Enseignants</option>
            <option value="Student">Étudiants</option>
          </select>
        </div>
        <div className="users-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-wrapper">
        <div className="users-table-header">
          <h3>Liste des utilisateurs</h3>
          <span className="users-count">{filteredUsers.length} utilisateur(s)</span>
        </div>
        
        <div className="users-table-container">
          {filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Contact</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Date d'adhésion</th>
                  <th className="users-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="users-table-row">
                    <td className="user-cell">
                      <div className="user-avatar-modern">
                        <div className="user-avatar-ring">
                          <div className="user-avatar-inner">
                            {user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <div className="contact-info">
                        <div><Phone size={12} /> {user.phone || 'Non renseigné'}</div>
                        {user.department && <div><Mail size={12} /> {user.department}</div>}
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td className="date-cell">{user.joinDate || '2024-01-01'}</td>
                    <td className="users-actions-cell">
                      <div className="users-actions">
                        <button className="users-action-btn view" onClick={() => handleViewDetails(user)} title="Voir détails">
                          <Eye size={16} />
                        </button>
                        <button className="users-action-btn edit" onClick={() => handleEdit(user)} title="Modifier">
                          <Edit size={16} />
                        </button>
                        <button className="users-action-btn delete" onClick={() => handleDelete(user.id)} title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="users-empty-state">
              <div className="users-empty-icon">
                <Users size={48} />
              </div>
              <h4>Aucun utilisateur trouvé</h4>
              <p>Cliquez sur "Nouvel utilisateur" pour en ajouter un.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="users-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h3>Détails de l'utilisateur</h3>
              <button className="users-modal-close" onClick={() => setShowDetails(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="users-modal-body">
              <div className="user-detail-avatar">
                <div className="detail-avatar-ring">
                  <div className="detail-avatar-inner">
                    {selectedUser.avatar || selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>
                {getRoleBadge(selectedUser.role)}
              </div>
              <div className="user-detail-info">
                <div className="detail-row">
                  <label>Nom complet</label>
                  <p>{selectedUser.name}</p>
                </div>
                <div className="detail-row">
                  <label>Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div className="detail-row">
                  <label>Téléphone</label>
                  <p>{selectedUser.phone || 'Non renseigné'}</p>
                </div>
                <div className="detail-row">
                  <label>Adresse</label>
                  <p>{selectedUser.address || 'Non renseignée'}</p>
                </div>
                <div className="detail-row">
                  <label>Département</label>
                  <p>{selectedUser.department || 'Non renseigné'}</p>
                </div>
                <div className="detail-row">
                  <label>Date d'adhésion</label>
                  <p>{selectedUser.joinDate || '2024-01-01'}</p>
                </div>
                <div className="detail-row">
                  <label>Statut</label>
                  <p>{getStatusBadge(selectedUser.status)}</p>
                </div>
              </div>
            </div>
            <div className="users-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetails(false)}>Fermer</button>
              <button className="btn-primary" onClick={() => {
                setShowDetails(false);
                handleEdit(selectedUser);
              }}>Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="users-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="users-modal-header">
              <h3>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h3>
              <button className="users-modal-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="users-modal-body">
              <div className="users-form-group">
                <label>Nom complet *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nom et prénom" />
              </div>
              <div className="users-form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@exemple.com" />
              </div>
              <div className="users-form-row">
                <div className="users-form-group">
                  <label>Rôle</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Admin">Administrateur</option>
                    <option value="Teacher">Enseignant</option>
                    <option value="Student">Étudiant</option>
                  </select>
                </div>
                <div className="users-form-group">
                  <label>Statut</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="users-form-row">
                <div className="users-form-group">
                  <label>Téléphone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+216 XX XXX XXX" />
                </div>
                <div className="users-form-group">
                  <label>Département</label>
                  <input type="text" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} placeholder="Département" />
                </div>
              </div>
              <div className="users-form-group">
                <label>Adresse</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Adresse complète" />
              </div>
              <div className="users-form-group">
                <label>Date d'adhésion</label>
                <input type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} />
              </div>
            </div>
            <div className="users-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingUser ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;