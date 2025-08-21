import React, { useState, useEffect, useCallback } from 'react';
import { useClient } from 'sanity';
import { Card, Text, Button, Flex, Stack, Badge, TextInput, Select, Box } from '@sanity/ui';
import { RoleBasedAccess, AdminOnly } from './RoleBasedAccess';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

export const UserManagementDashboard: React.FC = () => {
  const client = useClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = `*[_type == "user"] {
        _id,
        name,
        email,
        role,
        isActive,
        permissions,
        lastLogin,
        createdAt
      } | order(role desc, name asc)`;
      
      const result = await client.fetch(query);
      setUsers(result);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEditUser = (user: User) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions || []
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      await client
        .patch(editingUser)
        .set({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          isActive: editForm.isActive,
          permissions: editForm.permissions,
          updatedAt: new Date().toISOString()
        })
        .commit();

      setEditingUser(null);
      setEditForm({});
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'editor': return 'positive';
      case 'viewer': return 'caution';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'editor': return '✏️';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <Card padding={4} radius={2}>
        <Text>Loading users...</Text>
      </Card>
    );
  }

  return (
    <AdminOnly>
      <Stack space={4}>
        <Card padding={4} radius={2} shadow={1}>
          <Flex align="center" justify="space-between">
            <Text size={3} weight="semibold">User Management Dashboard</Text>
            <Badge tone="primary" mode="outline">
              {users.length} Users
            </Badge>
          </Flex>
        </Card>

        <Stack space={3}>
          {users.map((user) => (
            <Card key={user._id} padding={4} radius={2} shadow={1}>
              {editingUser === user._id ? (
                <Stack space={3}>
                  <Flex align="center" gap={2}>
                    <Text size={2} weight="semibold">Editing User</Text>
                    <Badge tone="caution" mode="outline">Edit Mode</Badge>
                  </Flex>
                  
                  <Flex gap={2}>
                    <Box flex={1}>
                      <Text size={1} muted>Name</Text>
                      <TextInput
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.currentTarget.value })}
                      />
                    </Box>
                    <Box flex={1}>
                      <Text size={1} muted>Email</Text>
                      <TextInput
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.currentTarget.value })}
                      />
                    </Box>
                  </Flex>

                  <Flex gap={2}>
                    <Box flex={1}>
                      <Text size={1} muted>Role</Text>
                      <Select
                        value={editForm.role || 'viewer'}
                        onChange={(e) => setEditForm({ ...editForm, role: e.currentTarget.value as any })}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </Box>
                    <Box flex={1}>
                      <Text size={1} muted>Status</Text>
                      <Select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.currentTarget.value === 'true' })}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>
                    </Box>
                  </Flex>

                  <Flex gap={2}>
                    <Button mode="default" onClick={handleSaveUser} text="Save Changes" />
                    <Button mode="ghost" onClick={handleCancelEdit} text="Cancel" />
                  </Flex>
                </Stack>
              ) : (
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Text size={2}>{getRoleIcon(user.role)}</Text>
                    <Stack space={1}>
                      <Text weight="semibold">{user.name}</Text>
                      <Text size={1} muted>{user.email}</Text>
                    </Stack>
                  </Flex>
                  
                  <Flex align="center" gap={2}>
                    <Badge tone={getRoleColor(user.role)} mode="outline">
                      {getRoleIcon(user.role)} {user.role}
                    </Badge>
                    <Badge tone={user.isActive ? 'positive' : 'critical'} mode="outline">
                      {user.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </Badge>
                    <Button
                      mode="ghost"
                      size={1}
                      onClick={() => handleEditUser(user)}
                      text="Edit"
                    />
                  </Flex>
                </Flex>
              )}
            </Card>
          ))}
        </Stack>
      </Stack>
    </AdminOnly>
  );
}; 