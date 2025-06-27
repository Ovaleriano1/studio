'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available roles
export const ROLES = ['admin', 'superuser', 'supervisor', 'user-technicians'] as const;
export type Role = (typeof ROLES)[number];

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
}

// In-memory user data store
const users: Record<string, UserProfile> = {
  'ohernandez@camosa.com': {
    name: 'Oscar Hernandez',
    email: 'ohernandez@camosa.com',
    phone: '+504 1234-5678',
    avatar: 'https://placehold.co/100x100.png',
    role: 'admin',
  },
  'jfunez@camosa.com': {
    name: 'Juan Funez',
    email: 'jfunez@camosa.com',
    phone: '+504 9876-5432',
    avatar: 'https://placehold.co/100x100.png',
    role: 'user-technicians',
  },
   'juan.gomez@camosaapp.com': {
    name: 'Juan Gomez',
    email: 'juan.gomez@camosaapp.com',
    phone: '+504 9876-5432',
    avatar: 'https://placehold.co/100x100.png',
    role: 'user-technicians',
  },
  'kgodoy@camosa.com': {
    name: 'Kevin Godoy',
    email: 'kgodoy@camosa.com',
    phone: '+504 8765-4321',
    avatar: 'https://placehold.co/100x100.png',
    role: 'supervisor',
  },
};


const defaultProfile: UserProfile = users['ohernandez@camosa.com']; // Default to an admin

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  login: (email: string) => void;
  logout: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const login = (email: string) => {
    const userProfile = users[email] || defaultProfile;
    setProfile(userProfile);
  };
  
  const logout = () => {
    setProfile(defaultProfile);
  };

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    // Also update the in-memory store for persistence across logins in this session
    if (users[profile.email]) {
        users[profile.email] = { ...users[profile.email], ...newProfileData };
    }
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, login, logout }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
