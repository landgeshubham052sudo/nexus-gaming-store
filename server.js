require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/assets', express.static('assets'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB at', process.env.MONGODB_URI))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('Hint: Ensure mongod is running locally on 127.0.0.1:27017');
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

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
