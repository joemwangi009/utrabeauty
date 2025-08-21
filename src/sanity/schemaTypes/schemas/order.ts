import { defineField, defineType } from 'sanity';

export const shippingAddress = defineType({
    name: 'shippingAddress',
    title: 'Shipping Address',
    type: 'object',
    fields: [
        defineField({
            name: 'name',
            title: 'Full Name',
            type: 'string'
        }),
        defineField({
            name: 'line1',
            title: 'Address Line 1',
            type: 'string',
        }),
        defineField({
            name: 'line2',
            title: 'Address Line 2',
            type: 'string',
        }),
        defineField({
            name: 'city',
            title: 'City',
            type: 'string',
        }),
        defineField({
            name: 'state',
            title: 'State',
            type: 'string',
        }),
        defineField({
            name: 'postalCode',
            title: 'Postal Code',
            type: 'string',
        }),
        defineField({
            name: 'country',
            title: 'Country',
            type: 'string',
        }),
    ]
});

export const orderItem = defineType({
    name: 'orderItem',
    title: 'Order Item',
    type: 'object',
    fields: [
        defineField({
            name: 'product',
            title: 'Product',
            type: 'reference',
            to: [{ type: 'product' }]
        }),
        defineField({
            name: 'quantity',
            title: 'Quantity',
            type: 'number',
            validation: (Rule) => Rule.required().positive().integer()
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().positive()
        }),
        defineField({
            name: 'lineTotal',
            title: 'Line Total',
            type: 'number',
            validation: (Rule) => Rule.required().positive(),
            description: 'Quantity × Price'
        }),
        defineField({
            name: 'supplierUrl',
            title: 'Supplier URL',
            type: 'url',
            description: 'Alibaba/AliExpress product URL for this item'
        }),
        defineField({
            name: 'supplierName',
            title: 'Supplier Name',
            type: 'string',
            description: 'Name of the supplier for this item'
        }),
        defineField({
            name: 'importedFromAlibaba',
            title: 'Imported from Alibaba',
            type: 'boolean',
            description: 'Indicates if this item was imported from Alibaba',
            initialValue: false
        }),
        defineField({
            name: 'goToSupplier',
            title: 'Go to Supplier',
            type: 'url',
            description: 'Click to open supplier product page in a new tab',
            readOnly: true
        })
    ],
    preview: {
        select: {
            title: 'product.title',
            quantity: 'quantity',
            price: 'price',
            supplierName: 'supplierName',
            importedFromAlibaba: 'importedFromAlibaba'
        },
        prepare(selection) {
            const { title, quantity, price, supplierName, importedFromAlibaba } = selection;
            const subtitle = [
                `Qty: ${quantity}`,
                `$${price}`,
                supplierName && `from ${supplierName}`,
                importedFromAlibaba && '(Alibaba Import)'
            ].filter(Boolean).join(' - ');
            
            return {
                title: title || 'Unknown Product',
                subtitle: subtitle || 'No details'
            };
        }
    }
});

export const order = defineType({
    name: 'order',
    title: 'Order',
    type: 'document',
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'orderDate',
            title: 'Order Date',
            type: 'datetime',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'customerId',
            title: 'Customer ID',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'customerName',
            title: 'Customer Name',
            type: 'string',
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'customerEmail',
            title: 'Customer Email',
            type: 'string',
            validation: (Rule) => Rule.required().email()
        }),
        defineField({
            name: 'stripeCustomerId',
            title: 'Stripe Customer ID',
            type: 'string'
        }),
        defineField({
            name: 'stripeCheckoutSessionId',
            title: 'Stripe Checkout Session ID',
            type: 'string'
        }),
        defineField({
            name: 'stripePaymentIntentId',
            title: 'Stripe Payment Intent ID',
            type: 'string'
        }),
        defineField({
            name: 'totalPrice',
            title: 'Total Price (USD)',
            type: 'number',
            validation: (Rule) => Rule.required().positive()
        }),
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'shippingAddress'
        }),
        defineField({
            name: 'orderItems',
            title: 'Order Items',
            type: 'array',
            of: [{ type: 'orderItem' }],
            validation: (Rule) => Rule.required().min(1)
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Processing', value: 'PROCESSING' },
                    { title: 'Shipped', value: 'SHIPPED' },
                    { title: 'Delivered', value: 'DELIVERED' },
                    { title: 'Cancelled', value: 'CANCELLED' },
                ]
            },
            initialValue: 'PROCESSING'
        }),
        defineField({
            name: 'supplierInfo',
            title: 'Supplier Information',
            type: 'object',
            fields: [
                {
                    name: 'hasAlibabaProducts',
                    title: 'Has Alibaba Products',
                    type: 'boolean',
                    description: 'Indicates if this order contains Alibaba-imported products',
                    readOnly: true
                },
                {
                    name: 'supplierCount',
                    title: 'Supplier Count',
                    type: 'number',
                    description: 'Number of unique suppliers in this order',
                    readOnly: true
                },
                {
                    name: 'supplierUrls',
                    title: 'Supplier URLs',
                    type: 'array',
                    of: [{ type: 'url' }],
                    description: 'All supplier URLs from order items',
                    readOnly: true
                }
            ],
            options: {
                collapsible: true,
                collapsed: true
            }
        }),
        defineField({
            name: 'notes',
            title: 'Order Notes',
            type: 'text',
            description: 'Internal notes about this order'
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
            title: 'orderNumber',
            customerName: 'customerName',
            totalPrice: 'totalPrice',
            status: 'status',
            orderDate: 'orderDate',
            hasAlibabaProducts: 'supplierInfo.hasAlibabaProducts'
        },
        prepare(selection) {
            const { title, customerName, totalPrice, status, orderDate, hasAlibabaProducts } = selection;
            const subtitle = [
                customerName,
                `$${totalPrice}`,
                status,
                hasAlibabaProducts && '🔄 Alibaba'
            ].filter(Boolean).join(' - ');
            
            return {
                title: title || 'Unknown Order',
                subtitle: subtitle || 'No details',
                media: hasAlibabaProducts ? '🔄' : '📦'
            };
        }
    },
    orderings: [
        {
            title: 'Order Date (Newest)',
            name: 'orderDateDesc',
            by: [{ field: 'orderDate', direction: 'desc' }]
        },
        {
            title: 'Order Date (Oldest)',
            name: 'orderDateAsc',
            by: [{ field: 'orderDate', direction: 'asc' }]
        },
        {
            title: 'Order Number',
            name: 'orderNumberAsc',
            by: [{ field: 'orderNumber', direction: 'asc' }]
        },
        {
            title: 'Customer Name',
            name: 'customerNameAsc',
            by: [{ field: 'customerName', direction: 'asc' }]
        },
        {
            title: 'Total Price (High to Low)',
            name: 'totalPriceDesc',
            by: [{ field: 'totalPrice', direction: 'desc' }]
        },
        {
            title: 'Total Price (Low to High)',
            name: 'totalPriceAsc',
            by: [{ field: 'totalPrice', direction: 'asc' }]
        },
        {
            title: 'Alibaba Orders First',
            name: 'alibabaFirst',
            by: [
                { field: 'supplierInfo.hasAlibabaProducts', direction: 'desc' },
                { field: 'orderDate', direction: 'desc' }
            ]
        }
    ]
});