import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AlibabaProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  images: string[];
  url: string;
  supplierName: string;
  scrapedAt: string;
  minOrderQuantity?: string;
  material?: string;
  color?: string;
  size?: string;
  brand?: string;
  warranty?: string;
  shippingInfo?: string;
  productSpecs?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, categoryId } = body;

    if (!product || !product.title) {
      return NextResponse.json(
        { error: 'Product data is required' },
        { status: 400 }
      );
    }

    // Convert price to number
    const price = parseFloat(product.price.replace(/[^\d.,]/g, '')) || 0;

    // Generate slug from title
    const slug = product.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 96);

    // Generate tags from product data
    const tags = [];
    const text = `${product.title} ${product.description}`.toLowerCase();
    
    // Common product tags
    if (text.includes('wireless') || text.includes('bluetooth')) tags.push('wireless');
    if (text.includes('waterproof') || text.includes('water-resistant')) tags.push('waterproof');
    if (text.includes('portable') || text.includes('travel')) tags.push('portable');
    if (text.includes('smart') || text.includes('ai')) tags.push('smart');
    if (text.includes('eco') || text.includes('green')) tags.push('eco-friendly');
    if (text.includes('premium') || text.includes('luxury')) tags.push('premium');
    if (text.includes('budget') || text.includes('affordable')) tags.push('budget-friendly');
    
    // Add category-based tags
    if (text.includes('phone') || text.includes('smartphone')) tags.push('mobile', 'electronics');
    if (text.includes('laptop') || text.includes('computer')) tags.push('computing', 'electronics');
    if (text.includes('headphone') || text.includes('earphone')) tags.push('audio', 'electronics');
    if (text.includes('watch') || text.includes('clock')) tags.push('wearable', 'electronics');
    if (text.includes('camera') || text.includes('photo')) tags.push('photography', 'electronics');
    if (text.includes('game') || text.includes('gaming')) tags.push('gaming', 'entertainment');
    
    // Add specification-based tags
    if (product.material) {
      const material = product.material.toLowerCase();
      if (material.includes('plastic')) tags.push('plastic');
      if (material.includes('metal') || material.includes('aluminum') || material.includes('steel')) tags.push('metal');
      if (material.includes('wood')) tags.push('wood');
      if (material.includes('leather')) tags.push('leather');
      if (material.includes('fabric') || text.includes('cotton')) tags.push('fabric');
      if (material.includes('glass')) tags.push('glass');
      if (material.includes('ceramic')) tags.push('ceramic');
    }
    
    if (product.color) {
      const color = product.color.toLowerCase();
      if (color.includes('black')) tags.push('black');
      if (color.includes('white')) tags.push('white');
      if (color.includes('red')) tags.push('red');
      if (color.includes('blue')) tags.push('blue');
      if (color.includes('green')) tags.push('green');
      if (color.includes('yellow')) tags.push('yellow');
      if (color.includes('pink')) tags.push('pink');
      if (color.includes('purple')) tags.push('purple');
      if (color.includes('orange')) tags.push('orange');
      if (color.includes('brown')) tags.push('brown');
      if (color.includes('gray') || color.includes('grey')) tags.push('gray');
      if (color.includes('gold')) tags.push('gold');
      if (color.includes('silver')) tags.push('silver');
    }
    
    if (product.brand) {
      tags.push(product.brand.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // Add warranty and certification tags
    if (product.warranty && product.warranty.toLowerCase().includes('warranty')) tags.push('warranty');
    if (product.productSpecs) {
      Object.values(product.productSpecs).forEach(spec => {
        if (spec && spec.toLowerCase().includes('certified')) tags.push('certified');
        if (spec && spec.toLowerCase().includes('iso')) tags.push('iso-certified');
        if (spec && spec.toLowerCase().includes('ce')) tags.push('ce-marked');
        if (spec && spec.toLowerCase().includes('fcc')) tags.push('fcc-approved');
      });
    }
    
    // Remove duplicates and limit to 15 tags
    const uniqueTags = [...new Set(tags)].slice(0, 15);

    // Create the product directly in the database
    const newProduct = await prisma.product.create({
      data: {
        title: product.title,
        description: product.description,
        price: price,
        image: product.images[0] || '', // Store first image URL
        categoryId: categoryId || 'default-category', // You can set a default category
        supplierUrl: product.url,
        supplierName: product.supplierName,
        importedFromAlibaba: true,
        stock: 100, // Default stock for imported products
        isActive: true,
        slug: {
          create: {
            current: slug
          }
        },
        tags: uniqueTags,
        importMetadata: {
          importedFrom: 'alibaba',
          importedAt: new Date().toISOString(),
          originalUrl: product.url,
          supplierRating: 0, // Will be updated later if available
          productRating: 0, // Will be updated later if available
          soldCount: 0, // Will be updated later if available
          shippingInfo: {
            free: product.shippingInfo?.includes('free') || false,
            cost: 0, // Will be calculated later
            estimatedDays: 0, // Will be updated later
            fromCountry: 'Unknown' // Will be updated later
          },
          variants: 0, // Will be updated later
          specifications: Object.keys(product.productSpecs || {}).length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Product created successfully: ${newProduct.title} (ID: ${newProduct.id})`);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct.id,
        title: newProduct.title,
        slug: newProduct.slug?.current,
        price: newProduct.price,
        supplierName: newProduct.supplierName,
        importedAt: newProduct.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Failed to create product:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 