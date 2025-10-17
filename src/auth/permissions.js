// Permission management system for role-based access control
import apiClient from '../api/client';
import authStorage from './storage';

// Permission constants matching backend
export const MODULES = {
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  PRODUCT: 'PRODUCT',
  CORE: 'CORE',
  FARMER: 'FARMER',
  DEALER: 'DEALER',
  USER: 'USER',
  FIELDTRACK: 'FIELDTRACK',
  EMPLOYEE: 'EMPLOYEE',
  PAYMENT: 'PAYMENT',
  INVENTORY: 'INVENTORY',
  ORDER: 'ORDER',
  INVENTORY_WAREHOUSE: 'INVENTORY_WAREHOUSE',
  INVENTORY_BATCH: 'INVENTORY_BATCH',
  DISPATCH: 'DISPATCH',
  SCHEME: 'SCHEME'
};

export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  CANCEL: 'cancel',
  REVISE: 'revise',
  RECONCILE: 'reconcile'
};

class PermissionManager {
  constructor() {
    this.permissions = null;
    this.isLoading = false;
  }

  /**
   * Fetch user permissions from backend
   */
  async fetchPermissions() {
    if (this.isLoading) return this.permissions;
    
    try {
      this.isLoading = true;
      const response = await apiClient.get('/api/auth/all-module-permissions/');
      
      if (response.data && response.data.modules) {
        this.permissions = this.parsePermissions(response.data.modules);
        await this.cachePermissions();
        return this.permissions;
      }
      
      throw new Error('Invalid permissions response');
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // Try to load cached permissions
      return await this.loadCachedPermissions();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Parse backend permissions into a more usable format
   */
  parsePermissions(modules) {
    const parsed = {};
    
    modules.forEach(module => {
      parsed[module.module] = {
        enabled: module.enabled,
        permissions: module.permissions
      };
    });
    
    return parsed;
  }

  /**
   * Cache permissions to storage (compressed format)
   */
  async cachePermissions() {
    try {
      // Compress permissions data to reduce storage size
      const compressed = this.compressPermissions(this.permissions);
      await authStorage.storePermissions(compressed);
    } catch (error) {
      console.error('Failed to cache permissions:', error);
    }
  }

  /**
   * Compress permissions data to reduce storage size
   */
  compressPermissions(permissions) {
    if (!permissions) return null;
    
    const compressed = {};
    Object.keys(permissions).forEach(module => {
      const moduleData = permissions[module];
      if (moduleData && moduleData.enabled) {
        // Only store enabled modules and their permissions
        compressed[module] = {
          e: moduleData.enabled, // enabled
          p: moduleData.permissions // permissions
        };
      }
    });
    
    return compressed;
  }

  /**
   * Decompress permissions data from storage
   */
  decompressPermissions(compressed) {
    if (!compressed) return null;
    
    const permissions = {};
    Object.keys(compressed).forEach(module => {
      const moduleData = compressed[module];
      permissions[module] = {
        enabled: moduleData.e,
        permissions: moduleData.p
      };
    });
    
    return permissions;
  }

  /**
   * Load cached permissions from storage
   */
  async loadCachedPermissions() {
    try {
      const cached = await authStorage.getPermissions();
      if (cached) {
        // Decompress the cached data
        this.permissions = this.decompressPermissions(cached);
        return this.permissions;
      }
    } catch (error) {
      console.error('Failed to load cached permissions:', error);
    }
    
    // Return default permissions if no cache
    return this.getDefaultPermissions();
  }

  /**
   * Get default permissions (all disabled)
   */
  getDefaultPermissions() {
    const defaultPerms = {};
    Object.values(MODULES).forEach(module => {
      defaultPerms[module] = {
        enabled: false,
        permissions: Object.values(PERMISSIONS).reduce((acc, perm) => {
          acc[perm] = false;
          return acc;
        }, {})
      };
    });
    return defaultPerms;
  }

  /**
   * Check if user has permission for a specific module and action
   */
  hasPermission(module, permission = PERMISSIONS.READ) {
    if (!this.permissions) return false;
    
    const modulePerms = this.permissions[module];
    if (!modulePerms || !modulePerms.enabled) return false;
    
    return modulePerms.permissions[permission] === true;
  }

  /**
   * Check if module is enabled
   */
  isModuleEnabled(module) {
    if (!this.permissions) return false;
    
    const modulePerms = this.permissions[module];
    return modulePerms && modulePerms.enabled;
  }

  /**
   * Get all enabled modules
   */
  getEnabledModules() {
    if (!this.permissions) return [];
    
    return Object.keys(this.permissions).filter(module => 
      this.permissions[module].enabled
    );
  }

  /**
   * Clear permissions (on logout)
   */
  clearPermissions() {
    this.permissions = null;
    this.isLoading = false;
  }

  /**
   * Get permission summary for debugging
   */
  getPermissionSummary() {
    if (!this.permissions) return 'No permissions loaded';
    
    const enabled = this.getEnabledModules();
    return `Enabled modules: ${enabled.join(', ')}`;
  }
}

// Export singleton instance
export const permissionManager = new PermissionManager();

// Convenience functions
export const hasPermission = (module, permission) => 
  permissionManager.hasPermission(module, permission);

export const isModuleEnabled = (module) => 
  permissionManager.isModuleEnabled(module);

export const getEnabledModules = () => 
  permissionManager.getEnabledModules();

export default permissionManager;
