import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

/**
 * Mobile.de Scraper
 * Extracts vehicle listings from Mobile.de
 */
await Actor.init();

try {
    const input = await Actor.getInput();

    // Validate and prepare input
    const {
        startUrls = [],
        maxItems = 0,
        searchCategory = 'Car',
        searchTerms = [],
        models = [],
        mileageKmMin,
        mileageKmMax,
        powerKwMin,
        powerKwMax,
        priceMin,
        priceMax,
        registrationDateYearMin,
        registrationDateYearMax,
        sort = 'relevance',
        reviewLimit = 5,
        proxyConfiguration = { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] }
    } = input || {};

    log.info('Starting Mobile.de Scraper', {
        startUrlsCount: startUrls.length,
        maxItems,
        searchCategory
    });

    // Build search URL if no startUrls provided
    let requestList = [];

    if (startUrls && startUrls.length > 0) {
        requestList = startUrls.map(item => {
            const url = typeof item === 'string' ? item : item.url;
            return { url, userData: { label: url.includes('/details.html') ? 'DETAIL' : 'SEARCH' } };
        });
    } else {
        // Build search URL from parameters
        const searchUrl = buildSearchUrl({
            searchCategory,
            searchTerms,
            models,
            mileageKmMin,
            mileageKmMax,
            powerKwMin,
            powerKwMax,
            priceMin,
            priceMax,
            registrationDateYearMin,
            registrationDateYearMax,
            sort
        });

        if (searchUrl) {
            requestList = [{ url: searchUrl, userData: { label: 'SEARCH' } }];
        }
    }

    if (requestList.length === 0) {
        log.warning('No URLs to scrape. Please provide startUrls or search parameters.');
        await Actor.exit();
    }

    let itemsScraped = 0;
    const proxyConfig = await Actor.createProxyConfiguration(proxyConfiguration);

    // Create crawler
    const crawler = new CheerioCrawler({
        proxyConfiguration: proxyConfig,
        maxRequestsPerCrawl: maxItems > 0 ? maxItems + 100 : undefined,
        requestHandler: async ({ request, $, enqueueLinks }) => {
            const { url, userData } = request;

            log.info(`Processing ${userData.label}: ${url}`);

            if (userData.label === 'SEARCH') {
                // Extract listing URLs from search page
                const listingLinks = [];

                $('a[data-testid="listing-link"], a.vehicle-link, div.vehicle-data a[href*="/details.html"]').each((i, el) => {
                    const href = $(el).attr('href');
                    if (href && href.includes('/details.html')) {
                        const fullUrl = href.startsWith('http') ? href : `https://suchen.mobile.de${href}`;
                        listingLinks.push(fullUrl);
                    }
                });

                log.info(`Found ${listingLinks.length} listings on search page`);

                // Enqueue detail pages
                for (const link of listingLinks) {
                    if (maxItems > 0 && itemsScraped >= maxItems) {
                        break;
                    }
                    await enqueueLinks({
                        urls: [link],
                        userData: { label: 'DETAIL' }
                    });
                }

                // Handle pagination
                const nextPageLink = $('a.pagination-next, a[data-testid="pagination-next"]').attr('href');
                if (nextPageLink && (!maxItems || itemsScraped < maxItems)) {
                    const nextUrl = nextPageLink.startsWith('http') ? nextPageLink : `https://suchen.mobile.de${nextPageLink}`;
                    await enqueueLinks({
                        urls: [nextUrl],
                        userData: { label: 'SEARCH' }
                    });
                }

            } else if (userData.label === 'DETAIL') {
                // Stop if max items reached
                if (maxItems > 0 && itemsScraped >= maxItems) {
                    return;
                }

                // Extract vehicle details
                const vehicleData = await extractVehicleDetails($, url, reviewLimit);

                if (vehicleData) {
                    await Actor.pushData(vehicleData);
                    itemsScraped++;
                    log.info(`Scraped vehicle: ${vehicleData.title} (${itemsScraped}/${maxItems || '∞'})`);
                }
            }
        },
        failedRequestHandler: async ({ request }) => {
            log.error(`Request failed: ${request.url}`);
        }
    });

    await crawler.run(requestList);

    log.info(`Scraping completed. Total items scraped: ${itemsScraped}`);

} catch (error) {
    log.error('Scraper failed with error:', error);
    throw error;
}

