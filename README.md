# B2B Supply Chain Intelligence Platform

Welcome to the **B2B Supply Chain Intelligence Platform**! This project acts as an automated bot that searches for product categories (like "sausage" or "mayonnaise") on platforms (modeled for Instacart), discovers the manufacturers of those products, uncovers their contact information, saves them to a database, and can be used to send out automated B2B outreach emails.

## 🚀 How it Works

1. **Search & Scrape**: You enter product keywords on the frontend (e.g., "sausage, mayonnaise").
2. **Product Discovery**: The backend uses **Puppeteer** to simulate browsing an e-commerce platform to find product listings for those keywords.
3. **Data Enrichment**: It extracts the Manufacturer's name from the product and mimics analyzing search tools (like SerpAPI) to uncover the Manufacturer's Website, Email, and Phone number.
4. **Data Storage**: The findings (both the products and the connected manufacturers) are saved automatically to a **MySQL** database.
5. **Real-time Updates**: The frontend shows a real-time log of the scraping process, keeping you updated on exactly what is being found and added to the database.

## 🛠️ Technology Used

### Frontend (User Interface)
- **React.js & Vite**: A lightning-fast web interface.
- **Axios**: Used to communicate with the backend API.
- **Lucide React**: Provides beautiful, modern icons.

### Backend (The Brains)
- **Node.js & Express**: The engine running the server and API endpoints (`http://localhost:5000/api/`).
- **Puppeteer & Cheerio**: Headless browser libraries used to scrape e-commerce data.
- **MySQL2**: Securely connects to your MySQL database to store leads.
- **Nodemailer**: Pre-configured to easily allow automated email outreach to the scraped leads.

## 📂 Project Layout

```text
project/
├── backend/          
│   ├── server.js     # Main API handles Express routes and scraping logs
│   ├── scraper.js    # Puppeteer setup for scanning products
│   ├── serpapi.js    # Fetches contact details for the manufacturers found 
│   ├── db.js         # MySQL DB configurations
│   └── email.js      # Contains logic for B2B automated outreach
│
└── frontend/         
    ├── src/App.jsx   # Main view, holds the input to start sourcing and shows real-time logs
    └── package.json  # Frontend dependencies (React, Vite, etc.)
```

## ⚙️ How to Run This Project

### 1. Database Setup
Make sure you have a local MySQL server running.
Create a database for the project and update `backend/db.js` or your `.env` file with your database credentials.

### 2. Start the Backend
Open a terminal, go into the `backend` folder, install the packages, and run the server.
```bash
cd backend
npm install
npm start
```
*The server will start on port 5000.*

### 3. Start the Frontend
Open a new terminal, go into the `frontend` folder, install the packages, and start the Vite development server.
```bash
cd frontend
npm install
npm run dev
```

### 4. Use the App!
Open the local link provided by Vite (usually `http://localhost:5173`). Type in your keywords, click "Start Sourcing", and watch the magic happen!

## License
ISC
