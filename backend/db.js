const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await tempConnection.end();

    const connection = await pool.getConnection();
    console.log("Connected to MySQL Database");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Manufacturers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        contact_phone VARCHAR(50),
        website VARCHAR(255),
        contacted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        raw_vendor_name VARCHAR(255),
        manufacturer_id INT,
        category VARCHAR(100),
        store_name VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manufacturer_id) REFERENCES Manufacturers(id) ON DELETE SET NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS IngredientProduct (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        ingredient_id INT,
        FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id) ON DELETE CASCADE
      )
    `);

    // Custom relational indexing to achieve sub-second query performance
    try { await connection.query(`CREATE INDEX idx_product_status ON Products(status)`); } catch (err) {}
    try { await connection.query(`CREATE INDEX idx_manufacturer_name ON Manufacturers(name)`); } catch (err) {}

    connection.release();
    console.log("Database schema initialized.");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

module.exports = { pool, initDB };
