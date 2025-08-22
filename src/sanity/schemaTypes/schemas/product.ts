import { defineField, defineType } from 'sanity';
import { ProductDiscovery } from '../../components/ProductDiscovery';

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        // Main Product Discovery Interface - Clean and Professional
        defineField({
            name: 'productDiscovery',
            title: '🚀 Alibaba Product Discovery & Import',
            type: 'object',
            components: {
                input: ProductDiscovery
            },
            options: {
                collapsible: false,
                collapsed: false
            },
            fields: [
                {
                    name: 'searchQuery',
                    title: 'Search Query',
                    type: 'string',
                    hidden: true
                },
                {
                    name: 'selectedProduct',
                    title: 'Selected Product',
                    type: 'object',
                    hidden: true,
                    fields: [
                        {
                            name: 'title',
                            title: 'Product Title',
                            type: 'string',
                            readOnly: true
                        },
                        {
                            name: 'url',
                            title: 'Product URL',
                            type: 'url',
                            readOnly: true
                        },
                        {
                            name: 'price',
                            title: 'Product Price',
                            type: 'string',
                            readOnly: true
                        }
                    ]
                }
            ],
            description: '🔍 Search Alibaba products and click to add them directly to your catalog. No manual form filling required.'
        }),
        
        // Hidden fields that get auto-populated when a product is selected
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            hidden: true,
            validation: (Rule) => Rule.required().min(1).max(100)
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            hidden: true,
            validation: (Rule) => Rule.required().min(10).max(2000)
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            hidden: true,
            validation: (Rule) => Rule.required().positive().precision(2)
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            hidden: true,
            options: {
                hotspot: true
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            hidden: true,
            to: [{ type: 'productCategory' }],
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'supplierUrl',
            title: 'Supplier URL',
            type: 'url',
            hidden: true,
            description: 'Alibaba product URL'
        }),
        defineField({
            name: 'supplierName',
            title: 'Supplier Name',
            type: 'string',
            hidden: true,
            description: 'Name of the supplier/vendor from Alibaba',
            validation: (Rule) => Rule.max(100)
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            hidden: true,
            validation: (Rule) => Rule.required().positive().integer()
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            hidden: true,
            initialValue: true
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            hidden: true,
            options: {
                source: 'title',
                maxLength: 96
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            hidden: true,
            of: [{ type: 'string' }],
            options: {
                layout: 'tags'
            }
        }),
        
        // Import metadata (hidden but important for tracking)
        defineField({
            name: 'importMetadata',
            title: 'Import Metadata',
            type: 'object',
            hidden: true,
            fields: [
                {
                    name: 'importedAt',
                    title: 'Import Date',
                    type: 'datetime',
                    readOnly: true
                },
                {
                    name: 'originalUrl',
                    title: 'Original URL',
                    type: 'url',
                    readOnly: true
                },
                {
                    name: 'supplierRating',
                    title: 'Supplier Rating',
                    type: 'number',
                    readOnly: true
                },
                {
                    name: 'productRating',
                    title: 'Product Rating',
                    type: 'number',
                    readOnly: true
                },
                {
                    name: 'soldCount',
                    title: 'Sold Count',
                    type: 'number',
                    readOnly: true
                },
                {
                    name: 'shippingInfo',
                    title: 'Shipping Information',
                    type: 'object',
                    fields: [
                        {
                            name: 'free',
                            title: 'Free Shipping',
                            type: 'boolean'
                        },
                        {
                            name: 'cost',
                            title: 'Shipping Cost',
                            type: 'number'
                        },
                        {
                            name: 'estimatedDays',
                            title: 'Estimated Days',
                            type: 'number'
                        },
                        {
                            name: 'fromCountry',
                            title: 'From Country',
                            type: 'string'
                        }
                    ]
                },
                {
                    name: 'variants',
                    title: 'Number of Variants',
                    type: 'number'
                },
                {
                    name: 'specifications',
                    title: 'Number of Specifications',
                    type: 'number'
                }
            ],
            readOnly: true
        }),
        
        // System fields
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            hidden: true,
            readOnly: true
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            hidden: true,
            readOnly: true
        })
    ],
    preview: {
        select: {
            title: 'title',
            price: 'price',
            media: 'image',
            supplier: 'supplierName'
        },
        prepare(selection) {
            const { title, price, media, supplier } = selection;
            return {
                title: title || 'Untitled Product',
                subtitle: supplier ? `${supplier} - $${price || 0}` : `$${price || 0}`,
                media: media
            };
        }
    }
}); 