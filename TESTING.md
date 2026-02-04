# 🧪 Testing Guide

This guide explains how to test the Mobile.de Scraper locally before deploying to Apify.

## 📋 Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager

## 🚀 Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```bash
cp .env.example .env
```

## 🧪 Running Tests Locally

### Method 1: Using npm scripts

Test with simple search (5 results):
```bash
npm run test:simple
```

Test BMW search with filters (10 results):
```bash
npm run test:bmw
```

Test single vehicle details:
```bash
npm run test:single
```

### Method 2: Using Apify CLI

Install Apify CLI:
```bash
npm install -g apify-cli
```

Run with custom input:
```bash
apify run -p
```

Run with specific input file:
```bash
apify run --input-file ./test-inputs/bmw-search.json
```

### Method 3: Direct Node execution

```bash
node src/main.js
```

## 📁 Test Input Files

Three test scenarios are provided in `test-inputs/`:

### 1. **simple-search.json** - Basic search
- Scrapes 5 random car listings
- Good for quick functionality test
- No proxy required for testing

### 2. **bmw-search.json** - Filtered search
- BMW 320/330 models
- Price range: 15,000 - 35,000 EUR
- Mileage: 10,000 - 100,000 km
- Year: 2015 - 2023
- 10 results with dealer reviews

### 3. **single-vehicle.json** - Single listing
- Scrapes one specific vehicle
- Good for testing detail extraction
- Includes up to 10 dealer reviews

## 📊 Output Location

Results are saved to:
```
./apify_storage/datasets/default/
```

Each result is saved as a separate JSON file.

## 🔍 What to Check

After running tests, verify:

1. **Data completeness**:
   - Title extracted
   - Price parsed correctly
   - Images downloaded (high-res URLs)
   - Attributes populated
   - Features list complete

2. **Dealer details**:
   - Name and contact info
   - Address
   - Reviews (if reviewLimit > 0)

3. **Error handling**:
   - No crashes on missing data
   - Graceful fallbacks
   - Meaningful error messages

## 🐛 Debugging

Enable debug logging:
```bash
LOG_LEVEL=DEBUG npm run test:simple
```

Check the logs in:
```
./apify_storage/logs/
```

## 🌐 Testing with Proxies

For production-like testing, enable proxies in the input file:

```json
{
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

**Note**: This requires an Apify account and valid API token in `.env`

## 📈 Performance Testing

Test scraping speed:
```bash
time npm run test:bmw
```

Expected performance:
- ~4 listings per second
- ~5-10 seconds for 10 results (including detail pages)
- ~1-2 seconds per detail page

## ✅ Checklist Before Deployment

- [ ] All test scenarios pass
- [ ] No errors in logs
- [ ] Data structure matches expected output
- [ ] Images load correctly
- [ ] Dealer details extracted
- [ ] Price parsing works
- [ ] Features/attributes complete
- [ ] Handles missing data gracefully

## 🚀 Deploy to Apify

Once all tests pass:

```bash
apify login
apify push
```

## 💡 Tips

1. Start with `test:single` to verify detail extraction
2. Use `test:simple` for quick iteration
3. Test `test:bmw` before production deployment
4. Always check the output JSON structure
5. Monitor logs for warnings

## 🆘 Common Issues

**Issue**: "No results found"
- Check if Mobile.de changed their HTML structure
- Verify the search URL is valid
- Try with proxy enabled

**Issue**: "Price not extracted"
- Check price selectors in extractVehicleDetails()
- Verify price format (EUR/German format)

**Issue**: "Images missing"
- Images might be lazy-loaded
- Check image URL patterns
- Verify srcset parsing

## 📞 Support

For issues or questions:
1. Check logs in `./apify_storage/logs/`
2. Verify input JSON is valid
3. Test with simpler input first
4. Check Mobile.de is accessible
