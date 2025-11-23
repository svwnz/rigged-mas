# 🎄 Merry Rigged-mas Deployment Guide

## 🚀 Cloudflare Pages Deployment

### Prerequisites
- Cloudflare account
- GitHub repository
- Node.js 18+ locally for development

### 1. Database Setup (Cloudflare D1)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create christmas-lights-db

# Note the database ID and update wrangler.toml
```

Update `wrangler.toml` with your actual database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "christmas-lights-db"
database_id = "YOUR_ACTUAL_DATABASE_ID"
```

### 2. Initialize Database Schema

```bash
# Apply schema to your D1 database
wrangler d1 execute christmas-lights-db --file=./schema.sql

# Or apply to local development database
wrangler d1 execute christmas-lights-db --local --file=./schema.sql
```

### 3. Environment Variables

#### Local Development
1. Copy `.env.example` to `.env.local`
2. Update any local configuration as needed

#### Production (Cloudflare Dashboard)
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to Settings → Environment variables
4. Add:
   - `NODE_ENV`: `production`

### 4. Deploy to Cloudflare Pages

#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub
2. Connect repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set build output directory: `dist`
5. Deploy!

#### Option B: Direct Deploy with Wrangler
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages publish dist --project-name=merry-rigged-mas
```

### 5. Custom Domain (Optional)
1. In Cloudflare Pages dashboard
2. Go to Custom domains
3. Add your domain
4. Follow DNS setup instructions

## 🔒 Security Checklist

- ✅ Input validation on all API endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (CSP headers)
- ✅ Rate limiting considerations
- ✅ Sensitive data in environment variables
- ✅ Error handling without data leakage
- ✅ HTTPS enforced
- ✅ Security headers configured

## 📱 Performance & Accessibility

- ✅ Mobile-responsive design
- ✅ Touch-friendly interactions
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Reduced motion preferences
- ✅ Focus management
- ✅ Semantic HTML structure

## 🧪 Testing Before Production

### Local Testing
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test with local D1 database
wrangler d1 execute christmas-lights-db --local --file=./schema.sql
```

### Production Testing
1. Test all voting flows
2. Verify message posting
3. Check mobile responsiveness
4. Test accessibility features
5. Verify error handling

## 🔧 Troubleshooting

### Database Issues
```bash
# Check database status
wrangler d1 info christmas-lights-db

# View database contents
wrangler d1 execute christmas-lights-db --command="SELECT * FROM houses;"
```

### Environment Variables
- Ensure API keys are set in both local `.env.local` and Cloudflare dashboard
- Check variable names match exactly

### Build Issues
- Verify Node.js version (18+)
- Clear node_modules and reinstall if needed
- Check for TypeScript errors

## 📊 Monitoring

### Cloudflare Analytics
- Enable Web Analytics in Cloudflare dashboard
- Monitor page views, performance metrics

### Error Monitoring
- Check Cloudflare Pages Functions logs
- Monitor D1 database performance

## 🎯 Post-Deployment

1. Test all functionality on live site
2. Share with your neighborhood!
3. Monitor for any issues
4. Enjoy the holiday chaos! 🎅

---

## 🚨 Important Security Notes

- Never commit API keys to git
- Regularly rotate API keys
- Monitor for unusual voting patterns
- Keep dependencies updated
- Review Cloudflare security logs

## 📞 Support

If you encounter issues:
1. Check Cloudflare Pages dashboard logs
2. Review browser console for frontend errors
3. Verify D1 database connectivity
4. Check environment variable configuration

Happy Holidays! 🎄✨