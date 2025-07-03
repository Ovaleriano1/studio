'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

export interface NewUserProfileData {
  name: string;
  email: string;
  phone: string;
  role: Role;
}

// In-memory user data store - this is now a fallback/default
const defaultUsers: Record<string, UserProfile> = {
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
  'rvalerio@camosa.com': {
    name: 'Rudy Valerio',
    email: 'rvalerio@camosa.com',
    phone: '+504 5555-1234',
    avatar: 'https://placehold.co/100x100.png',
    role: 'user-technicians',
  },
};

const defaultAdminProfile: UserProfile = defaultUsers['ohernandez@camosa.com']; // Default to an admin

interface UserProfileContextType {
  profile: UserProfile;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  createUser: (newUserData: NewUserProfileData) => void;
  login: (email: string) => UserProfile;
  logout: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultAdminProfile);
  const [users, setUsers] = useState<Record<string, UserProfile>>(defaultUsers);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect runs once on the client to load data from localStorage
    try {
      const storedUsersJSON = localStorage.getItem('camosaUserProfiles');
      const storedUserEmail = localStorage.getItem('camosaCurrentUserEmail');
      
      let usersFromStorage = {};
      if (storedUsersJSON) {
        try {
          usersFromStorage = JSON.parse(storedUsersJSON);
        } catch (e) {
          console.error("Could not parse users from localStorage", e);
        }
      }

      // Merge default users with users from storage to ensure new users are added
      const combinedUsers = { ...defaultUsers, ...usersFromStorage };
      setUsers(combinedUsers);
      
      // Persist the combined list back to localStorage
      localStorage.setItem('camosaUserProfiles', JSON.stringify(combinedUsers));
      
      // If there was a user logged in, restore their session
      if (storedUserEmail && combinedUsers[storedUserEmail]) {
        setProfile(combinedUsers[storedUserEmail]);
      } else {
        // Otherwise, default to admin
        setProfile(combinedUsers['ohernandez@camosa.com']);
      }

    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Fallback to default users if localStorage fails
      setUsers(defaultUsers);
      setProfile(defaultAdminProfile);
    }
    setIsInitialized(true);
  }, []);

  const login = (email: string): UserProfile => {
    const userProfile = users[email] || defaultAdminProfile;
    setProfile(userProfile);
    try {
      localStorage.setItem('camosaCurrentUserEmail', email);
    } catch (error) {
      console.error("Failed to set current user in localStorage:", error);
    }
    return userProfile;
  };
  
  const logout = () => {
    setProfile(users['ohernandez@camosa.com']); // Default to admin on logout
    try {
        localStorage.removeItem('camosaCurrentUserEmail');
    } catch (error) {
        console.error("Failed to remove current user from localStorage:", error);
    }
  };

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    const userEmailToUpdate = profile.email;
    if (users[userEmailToUpdate]) {
      const updatedProfile = { ...users[userEmailToUpdate], ...newProfileData };
      const updatedUsers = { ...users, [userEmailToUpdate]: updatedProfile };
      
      setUsers(updatedUsers);
      setProfile(updatedProfile);

      try {
        localStorage.setItem('camosaUserProfiles', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error("Failed to save updated profiles to localStorage:", error);
      }
    }
  };

  const createUser = (newUserData: NewUserProfileData) => {
    if (users[newUserData.email]) {
      throw new Error('Un usuario con este correo electrónico ya existe.');
    }

    const newUserProfile: UserProfile = {
      ...newUserData,
      avatar: 'https://placehold.co/100x100.png', // Default avatar
    };

    const updatedUsers = { ...users, [newUserData.email]: newUserProfile };
    
    setUsers(updatedUsers);

    try {
      localStorage.setItem('camosaUserProfiles', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Failed to save new user to localStorage:", error);
      // If saving fails, we should probably revert the state change, but for simplicity, we'll just log the error.
      throw new Error('No se pudo guardar el nuevo usuario.');
    }
  };
  
  // Render nothing until we've initialized from localStorage to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, createUser, login, logout }}>
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
