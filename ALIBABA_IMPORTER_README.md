# 🚀 Alibaba Product Importer for Utrabeauty

A powerful Next.js API system for scraping Alibaba and AliExpress products and importing them into your Sanity CMS-powered e-commerce store.

## ✨ Features

- **🔄 Web Scraping**: Extract product data from Alibaba/AliExpress using Puppeteer
- **📊 Data Extraction**: Get product title, description, price, and images
- **📥 Sanity Integration**: Automatically import scraped products into your CMS
- **🖼️ Image Handling**: Download and upload product images to Sanity
- **🛡️ Error Handling**: Robust error handling and validation
- **⚡ Performance**: Optimized for speed and reliability

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Alibaba URL  │───▶│  Puppeteer      │───▶│  Sanity CMS    │
│                 │    │  Scraper        │    │  Import        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scrape-alibaba/          # Basic scraping API
│   │   └── scrape-and-import/       # Scraping + Import API
│   └── scrape-test/                 # Test interface
├── lib/
│   └── alibaba-importer.ts          # Import utilities
└── stores/
    └── cart-store.ts                # Cart management
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install puppeteer
```

### 2. Test the Scraper

Visit: `http://localhost:3000/scrape-test`

### 3. Use the API

```bash
# Basic scraping
GET /api/scrape-alibaba?url=https://alibaba.com/product-detail/...

# Scraping + Import
POST /api/scrape-and-import
{
  "url": "https://alibaba.com/product-detail/...",
  "importToSanity": true,
  "categoryId": "optional-category-id"
}
```

## 🔧 API Endpoints

### 1. Basic Scraping (`/api/scrape-alibaba`)

**GET Request:**
```bash
GET /api/scrape-alibaba?url=https://alibaba.com/product-detail/...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Product Title",
    "description": "Product Description",
    "price": "29.99",
    "images": ["image1.jpg", "image2.jpg"],
    "scrapedAt": "2024-01-20T10:00:00.000Z"
  },
  "message": "Product scraped successfully"
}
```

### 2. Scraping + Import (`/api/scrape-and-import`)

**POST Request:**
```json
{
  "url": "https://alibaba.com/product-detail/...",
  "importToSanity": true,
  "categoryId": "optional-category-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* scraped data */ },
  "importResult": {
    "_id": "sanity-product-id",
    "title": "Product Title",
    "slug": "product-title",
    "images": [/* Sanity image references */]
  },
  "message": "Product scraped and imported successfully"
}
```

## 🎯 Usage Examples

### Example 1: Basic Scraping

```javascript
const response = await fetch('/api/scrape-alibaba?url=https://alibaba.com/product-detail/123');
const result = await response.json();

if (result.success) {
  console.log('Product:', result.data.title);
  console.log('Price:', result.data.price);
  console.log('Images:', result.data.images.length);
}
```

### Example 2: Scraping + Import

```javascript
const response = await fetch('/api/scrape-and-import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://alibaba.com/product-detail/123',
    importToSanity: true,
    categoryId: 'electronics-category'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Product imported with ID:', result.importResult._id);
}
```

### Example 3: Using the Import Utility

```javascript
import { completeAlibabaImport } from '@/lib/alibaba-importer';

const scrapedProduct = {
  title: "Wireless Headphones",
  description: "High-quality wireless headphones",
  price: "49.99",
  images: ["image1.jpg", "image2.jpg"],
  scrapedAt: new Date().toISOString()
};

const importedProduct = await completeAlibabaImport(
  scrapedProduct,
  'https://alibaba.com/product-detail/123',
  'audio-category'
);
```

## 🔍 Data Extraction

The scraper extracts the following data:

### **Product Title**
- Multiple selector fallbacks for reliability
- Clean text extraction
- Fallback to generic h1 if specific selectors fail

### **Product Description**
- Comprehensive description extraction
- Multiple selector strategies
- Fallback mechanisms for different page layouts

### **Product Price**
- Price extraction with currency symbol removal
- Numeric value cleaning
- Support for various price formats

### **Product Images**
- Multiple image selector strategies
- Duplicate removal
- Maximum 10 images per product
- Support for lazy-loaded images

## 🛡️ Error Handling

### **Scraping Errors**
- Network timeout handling (30 seconds)
- Page load failures
- Selector not found scenarios
- Browser launch failures

### **Import Errors**
- Sanity connection issues
- Image upload failures
- Invalid data validation
- Category reference errors

### **Response Format**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Detailed error information",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

## ⚙️ Configuration

### **Puppeteer Settings**
```javascript
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
});
```

### **User Agent**
```javascript
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);
```

## 🚨 Important Considerations

### **Legal & Ethical**
- ✅ Use for legitimate business purposes only
- ✅ Respect website terms of service
- ✅ Check robots.txt files
- ✅ Use reasonable scraping intervals
- ❌ Don't overwhelm servers
- ❌ Don't violate terms of service

### **Technical Limitations**
- Some pages may have anti-scraping measures
- Image URLs may expire over time
- Page structure changes may break selectors
- Network issues may cause timeouts

### **Performance**
- Scraping takes 5-15 seconds per product
- Image uploads add additional time
- Consider implementing rate limiting
- Monitor server resources

## 🔧 Troubleshooting

### **Common Issues**

1. **"Failed to scrape product"**
   - Check if URL is accessible
   - Verify it's an Alibaba/AliExpress URL
   - Try different product pages

2. **"No title/description/price found"**
   - Page structure may have changed
   - Selectors may need updating
   - Check browser console for errors

3. **"Import to Sanity failed"**
   - Verify Sanity credentials
   - Check network connectivity
   - Ensure proper permissions

### **Debug Mode**

Enable detailed logging by checking the console:
```bash
# Check browser console for detailed logs
npm run dev
# Then visit the scraping page and check terminal output
```

## 🚀 Deployment

### **Vercel Deployment**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### **Environment Variables**
```bash
# Required for Sanity integration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
SANITY_API_WRITE_TOKEN=your_write_token
```

### **Server Requirements**
- Node.js 18+ (for Puppeteer compatibility)
- Sufficient memory for browser instances
- Network access to Alibaba/AliExpress

## 📈 Future Enhancements

### **Planned Features**
- [ ] Batch product importing
- [ ] Scheduled scraping
- [ ] Price monitoring
- [ ] Competitor analysis
- [ ] Automated category detection
- [ ] Image optimization
- [ ] SEO metadata extraction

### **Integration Possibilities**
- [ ] Shopify integration
- [ ] WooCommerce support
- [ ] Inventory management
- [ ] Price comparison tools
- [ ] Market analysis dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational and legitimate business purposes. Please respect all applicable laws and terms of service.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review console logs
3. Test with different URLs
4. Create an issue with detailed information

---

**Happy Scraping! 🚀**

*Remember to use this tool responsibly and in accordance with website terms of service.* 