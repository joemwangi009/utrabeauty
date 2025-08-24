import { ValidationResult } from './types';

export class DataValidator {
  private validationRules = {
    title: {
      minLength: 3,
      maxLength: 200,
      required: true
    },
    price: {
      minValue: 0.01,
      maxValue: 100000,
      required: true
    },
    description: {
      minLength: 10,
      maxLength: 2000,
      required: true
    },
    images: {
      minCount: 1,
      maxCount: 20,
      required: true
    },
    supplierName: {
      minLength: 2,
      maxLength: 100,
      required: false
    }
  };

  /**
   * Validate scraped product data
   */
  validateProductData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;

    try {
      // Validate title
      if (this.validationRules.title.required && (!data.title || typeof data.title !== 'string')) {
        errors.push('Product title is required and must be a string');
        confidence -= 30;
      } else if (data.title) {
        const titleValidation = this.validateStringField(
          data.title,
          'title',
          this.validationRules.title
        );
        errors.push(...titleValidation.errors);
        warnings.push(...titleValidation.warnings);
        confidence -= titleValidation.confidencePenalty;
      }

      // Validate price
      if (this.validationRules.price.required && (!data.price || typeof data.price !== 'string')) {
        errors.push('Product price is required and must be a string');
        confidence -= 25;
      } else if (data.price) {
        const priceValidation = this.validatePriceField(data.price);
        errors.push(...priceValidation.errors);
        warnings.push(...priceValidation.warnings);
        confidence -= priceValidation.confidencePenalty;
      }

      // Validate description
      if (this.validationRules.description.required && (!data.description || typeof data.description !== 'string')) {
        errors.push('Product description is required and must be a string');
        confidence -= 20;
      } else if (data.description) {
        const descriptionValidation = this.validateStringField(
          data.description,
          'description',
          this.validationRules.description
        );
        errors.push(...descriptionValidation.errors);
        warnings.push(...descriptionValidation.warnings);
        confidence -= descriptionValidation.confidencePenalty;
      }

      // Validate images
      if (this.validationRules.images.required && (!data.images || !Array.isArray(data.images))) {
        errors.push('Product images are required and must be an array');
        confidence -= 20;
      } else if (data.images && Array.isArray(data.images)) {
        const imagesValidation = this.validateImagesField(data.images);
        errors.push(...imagesValidation.errors);
        warnings.push(...imagesValidation.warnings);
        confidence -= imagesValidation.confidencePenalty;
      }

      // Validate supplier name
      if (data.supplierName && typeof data.supplierName === 'string') {
        const supplierValidation = this.validateStringField(
          data.supplierName,
          'supplierName',
          this.validationRules.supplierName
        );
        errors.push(...supplierValidation.errors);
        warnings.push(...supplierValidation.warnings);
        confidence -= supplierValidation.confidencePenalty;
      }

      // Validate URL
      if (data.url) {
        const urlValidation = this.validateUrlField(data.url);
        errors.push(...urlValidation.errors);
        warnings.push(...urlValidation.warnings);
        confidence -= urlValidation.confidencePenalty;
      }

      // Validate scraped timestamp
      if (data.scrapedAt) {
        const timestampValidation = this.validateTimestampField(data.scrapedAt);
        errors.push(...timestampValidation.errors);
        warnings.push(...timestampValidation.warnings);
        confidence -= timestampValidation.confidencePenalty;
      }

      // Additional quality checks
      const qualityChecks = this.performQualityChecks(data);
      warnings.push(...qualityChecks.warnings);
      confidence -= qualityChecks.confidencePenalty;

      // Ensure confidence doesn't go below 0
      confidence = Math.max(0, confidence);

      // Determine data quality level
      const dataQuality = this.determineDataQuality(confidence);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        confidence,
        dataQuality
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        confidence: 0,
        dataQuality: 'poor'
      };
    }
  }

  /**
   * Validate string field
   */
  private validateStringField(
    value: string,
    fieldName: string,
    rules: { minLength: number; maxLength: number; required: boolean }
  ): { errors: string[]; warnings: string[]; confidencePenalty: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    if (value.length < rules.minLength) {
      errors.push(`${fieldName} is too short (${value.length} chars, minimum ${rules.minLength})`);
      confidencePenalty += 15;
    }

    if (value.length > rules.maxLength) {
      warnings.push(`${fieldName} is very long (${value.length} chars, maximum ${rules.maxLength})`);
      confidencePenalty += 5;
    }

    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(value)) {
      warnings.push(`${fieldName} contains suspicious patterns`);
      confidencePenalty += 10;
    }

    // Check for repetitive content
    if (this.isRepetitiveContent(value)) {
      warnings.push(`${fieldName} appears to contain repetitive content`);
      confidencePenalty += 8;
    }

    return { errors, warnings, confidencePenalty };
  }

  /**
   * Validate price field
   */
  private validatePriceField(price: string): { errors: string[]; warnings: string[]; confidencePenalty: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    // Extract numeric price
    const numericPrice = parseFloat(price.replace(/[^\d.,]/g, ''));
    
    if (isNaN(numericPrice)) {
      errors.push('Price could not be parsed as a number');
      confidencePenalty += 20;
    } else {
      if (numericPrice < this.validationRules.price.minValue) {
        errors.push(`Price is too low: $${numericPrice} (minimum $${this.validationRules.price.minValue})`);
        confidencePenalty += 15;
      }

      if (numericPrice > this.validationRules.price.maxValue) {
        warnings.push(`Price is very high: $${numericPrice} (maximum $${this.validationRules.price.maxValue})`);
        confidencePenalty += 5;
      }

      // Check for suspicious price patterns
      if (numericPrice === 0 || numericPrice === 1) {
        warnings.push('Price seems suspiciously low');
        confidencePenalty += 10;
      }

      if (numericPrice % 1 === 0 && numericPrice < 10) {
        warnings.push('Price is a suspicious whole number');
        confidencePenalty += 5;
      }
    }

    return { errors, warnings, confidencePenalty };
  }

  /**
   * Validate images field
   */
  private validateImagesField(images: string[]): { errors: string[]; warnings: string[]; confidencePenalty: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    if (images.length < this.validationRules.images.minCount) {
      errors.push(`Too few images: ${images.length} (minimum ${this.validationRules.images.minCount})`);
      confidencePenalty += 15;
    }

    if (images.length > this.validationRules.images.maxCount) {
      warnings.push(`Many images: ${images.length} (maximum ${this.validationRules.images.maxCount})`);
      confidencePenalty += 5;
    }

    // Validate individual image URLs
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      if (!this.isValidImageUrl(imageUrl)) {
        warnings.push(`Image ${i + 1} has invalid URL: ${imageUrl}`);
        confidencePenalty += 3;
      }
    }

    // Check for duplicate images
    const uniqueImages = new Set(images);
    if (uniqueImages.size < images.length) {
      warnings.push('Duplicate images detected');
      confidencePenalty += 5;
    }

    return { errors, warnings, confidencePenalty };
  }

  /**
   * Validate URL field
   */
  private validateUrlField(url: string): { errors: string[]; warnings: string[]; confidencePenalty: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    try {
      const urlObj = new URL(url);
      
      // Check for expected domains
      const expectedDomains = ['alibaba.com', 'aliexpress.com', 'amazon.com', 'amazon.co.uk'];
      const domain = urlObj.hostname.toLowerCase();
      
      if (!expectedDomains.some(expected => domain.includes(expected))) {
        warnings.push(`URL domain (${domain}) is not from expected e-commerce platform`);
        confidencePenalty += 5;
      }

      // Check for suspicious URL patterns
      if (url.includes('javascript:') || url.includes('data:')) {
        errors.push('URL contains suspicious patterns');
        confidencePenalty += 20;
      }

    } catch (error) {
      errors.push('Invalid URL format');
      confidencePenalty += 15;
    }

    return { errors, warnings, confidencePenalty };
  }

  /**
   * Validate timestamp field
   */
  private validateTimestampField(timestamp: string): { errors: string[]; warnings: string[]; confidencePenalty: number } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidencePenalty = 0;

    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        errors.push('Invalid timestamp format');
        confidencePenalty += 10;
      } else {
        const now = new Date();
        const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 24) {
          warnings.push('Timestamp is more than 24 hours old');
          confidencePenalty += 5;
        }
        
        if (date > now) {
          errors.push('Timestamp is in the future');
          confidencePenalty += 15;
        }
      }
    } catch (error) {
      errors.push('Could not parse timestamp');
      confidencePenalty += 10;
    }

    return { errors, warnings, confidencePenalty };
  }

  /**
   * Perform additional quality checks
   */
  private performQualityChecks(data: any): { warnings: string[]; confidencePenalty: number } {
    const warnings: string[] = [];
    let confidencePenalty = 0;

    // Check for missing important fields
    const importantFields = ['title', 'price', 'description', 'images'];
    const missingFields = importantFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      warnings.push(`Missing important fields: ${missingFields.join(', ')}`);
      confidencePenalty += missingFields.length * 5;
    }

    // Check for placeholder content
    const placeholderPatterns = [
      /^[A-Z\s]+$/, // ALL CAPS
      /^[a-z\s]+$/, // all lowercase
      /^\d+$/, // only numbers
      /^[^\w\s]+$/, // only symbols
      /^(product|item|goods|merchandise)$/i, // generic terms
      /^(title|name|description|price)$/i // field names
    ];

    for (const [field, value] of Object.entries(data)) {
      if (typeof value === 'string' && placeholderPatterns.some(pattern => pattern.test(value))) {
        warnings.push(`Field '${field}' contains placeholder-like content: "${value}"`);
        confidencePenalty += 8;
      }
    }

    // Check for extremely short content
    if (data.title && data.title.length < 5) {
      warnings.push('Title is extremely short');
      confidencePenalty += 10;
    }

    if (data.description && data.description.length < 20) {
      warnings.push('Description is very short');
      confidencePenalty += 8;
    }

    return { warnings, confidencePenalty };
  }

  /**
   * Check for suspicious patterns in text
   */
  private containsSuspiciousPatterns(text: string): boolean {
    const suspiciousPatterns = [
      /\[.*?\]/, // Square brackets
      /\{.*?\}/, // Curly brackets
      /<.*?>/, // HTML tags
      /javascript:/i, // JavaScript code
      /on\w+\s*=/i, // Event handlers
      /data:/i, // Data URLs
      /blob:/i, // Blob URLs
      /about:blank/i // About blank
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check for repetitive content
   */
  private isRepetitiveContent(text: string): boolean {
    if (text.length < 20) return false;
    
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 2) { // Ignore very short words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    // Check if any word appears too frequently
    const maxFrequency = Math.ceil(words.length * 0.3); // 30% threshold
    return Array.from(wordCounts.values()).some(count => count > maxFrequency);
  }

  /**
   * Check if URL is a valid image URL
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      
      return hasImageExtension || urlObj.hostname.includes('image') || urlObj.hostname.includes('img');
    } catch {
      return false;
    }
  }

  /**
   * Determine data quality level
   */
  private determineDataQuality(confidence: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (confidence >= 90) return 'excellent';
    if (confidence >= 75) return 'good';
    if (confidence >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Get validation rules
   */
  getValidationRules(): any {
    return { ...this.validationRules };
  }

  /**
   * Update validation rules
   */
  updateValidationRules(newRules: Partial<typeof this.validationRules>): void {
    this.validationRules = { ...this.validationRules, ...newRules };
    console.log('⚙️ Validation rules updated');
  }
} 