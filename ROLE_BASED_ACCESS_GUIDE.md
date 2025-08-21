# 🔐 Role-Based Access Control (RBAC) Guide

## Overview

This guide explains how to use the new role-based access control system in Sanity Studio instead of API tokens. This approach is more secure and integrates seamlessly with Sanity's user management.

## 🏗️ **System Architecture**

### **User Roles Hierarchy**
```
👑 Admin (Level 3) - Full access to all features
✏️ Editor (Level 2) - Can edit content, limited admin features  
👁️ Viewer (Level 1) - Read-only access to most content
```

### **Permission System**
- **Granular Control**: Specific permissions for different features
- **Role-Based**: Automatic permissions based on user role
- **Context-Aware**: Fields show/hide based on user permissions

## 👥 **User Roles & Permissions**

### **👑 Admin Role**
- **Access Level**: Full system access
- **Permissions**: All permissions automatically granted
- **Features**: 
  - Manage all products and orders
  - Import from Alibaba
  - View supplier information
  - Manage user accounts
  - Access analytics and reports

### **✏️ Editor Role**
- **Access Level**: Content management
- **Permissions**: 
  - `manage_products` - Create/edit products
  - `manage_orders` - Update order status
  - `import_alibaba` - Import products from Alibaba
  - `view_supplier_info` - See supplier details
- **Features**:
  - Edit product information
  - Update order status
  - Import products from Alibaba
  - View supplier information

### **👁️ Viewer Role**
- **Access Level**: Read-only access
- **Permissions**: 
  - `view_supplier_info` - See supplier details (if granted)
- **Features**:
  - View products and orders
  - Limited access to supplier information

## 🔧 **Setup Instructions**

### **1. Add User Schema to Sanity**
The user schema is already included in your project. It defines:
- User authentication fields
- Role assignment
- Permission management
- User status tracking

### **2. Create Initial Admin User**
Run the setup script to create your first admin user:

```bash
node setup-admin-user.js
```

This creates a user with:
- **Email**: admin@utrabeauty.com
- **Role**: admin
- **Permissions**: All permissions granted

### **3. Access Sanity Studio**
1. Go to `http://localhost:3000/studio`
2. You'll see the new "User" document type
3. Manage users and their roles from the Studio interface

## 📋 **Permission Reference**

### **Available Permissions**
```typescript
const permissions = [
  'manage_products',      // Create/edit products
  'manage_orders',        // Update order status
  'import_alibaba',       // Import from Alibaba
  'view_supplier_info',   // See supplier details
  'manage_users',         // Manage user accounts
  'access_analytics'      // View analytics/reports
];
```

### **Field-Level Access Control**
Fields automatically show/hide based on permissions:

```typescript
// Example: Alibaba import field
defineField({
  name: 'importFromAlibaba',
  // Only visible to users with import_alibaba permission
  readOnly: (context) => {
    const user = context.currentUser;
    if (!user) return true;
    
    const userPermissions = user.permissions || [];
    return !userPermissions.includes('import_alibaba');
  }
})
```

## 🎯 **Usage Examples**

### **Creating a New User**
1. Go to Sanity Studio → Users
2. Click "Create new document"
3. Fill in user details:
   - **Name**: User's full name
   - **Email**: User's email address
   - **Role**: Select appropriate role
   - **Permissions**: Add specific permissions
   - **Status**: Set to active

### **Managing User Roles**
1. **Promote to Admin**: Change role to "admin"
2. **Demote User**: Change role to "editor" or "viewer"
3. **Deactivate**: Set status to inactive
4. **Custom Permissions**: Add/remove specific permissions

### **Role-Based Field Visibility**
- **Admin**: Sees all fields and can edit everything
- **Editor**: Sees most fields, can edit content
- **Viewer**: Sees limited fields, read-only access

## 🛡️ **Security Features**

### **Automatic Access Control**
- Fields automatically hide/show based on permissions
- No manual token management required
- Integrated with Sanity's authentication system

### **Permission Validation**
- Server-side validation of user permissions
- Role hierarchy enforcement
- Granular permission checking

### **Audit Trail**
- User creation/update timestamps
- Last login tracking
- Permission change history

## 🔍 **Troubleshooting**

### **Common Issues**

#### **User Can't See Fields**
- Check user role and permissions
- Verify user is active
- Ensure permissions include required access

#### **Permission Denied Errors**
- Verify user has required role
- Check specific permissions
- Ensure user account is active

#### **Schema Not Visible**
- Restart Sanity Studio after schema changes
- Verify schema is added to index
- Check for syntax errors in schema

### **Debug Commands**
```bash
# Check user permissions in Studio console
console.log(sanity.getCurrentUser())

# Verify schema compilation
npm run build
```

## 🚀 **Advanced Features**

### **Custom Permission Groups**
Create custom permission sets for different user types:

```typescript
// Example: Product Manager permissions
const productManagerPermissions = [
  'manage_products',
  'import_alibaba',
  'view_supplier_info'
];

// Example: Order Manager permissions  
const orderManagerPermissions = [
  'manage_orders',
  'view_supplier_info'
];
```

### **Dynamic Permission Assignment**
Assign permissions based on user attributes:

```typescript
// Example: Department-based permissions
if (user.department === 'product') {
  userPermissions.push('manage_products');
}
```

### **Permission Inheritance**
Roles can inherit permissions from parent roles:

```typescript
const rolePermissions = {
  admin: ['*'], // All permissions
  editor: ['manage_products', 'manage_orders', 'import_alibaba'],
  viewer: ['view_supplier_info']
};
```

## 📚 **Best Practices**

### **Role Design**
1. **Keep roles simple**: Don't create too many role types
2. **Use permissions for granular control**: Assign specific permissions to roles
3. **Follow principle of least privilege**: Give users minimum access needed

### **Permission Management**
1. **Document permissions**: Keep a clear list of what each permission allows
2. **Regular audits**: Review user permissions periodically
3. **Test access**: Verify permissions work as expected

### **User Onboarding**
1. **Start with viewer role**: Give new users minimal access initially
2. **Gradual escalation**: Increase permissions as users prove trustworthy
3. **Training**: Ensure users understand their role and permissions

## 🔄 **Migration from Token System**

### **What Changed**
- ❌ Removed API token authentication
- ✅ Added role-based access control
- ✅ Integrated with Sanity user management
- ✅ Enhanced security and usability

### **Benefits of New System**
- **Better Security**: No token management or storage
- **Easier Management**: Manage users through Sanity Studio
- **Granular Control**: Fine-tuned permission system
- **Better UX**: Seamless integration with Studio interface

## 📞 **Support**

If you encounter issues with the role-based access system:

1. **Check user permissions** in Sanity Studio
2. **Verify schema configuration** is correct
3. **Restart Sanity Studio** after schema changes
4. **Review console logs** for error messages

The new system provides a more robust, secure, and user-friendly way to manage access to your admin features! 🎉 