const { log } = require('apify');

/**
 * Build a search URL from input parameters
 */
function buildSearchUrl(params) {
    const {
        searchCategory = 'Car',
        models = [],
        priceMin,
        priceMax,
        mileageKmMin,
        mileageKmMax,
        powerKwMin,
        powerKwMax,
        registrationDateYearMin,
        registrationDateYearMax,
        sort = 'relevance',
        searchTerms = [],
    } = params;

    const baseUrl = 'https://suchen.mobile.de/fahrzeuge/search.html';
    const urlParams = new URLSearchParams();

    urlParams.set('isSearchRequest', 'true');
    urlParams.set('s', searchCategory);
    urlParams.set('vc', searchCategory);
    urlParams.set('dam', 'false');

    // Add models
    if (models.length > 0) {
        const modelString = models.join(',');
        urlParams.set('ms', modelString);
    }

    // Add price range
    if (priceMin) urlParams.set('ambit', priceMin);
    if (priceMax) urlParams.set('prit', priceMax);

    // Add mileage range
    if (mileageKmMin) urlParams.set('mlx', mileageKmMin);
    if (mileageKmMax) urlParams.set('mlx', mileageKmMax);

    // Add power range
    if (powerKwMin) urlParams.set('pwt', powerKwMin);
    if (powerKwMax) urlParams.set('pwt', powerKwMax);

    // Add registration year range
    if (registrationDateYearMin) urlParams.set('frn', registrationDateYearMin);
    if (registrationDateYearMax) urlParams.set('frx', registrationDateYearMax);

    // Add sort
    const sortMap = {
        'relevance': 'rel',
        'dateCreated-desc': 'creationTime',
        'dateCreated-asc': 'creationTime:asc',
        'price-asc': 'price',
        'price-desc': 'price:desc',
        'mileage-asc': 'mileage',
        'mileage-desc': 'mileage:desc',
    };
    urlParams.set('sb', sortMap[sort] || 'rel');

    // Add search terms
    if (searchTerms.length > 0) {
        urlParams.set('q', searchTerms.join(' '));
    }

    return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Parse a search/listing page to extract vehicle URLs
 */
async function parseListingPage(page) {
    try {
        // Wait for listings to load
        await page.waitForSelector('[data-testid="result-list-item"]', { timeout: 10000 }).catch(() => {});

        const listings = await page.$$eval('[data-testid="result-list-item"]', (items) => {
            return items.map(item => {
                const linkElement = item.querySelector('a[data-testid="classified-link"]');
                const url = linkElement ? linkElement.href : null;
                return { url };
            }).filter(item => item.url);
        });

        return listings;
    } catch (error) {
        log.error(`Error parsing listing page: ${error.message}`);
        return [];
    }
}

/**
 * Parse a detail page to extract vehicle data
 */
async function parseDetailPage(page, reviewLimit = 10) {
    try {
        // Wait for key elements
        await page.waitForSelector('h1', { timeout: 10000 });

        const data = await page.evaluate((revLimit) => {
            // Helper function to safely get text content
            const getText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.trim() : null;
            };

            const getTexts = (selector) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements).map(el => el.textContent.trim());
            };

            const getAttribute = (selector, attr) => {
                const element = document.querySelector(selector);
                return element ? element.getAttribute(attr) : null;
            };

            // Extract basic info
            const title = getText('h1') || getText('[data-testid="classified-heading"]');
            const price = getText('[data-testid="prime-price"]');
            const description = getText('[data-testid="description"]');

            // Extract images
            const images = Array.from(document.querySelectorAll('[data-testid="image-gallery"] img, .gallery-picture img'))
                .map(img => img.src || img.getAttribute('data-src'))
                .filter(src => src && src.startsWith('http'));

            // Extract attributes
            const attributes = {};
            document.querySelectorAll('[data-testid="feature-list"] dt, .technical-data dt').forEach((dt) => {
                const key = dt.textContent.trim();
                const dd = dt.nextElementSibling;
                if (dd && dd.tagName === 'DD') {
                    attributes[key] = dd.textContent.trim();
                }
            });

            // Extract features
            const features = getTexts('[data-testid="features-list"] li, .equipment-list li');

            // Extract dealer info
            const dealerName = getText('[data-testid="dealer-name"], .seller-name');
            const dealerPhone = getText('[data-testid="dealer-phone"], .phone-number');
            const dealerAddress = getText('[data-testid="dealer-address"], .seller-address');

            // Extract URL
            const url = window.location.href;

            // Extract ID from URL
            const idMatch = url.match(/id=(\d+)/);
            const id = idMatch ? parseInt(idMatch[1]) : null;

            return {
                title,
                url,
                id,
                price: price ? {
                    localized: price,
                    amount: parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) || null,
                    currency: 'EUR'
                } : null,
                description,
                images: [...new Set(images)], // Remove duplicates
                attributes,
                features,
                dealerDetails: {
                    name: dealerName,
                    phone: dealerPhone,
                    address: dealerAddress,
                }
            };
        }, reviewLimit);

        // Extract additional structured data
        const brand = data.attributes['Marke'] || data.attributes['Brand'] || extractFromTitle(data.title, 0);
        const model = data.attributes['Modell'] || data.attributes['Model'] || extractFromTitle(data.title, 1);
        const category = data.attributes['Fahrzeugtyp'] || data.attributes['Category'];
        const mileage = data.attributes['Kilometerstand'] || data.attributes['Mileage'];
        const registrationDate = data.attributes['Erstzulassung'] || data.attributes['First Registration'];

        return {
            ...data,
            brand,
            model,
            category,
            segment: 'Car',
            mileage,
            registrationDate,
            createdDate: new Date().toISOString(),
        };

    } catch (error) {
        log.error(`Error parsing detail page: ${error.message}`);
        return null;
    }
}

/**
 * Helper to extract brand/model from title
 */
function extractFromTitle(title, index) {
    if (!title) return null;
    const parts = title.split(' ');
    return parts[index] || null;
}

/**
 * Parse price string to number
 */
function parsePrice(priceString) {
    if (!priceString) return null;
    const cleaned = priceString.replace(/[^\d,]/g, '').replace(',', '.');
    const amount = parseFloat(cleaned);
    return isNaN(amount) ? null : amount;
}

module.exports = {
    buildSearchUrl,
    parseListingPage,
    parseDetailPage,
};
