import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(u => {
          setIsAuthenticated(true);
          setUser(u);
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoadingInitial(false));
    } else {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Load data from backend
      api.get('/users').then(setUsers).catch(console.error);
      api.get('/exams').then(setExams).catch(console.error);
      api.get('/rooms').then(setRooms).catch(console.error);
      api.get('/assignments').then(setAssignments).catch(console.error);
      api.get('/grades').then(setGrades).catch(console.error);
    }
  }, [isAuthenticated]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      setUser(res.user);
    } catch (err) {
      console.error(err);
      alert("Identifiants incorrects ou erreur serveur");
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', res.token);
      setIsAuthenticated(true);
      setUser(res.user);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription : " + err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loadingInitial) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Chargement...</div>;
  }

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      login,
      register,
      logout,
      users, setUsers,
      exams, setExams,
      rooms, setRooms,
      assignments, setAssignments,
      grades, setGrades
    }}>
      {children}
    </AppContext.Provider>
  );
};
