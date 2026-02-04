# 🚀 Deployment Guide

Complete guide for deploying the Mobile.de Scraper to Apify.

## 📋 Prerequisites

1. **Apify Account**
   - Sign up at [apify.com](https://apify.com)
   - Free tier includes $5 credit per month

2. **Apify CLI** (recommended)
   ```bash
   npm install -g apify-cli
   ```

3. **Git** (optional, for version control)

## 🔐 Authentication

### Step 1: Get your API Token

1. Log in to [Apify Console](https://console.apify.com)
2. Go to Settings → Integrations
3. Copy your API Token

### Step 2: Login via CLI

```bash
apify login
```

Paste your API token when prompted.

## 📦 Deployment Methods

### Method 1: Apify CLI (Recommended)

**Quick Deploy:**
```bash
cd "/Users/mitch/scraper mobile"
apify push
```

**First-time setup:**
```bash
# Initialize (if not already done)
apify init

# Set actor name
apify set-name mobile-de-scraper

# Push to Apify
apify push
```

**Build and push with custom tag:**
```bash
apify push --tag production
```

### Method 2: Apify Console (Web UI)

1. **Zip the project:**
   ```bash
   cd "/Users/mitch/scraper mobile"
   zip -r mobile-de-scraper.zip . -x "node_modules/*" "apify_storage/*" ".git/*"
   ```

2. **Upload to Apify:**
   - Go to [Apify Console](https://console.apify.com)
   - Click "Actors" → "Create new"
   - Choose "From scratch"
   - Upload the ZIP file
   - Click "Build"

### Method 3: GitHub Integration

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mobile.de Scraper"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mobile-de-scraper.git
   git push -u origin main
   ```

2. **Connect to Apify:**
   - In Apify Console → "Create new actor"
   - Choose "From Git repository"
   - Enter your GitHub repo URL
   - Set branch to `main`
   - Click "Create"

## ⚙️ Configuration

### Actor Settings

After deployment, configure in Apify Console:

1. **Memory**: 2048 MB (recommended)
2. **Timeout**: 3600 seconds (1 hour)
3. **Build tag**: latest

### Environment Variables

Set in Apify Console → Your Actor → Settings → Environment:

```
LOG_LEVEL=INFO
```

### Pricing Settings

For rental model:
1. Go to Actor → Settings → Pricing
2. Set pricing model to "Rental"
3. Set monthly price (e.g., $20/month)

For pay-per-result:
1. Set pricing model to "Pay per result"
2. Set price per 1000 results (e.g., $0.30)

## 🧪 Testing on Apify

### Test Run

1. Go to your actor in Apify Console
2. Click "Try it"
3. Use one of the example inputs:

**Simple test:**
```json
{
  "startUrls": [
    {"url": "https://suchen.mobile.de/fahrzeuge/search.html?s=Car&vc=Car"}
  ],
  "maxItems": 5
}
```

4. Click "Start"
5. Monitor the run and check results

### Check Results

- View results in "Dataset" tab
- Download as JSON, CSV, or Excel
- Check logs for errors

## 📊 Monitoring

### Metrics to Watch

1. **Success Rate**: Should be > 95%
2. **Speed**: ~4 listings/second
3. **Cost**: ~$0.30 per 1000 results
4. **Memory**: Should stay under 1GB

### Alerts

Set up in Apify Console → Actor → Monitoring:
- Failed runs > 10%
- Runtime > 30 minutes
- Memory usage > 80%

## 🔄 Updates

### Update existing actor:

```bash
# Make changes to code
git add .
git commit -m "Update: improved selectors"

# Push to Apify
apify push
```

### Version Management:

```bash
# Create new version
apify push --version-number 1.0.1 --tag beta

# Promote to production
apify push --tag latest
```

## 💰 Pricing Strategy

### Recommended Pricing

**Rental Model:**
- Small: $19/month (up to 10,000 results/month)
- Medium: $49/month (up to 50,000 results/month)
- Large: $99/month (up to 200,000 results/month)

**Pay-per-Result:**
- $0.30 per 1,000 results
- Minimum charge: $0.10 per run

### Cost Breakdown

- Compute: ~$0.20 per 1,000 results
- Proxies: ~$0.10 per 1,000 results
- Profit: ~$0.30 per 1,000 results

## 🛡️ Best Practices

1. **Use Residential Proxies**
   - Mobile.de blocks datacenter IPs
   - Enable in proxy configuration

2. **Rate Limiting**
   - Don't scrape > 10 requests/second
   - Add delays if needed

3. **Error Handling**
   - Actor should never crash
   - Log errors clearly
   - Retry failed requests

4. **Data Quality**
   - Validate output structure
   - Check for missing fields
   - Handle edge cases

## 📈 Scaling

### Increase Performance:

1. **More Memory**: Increase to 4096 MB
2. **Parallel Requests**: Increase `maxConcurrency`
3. **Multiple Actors**: Run multiple instances

Example configuration for high-volume:
```json
{
  "maxConcurrency": 10,
  "maxRequestsPerCrawl": 10000
}
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Check Dockerfile
apify build

# View build logs
apify log
```

### Actor Crashes

1. Check memory usage
2. Review logs in Apify Console
3. Test locally first
4. Increase timeout

### No Results

1. Verify Mobile.de is accessible
2. Check if HTML structure changed
3. Enable proxies
4. Test with single URL

## 📞 Support

### Apify Support

- Docs: [docs.apify.com](https://docs.apify.com)
- Discord: [Apify Community](https://discord.gg/apify)
- Email: support@apify.com

### Mobile.de Scraper Issues

- GitHub Issues (if repo public)
- Check logs for error details
- Test locally first

## ✅ Deployment Checklist

- [ ] Code tested locally
- [ ] All dependencies in package.json
- [ ] INPUT_SCHEMA.json valid
- [ ] README.md complete
- [ ] .actor/actor.json configured
- [ ] Dockerfile working
- [ ] API token configured
- [ ] Actor pushed to Apify
- [ ] Test run successful
- [ ] Results validated
- [ ] Monitoring set up
- [ ] Pricing configured

## 🎉 Go Live!

Once all checks pass:

1. Set actor visibility to "Public" or "Private"
2. Add description and README
3. Set pricing
4. Publish to Apify Store (optional)
5. Share with users!

## 📚 Next Steps

- Monitor first runs
- Collect user feedback
- Iterate on features
- Update documentation
- Add more test cases
- Optimize performance
