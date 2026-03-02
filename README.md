# NEXUS-GAMING-STORE

A modern gaming e-commerce store with high-quality product imagery and a robust backend.

## Prerequisites
- **Node.js**: Installed on your machine.
- **MongoDB**: Running locally on `127.0.0.1:27017`.

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/nexus_store
   ```
4. Run `npm run seed` to populate the database with products and images.

## Running the App
1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   [http://localhost:5000](http://localhost:5000)

## Features
- Dynamic product grid with real game art.
- Interactive cart and checkout system.
- Secure payment integration mockups.