// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [resourceLinks, setResourceLinks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(u => {
          setIsAuthenticated(true);
          setUser(u);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoadingInitial(false));
    } else {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load data from backend based on user role
      const loadData = async () => {
        try {
          const [usersData, examsData, roomsData, assignmentsData, gradesData, resourceLinksData, notificationsData] = await Promise.all([
            api.get('/users').catch(() => []),
            api.get('/exams').catch(() => []),
            api.get('/rooms').catch(() => []),
            api.get('/assignments').catch(() => []),
            api.get('/grades').catch(() => []),
            api.get('/resource-links').catch(() => []),
            api.get('/notifications').catch(() => [])
          ]);
          setUsers(usersData);
          setExams(examsData);
          setRooms(roomsData);
          setAssignments(assignmentsData);
          setGrades(gradesData);
          setResourceLinks(resourceLinksData);
          setNotifications(notificationsData);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };
      loadData();
    }
  }, [isAuthenticated, user]);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      setUser(res.user);
      toast.success(`Bienvenue ${res.user.name || role} !`);
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Identifiants incorrects ou erreur serveur");
      return false;
    }
  };

  const register = async (name, email, password, role, className) => {
    try {
      const payload = { name, email, password, role };
      if (role === 'Student') {
        payload.className = className;
      }
      const res = await api.post('/auth/register', payload);
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      setUser(res.user);
      toast.success("Compte créé avec succès ! Bienvenue.");
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erreur lors de l'inscription : Cet email existe déjà.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  // CRUD operations for users
  const addUser = async (userData) => {
    try {
      const newUser = await api.post('/users', userData);
      setUsers([...users, newUser]);
      toast.success('Utilisateur ajouté avec succès');
      return newUser;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
      return null;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await api.put(`/users/${id}`, userData);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      toast.success('Utilisateur mis à jour avec succès');
      return updatedUser;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('Utilisateur supprimé avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for exams
  const addExam = async (examData) => {
    try {
      const newExam = await api.post('/exams', examData);
      setExams([...exams, newExam]);
      toast.success('Examen ajouté avec succès');
      return newExam;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
      return null;
    }
  };

  const updateExam = async (id, examData) => {
    try {
      const updatedExam = await api.put(`/exams/${id}`, examData);
      setExams(exams.map(e => e.id === id ? updatedExam : e));
      toast.success('Examen mis à jour avec succès');
      return updatedExam;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteExam = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      setExams(exams.filter(e => e.id !== id));
      toast.success('Examen supprimé avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for rooms
  const addRoom = async (roomData) => {
    try {
      const newRoom = await api.post('/rooms', roomData);
      setRooms([...rooms, newRoom]);
      toast.success('Salle ajoutée avec succès');
      return newRoom;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
      return null;
    }
  };

  const updateRoom = async (id, roomData) => {
    try {
      const updatedRoom = await api.put(`/rooms/${id}`, roomData);
      setRooms(rooms.map(r => r.id === id ? updatedRoom : r));
      toast.success('Salle mise à jour avec succès');
      return updatedRoom;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteRoom = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      setRooms(rooms.filter(r => r.id !== id));
      toast.success('Salle supprimée avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for assignments
  const addAssignment = async (assignmentData) => {
    try {
      const newAssignment = await api.post('/assignments', assignmentData);
      setAssignments([...assignments, newAssignment]);
      toast.success('Affectation ajoutée avec succès');
      return newAssignment;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
      return null;
    }
  };

  const updateAssignment = async (id, assignmentData) => {
    try {
      const updatedAssignment = await api.put(`/assignments/${id}`, assignmentData);
      setAssignments(assignments.map(a => a.id === id ? updatedAssignment : a));
      toast.success('Affectation mise à jour avec succès');
      return updatedAssignment;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteAssignment = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(assignments.filter(a => a.id !== id));
      toast.success('Affectation supprimée avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for grades
  const addGrade = async (gradeData) => {
    try {
      const newGrade = await api.post('/grades', gradeData);
      setGrades([...grades, newGrade]);
      toast.success('Note ajoutée avec succès');
      return newGrade;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
      return null;
    }
  };

  const updateGrade = async (id, gradeData) => {
    try {
      const updatedGrade = await api.put(`/grades/${id}`, gradeData);
      setGrades(grades.map(g => g.id === id ? updatedGrade : g));
      toast.success('Note mise à jour avec succès');
      return updatedGrade;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteGrade = async (id) => {
    try {
      await api.delete(`/grades/${id}`);
      setGrades(grades.filter(g => g.id !== id));
      toast.success('Note supprimée avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for resource links
  const addResourceLink = async (linkData) => {
    try {
      const newLink = await api.post('/resource-links', linkData);
      setResourceLinks([...resourceLinks, newLink]);
      toast.success('Lien de cours assigné avec succès');
      return newLink;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'assignation');
      return null;
    }
  };

  const deleteResourceLink = async (id) => {
    try {
      await api.delete(`/resource-links/${id}`);
      setResourceLinks(resourceLinks.filter(l => l.id !== id));
      toast.success('Lien supprimé avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // CRUD operations for notifications
  const markNotificationRead = async (id) => {
    try {
      const updated = await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('Toutes les notifications marquées comme lues');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur');
      return false;
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader-spinner" style={{ margin: '0 auto 20px' }}></div>
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout,
      // Data states
      users, setUsers,
      exams, setExams,
      rooms, setRooms,
      assignments, setAssignments,
      grades, setGrades,
      resourceLinks, setResourceLinks,
      notifications, setNotifications,
      // CRUD operations
      addUser, updateUser, deleteUser,
      addExam, updateExam, deleteExam,
      addRoom, updateRoom, deleteRoom,
      addAssignment, updateAssignment, deleteAssignment,
      addGrade, updateGrade, deleteGrade,
      addResourceLink, deleteResourceLink,
      markNotificationRead, markAllNotificationsRead, deleteNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};