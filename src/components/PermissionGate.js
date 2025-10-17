import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useModulePermission } from '../hooks/usePermissions';
import { MODULES, PERMISSIONS } from '../auth/permissions';
import DESIGN from '../theme';

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 */
const PermissionGate = ({
    module,
    permission = PERMISSIONS.READ,
    children,
    fallback = null,
    showAccessDenied = false
}) => {
    const { enabled, loading } = useModulePermission(module);

    // Show loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Check if user has permission
    const hasAccess = enabled && (permission === PERMISSIONS.READ ||
        useModulePermission(module)[`can${permission.charAt(0).toUpperCase() + permission.slice(1)}`]);

    if (!hasAccess) {
        if (showAccessDenied) {
            return (
                <View style={styles.accessDeniedContainer}>
                    <Text style={styles.accessDeniedText}>
                        You don't have permission to access this feature
                    </Text>
                </View>
            );
        }
        return fallback;
    }

    return children;
};

/**
 * PermissionButton Component
 * Button that's disabled when user lacks permission
 */
export const PermissionButton = ({
    module,
    permission = PERMISSIONS.READ,
    children,
    disabled = false,
    ...props
}) => {
    const { enabled, loading } = useModulePermission(module);

    const hasAccess = enabled && (permission === PERMISSIONS.READ ||
        useModulePermission(module)[`can${permission.charAt(0).toUpperCase() + permission.slice(1)}`]);

    return React.cloneElement(children, {
        ...props,
        disabled: disabled || !hasAccess || loading,
        style: [
            children.props.style,
            (!hasAccess || loading) && styles.disabledButton
        ]
    });
};

/**
 * PermissionTab Component
 * Tab that's hidden when user lacks permission
 */
export const PermissionTab = ({
    module,
    children,
    ...props
}) => {
    const { enabled, loading } = useModulePermission(module);

    if (loading) return null;
    if (!enabled) return null;

    return React.cloneElement(children, props);
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: DESIGN.colors.textSecondary,
        fontSize: 14,
    },
    accessDeniedContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: DESIGN.colors.error + '10',
        borderRadius: 8,
        margin: 10,
    },
    accessDeniedText: {
        color: DESIGN.colors.error,
        fontSize: 14,
        textAlign: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default PermissionGate;
