require('dotenv').config();
const mongoose = require('mongoose');

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

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        const count = await Product.countDocuments();
        console.log('Product count:', count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
