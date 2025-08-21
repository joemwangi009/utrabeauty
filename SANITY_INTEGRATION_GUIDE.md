# 🔗 Sanity Studio Integration Guide for Alibaba Product Importer

This guide shows you how to integrate the Alibaba product importer into your Sanity Studio for seamless product importing.

## 📁 File Structure

```
src/sanity/
├── components/
│   ├── ImportFromAlibaba.tsx          # Main component
│   ├── ImportFromAlibabaInput.tsx     # Sanity input wrapper
│   └── index.ts                       # Component exports
├── schemaTypes/
│   └── schemas/
│       └── product.ts                 # Updated product schema
└── ...
```

## 🚀 Quick Setup

### 1. **Install Dependencies**

```bash
npm install puppeteer
```

### 2. **Copy Component Files**

The following files have been created:
- `src/sanity/components/ImportFromAlibaba.tsx`
- `src/sanity/components/ImportFromAlibabaInput.tsx`
- `src/sanity/components/index.ts`

### 3. **Update Product Schema**

Your product schema has been enhanced with:
- Alibaba import field
- **Supplier URL tracking** - Stores original Alibaba URL
- **Supplier Name** - Automatically set based on platform
- **Imported from Alibaba flag** - Boolean indicator
- Import metadata
- Enhanced validation
- Better preview and ordering

## 🔧 How It Works

### **Component Flow**

```
1. User pastes Alibaba URL
2. Clicks "Import Product"
3. Component calls /api/scrape-alibaba
4. Puppeteer scrapes product data
5. Data auto-fills product fields
6. Supplier fields are automatically populated
7. Metadata is stored for tracking
```

### **Data Mapping**

| Scraped Field | Sanity Field | Type | Auto-populated |
|---------------|---------------|------|----------------|
| `title` | `title` | string | ✅ Yes |
| `description` | `description` | text | ✅ Yes |
| `price` | `price` | number | ✅ Yes |
| `images` | `image` | image (first image) | ✅ Yes |
| `url` | `supplierUrl` | url | ✅ Yes |
| - | `supplierName` | string | ✅ Yes (auto-detected) |
| - | `importedFromAlibaba` | boolean | ✅ Yes (set to true) |
| - | `importMetadata` | object | ✅ Yes |

## 🎯 Usage in Sanity Studio

### **Step 1: Create New Product**

1. Go to your Sanity Studio
2. Navigate to Products
3. Click "Create new product"

### **Step 2: Use Alibaba Import**

1. **Find the "Import from Alibaba" field** at the top
2. **Paste an Alibaba URL** (e.g., `https://alibaba.com/product-detail/123`)
3. **Click "Import Product"**
4. **Wait for scraping** (5-15 seconds)
5. **Review imported data**

### **Step 3: Complete Product Setup**

1. **Verify imported data** (title, description, price)
2. **Check supplier fields** (URL, name, import flag)
3. **Upload additional images** if needed
4. **Select category** from dropdown
5. **Set product status** (draft/published)
6. **Save the product**

## 🔍 Field Details

### **Import from Alibaba**
- **Type**: Custom input component
- **Purpose**: Scrape and import product data
- **Validation**: Optional, URL format check

### **Supplier URL**
- **Type**: URL field
- **Purpose**: Store original Alibaba link
- **Usage**: Reference for re-importing or updates
- **Auto-populated**: ✅ Yes

### **Supplier Name**
- **Type**: String field
- **Purpose**: Name of the supplier/vendor
- **Auto-detection**: 
  - Alibaba URLs → "Alibaba Supplier"
  - AliExpress URLs → "AliExpress Supplier"
- **Auto-populated**: ✅ Yes

### **Imported from Alibaba**
- **Type**: Boolean field
- **Purpose**: Flag indicating Alibaba import
- **Default**: false
- **Auto-set**: ✅ Yes (set to true on import)
- **Read-only**: ✅ Yes (prevents manual changes)

### **Import Metadata**
- **Type**: Collapsible object
- **Fields**:
  - `importedFrom`: Source platform (alibaba/aliexpress)
  - `importedAt`: Import timestamp
  - `originalUrl`: Original product URL

## 🛠️ Customization Options

### **Modify Scraped Fields**

Edit `ImportFromAlibaba.tsx` to change which fields get auto-filled:

```typescript
// Example: Add custom field mapping
patches.push(set(data.data.customField, ['customField']));
```

### **Customize Supplier Name Logic**

Modify the supplier name detection in the component:

```typescript
// Example: Extract supplier name from URL path
const urlPath = urlObj.pathname;
if (urlPath.includes('/company/')) {
  const companyMatch = urlPath.match(/\/company\/([^\/]+)/);
  if (companyMatch) {
    supplierName = decodeURIComponent(companyMatch[1]);
  }
}
```

### **Add Validation Rules**

Modify the product schema validation:

