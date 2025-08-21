import { defineField, defineType } from 'sanity';

export const user = defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email()
        }),
        defineField({
            name: 'name',
            title: 'Full Name',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'role',
            title: 'User Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Admin', value: 'admin' },
                    { title: 'Editor', value: 'editor' },
                    { title: 'Viewer', value: 'viewer' }
                ]
            },
            initialValue: 'viewer',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'isActive',
            title: 'Active Status',
            type: 'boolean',
            description: 'Whether this user account is active',
            initialValue: true
        }),
        defineField({
            name: 'permissions',
            title: 'Permissions',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: 'Manage Products', value: 'manage_products' },
                    { title: 'Manage Orders', value: 'manage_orders' },
                    { title: 'Import from Alibaba', value: 'import_alibaba' },
                    { title: 'View Supplier Info', value: 'view_supplier_info' },
                    { title: 'Manage Users', value: 'manage_users' },
                    { title: 'Access Analytics', value: 'access_analytics' }
                ]
            },
            description: 'Specific permissions for this user'
        }),
        defineField({
            name: 'lastLogin',
            title: 'Last Login',
            type: 'datetime',
            readOnly: true
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            readOnly: true,
            initialValue: () => new Date().toISOString()
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            readOnly: true,
            initialValue: () => new Date().toISOString()
        })
    ],
    preview: {
        select: {
            title: 'name',
            email: 'email',
            role: 'role',
            isActive: 'isActive'
        },
        prepare(selection) {
            const { title, email, role, isActive } = selection;
            const status = isActive ? '🟢' : '🔴';
            const roleLabel = role === 'admin' ? '👑' : role === 'editor' ? '✏️' : '👁️';
            
            return {
                title: title || 'Unknown User',
                subtitle: `${roleLabel} ${role} - ${email}`,
                media: status
            };
        }
    },
    orderings: [
        {
            title: 'Name A-Z',
            name: 'nameAsc',
            by: [{ field: 'name', direction: 'asc' }]
        },
        {
            title: 'Role (Admin First)',
            name: 'roleAdminFirst',
            by: [
                { field: 'role', direction: 'desc' },
                { field: 'name', direction: 'asc' }
            ]
        },
        {
            title: 'Recently Created',
            name: 'createdAtDesc',
            by: [{ field: 'createdAt', direction: 'desc' }]
        }
    ]
}); 