import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from './AppContext';
import { api } from '../api';
import toast from 'react-hot-toast';

const EliminationContext = createContext();

export const EliminationProvider = ({ children }) => {
  const { user } = useContext(AppContext);
  const [eliminations, setEliminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Fetch eliminations from API
  const fetchEliminations = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.get('/eliminations');
      setEliminations(data);
    } catch (err) {
      console.error('Error fetching eliminations:', err);
      toast.error(err.message || 'Erreur lors du chargement des éliminations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEliminations();
  }, [fetchEliminations]);

  // Calculate eliminations from attendance (Admin only)
  const calculateEliminations = async () => {
    try {
      setCalculating(true);
      const result = await api.post('/eliminations/calculate', {});
      toast.success(result.message);
      await fetchEliminations();
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors du calcul');
      return false;
    } finally {
      setCalculating(false);
    }
  };

  // Publish eliminations (Admin only)
  const publishEliminations = async () => {
    try {
      setPublishing(true);
      const result = await api.post('/eliminations/publish', {});
      toast.success(result.message);
      await fetchEliminations();
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la publication');
      return false;
    } finally {
      setPublishing(false);
    }
  };

  // Delete elimination (Admin only)
  const deleteElimination = async (id) => {
    try {
      await api.delete(`/eliminations/${id}`);
      toast.success('Élimination supprimée');
      await fetchEliminations();
      return true;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
      return false;
    }
  };

  // Get status based on absence rate
  const getEliminationStatus = (absenceRate) => {
    if (absenceRate >= 66.67) return 'at_risk';
    if (absenceRate >= 33.34) return 'eliminated';
    return 'safe';
  };

  // Get status label
  const getStatusLabel = (status) => {
    if (status === 'eliminated') return 'Éliminé';
    if (status === 'at_risk') return 'À risque';
    return 'Safe';
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'eliminated') return '#EF4444';
    if (status === 'at_risk') return '#F59E0B';
    return '#10B981';
  };

  // Get eliminations by student ID
  const getStudentEliminations = (studentId) => {
    return eliminations.filter(e => String(e.studentId) === String(studentId));
  };

  // Get eliminations by exam ID (for teachers)
  const getExamEliminations = (examId) => {
    return eliminations.filter(e => String(e.examId) === String(examId));
  };

  // Get disqualified students (🔴)
  const getEliminatedStudents = () => {
    return eliminations.filter(e => e.status === 'eliminated');
  };

  // Get at-risk students (🟡)
  const getAtRiskStudents = () => {
    return eliminations.filter(e => e.status === 'at_risk');
  };

  // Get all eliminations
  const getAllEliminations = () => {
    return eliminations;
  };

  // Get unpublished count
  const getUnpublishedCount = () => {
    return eliminations.filter(e => !e.published).length;
  };

  const value = {
    eliminations,
    loading,
    calculating,
    publishing,
    fetchEliminations,
    calculateEliminations,
    publishEliminations,
    deleteElimination,
    getStudentEliminations,
    getExamEliminations,
    getEliminatedStudents,
    getAtRiskStudents,
    getAllEliminations,
    getEliminationStatus,
    getStatusLabel,
    getStatusColor,
    getUnpublishedCount,
  };

  return (
    <EliminationContext.Provider value={value}>
      {children}
    </EliminationContext.Provider>
  );
};

export const useElimination = () => {
  const context = useContext(EliminationContext);
  if (!context) {
    throw new Error('useElimination must be used within EliminationProvider');
  }
  return context;
};

