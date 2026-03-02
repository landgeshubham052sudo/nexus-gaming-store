require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory (for local dev)
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
}

mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_store')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

// Product Schema
const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    cat: String,
    price: Number,
    orig: Number,
    emoji: String,
    image: String,
    badge: String,
    is_new_arrival: Boolean
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
    });
});
app.get('/api/products', async (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/products`);
    try {
        const products = await Product.find();
        console.log(`[${new Date().toISOString()}] Returned ${products.length} products`);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fallback for non-API routes to serve index.html (for local dev)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

// Start Server (only for local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
