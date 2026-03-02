require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Avoid model recompilation error on Vercel
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Routes
// Note: In Vercel, this function handles requests prefix with /api
// So /api/products will hit this route if we use app.get('/products')
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start Server (only for local dev)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
