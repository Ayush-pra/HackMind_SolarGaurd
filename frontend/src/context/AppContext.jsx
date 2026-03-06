import { createContext, useContext, useState, useEffect } from 'react';
import { mockPlants, mockInverters } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState(mockPlants);
  const [inverters, setInverters] = useState(mockInverters);
  const [selectedPlantId, setSelectedPlantId] = useState(mockPlants[0]?.id || null);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;
  const plantInverters = inverters.filter((inv) => inv.plantId === selectedPlantId);

  // Group inverters by plant for sidebar
  const invertersByPlant = plants.reduce((acc, plant) => {
    acc[plant.id] = inverters.filter((inv) => inv.plantId === plant.id);
    return acc;
  }, {});

  const addPlant = (plant) => {
    const newPlant = { ...plant, id: `plant-${Date.now()}` };
    setPlants((prev) => [...prev, newPlant]);
    return newPlant;
  };

  const addInverter = (inverter) => {
    const newInv = { ...inverter, id: inverter.inverterId || `INV-${Date.now()}` };
    setInverters((prev) => [...prev, newInv]);
    return newInv;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        plants,
        setPlants,
        inverters,
        setInverters,
        selectedPlantId,
        setSelectedPlantId,
        selectedPlant,
        plantInverters,
        invertersByPlant,
        addPlant,
        addInverter,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
