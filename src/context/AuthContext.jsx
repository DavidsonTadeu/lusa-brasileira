import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // 'login', 'register' ou 'teaser' (o novo modo de convite)
  const [authView, setAuthView] = useState('login'); 
  const [redirectAction, setRedirectAction] = useState(null);
  
  // Ref para garantir que o popup automático só apareça uma vez por recarga de página
  const hasShownAutoPopup = useRef(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  const login = async (email, password) => {
    const user = await base44.auth.login(email, password);
    setUser(user);
    setIsAuthModalOpen(false);
    queryClient.invalidateQueries();
    if (redirectAction) {
      redirectAction();
      setRedirectAction(null);
    }
  };

  const register = async (data) => {
    const user = await base44.auth.register(data);
    setUser(user);
    setIsAuthModalOpen(false);
    queryClient.invalidateQueries();
    if (redirectAction) {
      redirectAction();
      setRedirectAction(null);
    }
  };

  const logout = () => {
    base44.auth.logout();
    setUser(null);
  };

  // Abre modal direto no Login (ex: clicou em Agendar)
  const openLogin = (onSuccess = null) => {
    setAuthView('login');
    setRedirectAction(() => onSuccess);
    setIsAuthModalOpen(true);
  };

  // Abre modal no modo Teaser (Convite automático)
  const openTeaser = () => {
    if (!hasShownAutoPopup.current && !user) {
      setAuthView('teaser');
      setIsAuthModalOpen(true);
      hasShownAutoPopup.current = true; // Marca que já mostrou
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthModalOpen, 
      setIsAuthModalOpen, 
      openLogin,
      openTeaser,
      authView,
      setAuthView 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);