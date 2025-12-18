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
  SCHEME: 'SCHEME',
  DEALER_DOCUMENT: 'DEALER_DOCUMENT',
  DEALER_OTP: 'DEALER_OTP',
  RBAC: 'RBAC',
  REPORT: 'REPORT'
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

// Scopes for permission applicability
export const SCOPES = {
  OWN: 'own',
  TEAM: 'team',
  COMPANY: 'company'
};

// Sources of permission decision
export const SOURCES = {
  ADMIN: 'admin',
  ROLE: 'role',
  OVERRIDE_ADD: 'override_add',
  OVERRIDE_REMOVE: 'override_remove'
};

// Standard permission object format (for reference)
export const PERMISSION_STRUCTURE = {
  allowed: false,
  scope: null,
  source: null,
  own_data_only: false
};

class PermissionManager {
  constructor() {
    this.permissions = null;
    this.userProfile = null;
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
        // If backend returns enhanced structure (action objects), parse accordingly
        this.permissions = this.parsePermissions(response.data.modules);

        // Store user profile if provided by backend (optional)
        const profile = response.data.user_profile || response.data.userProfile || response.data.user;
        if (profile) {
          this.userProfile = profile;
          try {
            await authStorage.storeUserProfile(profile);
          } catch (e) {
            // ignore storage failures
          }
        }
        await this.cachePermissions();
        return this.permissions;
      }

      throw new Error('Invalid permissions response');
    } catch (error) {
      console.error('Failed to fetch permissions:', error);

      // Check if error is 401 (Unauthorized) - session expired
      if (error.response?.status === 401 || error.status === 401) {
        console.warn('⚠️ 401 Unauthorized while fetching permissions - token expired');
        // Clear permissions and throw error to trigger logout in context
        this.clearPermissions();
        throw new Error('UNAUTHORIZED');
      }

      // For other errors, try to load cached permissions
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
      // Support both simple boolean-permission maps and enhanced action objects
      const perms = {};
      if (module.permissions && typeof module.permissions === 'object') {
        Object.keys(module.permissions).forEach(action => {
          const actionVal = module.permissions[action];
          if (actionVal && typeof actionVal === 'object' && ('allowed' in actionVal || 'scope' in actionVal)) {
            // Enhanced format
            perms[action] = {
              allowed: !!actionVal.allowed,
              scope: actionVal.scope || null,
              source: actionVal.source || null,
              own_data_only: !!actionVal.own_data_only
            };
          } else {
            // Legacy boolean format
            perms[action] = !!actionVal;
          }
        });
      }

      parsed[module.module] = {
        enabled: !!module.enabled,
        permissions: perms
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
      // Also persist user profile if available
      try {
        if (this.userProfile) await authStorage.storeUserProfile(this.userProfile);
      } catch (e) {}
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
        // Try to load cached user profile as well
        try {
          const profile = await authStorage.getUserProfile();
          if (profile) this.userProfile = profile;
        } catch (e) {}
        return this.permissions;
      }
    } catch (error) {
      console.error('Failed to load cached permissions:', error);
    }

    // Return default permissions if no cache
    return this.getDefaultPermissions();
  }

  /**
   * Get module permissions object (enhanced) or null
   */
  getModulePermissions(moduleName) {
    if (!this.permissions) return null;
    return this.permissions[moduleName] || null;
  }

  /**
   * Get permission scope for a module.action
   */
  getPermissionScope(moduleName, permission = null) {
    if (!this.permissions) return null;
    const action = permission || PERMISSIONS.READ;
    const modulePerms = this.permissions[moduleName];
    if (!modulePerms || !modulePerms.enabled) return null;
    const actionPerm = modulePerms.permissions[action];
    if (!actionPerm) return null;
    if (typeof actionPerm === 'object') return actionPerm.scope || null;
    return actionPerm === true ? SCOPES.OWN : null;
  }

  /**
   * Get allowed actions list for a module
   */
  getAllowedActions(moduleName) {
    if (!this.permissions) return [];
    const modulePerms = this.getModulePermissions(moduleName);
    if (!modulePerms) return [];
    return Object.keys(modulePerms.permissions).filter(action => {
      const v = modulePerms.permissions[action];
      if (typeof v === 'object') return !!v.allowed;
      return !!v;
    });
  }

  /**
   * Is current user considered admin (fast check)
   */
  async isAdmin() {
    try {
      if (this.userProfile && this.userProfile.is_admin === true) return true;
      const stored = await authStorage.getUserProfile();
      return !!(stored && stored.is_admin === true);
    } catch (e) {
      return false;
    }
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
