import { client } from '@/sanity/lib/client';

export interface ScrapedProduct {
  title: string;
  description: string;
  price: string;
  images: string[];
  scrapedAt: string;
}

export interface ImportedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: Array<{
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  }>;
  source: {
    _type: 'object';
    platform: 'alibaba' | 'aliexpress';
    originalUrl: string;
    scrapedAt: string;
  };
  category?: {
    _type: 'reference';
    _ref: string;
  };
  slug?: {
    _type: 'slug';
    current: string;
  };
}

/**
 * Import a scraped Alibaba product into Sanity CMS
 */
export async function importAlibabaProduct(
  scrapedProduct: ScrapedProduct,
  originalUrl: string,
  categoryId?: string
): Promise<ImportedProduct> {
  try {
    // Generate a slug from the title
    const slug = generateSlug(scrapedProduct.title);
    
    // Parse price to number
    const price = parseFloat(scrapedProduct.price.replace(/[^\d.,]/g, '')) || 0;
    
    // Create the product document
    const productDoc: any = {
      _type: 'product',
      title: scrapedProduct.title,
      description: scrapedProduct.description,
      price: price,
      images: [], // Will be populated after image uploads
      source: {
        _type: 'object',
        platform: originalUrl.includes('alibaba.com') ? 'alibaba' : 'aliexpress',
        originalUrl: originalUrl,
        scrapedAt: scrapedProduct.scrapedAt
      },
      slug: {
        _type: 'slug',
        current: slug
      }
    };

    // Add category if provided
    if (categoryId) {
      productDoc.category = {
        _type: 'reference',
        _ref: categoryId
      };
    }

    // Create the product in Sanity
    const createdProduct = await client.create(productDoc);

    console.log(`✅ Product imported successfully: ${createdProduct._id}`);

    return {
      _id: createdProduct._id,
      title: scrapedProduct.title,
      description: scrapedProduct.description,
      price: price,
      images: [],
      source: productDoc.source,
      category: productDoc.category,
      slug: productDoc.slug
    };

  } catch (error) {
    console.error('❌ Failed to import product:', error);
    throw new Error(`Failed to import product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Upload images from URLs to Sanity
 */
export async function uploadImagesToSanity(imageUrls: string[]): Promise<string[]> {
  const uploadedImageRefs: string[] = [];

  for (const imageUrl of imageUrls) {
    try {
      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`⚠️ Failed to download image: ${imageUrl}`);
        continue;
      }

      const buffer = await response.arrayBuffer();
      
      // Upload to Sanity
      const asset = await client.assets.upload('image', Buffer.from(buffer), {
        filename: `alibaba-import-${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });

      uploadedImageRefs.push(asset._id);
      console.log(`✅ Image uploaded: ${asset._id}`);

    } catch (error) {
      console.error(`❌ Failed to upload image ${imageUrl}:`, error);
    }
  }

  return uploadedImageRefs;
}

/**
 * Update product with uploaded images
 */
export async function updateProductImages(productId: string, imageRefs: string[]): Promise<void> {
  try {
    const imageObjects = imageRefs.map(ref => ({
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: ref
      }
    }));

    await client
      .patch(productId)
      .set({ images: imageObjects })
      .commit();

    console.log(`✅ Product ${productId} updated with ${imageRefs.length} images`);

  } catch (error) {
    console.error(`❌ Failed to update product images:`, error);
    throw new Error(`Failed to update product images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete import process: create product and upload images
 */
export async function completeAlibabaImport(
  scrapedProduct: ScrapedProduct,
  originalUrl: string,
  categoryId?: string
): Promise<ImportedProduct> {
  try {
    // Step 1: Import the product
    const importedProduct = await importAlibabaProduct(scrapedProduct, originalUrl, categoryId);

    // Step 2: Upload images
    if (scrapedProduct.images.length > 0) {
      const imageRefs = await uploadImagesToSanity(scrapedProduct.images);
      
      // Step 3: Update product with image references
      if (imageRefs.length > 0) {
        await updateProductImages(importedProduct._id, imageRefs);
        
        // Update the returned product with image objects
        importedProduct.images = imageRefs.map(ref => ({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: ref
          }
        }));
      }
    }

    console.log(`🎉 Complete import successful for product: ${importedProduct.title}`);
    return importedProduct;

  } catch (error) {
    console.error('❌ Complete import failed:', error);
    throw error;
  }
} 