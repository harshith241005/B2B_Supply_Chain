const axios = require('axios');
require('dotenv').config();

const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function getManufacturerContacts(manufacturerName) {
  if (!SERPAPI_KEY || SERPAPI_KEY === 'YOUR_SERPAPI_KEY_HERE') {
    console.log(`[SerpAPI Mock] Simulating search for ${manufacturerName}...`);
    // Mock the response if no key is provided so the pipeline doesn't break
    const cleanStr = manufacturerName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return {
      website: `https://www.${cleanStr || 'company'}.com`,
      email: `contact@${cleanStr || 'company'}.com`,
      phone: `+1-800-555-${Math.floor(1000 + Math.random() * 9000)}`
    };
  }

  // Real SerpAPI Implementation
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google',
        q: `${manufacturerName} contact email phone official site`,
        api_key: SERPAPI_KEY,
      }
    });

    const results = response.data.organic_results || [];
    let website = null;
    let email = null;
    let phone = null;

    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

    for (const result of results) {
      if (!website && (result.title.toLowerCase().includes('official') || result.title.toLowerCase().includes('contact'))) {
        website = result.link;
      }
      
      const snippet = result.snippet || "";
      
      if (!email) {
        const emailMatch = snippet.match(emailPattern);
        if (emailMatch) email = emailMatch[0];
      }
      if (!phone) {
        const phoneMatch = snippet.match(phonePattern);
        if (phoneMatch) phone = phoneMatch[0];
      }
    }

    return { website, email, phone };
  } catch (err) {
    console.error("SerpAPI Error:", err.message);
    return { website: null, email: null, phone: null };
  }
}

module.exports = { getManufacturerContacts };
