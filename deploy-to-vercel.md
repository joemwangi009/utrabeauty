# 🚀 Deploy Utrabeauty to Vercel with Sanity Studio Access

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **Sanity Project** - Already configured (`i10ney18`)

## 🔧 Step-by-Step Deployment

### **1. Connect Repository to Vercel**

1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository:** `utrabeauty`
4. **Select the repository and click "Deploy"**

### **2. Configure Environment Variables**

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://your_supabase_connection_string

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=i10ney18
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-12-06
SANITY_API_READ_TOKEN=skpMtinf7QlJ771QH9sPOnpgZFbciHHoMO22lSgNvHZqQa72XXFpr82gcl9p8QfMwNsvXnQfQFKkg8VNyRyesdXu7VI3dX7xWKyjSHsWNyPnjj6CPScj96WqjIdS3v3B5E20ABFaP3phWMST2PyE51uDRDLjbCBy8zWLvNPGatGKagPgFIIw
SANITY_API_WRITE_TOKEN=skjbY0rFoMPGkV3MulNRiAy7FU9HQcIQM0Ul0r7nPz8hY6iVAfe3TKcPXDz5mdBRB8tyDOWvbpCyw5zBj9X8ZIJrRrBVb8Bx7IwhOysi7Y3HIwl0kR41kVEyy4CgLK4F5gb5afGb9iIKGFyf18YFuzbhLCJAs2T1xrcvsYSrMLq7v1ql1HRM

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### **3. Configure Sanity CORS**

1. **Go to [manage.sanity.io](https://manage.sanity.io)**
2. **Select project:** `i10ney18`
3. **Go to API section**
4. **Add CORS Origins:**
   ```
   https://your-domain.vercel.app
   https://your-domain.vercel.app/studio
   ```

### **4. Deploy**

1. **Push your latest changes to GitHub**
2. **Vercel will automatically deploy**
3. **Wait for deployment to complete**

## 🌐 Access Your Deployed Application

### **Main Application**
```
https://your-domain.vercel.app
```

### **Sanity Studio (Admin Dashboard)**
```
https://your-domain.vercel.app/studio
```

### **Admin Login**
- **Email:** `admin@utrabeauty.com`
- **Password:** `Transline254@`

## 🔐 Sanity Studio Access

### **What You Can Manage Online:**

1. **📦 Products**
   - Add new products
   - Edit existing products
   - Upload product images
   - Set prices and descriptions

2. **🏷️ Categories**
   - Create product categories
   - Organize products

3. **📋 Orders**
   - View customer orders
   - Track order status

4. **🎯 Promotions**
   - Create discount campaigns
   - Manage promotional codes

5. **📱 Content**
   - Update website banners
   - Manage promotional content

## ⚠️ Important Notes

- **Environment Variables** must be set in Vercel dashboard
- **CORS Configuration** is required for Sanity Studio to work
- **Database Connection** must be accessible from Vercel's servers
- **Stripe Webhooks** need to be updated with your Vercel domain

## 🚨 Troubleshooting

### **If Sanity Studio doesn't load:**
1. Check CORS configuration in Sanity
2. Verify environment variables in Vercel
3. Check browser console for errors

### **If database connection fails:**
1. Verify `DATABASE_URL` in Vercel
2. Check Supabase connection settings
3. Ensure database is accessible from external IPs

## 🎉 Success!

Once deployed, you'll have:
- ✅ **Live E-commerce Site** accessible worldwide
- ✅ **Online Admin Dashboard** via Sanity Studio
- ✅ **Database Management** from anywhere
- ✅ **Content Management** without coding

Your Utrabeauty store will be fully operational online with professional admin capabilities! 