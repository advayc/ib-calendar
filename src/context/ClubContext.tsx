'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Club } from '@/types';

interface ClubContextType {
  clubs: Club[];
  setClubs: (clubs: Club[]) => void;
  toggleClub: (clubId: string) => void;
  enabledClubIds: string[];
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const useClubs = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClubs must be used within a ClubProvider');
  }
  return context;
};

interface ClubProviderProps {
  children: ReactNode;
  initialClubs: Club[];
}

export const ClubProvider: React.FC<ClubProviderProps> = ({ 
  children, 
  initialClubs 
}) => {
  const [clubs, setClubs] = useState<Club[]>(initialClubs);

  const toggleClub = (clubId: string) => {
    setClubs(prevClubs =>
      prevClubs.map(club =>
        club.id === clubId ? { ...club, enabled: !club.enabled } : club
      )
    );
  };

  const enabledClubIds = clubs.filter(club => club.enabled).map(club => club.id);

  return (
    <ClubContext.Provider value={{ clubs, setClubs, toggleClub, enabledClubIds }}>
      {children}
    </ClubContext.Provider>
  );
};