await Actor.exit();

/**
 * Build search URL from parameters
 */
function buildSearchUrl(params) {
    const {
        searchCategory = 'Car',
        searchTerms = [],
        models = [],
        mileageKmMin,
        mileageKmMax,
        powerKwMin,
        powerKwMax,
        priceMin,
        priceMax,
        registrationDateYearMin,
        registrationDateYearMax,
        sort
    } = params;

    const urlParams = new URLSearchParams();
    urlParams.append('s', searchCategory);
    urlParams.append('vc', searchCategory);
    urlParams.append('isSearchRequest', 'true');

    if (models.length > 0) {
        urlParams.append('ms', models.join(';'));
    }

    if (searchTerms.length > 0) {
        urlParams.append('q', searchTerms.join(' '));
    }

    if (mileageKmMin) urlParams.append('ml', mileageKmMin);
    if (mileageKmMax) urlParams.append('mh', mileageKmMax);
    if (powerKwMin) urlParams.append('pwl', powerKwMin);
    if (powerKwMax) urlParams.append('pwh', powerKwMax);
    if (priceMin) urlParams.append('prl', priceMin);
    if (priceMax) urlParams.append('prh', priceMax);
    if (registrationDateYearMin) urlParams.append('frl', registrationDateYearMin);
    if (registrationDateYearMax) urlParams.append('frh', registrationDateYearMax);

    const sortMap = {
        'dateCreated_desc': 'dateCreated desc',
        'dateCreated_asc': 'dateCreated asc',
        'price_asc': 'price asc',
        'price_desc': 'price desc',
        'mileage_asc': 'mileage asc',
        'mileage_desc': 'mileage desc'
    };

    if (sort && sortMap[sort]) {
        urlParams.append('sb', sortMap[sort]);
    }

    return `https://suchen.mobile.de/fahrzeuge/search.html?${urlParams.toString()}`;
}

/**
 * Extract vehicle details from detail page
 */
