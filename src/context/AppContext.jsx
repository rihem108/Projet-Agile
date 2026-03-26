import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);

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

  const login = (email, password) => {
    // Fake login
    setIsAuthenticated(true);
    setUser({ email, role: 'ADMIN' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      login,
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
