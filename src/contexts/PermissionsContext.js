import { createContext, useContext, useState, useCallback } from 'react';
import { permissionManager, MODULES } from '../auth/permissions';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userPermissions = await permissionManager.fetchPermissions();
      setPermissions(userPermissions);
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setError(err.message);
      setPermissions({});
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  const clearPermissions = useCallback(() => {
    setPermissions(null);
    setError(null);
    setIsInitialized(false);
  }, []);

  const isModuleEnabled = (module) => {
    return permissionManager.isModuleEnabled(module);
  };

  const getEnabledModules = () => {
    return permissionManager.getEnabledModules();
  };

  const hasPermission = (module, permission = 'read') => {
    return permissionManager.hasPermission(module, permission);
  };

  const value = {
    permissions,
    loading,
    error,
    isInitialized,
    loadPermissions,
    refreshPermissions,
    clearPermissions,
    isModuleEnabled,
    getEnabledModules,
    hasPermission,
    showDashboard: true,
    showProducts: isModuleEnabled(MODULES.PRODUCT),
    showOrders: isModuleEnabled(MODULES.ORDER),
    showCollections: isModuleEnabled(MODULES.PAYMENT),
    showFarmers: isModuleEnabled(MODULES.FARMER),
    showDealers: isModuleEnabled(MODULES.DEALER),
    showInventory: isModuleEnabled(MODULES.INVENTORY),
    showFieldTrack: isModuleEnabled(MODULES.FIELDTRACK),
    showEmployee: isModuleEnabled(MODULES.EMPLOYEE),
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissionsContext must be used within PermissionsProvider');
  }
  return context;
};

export default PermissionsContext;
