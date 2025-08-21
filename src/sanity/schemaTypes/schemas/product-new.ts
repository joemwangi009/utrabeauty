import { defineField, defineType } from 'sanity';

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(100)
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            validation: (Rule) => Rule.required().min(10).max(1000)
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().positive().precision(2)
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'productCategory' }],
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'supplierUrl',
            title: 'Supplier URL',
            type: 'url',
            description: 'Paste an Alibaba or AliExpress URL to automatically import product details'
        }),
        defineField({
            name: 'supplierName',
            title: 'Supplier Name',
            type: 'string',
            description: 'Name of the supplier/vendor from Alibaba',
            validation: (Rule) => Rule.max(100)
        }),
        defineField({
            name: 'importedFromAlibaba',
            title: 'Imported from Alibaba',
            type: 'boolean',
            description: 'Indicates if this product was imported from Alibaba',
            initialValue: false,
            readOnly: true
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96
            },
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            validation: (Rule) => Rule.required().integer().min(0),
            initialValue: 0
        }),
        defineField({
            name: 'isActive',
            title: 'Active',
            type: 'boolean',
            description: 'Whether this product is available for purchase',
            initialValue: true
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            readOnly: true
        }),
        defineField({
            name: 'updatedAt',
            title: 'Updated At',
            type: 'datetime',
            readOnly: true
        })
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
            category: 'category.title',
            price: 'price'
        },
        prepare(selection) {
            const { title, media, category, price } = selection;
            return {
                title,
                subtitle: `${category ? category + ' • ' : ''}$${price}`,
                media
            };
        }
    }
}); 