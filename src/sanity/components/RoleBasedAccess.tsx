import React from 'react';
import { useCurrentUser } from 'sanity';
import { Card, Text, Badge, Flex } from '@sanity/ui';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRole = 'viewer',
  requiredPermissions = [],
  fallback
}) => {
  const user = useCurrentUser();
  
  if (!user) {
    return fallback || (
      <Card padding={3} radius={2} tone="caution">
        <Text size={1}>
          User not authenticated
        </Text>
      </Card>
    );
  }

  // For now, we'll use a simple role check based on user ID or email
  // In a real implementation, you'd check against your user schema
  const isAdmin = user.id === 'admin' || user.email === 'admin@utrabeauty.com';
  const isEditor = isAdmin || user.id === 'editor';
  
  let hasRequiredRole = false;
  if (requiredRole === 'admin') {
    hasRequiredRole = isAdmin;
  } else if (requiredRole === 'editor') {
    hasRequiredRole = isEditor;
  } else {
    hasRequiredRole = true; // viewer role - everyone can access
  }

  // For now, skip permission checks until we have proper user schema integration
  const hasRequiredPermissions = true;

  if (!hasRequiredRole || !hasRequiredPermissions) {
    return fallback || (
      <Card padding={3} radius={2} tone="caution">
        <Flex align="center" gap={2}>
          <Text size={1}>
            Access denied
          </Text>
          <Badge tone="caution" mode="outline" size={1}>
            Requires {requiredRole} role
          </Badge>
        </Flex>
      </Card>
    );
  }

  return <>{children}</>;
};

// Convenience components for common access patterns
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess requiredRole="admin" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const EditorOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedAccess requiredRole="editor" fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const WithPermission: React.FC<{ 
  children: React.ReactNode; 
  permission: string; 
  fallback?: React.ReactNode 
}> = ({ children, permission, fallback }) => (
  <RoleBasedAccess requiredPermissions={[permission]} fallback={fallback}>
    {children}
  </RoleBasedAccess>
); 