# Use the official Apify SDK image as the base
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev --audit=false

# Copy source code
COPY . ./

# Run the scraper
CMD npm start
