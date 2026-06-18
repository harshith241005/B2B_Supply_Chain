const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
const { scrapeInstacart } = require('./scraper');
const { sendOutreachEmail } = require('./email');

const app = express();
app.use(cors({
  origin: [
    'https://b2b-supply-chain-frontend.onrender.com',
    'http://localhost:5173'
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

app.use(express.json());

let scrapingProgress = {
  total: 0,
  completed: 0,
  logs: []
};

const PORT = process.env.PORT || 5000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

app.get('/api/progress', (req, res) => {
  res.json(scrapingProgress);
});

app.get('/api/mappings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id as productId, p.name as productName, p.category, p.status, m.name as manufacturerName, m.email, m.contact_phone, m.website
      FROM Products p
      LEFT JOIN Manufacturers m ON p.manufacturer_id = m.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Mappings query error:", err);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
});

// Endpoint to trigger Instacart scraping based on search terms
app.post('/api/search', async (req, res) => {
  console.log('Request body:', req.body);
  try {
    const { terms } = req.body;
    if (!terms || !Array.isArray(terms)) {
      return res.status(400).json({ error: 'Invalid search terms' });
    }

    scrapingProgress = { total: terms.length, completed: 0, logs: [] };
    res.json({ message: 'Instacart scraping pipeline started.' });

    processInstacartTermsBackground(terms);
  } catch (error) {
    console.error('Search route error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function processInstacartTermsBackground(terms) {
  for (const term of terms) {
    try {
      scrapingProgress.logs.push(`[Instacart] Searching for "${term}"...`);
      
      const products = await scrapeInstacart(term);
      scrapingProgress.logs.push(`[Instacart] Found ${products.length} products for "${term}".`);
      
      for (const prod of products) {
        try {
          scrapingProgress.logs.push(`[Scraping] Processing: ${prod.name}`);
          
          // 1. Handle Manufacturer
          const [existingManuf] = await pool.query('SELECT id FROM Manufacturers WHERE name = ?', [prod.manufacturerName]);
          let manufacturerId;
          
          if (existingManuf.length > 0) {
            manufacturerId = existingManuf[0].id;
          } else {
            const [result] = await pool.query(
              'INSERT INTO Manufacturers (name, email, contact_phone, website) VALUES (?, ?, ?, ?)', 
              [prod.manufacturerName, prod.manufacturerEmail || null, prod.manufacturerPhone || null, prod.manufacturerWebsite || null]
            );
            manufacturerId = result.insertId;
          }
          scrapingProgress.logs.push(`[Database] Manufacturer saved: ${prod.manufacturerName}`);

          // 2. Handle Product
          const [existingProd] = await pool.query('SELECT id FROM Products WHERE name = ?', [prod.name]);
          let productId;
          
          if (existingProd.length > 0) {
            productId = existingProd[0].id;
          } else {
            const [result] = await pool.query(
              'INSERT INTO Products (name, raw_vendor_name, manufacturer_id, category, store_name, status) VALUES (?, ?, ?, ?, ?, ?)', 
              [prod.name, prod.manufacturerName, manufacturerId, term, prod.store || null, 'mapped']
            );
            productId = result.insertId;
          }
          scrapingProgress.logs.push(`[Database] Product mapped: ${prod.name} → ${prod.manufacturerName}`);

          // 3. Handle Ingredients
          if (prod.ingredients && prod.ingredients.length > 0) {
            for (const ingredient of prod.ingredients) {
              try {
                const ingredName = ingredient.toLowerCase().trim();
                if (!ingredName) continue;
                
                const [existingIngred] = await pool.query('SELECT id FROM Ingredients WHERE name = ?', [ingredName]);
                let ingredientId;
                
                if (existingIngred.length > 0) {
                  ingredientId = existingIngred[0].id;
                } else {
                  const [result] = await pool.query('INSERT INTO Ingredients (name) VALUES (?)', [ingredName]);
                  ingredientId = result.insertId;
                }
                
                // Check if link already exists before inserting
                const [existingLink] = await pool.query(
                  'SELECT id FROM IngredientProduct WHERE product_id = ? AND ingredient_id = ?', 
                  [productId, ingredientId]
                );
                if (existingLink.length === 0) {
                  await pool.query('INSERT INTO IngredientProduct (product_id, ingredient_id) VALUES (?, ?)', [productId, ingredientId]);
                }
              } catch (ingredErr) {
                console.error("Ingredient error:", ingredErr.message);
                // Continue processing other ingredients
              }
            }
            scrapingProgress.logs.push(`[Database] ${prod.ingredients.length} ingredients linked.`);
          }

          // 4. Outreach Email
          if (prod.manufacturerEmail) {
            scrapingProgress.logs.push(`[Email] Sending outreach to ${prod.manufacturerEmail}...`);
            try {
              const preview = await sendOutreachEmail(prod.manufacturerName, prod.manufacturerEmail, prod.name);
              if (preview) {
                scrapingProgress.logs.push(`[Email Sent] ✅ Preview: ${preview}`);
                await pool.query('UPDATE Manufacturers SET contacted = true WHERE id = ?', [manufacturerId]);
              }
            } catch (emailErr) {
              scrapingProgress.logs.push(`[Email] ⚠️ Email skipped (test mode): ${emailErr.message}`);
            }
          }
        } catch (prodErr) {
          console.error("Product processing error:", prodErr);
          scrapingProgress.logs.push(`[Error] Failed on ${prod.name}: ${prodErr.message}`);
          // Continue to next product
        }
      }
      
      scrapingProgress.completed += 1;
      scrapingProgress.logs.push(`[Done] ✅ Finished category "${term}" (${scrapingProgress.completed}/${scrapingProgress.total})`);
    } catch (termErr) {
      console.error("Term processing error:", termErr);
      scrapingProgress.logs.push(`[Error] Failed on category "${term}": ${termErr.message}`);
      scrapingProgress.completed += 1;
    }
  }
  scrapingProgress.logs.push(`[Complete] 🎉 All ${scrapingProgress.total} categories processed successfully!`);
}
