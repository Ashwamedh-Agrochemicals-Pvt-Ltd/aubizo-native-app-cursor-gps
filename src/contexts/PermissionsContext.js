import { createContext, useContext, useState, useCallback } from 'react';
import { permissionManager, MODULES, SCOPES } from '../auth/permissions';
import authStorage from '../auth/storage';
import showToast from '../utility/showToast';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userPermissions = await permissionManager.fetchPermissions();
      setPermissions(userPermissions);
      // capture user profile if permission manager provided it or storage has it
      try {
        if (permissionManager.userProfile) {
          setUserProfile(permissionManager.userProfile);
        } else {
          const stored = await authStorage.getUserProfile();
          if (stored) setUserProfile(stored);
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      
      // Check if error is due to unauthorized access (expired tokens)
      if (err.message === 'UNAUTHORIZED') {
        console.warn('⚠️ Session expired while loading permissions, clearing auth...');
        
        // Clear all auth data
        await authStorage.clearAll().catch(e => console.error('Failed to clear storage:', e));
        
        // Show user-friendly message
        showToast.error('Session Expired', 'Please login again');
        
        // Set error state to trigger logout in App.js
        setError('UNAUTHORIZED');
        setPermissions(null);
      } else {
        // For other errors, set empty permissions and log error
        setError(err.message);
        setPermissions({});
      }
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
    setUserProfile(null);
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

  const getPermissionScope = (module, permission = null) => {
    return permissionManager.getPermissionScope(module, permission);
  };

  const getModulePermissions = (module) => {
    return permissionManager.getModulePermissions(module);
  };

  const getAllowedActions = (module) => {
    return permissionManager.getAllowedActions(module);
  };

  const isAdmin = () => {
    return !!(userProfile && userProfile.is_admin === true) || !!(permissionManager.userProfile && permissionManager.userProfile?.is_admin === true);
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
    getPermissionScope,
    getModulePermissions,
    getAllowedActions,
    isAdmin,
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
