# Network Monitoring Dashboard - Frontend

This is the frontend-only version of the Network Monitoring Dashboard, designed for deployment on Netlify.

## 🚀 Quick Deploy to Netlify

### Step 1: Push to GitHub
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Network monitoring dashboard - frontend only"

# Add remote origin (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/network-monitoring-frontend.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Build settings are auto-configured via `netlify.toml`
5. Click "Deploy site"

### Step 3: Configure Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:
- `VITE_API_URL` = `https://your-backend-server.com` (your Replit URL)

## 🔧 Architecture

This frontend connects to your existing backend server (running on Replit) via:
- REST API calls for data fetching
- WebSocket connections for real-time updates

## 📋 Environment Variables

- `VITE_API_URL`: Your backend server URL (e.g., `https://your-project.replit.dev`)

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

## 📦 What's Included

- ✅ Complete React dashboard
- ✅ Real-time WebSocket connections
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Netlify-optimized build configuration
- ✅ Environment variable support

## 🔗 Backend Connection

This frontend expects your backend to be running with:
- REST API endpoints (`/api/agents`, `/api/stats`, etc.)
- WebSocket server at `/ws`
- CORS configured to allow your Netlify domain

## 🚨 Important Notes

1. **Backend Required**: This frontend needs your backend server running
2. **CORS**: Ensure your backend allows requests from your Netlify domain
3. **WebSocket**: Uses secure WebSocket (wss://) for HTTPS deployments
4. **API URL**: Must be configured via environment variables

## 🎯 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Netlify site created and deployed
- [ ] Environment variables configured
- [ ] Backend server running and accessible
- [ ] CORS configured on backend
- [ ] WebSocket connections working
- [ ] Dashboard loading data successfully

## 🔧 Troubleshooting

### Build Errors
- Check Node.js version (requires v20)
- Verify all dependencies are installed
- Check TypeScript compilation errors

### Connection Issues
- Verify `VITE_API_URL` is correct
- Check backend server is running
- Verify CORS configuration
- Test WebSocket connectivity

### Data Not Loading
- Check browser console for errors
- Verify API endpoints are accessible
- Check network requests in browser dev tools