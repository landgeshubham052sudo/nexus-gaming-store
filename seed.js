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

const Product = mongoose.model('Product', productSchema);

const PRODUCTS = [
    { id: 19, name: 'Ghost of Tsushima', cat: 'pc-games', price: 3499, orig: null, emoji: '🈂️', image: 'assets/products/ghost_of_tsushima.png', badge: 'hot', is_new_arrival: true },
    { id: 20, name: 'Helldivers 2', cat: 'pc-games', price: 2499, orig: null, emoji: '🛡️', image: 'assets/products/helldivers_2.png', badge: 'new', is_new_arrival: true },
    { id: 21, name: 'Final Fantasy VII Rebirth', cat: 'ps-games', price: 4999, orig: null, emoji: '⚔️', image: 'assets/products/ffvii_rebirth.png', badge: 'hot', is_new_arrival: true },
    { id: 1, name: 'Cyberpunk 2077', cat: 'pc-games', price: 2499, orig: 3999, emoji: '🌆', image: 'assets/products/cyberpunk_2077.png', badge: 'hot', is_new_arrival: false },
    { id: 2, name: 'Elden Ring', cat: 'pc-games', price: 3299, orig: 4199, emoji: '⚔️', image: 'assets/products/elden_ring.png', badge: 'top', is_new_arrival: false },
    { id: 3, name: "Baldur's Gate 3", cat: 'pc-games', price: 3799, orig: null, emoji: '🧙', image: 'assets/products/baldurs_gate_3.png', badge: null, is_new_arrival: true },
    { id: 4, name: 'Starfield', cat: 'pc-games', price: 2999, orig: 3999, emoji: '🚀', image: 'assets/products/starfield.png', badge: 'sale', is_new_arrival: false },
    { id: 5, name: 'Alan Wake 2', cat: 'pc-games', price: 3599, orig: null, emoji: '🔦', image: 'assets/products/alan_wake_2.png', badge: null, is_new_arrival: true },
    { id: 6, name: 'Sony PS5 Console', cat: 'consoles', price: 49999, orig: 54999, emoji: '🖥️', image: 'assets/products/ps5_console.png', badge: 'new', is_new_arrival: true },
    { id: 7, name: 'Xbox Series X', cat: 'consoles', price: 52999, orig: null, emoji: '⬛', image: 'assets/products/xbox_series_x.png', badge: null, is_new_arrival: false },
    { id: 8, name: 'Nintendo Switch OLED', cat: 'consoles', price: 29999, orig: 34999, emoji: '🟥', image: 'assets/products/nintendo_switch.png', badge: 'sale', is_new_arrival: false },
    { id: 9, name: 'PS5 DualSense', cat: 'playstation', price: 6299, orig: 7499, emoji: '🎮', image: 'assets/products/ps5_dualsense.png', badge: 'hot', is_new_arrival: false },
    { id: 10, name: 'Pulse 3D Headset', cat: 'playstation', price: 9499, orig: null, emoji: '🎧', image: 'assets/products/pulse_3d.png', badge: null, is_new_arrival: true },
    { id: 11, name: 'PS VR2', cat: 'playstation', price: 44999, orig: 49999, emoji: '🥽', image: 'assets/products/ps_vr2.png', badge: 'sale', is_new_arrival: false },
    { id: 12, name: 'Media Remote', cat: 'playstation', price: 3299, orig: null, emoji: '📺', image: 'assets/products/media_remote_img_final_1771876209753.png', badge: null, is_new_arrival: false },
    { id: 13, name: 'Spider-Man 2', cat: 'ps-games', price: 4999, orig: null, emoji: '🕷️', image: 'assets/products/spiderman_2.png', badge: 'new', is_new_arrival: true },
    { id: 14, name: 'God of War Ragnarök', cat: 'ps-games', price: 3999, orig: 4999, emoji: '⚡', image: 'assets/products/god_of_war_cover_final_img_v2_1771876253818.png', badge: 'top', is_new_arrival: false },
    { id: 15, name: 'The Last of Us Part I', cat: 'ps-games', price: 3499, orig: 4999, emoji: '🌿', image: 'assets/products/tlou_part1.png', badge: 'sale', is_new_arrival: false },
    { id: 16, name: 'Horizon Forbidden West', cat: 'ps-games', price: 2999, orig: 3999, emoji: '🏹', image: 'assets/products/horizon_forbidden_west.png', badge: null, is_new_arrival: false },
    { id: 17, name: 'Gran Turismo 7', cat: 'ps-games', price: 3299, orig: null, emoji: '🏎️', image: 'assets/products/gran_turismo_7.png', badge: null, is_new_arrival: false },
    { id: 18, name: "Demon's Souls", cat: 'ps-games', price: 2499, orig: 3499, emoji: '💀', image: 'assets/products/demons_souls.png', badge: 'sale', is_new_arrival: false }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding');

        await Product.deleteMany({});
        console.log('🗑️ Existing products cleared');

        await Product.insertMany(PRODUCTS);
        console.log('🌱 Data seeded successfully');

        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
}

seed();
