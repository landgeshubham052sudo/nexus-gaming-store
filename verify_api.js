async function verify() {
    try {
        const healthRes = await fetch('http://localhost:5000/api/health');
        const health = await healthRes.json();
        console.log('Health Check:', health);

        const productsRes = await fetch('http://localhost:5000/api/products');
        const products = await productsRes.json();
        console.log('Products Count:', products.length);

        if (health.status === 'ok' && products.length > 0) {
            console.log('✅ Backend Verification Successful!');
            process.exit(0);
        } else {
            console.log('❌ Backend Verification Failed!');
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Verification Error:', err.message);
        process.exit(1);
    }
}

verify();
