const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { getManufacturerContacts } = require('./serpapi');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeInstacart(searchTerm) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    // Simulate navigating to Instacart
    // await page.goto(`https://www.instacart.com/store/s?k=${encodeURIComponent(searchTerm)}`);
    await delay(1000); 

    // MOCK INSTACART DATA
    // In a production environment, you would use page.evaluate() to extract links, 
    // navigate to them, and extract the real HTML. For this reliable demo, we mock the parsed results.
    const mockProducts = [
      {
        name: `Premium ${searchTerm.replace('+', ' ').toUpperCase()}`,
        manufacturerName: `${searchTerm.split('+')[0].toUpperCase()} Foods Inc.`,
        url: `https://www.instacart.com/products/mock-${searchTerm}`,
        store: "Instacart Local",
        ingredients: ["Water", "Salt", "Organic " + searchTerm.split('+')[0], "Spices"]
      },
      {
        name: `Budget ${searchTerm.replace('+', ' ').toUpperCase()}`,
        manufacturerName: `Global ${searchTerm.split('+')[0]} Supply`,
        url: `https://www.instacart.com/products/mock-budget-${searchTerm}`,
        store: "Instacart Bulk",
        ingredients: ["Artificial Flavors", "Preservatives", searchTerm.split('+')[0]]
      }
    ];

    await browser.close();

    // Now enrich the data with SerpAPI contacts
    const enrichedProducts = [];
    for (const prod of mockProducts) {
      const contacts = await getManufacturerContacts(prod.manufacturerName);
      enrichedProducts.push({
        ...prod,
        manufacturerWebsite: contacts.website,
        manufacturerEmail: contacts.email,
        manufacturerPhone: contacts.phone
      });
    }

    return enrichedProducts;
  } catch (error) {
    console.error("Scraping error:", error);
    if (browser) await browser.close();
    return [];
  }
}

module.exports = { scrapeInstacart };
