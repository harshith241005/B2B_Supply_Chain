FROM node:22-slim

# Install system dependencies required for Puppeteer / Chromium (including tar and unzip for extraction)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    tar \
    unzip \
    libgbm-dev \
    libxss1 \
    libasound2 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    lsb-release \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
