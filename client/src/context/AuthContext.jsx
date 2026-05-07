import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('collabtrack_user');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('collabtrack_user');
      localStorage.removeItem('collabtrack_token');
      return null;
    }
  });
  const [bootstrapping, setBootstrapping] = useState(Boolean(localStorage.getItem('collabtrack_token')));

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await api.get('/users/me');
        setUser(data.user);
        localStorage.setItem('collabtrack_user', JSON.stringify(data.user));
      } catch {
        localStorage.removeItem('collabtrack_token');
        localStorage.removeItem('collabtrack_user');
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    }

    if (localStorage.getItem('collabtrack_token')) {
      loadProfile();
    } else {
      setBootstrapping(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      isAdmin: user?.role === 'Admin',
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('collabtrack_token', data.token);
        localStorage.setItem('collabtrack_user', JSON.stringify(data.user));
        setUser(data.user);
      },
      async signup(payload) {
        const { data } = await api.post('/auth/signup', payload);
        localStorage.setItem('collabtrack_token', data.token);
        localStorage.setItem('collabtrack_user', JSON.stringify(data.user));
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('collabtrack_token');
        localStorage.removeItem('collabtrack_user');
        setUser(null);
      }
    }),
    [user, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
