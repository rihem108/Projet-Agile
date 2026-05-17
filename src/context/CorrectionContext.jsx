import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

export const CorrectionContext = createContext();

export const CorrectionProvider = ({ children }) => {
  const { user, grades, exams } = useContext(AppContext);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCorrectionRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const requests = await api.get('/correction-requests');
        setCorrectionRequests(requests);
      } catch (error) {
        console.error('Error loading correction requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCorrectionRequests();
  }, [user]);

  // Add correction request
  const addCorrectionRequest = async (requestData) => {
    try {
      const newRequest = await api.post('/correction-requests', requestData);
      setCorrectionRequests([...correctionRequests, newRequest]);
      toast.success('Demande de correction soumise avec succès');
      return newRequest;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la soumission');
      return null;
    }
  };

  // Admin decision
  const makeAdminDecision = async (id, decision, approved) => {
    try {
      const updatedRequest = await api.put(`/correction-requests/${id}/admin-decision`, {
        decision,
        approved
      });
      setCorrectionRequests(correctionRequests.map(req => 
        req.id === id ? updatedRequest : req
      ));
      toast.success(approved ? 'Demande approuvée' : 'Demande rejetée');
      return updatedRequest;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la décision');
      return null;
    }
  };

  // Teacher decision
  const makeTeacherDecision = async (id, decision, newGrade) => {
    try {
      const updatedRequest = await api.put(`/correction-requests/${id}/teacher-decision`, {
        decision,
        newGrade
      });
      setCorrectionRequests(correctionRequests.map(req => 
        req.id === id ? updatedRequest : req
      ));
      toast.success('Décision enregistrée avec succès');
      return updatedRequest;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la décision');
      return null;
    }
  };

  // Delete correction request (admin only)
  const deleteCorrectionRequest = async (id) => {
    try {
      await api.delete(`/correction-requests/${id}`);
      setCorrectionRequests(correctionRequests.filter(req => req.id !== id));
      toast.success('Demande supprimée avec succès');
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // Get requests for current user based on role
  const getMyRequests = () => {
    if (!user) return [];
    
    if (user.role === 'Student') {
      return correctionRequests.filter(req => String(req.studentId) === String(user.id));
    }
    
    if (user.role === 'Teacher') {
      return correctionRequests.filter(req => 
        String(req.teacherId) === String(user.id) && 
        ['admin_approved', 'teacher_reviewed', 'completed'].includes(req.status)
      );
    }
    
    return correctionRequests; // Admin sees all
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'admin_approved': return '#3B82F6';
      case 'admin_rejected': return '#EF4444';
      case 'teacher_reviewed': return '#8B5CF6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'admin_approved': return 'Approuvé par admin';
      case 'admin_rejected': return 'Rejeté par admin';
      case 'teacher_reviewed': return 'Traité par enseignant';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  // Get type label
  const getTypeLabel = (type) => {
    return type === 'second_correction' ? 'Seconde correction' : 'Vérification de note';
  };

  if (loading) {
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
    <CorrectionContext.Provider value={{
      correctionRequests,
      setCorrectionRequests,
      addCorrectionRequest,
      makeAdminDecision,
      makeTeacherDecision,
      deleteCorrectionRequest,
      getMyRequests,
      getStatusColor,
      getStatusLabel,
      getTypeLabel,
      loading
    }}>
      {children}
    </CorrectionContext.Provider>
  );
};

export const useCorrection = () => {
  const context = useContext(CorrectionContext);
  if (!context) {
    throw new Error('useCorrection must be used within CorrectionProvider');
  }
  return context;
};
