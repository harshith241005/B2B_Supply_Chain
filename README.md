# B2B Supply Chain

A full-stack application designed to streamline B2B supply chain operations, lead generation, and automated outreach.

## Features

- **Automated Web Scraping:** Source prospects and supply chain data using Puppeteer and Cheerio.
- **Email Automation:** Send automated, customized outreach emails via Nodemailer.
- **RESTful API Backend:** Fast, robust backend built with Node.js and Express.
- **Data Persistence:** Store and manage leads/suppliers using MySQL.
- **Modern User Interface:** Fast and responsive frontend built with React and Vite.

## Tech Stack

**Frontend:**
- React 19 (Vite)
- Axios for API requests
- Lucide React for modern iconography

**Backend:**
- Node.js & Express.js
- Puppeteer & Cheerio (Web scraping & data extraction)
- MySQL2 (Database connectivity)
- Nodemailer (Email automation)
- Multer (File uploads/handling)

## Project Structure

```text
project/
├── backend/          # Express API, scraping scripts, DB connection, and email logic
└── frontend/         # React + Vite web application
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Database

### Installation & Setup

1. **Clone the repository (if applicable):**
   ```bash
   git clone https://github.com/harshith241005/B2B_Supply_Chain.git
   cd B2B_Supply_Chain
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` folder and add your environment variables (e.g., Database credentials, Email SMTP details).*
   ```bash
   npm start # or node server.js
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## License
ISC
