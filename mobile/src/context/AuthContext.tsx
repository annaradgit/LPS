import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {loadState, saveState} from '../services/storage';
import {User, Role, PackageId} from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (input: {name: string; email: string; phone: string; packageId: PackageId}) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState().then(state => {
      setUser(state.user);
      setLoading(false);
    });
  }, []);

  const persistUser = async (nextUser: User | null) => {
    const state = await loadState();
    state.user = nextUser;
    await saveState(state);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) return 'Please enter email and password.';
    const state = await loadState();
    const role: Role = email.toLowerCase().startsWith('admin@') ? 'admin' : 'homeowner';
    const existing = state.user && state.user.email === email ? state.user : {
      id: role === 'admin' ? 'ADMIN-1' : 'U-100',
      name: role === 'admin' ? 'LPS Team' : 'Homeowner',
      email,
      phone: '',
      role,
      packageId: role === 'homeowner' ? 'basic' : undefined,
      properties: role === 'homeowner' ? [{
        id: 'P-1',
        name: 'My Home',
        addressLine1: '12 Example Road',
        city: 'London',
        postcode: 'SE20 7AA',
        bedrooms: '3',
        propertyType: 'House',
        notes: '',
      }] : [],
    };
    await persistUser(existing);
    return null;
  };

  const register = async ({name, email, phone, packageId}: {name: string; email: string; phone: string; packageId: PackageId}) => {
    if (!name || !email || !phone) return 'Please complete all fields.';
    const newUser: User = {
      id: `U-${Date.now()}`,
      name,
      email,
      phone,
      role: 'homeowner',
      packageId,
      properties: [],
    };
    await persistUser(newUser);
    return null;
  };

  const logout = async () => persistUser(null);

  const refresh = async () => {
    const state = await loadState();
    setUser(state.user);
  };

  const value = useMemo(() => ({user, loading, login, register, logout, refresh}), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}