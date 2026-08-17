import React, { createContext, useContext, useEffect } from 'react';
import { useLocationStore, LocationItem } from '@/store/location-store';

interface LocationContextType {
  currentLocation: LocationItem | null;
  isInitializingLocation: boolean;
  detectLocationFromGps: () => Promise<LocationItem | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentLocation, isInitializingLocation, detectLocationFromGps } = useLocationStore();

  useEffect(() => {
    // Automatically request GPS location permission & detect user location on app startup
    detectLocationFromGps();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isInitializingLocation,
        detectLocationFromGps,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
