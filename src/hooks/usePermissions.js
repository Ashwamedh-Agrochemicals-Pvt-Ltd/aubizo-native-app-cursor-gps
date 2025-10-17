import { useState, useEffect, useContext } from 'react';
import { permissionManager, MODULES, PERMISSIONS } from '../auth/permissions';
import authContext from '../auth/context';

/**
 * Hook for managing user permissions
 * Provides permission checking and loading states
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(authContext);

  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      // Clear permissions when user logs out
      setPermissions(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userPermissions = await permissionManager.fetchPermissions();
      setPermissions(userPermissions);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module, permission = PERMISSIONS.READ) => {
    return permissionManager.hasPermission(module, permission);
  };

  const isModuleEnabled = (module) => {
    return permissionManager.isModuleEnabled(module);
  };

  const getEnabledModules = () => {
    return permissionManager.getEnabledModules();
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    isModuleEnabled,
    getEnabledModules,
    refreshPermissions,
    // Convenience methods for common checks
    canCreate: (module) => hasPermission(module, PERMISSIONS.CREATE),
    canRead: (module) => hasPermission(module, PERMISSIONS.READ),
    canUpdate: (module) => hasPermission(module, PERMISSIONS.UPDATE),
    canDelete: (module) => hasPermission(module, PERMISSIONS.DELETE),
    canSubmit: (module) => hasPermission(module, PERMISSIONS.SUBMIT),
    canApprove: (module) => hasPermission(module, PERMISSIONS.APPROVE),
  };
};

/**
 * Hook for checking specific module permissions
 */
export const useModulePermission = (module) => {
  const { hasPermission, isModuleEnabled, loading } = usePermissions();

  return {
    enabled: isModuleEnabled(module),
    canCreate: hasPermission(module, PERMISSIONS.CREATE),
    canRead: hasPermission(module, PERMISSIONS.READ),
    canUpdate: hasPermission(module, PERMISSIONS.UPDATE),
    canDelete: hasPermission(module, PERMISSIONS.DELETE),
    canSubmit: hasPermission(module, PERMISSIONS.SUBMIT),
    canApprove: hasPermission(module, PERMISSIONS.APPROVE),
    loading,
  };
};

/**
 * Hook for navigation permission checks
 */
export const useNavigationPermissions = () => {
  const { isModuleEnabled, loading } = usePermissions();

  return {
    loading,
    // Tab visibility based on permissions
    showDashboard: true, // Always show dashboard
    showProducts: isModuleEnabled(MODULES.PRODUCT),
    showOrders: isModuleEnabled(MODULES.ORDER),
    showCollections: isModuleEnabled(MODULES.PAYMENT),
    showFarmers: isModuleEnabled(MODULES.FARMER),
    showDealers: isModuleEnabled(MODULES.DEALER),
    showInventory: isModuleEnabled(MODULES.INVENTORY),
    showFieldTrack: isModuleEnabled(MODULES.FIELDTRACK),
    showEmployee: isModuleEnabled(MODULES.EMPLOYEE),
  };
};

export default usePermissions;