async function extractVehicleDetails($, url, reviewLimit) {
    try {
        // Extract basic information with multiple fallback selectors
        const title = extractText($, [
            'h1[data-testid="ad-title"]',
            'h1.title',
            'h1.listing-title',
            '.vehicle-title h1'
        ]);

        const previewImage = extractAttribute($, [
            'img[data-testid="main-image"]',
            'img.main-image',
            '.image-gallery img:first',
            'picture img:first'
        ], 'src') || '';

        // Extract price with better parsing
        const priceText = extractText($, [
            'span[data-testid="price"]',
            'span.price-value',
            '.price-block .price',
            'div.price-label'
        ]);

        const priceAmount = parsePrice(priceText);
        const price = priceAmount ? {
            total: {
                amount: priceAmount,
                currency: 'EUR',
                localized: priceText
            },
            type: 'FIXED'
        } : null;

        // Extract dates
        const createdDate = extractDate($, ['span[data-testid="created-date"]', '.created-date']);
        const modifiedDate = extractDate($, ['span[data-testid="modified-date"]', '.modified-date']);

        // Extract attributes with improved selectors
        const attributes = {};

        // Method 1: Data attribute table
        $('div[data-testid="feature-label"], .vehicle-data-item, .ad-details-item, dl.feature-list dt').each((i, el) => {
            const $el = $(el);
            let key, value;

            if ($el.is('dt')) {
                key = $el.text().trim();
                value = $el.next('dd').text().trim();
            } else {
                key = $el.text().trim();
                value = $el.next().text().trim() || $el.siblings('[data-testid="feature-value"]').text().trim();
            }

            if (key && value) {
                attributes[key] = value;
            }
        });

        // Method 2: Key-value pairs
        $('.key-value-pair, .attribute-item').each((i, el) => {
            const $el = $(el);
            const key = $el.find('.key, .label, .attribute-label').text().trim();
            const value = $el.find('.value, .attribute-value').text().trim();
            if (key && value) {
                attributes[key] = value;
            }
        });

        // Extract features/equipment
        const features = [];
        $('li[data-testid="equipment-item"], .features-list li, .equipment-list li, .feature-item').each((i, el) => {
            const feature = $(el).text().trim();
            if (feature && !features.includes(feature)) {
                features.push(feature);
            }
        });

        // Extract ALL images with better quality
        const images = [];
        const imageSelectors = [
            'img[data-testid="gallery-image"]',
            'img.gallery-image',
            '.image-gallery img',
            'picture source',
            'img[src*="classistatic"]'
        ];

        imageSelectors.forEach(selector => {
            $(selector).each((i, el) => {
                const $el = $(el);
                let src = $el.attr('src') || $el.attr('data-src') || $el.attr('srcset');

                // Parse srcset for highest quality
                if (src && src.includes(',')) {
                    const srcsetParts = src.split(',').map(s => s.trim());
                    src = srcsetParts[srcsetParts.length - 1].split(' ')[0];
                }

                // Convert to high-res version
                if (src && src.includes('classistatic')) {
                    src = src.replace(/rule=mo-\d+/, 'rule=mo-1600');
                }

                if (src && !images.includes(src)) {
                    images.push(src);
                }
            });
        });

        // Extract description
        const description = extractText($, [
            'div[data-testid="description"]',
            '.description-text',
            '.ad-description',
            '.vehicle-description'
        ]);

        // Extract price rating
        const priceRating = extractPriceRating($);

        // Extract comprehensive dealer details
        const dealerDetails = extractDealerDetails($, reviewLimit);

        // Extract ID from URL
        const idMatch = url.match(/id=(\d+)/);
        const vehicleId = idMatch ? parseInt(idMatch[1]) : null;

        // Extract rank/position
        const rank = parseInt($('[data-testid="listing-rank"]').text()) || null;

        // Build result object
        const result = {
            title: title || 'No title found',
            previewImage,
            url,
            price,
            createdDate,
            modifiedDate,
            description: description || null,
            attributes,
            features,
            images: images.length > 0 ? images : (previewImage ? [previewImage] : []),
            id: vehicleId,
            rank,
            segment: attributes['Category'] || attributes['Vehicle Type'] || null,
            category: attributes['Category'] || attributes['Body Type'] || null,
            brand: attributes['Brand'] || attributes['Make'] || extractBrandFromTitle(title),
            model: attributes['Model'] || null
        };

        // Add optional fields
        if (priceRating) {
            result.priceRating = priceRating;
        }

        if (dealerDetails) {
            result.dealerDetails = dealerDetails;
        }

        return result;

    } catch (error) {
        log.error(`Error extracting vehicle details from ${url}:`, error);
        return null;
    }
}

/**
 * Helper: Extract text from multiple selectors (fallback)
 */
function extractText($, selectors) {
    for (const selector of selectors) {
        const text = $(selector).first().text().trim();
        if (text) return text;
    }
    return '';
}

/**
 * Helper: Extract attribute from multiple selectors
 */
function extractAttribute($, selectors, attr) {
    for (const selector of selectors) {
        const value = $(selector).first().attr(attr);
        if (value) return value;
    }
    return null;
}

/**
 * Helper: Parse price from text
 */
function parsePrice(priceText) {
    if (!priceText) return null;

    // Remove currency symbols and extract number
    const cleaned = priceText.replace(/[€$£\s]/g, '');
    const match = cleaned.match(/[\d.,]+/);

    if (match) {
        // Handle European format (1.234,56) and US format (1,234.56)
        let number = match[0];

        // European format
        if (number.includes('.') && number.includes(',')) {
            number = number.replace(/\./g, '').replace(',', '.');
        }
        // Just comma (European decimal)
        else if (number.includes(',') && !number.includes('.')) {
            number = number.replace(',', '.');
        }
        // Just dots (remove thousand separators)
        else if (number.split('.').length > 2) {
            number = number.replace(/\./g, '');
        }

        return parseFloat(number);
    }

    return null;
}

/**
 * Helper: Extract date
 */
function extractDate($, selectors) {
    const dateText = extractText($, selectors);
    if (!dateText) return null;

    try {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
            return date.toISOString();
        }
    } catch (e) {
        // Ignore parse errors
    }

    return dateText || null;
}

/**
 * Extract price rating information
 */
function extractPriceRating($) {
    const ratingText = extractText($, [
        '[data-testid="price-rating"]',
        '.price-rating',
        '.price-evaluation'
    ]);

    if (!ratingText) return null;

    return {
        rating: ratingText,
        priceRanges: extractPriceRanges($)
    };
}

