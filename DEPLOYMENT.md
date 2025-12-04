# 🚀 Deployment Guide - LuxeLend Rental Platform

This guide will help you deploy your full-stack rental platform to production.

## 📋 Prerequisites

- [x] GitHub repository with your code
- [ ] MongoDB Atlas account (for production database)
- [ ] Cloudinary account (for image hosting)
- [ ] Razorpay account (for payments)

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't already)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (it looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/luxelend?retryWrites=true&w=majority`)
5. Replace `<password>` with your actual password
6. **Important**: In Network Access, add `0.0.0.0/0` to allow connections from anywhere

### Step 2: Deploy to Render

1. **Sign Up/Login**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `anshikaasati/vastravows`
   - Click "Connect" next to your repository

3. **Configure Service**
   ```
   Name: luxelend-backend
   Region: Choose closest to you (e.g., Singapore for India)
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Plan**
   - Choose "Free" plan to start

5. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add these:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | |
   | `MONGODB_URI` | `your-mongodb-atlas-connection-string` | From Step 1 |
   | `JWT_SECRET` | `your-super-secret-jwt-key-min-32-chars` | Generate a random string |
   | `CLOUDINARY_CLOUD_NAME` | `your-cloudinary-cloud-name` | From Cloudinary dashboard |
   | `CLOUDINARY_API_KEY` | `your-cloudinary-api-key` | From Cloudinary dashboard |
   | `CLOUDINARY_API_SECRET` | `your-cloudinary-api-secret` | From Cloudinary dashboard |
   | `RAZORPAY_KEY_ID` | `your-razorpay-key-id` | From Razorpay dashboard |
   | `RAZORPAY_KEY_SECRET` | `your-razorpay-key-secret` | From Razorpay dashboard |
   | `FRONTEND_URL` | `https://your-app.netlify.app` | Add after deploying frontend |

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your backend URL will be: `https://luxelend-backend.onrender.com`

### Step 3: Verify Backend

Once deployed, visit: `https://luxelend-backend.onrender.com/`

You should see: `{"message": "Rental API is running"}`

---

## 🎨 Frontend Deployment (Netlify)

### Step 1: Create Production Environment File

Create `frontend/.env.production` with:

```env
VITE_BACKEND_URL=https://luxelend-backend.onrender.com
```

### Step 2: Commit and Push

```bash
git add frontend/.env.production
git commit -m "Add production environment config"
git push
```

### Step 3: Deploy to Netlify

1. **Sign Up/Login**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository: `anshikaasati/vastravows`

3. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Add Environment Variables**
   - Go to "Site settings" → "Environment variables"
   - Add: `VITE_BACKEND_URL` = `https://luxelend-backend.onrender.com`

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Your site will be live at: `https://random-name-12345.netlify.app`

6. **Custom Domain (Optional)**
   - Go to "Domain settings"
   - Click "Add custom domain" to use your own domain

### Step 4: Update Backend FRONTEND_URL

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` to your Netlify URL (e.g., `https://your-app.netlify.app`)
5. Save changes (this will redeploy your backend)

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Netlify URL
- [ ] Test user registration
- [ ] Test user login
- [ ] Test adding an item
- [ ] Test image upload (Cloudinary)
- [ ] Test payment flow (Razorpay)
- [ ] Check browser console for CORS errors
- [ ] Test on mobile device

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Verify `FRONTEND_URL` in Render matches your Netlify URL exactly
2. Make sure there's no trailing slash
3. Redeploy backend after changing environment variables

### Images Not Uploading
1. Verify Cloudinary credentials in Render
2. Check Cloudinary dashboard for upload quota
3. Check browser console for errors

### Payment Failing
1. Verify Razorpay credentials
2. Make sure you're using test mode keys for testing
3. Check Razorpay dashboard for webhook settings

### Backend Not Responding
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify MongoDB connection string is correct
3. Make sure MongoDB Atlas allows connections from `0.0.0.0/0`

### "Free instance will spin down with inactivity"
Render's free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds. Solutions:
- Upgrade to paid plan ($7/month)
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes

---

## 🎯 Quick Commands Reference

```bash
# Check what's staged for commit
git status

# Add all changes
git add .

# Commit changes
git commit -m "your message"

# Push to GitHub (triggers auto-deploy)
git push

# Build frontend locally to test
cd frontend
npm run build
npm run preview
```

---

## 📱 Share Your Project

Once deployed, you can share:
- **Live URL**: `https://your-app.netlify.app`
- **GitHub Repo**: `https://github.com/anshikaasati/vastravows`
- **API Docs**: `https://luxelend-backend.onrender.com/api`

Add these to your resume! 🎉

---

## 💡 Tips

1. **Auto-Deploy**: Both Render and Netlify auto-deploy when you push to GitHub
2. **Logs**: Always check deployment logs if something fails
3. **Environment Variables**: Never commit `.env` files to GitHub
4. **Testing**: Test thoroughly in production before sharing
5. **Monitoring**: Check Render and Netlify dashboards regularly

---

Need help? Check the logs first, then review this guide. Good luck! 🚀
