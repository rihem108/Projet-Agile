// src/pages/RoomsPage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { 
  DoorOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Wifi,
  Wind,
  Monitor,
  Coffee,
  ClipboardList,
  Activity
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import './RoomsPage.css';

const RoomsPage = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    type: 'standard',
    status: 'available',
    equipment: [],
    description: ''
  });

  // Available equipment options
  const equipmentOptions = [
    { id: 'projector', label: 'Projecteur', icon: Monitor },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'ac', label: 'Climatisation', icon: Wind },
    { id: 'coffee', label: 'Cafétéria', icon: Coffee },
  ];

  // Mock rooms if empty
  const [localRooms, setLocalRooms] = useState([
    { id: 1, name: 'Amphithéâtre A', building: 'Bâtiment A', floor: 'RDC', capacity: 150, type: 'amphitheater', status: 'available', equipment: ['projector', 'wifi', 'ac'], description: 'Grand amphithéâtre équipé pour les conférences', currentExam: null, nextExam: 'Mathématiques - 15/05/2026' },
    { id: 2, name: 'Laboratoire B', building: 'Bâtiment B', floor: '1er étage', capacity: 30, type: 'lab', status: 'available', equipment: ['wifi', 'ac'], description: 'Laboratoire informatique', currentExam: null, nextExam: 'Physique - 16/05/2026' },
    { id: 3, name: 'Salle A101', building: 'Bâtiment A', floor: '1er étage', capacity: 40, type: 'standard', status: 'occupied', equipment: ['projector', 'wifi'], description: 'Salle de cours standard', currentExam: 'Informatique - 10:00', nextExam: 'Informatique - 18/05/2026' },
    { id: 4, name: 'Salle B202', building: 'Bâtiment B', floor: '2ème étage', capacity: 35, type: 'standard', status: 'available', equipment: ['projector', 'wifi', 'ac'], description: 'Salle lumineuse avec vue', currentExam: null, nextExam: 'Anglais - 20/05/2026' },
    { id: 5, name: 'Salle C303', building: 'Bâtiment C', floor: '3ème étage', capacity: 25, type: 'small', status: 'maintenance', equipment: ['wifi'], description: 'Salle en maintenance', currentExam: null, nextExam: null },
  ]);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setLocalRooms(rooms);
    }
  }, [rooms]);

  // Get unique buildings for filter
  const buildings = ['all', ...new Set(localRooms.map(r => r.building))];

  const filteredRooms = localRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = filterBuilding === 'all' || room.building === filterBuilding;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesCapacity = filterCapacity === 'all' || 
      (filterCapacity === 'small' && room.capacity <= 30) ||
      (filterCapacity === 'medium' && room.capacity > 30 && room.capacity <= 60) ||
      (filterCapacity === 'large' && room.capacity > 60);
    return matchesSearch && matchesBuilding && matchesStatus && matchesCapacity;
  });

  const stats = {
    total: localRooms.length,
    available: localRooms.filter(r => r.status === 'available').length,
    occupied: localRooms.filter(r => r.status === 'occupied').length,
    maintenance: localRooms.filter(r => r.status === 'maintenance').length,
    totalCapacity: localRooms.reduce((acc, r) => acc + r.capacity, 0),
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      building: '',
      floor: '',
      capacity: '',
      type: 'standard',
      status: 'available',
      equipment: [],
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      building: room.building,
      floor: room.floor || '',
      capacity: room.capacity,
      type: room.type || 'standard',
      status: room.status,
      equipment: room.equipment || [],
      description: room.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) {
      setLocalRooms(localRooms.filter(r => r.id !== id));
      toast.success('Salle supprimée avec succès');
    }
  };

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
    setShowDetails(true);
  };

  const handleToggleEquipment = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.building || !formData.capacity) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingRoom) {
      setLocalRooms(localRooms.map(r => 
        r.id === editingRoom.id 
          ? { ...r, ...formData, capacity: parseInt(formData.capacity) }
          : r
      ));
      toast.success('Salle modifiée avec succès');
    } else {
      const newRoom = {
        id: Date.now(),
        ...formData,
        capacity: parseInt(formData.capacity),
        currentExam: null,
        nextExam: null
      };
      setLocalRooms([...localRooms, newRoom]);
      toast.success('Salle ajoutée avec succès');
    }
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const statuses = {
      available: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', icon: CheckCircle, label: 'Disponible' },
      occupied: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', icon: Activity, label: 'Occupée' },
      maintenance: { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', icon: AlertCircle, label: 'Maintenance' }
    };
    const s = statuses[status] || statuses.available;
    const Icon = s.icon;
    return (
      <span className="room-status-badge" style={{ background: s.bg, color: s.color }}>
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      amphitheater: { bg: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6', label: 'Amphithéâtre' },
      lab: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', label: 'Laboratoire' },
      standard: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981', label: 'Standard' },
      small: { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', label: 'Petite' }
    };
    const t = types[type] || types.standard;
    return (
      <span className="room-type-badge" style={{ background: t.bg, color: t.color }}>
        {t.label}
      </span>
    );
  };

  const getEquipmentIcon = (equipment) => {
    const icons = {
      projector: Monitor,
      wifi: Wifi,
      ac: Wind,
      coffee: Coffee
    };
    const Icon = icons[equipment] || Monitor;
    return <Icon size={14} />;
  };

  return (
    <div className="rooms-page">
      {/* Hero Section */}
      <div className="rooms-hero">
        <div className="rooms-hero-content">
          <div className="rooms-hero-icon">
            <DoorOpen size={28} />
          </div>
          <div>
            <h1>Gestion des Salles</h1>
            <p>Gérez les salles et leurs disponibilités</p>
          </div>
        </div>
        <button className="rooms-add-btn" onClick={handleAdd}>
          <Plus size={18} />
          Nouvelle salle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="rooms-stats-grid">
        <div className="rooms-stat-card">
          <div className="rooms-stat-icon total">
            <DoorOpen size={20} />
          </div>
          <div className="rooms-stat-info">
            <span className="rooms-stat-value">{stats.total}</span>
            <span className="rooms-stat-label">Total salles</span>
          </div>
        </div>
        <div className="rooms-stat-card">
          <div className="rooms-stat-icon available">
            <CheckCircle size={20} />
          </div>
          <div className="rooms-stat-info">
            <span className="rooms-stat-value">{stats.available}</span>
            <span className="rooms-stat-label">Disponibles</span>
          </div>
        </div>
        <div className="rooms-stat-card">
          <div className="rooms-stat-icon occupied">
            <Activity size={20} />
          </div>
          <div className="rooms-stat-info">
            <span className="rooms-stat-value">{stats.occupied}</span>
            <span className="rooms-stat-label">Occupées</span>
          </div>
        </div>
        <div className="rooms-stat-card">
          <div className="rooms-stat-icon capacity">
            <Users size={20} />
          </div>
          <div className="rooms-stat-info">
            <span className="rooms-stat-value">{stats.totalCapacity}</span>
            <span className="rooms-stat-label">Capacité totale</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rooms-filters">
        <div className="rooms-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou bâtiment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rooms-filter-group">
          <Building size={18} />
          <select value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)}>
            {buildings.map(building => (
              <option key={building} value={building}>
                {building === 'all' ? 'Tous les bâtiments' : building}
              </option>
            ))}
          </select>
        </div>
        <div className="rooms-filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles</option>
            <option value="occupied">Occupées</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="rooms-filter-group">
          <Users size={18} />
          <select value={filterCapacity} onChange={(e) => setFilterCapacity(e.target.value)}>
            <option value="all">Toutes capacités</option>
            <option value="small">Petite (-30)</option>
            <option value="medium">Moyenne (30-60)</option>
            <option value="large">Grande (+60)</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rooms-table-wrapper">
        <div className="rooms-table-header">
          <h3>Liste des salles</h3>
          <span className="rooms-count">{filteredRooms.length} salle(s)</span>
        </div>
        
        <div className="rooms-table-container">
          {filteredRooms.length > 0 ? (
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Salle</th>
                  <th>Bâtiment</th>
                  <th>Étage</th>
                  <th>Capacité</th>
                  <th>Type</th>
                  <th>Équipements</th>
                  <th>Prochain examen</th>
                  <th>Statut</th>
                  <th className="rooms-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="rooms-table-row">
                    <td className="room-cell">
                      <div className="room-info">
                        <div className="room-name">{room.name}</div>
                      </div>
                    </td>
                    <td className="building-cell">
                      <div className="room-building">
                        <Building size={14} />
                        <span>{room.building}</span>
                      </div>
                    </td>
                    <td className="floor-cell">{room.floor || '-'}</td>
                    <td className="capacity-cell">
                      <div className="room-capacity">
                        <Users size={14} />
                        <span>{room.capacity}</span>
                      </div>
                    </td>
                    <td>{getTypeBadge(room.type)}</td>
                    <td className="equipment-cell">
                      <div className="room-equipment">
                        {room.equipment && room.equipment.length > 0 ? (
                          room.equipment.map(eq => (
                            <span key={eq} className="equipment-badge" title={eq}>
                              {getEquipmentIcon(eq)}
                            </span>
                          ))
                        ) : (
                          <span className="no-equipment">-</span>
                        )}
                      </div>
                    </td>
                    <td className="next-exam-cell">
                      {room.nextExam ? (
                        <div className="next-exam">
                          <Calendar size={14} />
                          <span>{room.nextExam}</span>
                        </div>
                      ) : (
                        <span className="no-exam">Aucun</span>
                      )}
                    </td>
                    <td>{getStatusBadge(room.status)}</td>
                    <td className="rooms-actions-cell">
                      <div className="rooms-actions">
                        <button className="rooms-action-btn view" onClick={() => handleViewDetails(room)} title="Voir détails">
                          <Eye size={16} />
                        </button>
                        <button className="rooms-action-btn edit" onClick={() => handleEdit(room)} title="Modifier">
                          <Edit size={16} />
                        </button>
                        <button className="rooms-action-btn delete" onClick={() => handleDelete(room.id)} title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="rooms-empty-state">
              <div className="rooms-empty-icon">
                <DoorOpen size={48} />
              </div>
              <h4>Aucune salle trouvée</h4>
              <p>Cliquez sur "Nouvelle salle" pour en ajouter une.</p>
            </div>
          )}
        </div>
      </div>

      {/* Room Details Modal */}
      {showDetails && selectedRoom && (
        <div className="rooms-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="rooms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rooms-modal-header">
              <h3>Détails de la salle</h3>
              <button className="rooms-modal-close" onClick={() => setShowDetails(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="rooms-modal-body">
              <div className="room-detail-header">
                <div className="room-detail-title">
                  <DoorOpen size={24} />
                  <div>
                    <h4>{selectedRoom.name}</h4>
                    <span>{selectedRoom.building} - {selectedRoom.floor || 'RDC'}</span>
                  </div>
                </div>
                {getStatusBadge(selectedRoom.status)}
              </div>
              
              <div className="room-detail-grid">
                <div className="detail-item">
                  <Users size={16} />
                  <div>
                    <label>Capacité</label>
                    <p>{selectedRoom.capacity} personnes</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Building size={16} />
                  <div>
                    <label>Type</label>
                    <p>{getTypeBadge(selectedRoom.type)}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <label>Prochain examen</label>
                    <p>{selectedRoom.nextExam || 'Aucun'}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <ClipboardList size={16} />
                  <div>
                    <label>Examen en cours</label>
                    <p>{selectedRoom.currentExam || 'Aucun'}</p>
                  </div>
                </div>
              </div>
              
              <div className="room-equipment-detail">
                <label>Équipements</label>
                <div className="equipment-list">
                  {selectedRoom.equipment && selectedRoom.equipment.length > 0 ? (
                    selectedRoom.equipment.map(eq => {
                      const eqOption = equipmentOptions.find(o => o.id === eq);
                      const Icon = eqOption?.icon || Monitor;
                      return (
                        <span key={eq} className="equipment-item">
                          <Icon size={14} />
                          {eqOption?.label || eq}
                        </span>
                      );
                    })
                  ) : (
                    <span className="no-equipment">Aucun équipement</span>
                  )}
                </div>
              </div>
              
              {selectedRoom.description && (
                <div className="room-description">
                  <label>Description</label>
                  <p>{selectedRoom.description}</p>
                </div>
              )}
            </div>
            <div className="rooms-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetails(false)}>Fermer</button>
              <button className="btn-primary" onClick={() => {
                setShowDetails(false);
                handleEdit(selectedRoom);
              }}>Modifier</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="rooms-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rooms-modal rooms-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="rooms-modal-header">
              <h3>{editingRoom ? 'Modifier la salle' : 'Ajouter une salle'}</h3>
              <button className="rooms-modal-close" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="rooms-modal-body">
              <div className="rooms-form-row">
                <div className="rooms-form-group">
                  <label>Nom de la salle *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ex: Amphithéâtre A" />
                </div>
                <div className="rooms-form-group">
                  <label>Bâtiment *</label>
                  <input type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} placeholder="Ex: Bâtiment A" />
                </div>
              </div>
              <div className="rooms-form-row">
                <div className="rooms-form-group">
                  <label>Étage</label>
                  <input type="text" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} placeholder="Ex: RDC, 1er étage..." />
                </div>
                <div className="rooms-form-group">
                  <label>Capacité *</label>
                  <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} placeholder="Nombre de places" />
                </div>
                <div className="rooms-form-group">
                  <label>Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="amphitheater">Amphithéâtre</option>
                    <option value="lab">Laboratoire</option>
                    <option value="standard">Standard</option>
                    <option value="small">Petite</option>
                  </select>
                </div>
              </div>
              <div className="rooms-form-group">
                <label>Équipements</label>
                <div className="equipment-checkboxes">
                  {equipmentOptions.map(eq => {
                    const Icon = eq.icon;
                    return (
                      <label key={eq.id} className="equipment-checkbox">
                        <input 
                          type="checkbox" 
                          checked={formData.equipment.includes(eq.id)}
                          onChange={() => handleToggleEquipment(eq.id)}
                        />
                        <Icon size={14} />
                        <span>{eq.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="rooms-form-row">
                <div className="rooms-form-group">
                  <label>Statut</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="available">Disponible</option>
                    <option value="occupied">Occupée</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="rooms-form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" placeholder="Description de la salle..." />
              </div>
            </div>
            <div className="rooms-modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingRoom ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;