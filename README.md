# 🔍 Mobile.de Scraper

Mobile.de Scraper is a powerful tool for extracting vehicle listings from Germany's most popular car marketplace, Mobile.de. This platform is used across Europe, featuring listings from Germany and many other EU countries.

## 🔍 What does Mobile.de Scraper do?

This scraper offers a simple, intuitive API for choosing exact search criteria. You can export data in various formats including JSON, CSV, Excel, and others supported by the Apify platform.

## 📋 Why scrape Mobile.de?

Mobile.de is Europe's largest online vehicle marketplace, offering an extensive database of new and used cars, motorcycles, and commercial vehicles. Scraping this platform provides valuable data for:

- **Market Analysis**: Monitor market trends and pricing strategies
- **Inventory Optimization**: Identify high-demand vehicles
- **Competitive Intelligence**: Compare competitor pricing
- **Financial Analysis**: Track vehicle depreciation rates
- **Research**: Support academic or business research projects

## 🚀 Features

- ✅ Search for vehicles using URL search queries
- ✅ Configure searches directly on mobile.de and use the URL here
- ✅ Limit the number of results to your needs
- ✅ Details URL scraping - get results for specific listings
- ✅ Fast scraping (~4 results per second)
- ✅ Cost-effective (~$0.3 per 1000 results)
- ✅ Export data in CSV, JSON, or Excel formats
- ✅ Comprehensive data extraction

## 📊 What is being extracted?

- 📰 Offer title
- 📝 Description
- 💰 Price
- 🏷️ Category
- 🏭 Brand
- 🚙 Model
- 🖼️ Images
- 🔗 Offer URL
- 📞 Contact information
- 📅 Dates
- 🔖 Attributes
- ⭐ Features
- 🏪 Dealer Information
- 📝 Dealer Reviews (optional)

## ❓ How to use

### Method 1: Using Mobile.de Search URL (Recommended)

This is the preferred way of using the scraper:

1. **Go to Mobile.de** - Visit [mobile.de](https://www.mobile.de) and set up your search
2. **Click Search** - Click the search button with your selected options
3. **Copy the URL** - Copy the search result page's URL from the address bar
4. **Paste into Input** - Paste it in the "🔎 Search/Details page URL(s)" field
5. **Start** - Press "Save & Start" and enjoy the results! 🎉

Example URL:
```
https://suchen.mobile.de/fahrzeuge/search.html?dam=false&isSearchRequest=true&ms=3500%3B%3B%3B&s=Car&vc=Car
```

### Method 2: Using Direct Listing URL

To scrape a specific vehicle listing:

1. Navigate to the listing's detail page
2. Copy the URL (e.g., `https://suchen.mobile.de/fahrzeuge/details.html?id=420206823`)
3. Put it into the "🔎 Search/Details page URL(s)" field
4. Press Start!

### Method 3: Using Simple Interface

For simple use cases, use the built-in interface parameters:

- Set vehicle category (Car, Motorcycle, etc.)
- Add brand and models (e.g., "BMW|320")
- Set mileage range, power range, price range
- Configure registration year range
- Add search terms for filtering

## 📑 Example Input JSON

```json
{
    "maxItems": 20,
    "mileageKmMin": 1000,
    "mileageKmMax": 85000,
    "models": [
        "BMW|330",
        "BMW|320"
    ],
    "powerKwMin": 50,
    "powerKwMax": 150,
    "registrationDateYearMin": 2010,
    "registrationDateYearMax": 2020,
    "reviewLimit": 10,
    "searchCategory": "Car",
    "sort": "dateCreated_desc"
}
```

## 🖼️ Example Output

```json
{
    "title": "Audi A5 Sportback 2.0 TFSI*S-LINE*XENON*SH*LED*NAVI*",
    "previewImage": "https://img.classistatic.de/api/v1/mo-prod/images/55/5580f874-ed5a-485f-80d1-ea7182e130fd?rule=mo-1600.jpg",
    "segment": "Car",
    "category": "Limousine",
    "brand": "Audi",
    "model": "A5",
    "url": "https://suchen.mobile.de/fahrzeuge/details.html?id=413683625",
    "price": {
        "total": {
            "amount": 19990,
            "currency": "EUR",
            "localized": "€19,990"
        },
        "type": "FIXED"
    },
    "description": "Fahrzeugbeschreibung...",
    "attributes": {
        "Vehicle condition": "Used vehicle, Accident-free",
        "Category": "Saloon",
        "Mileage": "89,106 km",
        "Power": "169 kW (230 hp)",
        "Fuel": "Petrol",
        "First Registration": "08/2016"
    },
    "features": [
        "ABS",
        "Alloy wheels",
        "Bluetooth",
        "Navigation system",
        "Xenon headlights"
    ],
    "images": [
        "https://img.classistatic.de/api/v1/mo-prod/images/55/5580f874-ed5a-485f-80d1-ea7182e130fd?rule=mo-1600.jpg"
    ],
    "dealerDetails": {
        "name": "Autohaus West Rheinland",
        "phones": ["+49 (0)2152 994200817"],
        "address": "Mülhauser Straße 111, DE-47906 Kempen"
    }
}
```

## ❌ Limitations

Currently, the scraper can only scrape the first 2000 results per search query. To bypass this limitation:

1. Split your search into multiple sub-searches
2. Use more specific search terms
3. Use exclusive filters (e.g., specific models, year ranges)

### Example

Instead of searching "All BMWs" (130,000+ results), split it into:
- "BMW e36"
- "BMW e46"
- "BMW e90"
- etc.

This allows you to scrape more than the 2000-result limit.

## 🔗 Integration

Mobile.de Scraper supports integrations with:
- Make (formerly Integromat)
- Zapier
- Slack
- Google Sheets
- Google Drive
- Airbyte
- GitHub
- Custom webhooks

## 💡 Tips

1. **Use Residential Proxies**: For best results, use Apify's residential proxies
2. **Respect Rate Limits**: Don't set maxItems too high in one run
3. **Test First**: Start with a small `maxItems` value to test your search
4. **Save Searches**: Save successful search URLs for repeated scraping

## 📞 Support

For issues, questions, or feature requests, please contact the developer or create an issue in the GitHub repository.

## 📄 License

Apache-2.0

---

**Note**: This scraper is for educational and research purposes. Always respect Mobile.de's Terms of Service and robots.txt. Use responsibly and ethically.