```typescript
defineField({
  name: 'supplierName',
  title: 'Supplier Name',
  type: 'string',
  validation: (Rule) => Rule.optional().max(100).min(2)
})
```

### **Custom Error Handling**

Enhance error messages in the component:

```typescript
if (data.error === 'specific_error') {
  setError('Custom error message for specific error');
}
```

## 🔒 Security Considerations

### **API Protection**
- Ensure `/api/scrape-alibaba` is properly secured
- Consider rate limiting for production use
- Validate URLs before scraping

### **Data Validation**
- Sanitize scraped content
- Validate image URLs before import
- Check for malicious content

## 🚨 Troubleshooting

### **Common Issues**

1. **"Component not found" error**
   - Check import paths in schema
   - Ensure components are properly exported

2. **Import field not showing**
   - Verify schema is registered in `schemaTypes/index.ts`
   - Check for TypeScript compilation errors

3. **Scraping fails**
   - Verify API endpoint is working
   - Check browser console for errors
   - Ensure Puppeteer is installed

4. **Fields not auto-filling**
   - Check API response format
   - Verify field names match schema
   - Check browser console for errors

5. **Supplier fields not populated**
   - Verify the component is calling the correct patch operations
   - Check that field names match exactly in the schema

### **Debug Steps**

1. **Check Sanity Studio console** for JavaScript errors
2. **Verify API endpoint** by testing directly
3. **Check component props** in React DevTools
4. **Review network requests** in browser DevTools
5. **Inspect patch operations** in the component

## 📈 Advanced Features

### **Batch Importing**
```typescript
// Future enhancement: Import multiple products
const urls = ['url1', 'url2', 'url3'];
for (const url of urls) {
  await handleImport(url);
}
```

### **Scheduled Updates**
```typescript
// Future enhancement: Auto-update prices
setInterval(async () => {
  // Re-scrape supplier URLs for price updates
}, 24 * 60 * 60 * 1000); // Daily
```

### **Image Processing**
```typescript
// Future enhancement: Optimize imported images
const optimizedImage = await processImage(scrapedImage);
```

### **Supplier Analytics**
```typescript
// Future enhancement: Track supplier performance
const supplierStats = await getSupplierAnalytics();
```

## 🔄 Updating Existing Products

### **Re-import Data**
1. Find existing product in Sanity Studio
2. Use "Import from Alibaba" field
3. Paste updated supplier URL
4. Click "Import Product" to refresh data
5. **All supplier fields will be updated**

### **Bulk Updates**
- Use Sanity's GROQ queries to find products
- Filter by `importedFromAlibaba: true`
- Update multiple products programmatically

### **Manual Supplier Updates**
- Edit `supplierName` field manually if needed
- Update `supplierUrl` for new product links
- Toggle `importedFromAlibaba` flag if necessary

## 📊 Monitoring & Analytics

### **Track Import Success**
- Monitor import success rates
- Track common failure reasons
- Analyze popular supplier platforms

### **Performance Metrics**
- Measure scraping time
- Track API response times
- Monitor error rates

### **Supplier Insights**
- Track most successful suppliers
- Monitor product quality by supplier
- Analyze import patterns

## 🚀 Production Deployment

### **Environment Variables**
```bash
# Required for Sanity integration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
SANITY_API_WRITE_TOKEN=your_write_token
```

### **Server Requirements**
- Node.js 18+ for Puppeteer compatibility
- Sufficient memory for browser instances
- Network access to Alibaba/AliExpress

### **Rate Limiting**
```typescript
// Implement rate limiting for production
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

## 🤝 Support & Contributing

### **Getting Help**
1. Check this documentation
2. Review component source code
3. Test with different Alibaba URLs
4. Check Sanity Studio console logs

### **Contributing**
1. Fork the repository
2. Create feature branch
3. Make improvements
4. Submit pull request

---

## 🎉 Success!

You now have a fully integrated Alibaba product importer in your Sanity Studio with comprehensive supplier tracking! 

**Key Benefits:**
- ✅ **Seamless Integration** - Works directly in Sanity Studio
- ✅ **Auto-fill Fields** - No manual data entry needed
- ✅ **Supplier Tracking** - Complete supplier information
- ✅ **Import Flags** - Clear indication of imported products
- ✅ **Data Tracking** - Complete import history
- ✅ **Error Handling** - Robust error management
- ✅ **User Friendly** - Simple paste-and-click interface

**New Features Added:**
- 🔗 **Supplier URL** - Store original product links
- 🏢 **Supplier Name** - Auto-detected platform names
- ✅ **Import Flag** - Boolean indicator for imported products
- 📊 **Enhanced Preview** - Shows supplier information in product lists
- 🔄 **Smart Ordering** - Sort by import status

**Next Steps:**
1. Test with real Alibaba URLs
2. Verify supplier fields are auto-populated
3. Customize supplier name logic if needed
4. Set up monitoring for production use
5. Train your team on the new workflow

Happy importing! 🚀 