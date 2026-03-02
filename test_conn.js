require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

console.log('Testing connection to:', uri);
mongoose.connect(uri)
    .then(() => {
        console.log('✅ Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:');
        console.error(err);
        process.exit(1);
    });
