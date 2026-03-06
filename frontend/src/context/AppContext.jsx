import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPlants, addPlant as apiAddPlant, addInverter as apiAddInverter } from '../api/inputApi';
import { getDashboardData } from '../api/dashboardApi';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plants, setPlants] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // Fetch plants from backend when user is authenticated
  const fetchPlants = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await getPlants();
      setPlants(data);
      if (data.length > 0 && !selectedPlantId) {
        setSelectedPlantId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch plants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants, user]);

  // Fetch inverters for the selected plant via the dashboard endpoint
  const fetchInverters = useCallback(async () => {
    if (!selectedPlantId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const data = await getDashboardData(selectedPlantId);
      if (data && data.inverters) {
        // Merge new inverters ensuring we keep inverters from other plants too
        setInverters((prev) => {
          const otherPlant = prev.filter((inv) => inv.plantId !== selectedPlantId);
          return [...otherPlant, ...data.inverters];
        });
      }
    } catch (err) {
      console.error('Failed to fetch inverters:', err);
    }
  }, [selectedPlantId]);

  useEffect(() => {
    fetchInverters();
  }, [fetchInverters]);

  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;
  const plantInverters = inverters.filter((inv) => inv.plantId === selectedPlantId);

  // Group inverters by plant for sidebar
  const invertersByPlant = plants.reduce((acc, plant) => {
    acc[plant.id] = inverters.filter((inv) => inv.plantId === plant.id);
    return acc;
  }, {});

  const addPlant = async (plantData) => {
    try {
      const newPlant = await apiAddPlant(plantData);
      setPlants((prev) => [...prev, newPlant]);
      if (!selectedPlantId) setSelectedPlantId(newPlant.id);
      return newPlant;
    } catch (err) {
      console.error('Failed to add plant:', err);
      throw err;
    }
  };

  const addInverter = async (inverterData) => {
    try {
      const newInv = await apiAddInverter(inverterData);
      setInverters((prev) => [...prev, newInv]);
      return newInv;
    } catch (err) {
      console.error('Failed to add inverter:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPlants([]);
    setInverters([]);
    setSelectedPlantId(null);
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
        loading,
        fetchPlants,
        fetchInverters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
