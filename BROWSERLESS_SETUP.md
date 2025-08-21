# 🚀 Browserless.io Setup for Vercel Deployment

## Why This Setup?

Your Alibaba scraper needs a real browser to work. Since Vercel is serverless and can't run Puppeteer locally, we use Browserless.io - a cloud service that provides real browsers.

## 🔑 Setup Steps

### 1. Get Browserless.io Account
- Go to [browserless.io](https://browserless.io)
- Sign up for a free account
- Get your API token

### 2. Add Environment Variables to Vercel
```bash
# In your Vercel dashboard or vercel.json
BROWSERLESS_URL=https://chrome.browserless.io
BROWSERLESS_TOKEN=your_api_token_here
```

### 3. Alternative: Use Free Tier
Browserless.io offers 1000 free sessions per month, which should be enough for testing.

## 🌐 How It Works

- **Local Development**: Uses your computer's Chrome (Puppeteer)
- **Vercel Production**: Uses Browserless.io's cloud Chrome
- **Both**: Extract REAL Alibaba data (no mock data!)

## 💰 Cost
- **Free**: 1000 sessions/month
- **Paid**: $0.001 per session after free tier
- **Your Use Case**: Likely under $5/month for moderate usage

## 🎯 Benefits
✅ **Real scraping** works on Vercel  
✅ **No mock data** - always accurate  
✅ **Scalable** - handles multiple users  
✅ **Reliable** - cloud infrastructure  

## 🚨 Important Notes
- Keep your API token secret
- Monitor usage to avoid unexpected charges
- Consider upgrading if you exceed free tier

## 🔧 Testing
After setup, your scraper will work exactly the same on Vercel as locally - extracting real Alibaba products with all details! 