/**
 * Extract price ranges if available
 */
function extractPriceRanges($) {
    const ranges = {};

    $('.price-range-item, [data-testid="price-range"]').each((i, el) => {
        const $el = $(el);
        const label = $el.find('.range-label').text().trim();
        const min = parsePrice($el.find('.range-min').text());
        const max = parsePrice($el.find('.range-max').text());

        if (label && (min || max)) {
            ranges[label] = { start: min, end: max };
        }
    });

    return Object.keys(ranges).length > 0 ? ranges : null;
}

/**
 * Extract comprehensive dealer details
 */
function extractDealerDetails($, reviewLimit) {
    const dealerName = extractText($, [
        '[data-testid="seller-name"]',
        '.dealer-name',
        '.seller-name',
        '.dealer-info h3'
    ]);

    if (!dealerName) return null;

    const details = {
        name: dealerName,
        sellerType: extractText($, [
            '[data-testid="seller-type"]',
            '.seller-type'
        ]) || 'Unknown'
    };

    // Extract contact info
    const phones = [];
    $('[data-testid="phone-number"], .dealer-phone, .phone-number, a[href^="tel:"]').each((i, el) => {
        const phone = $(el).text().trim() || $(el).attr('href')?.replace('tel:', '');
        if (phone && !phones.includes(phone)) {
            phones.push(phone);
        }
    });
    if (phones.length > 0) details.phones = phones;

    // Extract address
    const address = extractText($, [
        '[data-testid="seller-address"]',
        '.dealer-address',
        '.seller-address',
        '.dealer-location'
    ]);
    if (address) details.address = address;

    // Extract email
    const email = extractAttribute($, ['a[href^="mailto:"]'], 'href')?.replace('mailto:', '');
    if (email) details.email = email;

    // Extract website
    const website = extractText($, [
        '[data-testid="dealer-website"]',
        '.dealer-website a'
    ]);
    if (website) details.homepageUrl = website;

    // Extract ratings
    const scoreText = extractText($, [
        '[data-testid="dealer-rating"]',
        '.dealer-rating',
        '.seller-rating-value'
    ]);
    const scoreMatch = scoreText.match(/[\d.]+/);
    if (scoreMatch) {
        details.score = {
            total: parseFloat(scoreMatch[0])
        };
    }

    // Extract review count
    const reviewCountText = extractText($, [
        '[data-testid="review-count"]',
        '.review-count',
        '.dealer-reviews-count'
    ]);
    const reviewMatch = reviewCountText.match(/\d+/);
    if (reviewMatch) {
        details.activeRatingCount = parseInt(reviewMatch[0]);
    }

    // Extract reviews if limit > 0
    if (reviewLimit > 0) {
        const reviews = extractReviews($, reviewLimit);
        if (reviews.length > 0) {
            details.reviews = reviews;
        }
    }

    return details;
}

/**
 * Extract dealer reviews
 */
function extractReviews($, limit) {
    const reviews = [];

    $('.review-item, [data-testid="review"]').slice(0, limit).each((i, el) => {
        const $review = $(el);

        const review = {
            reviewerName: $review.find('.reviewer-name, [data-testid="reviewer-name"]').text().trim() || null,
            totalScore: parseFloat($review.find('.review-score, [data-testid="review-score"]').text()) || null,
            reviewDate: $review.find('.review-date, [data-testid="review-date"]').text().trim() || null,
            details: {
                likedText: $review.find('.review-positive, [data-testid="review-positive"]').text().trim() || null,
                dislikedText: $review.find('.review-negative, [data-testid="review-negative"]').text().trim() || null
            }
        };

        if (review.reviewerName || review.totalScore) {
            reviews.push(review);
        }
    });

    return reviews;
}

/**
 * Extract brand from title as fallback
 */
function extractBrandFromTitle(title) {
    const brands = ['Audi', 'BMW', 'Mercedes', 'Mercedes-Benz', 'VW', 'Volkswagen', 'Porsche',
                    'Opel', 'Ford', 'Renault', 'Peugeot', 'Citroën', 'Fiat', 'Toyota',
                    'Honda', 'Nissan', 'Mazda', 'Hyundai', 'Kia', 'Skoda', 'Seat'];

    for (const brand of brands) {
        if (title.toLowerCase().includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return null;
}
