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

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  name: 'Juan Gomez',
  email: 'juan.gomez@camosaapp.com',
  phone: '+504 9876-5432',
  avatar: 'https://placehold.co/100x100.png',
  role: 'user-technicians',
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
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
