/* ============================================================
   NEXUS GAMING STORE — app.js
   ============================================================ */

// ── PRODUCT DATA ──────────────────────────────────────────
let PRODUCTS = [];
const API_URL = 'http://localhost:5000/api';

// ── STATE ─────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem('nexus_cart') || '[]');
let user = JSON.parse(localStorage.getItem('nexus_user') || 'null');
let activeTab = 'all';
let maxPrice = 55000;
let selPM = 'razorpay';
let couponApplied = false;
let currentStep = 1;
const PLATFORM_FEE = 49;

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    syncBadge();
    if (user) applyUser(user);
    initApp();
});

async function initApp() {
    try {
        const res = await fetch(`${API_URL}/products`);
        PRODUCTS = await res.json();
        renderProducts();
    } catch (err) {
        console.error('Failed to fetch products:', err);
        toast('Offline Mode: Load products failed');
    }
}

// ── PAGE NAVIGATION ───────────────────────────────────────
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
}

function goHome() {
    showPage('pageHome');
    setNavActive('nl-home');
}

function goShop(cat) {
    activeTab = cat;
    showPage('pageShop');
    setNavActive('nl-shop');

    const titles = {
        'all': 'All Products',
        'pc-games': 'PC Games',
        'consoles': 'Consoles',
        'playstation': 'PlayStation',
        'ps-games': 'PlayStation Games',
        'new-releases': 'New Releases',
    };
    document.getElementById('shopTitle').textContent = titles[cat] || 'Shop';
    document.getElementById('searchInput').value = '';

    const cats = ['all', 'pc-games', 'consoles', 'playstation', 'ps-games', 'new-releases'];
    document.querySelectorAll('.cat-tab').forEach((tab, i) =>
        tab.classList.toggle('active', cats[i] === cat)
    );
    renderProducts();
}

function setNavActive(id) {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('act'));
    const el = document.getElementById(id);
    if (el) el.classList.add('act');
}

function setTab(cat, el) {
    activeTab = cat;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const titles = {
        'all': 'All Products', 'pc-games': 'PC Games', 'consoles': 'Consoles',
        'playstation': 'PlayStation', 'ps-games': 'PlayStation Games', 'new-releases': 'New Releases',
    };
    document.getElementById('shopTitle').textContent = titles[cat] || 'Shop';
    document.getElementById('searchInput').value = '';
    renderProducts();
}

// ── MOBILE MENU ───────────────────────────────────────────
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
}

// ── PRODUCTS ──────────────────────────────────────────────
function renderProducts(cat = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!Array.isArray(PRODUCTS)) {
        console.error('PRODUCTS is not an array:', PRODUCTS);
        grid.innerHTML = '<div class="error-msg">Failed to load products. Please check the backend.</div>';
        return;
    }

    const q = document.getElementById('searchInput').value.toLowerCase();

    const catChecks = [...document.querySelectorAll('.sidebar input[type=checkbox]:checked')]
        .filter(c => ['pc-games', 'consoles', 'playstation', 'ps-games'].includes(c.value))
        .map(c => c.value);

    const onlyNew = document.querySelector('.sidebar input[value="new"]')?.checked;
    const onlySale = document.querySelector('.sidebar input[value="sale"]')?.checked;

    const bClass = { hot: 'badge-hot', new: 'badge-new', sale: 'badge-sale', top: 'badge-top' };

    const list = PRODUCTS.filter(p => {
        if (activeTab === 'new-releases') return p.is_new_arrival;
        if (activeTab !== 'all' && p.cat !== activeTab) return false;
        if (catChecks.length && !catChecks.includes(p.cat)) return false;
        if (onlyNew && !p.is_new_arrival) return false;
        if (onlySale && !p.orig) return false;
        if (p.price > maxPrice) return false;
        if (q && !p.name.toLowerCase().includes(q)) return false;
        return true;
    });

    if (!list.length) {
        grid.innerHTML = `
      <div style="grid-column:1/-1;padding:48px;text-align:center;color:var(--text-3);font-size:0.9rem;">
        <div style="font-size:2rem;margin-bottom:10px;">🔍</div>
        No products match your filters.
      </div>`;
        return;
    }

    grid.innerHTML = list.map(p => {
        const inCart = cart.some(c => c.id === p.id);
        return `
      <div class="product-card">
        <div class="pc-img">
          ${p.badge ? `<span class="pc-badge ${bClass[p.badge]}">${p.badge}</span>` : ''}
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : p.emoji}
        </div>
        <div class="pc-body">
          <div class="pc-cat">${p.cat.replace('-', ' ')}</div>
          <div class="pc-name">${p.name}</div>
          <div class="pc-footer">
            <div>
              <span class="pc-price">₹${p.price.toLocaleString('en-IN')}</span>
              ${p.orig ? `<span class="pc-original">₹${p.orig.toLocaleString('en-IN')}</span>` : ''}
            </div>
            <button class="pc-add ${inCart ? 'done' : ''}" id="btn-${p.id}" onclick="addToCart(${p.id})">
              ${inCart ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
}

function updateMaxPrice(v) {
    maxPrice = +v;
    document.getElementById('priceLabel').textContent = '₹' + Number(v).toLocaleString('en-IN');
    renderProducts();
}

// ── CART ──────────────────────────────────────────────────
function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    const ex = cart.find(c => c.id === id);
    ex ? ex.qty++ : cart.push({ ...p, qty: 1 });
    saveCart();

    const btn = document.getElementById('btn-' + id);
    if (btn) { btn.classList.add('done'); btn.textContent = '✓'; }
    toast('Added — ' + p.name);
}

function changeQty(id, d) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    saveCart();
    renderDrawer();
}

function removeItem(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    renderDrawer();
}

function saveCart() {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
    syncBadge();
}

function syncBadge() {
    document.getElementById('cartBadge').textContent = cart.reduce((s, c) => s + c.qty, 0);
}

function openCart() {
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('drawerBg').classList.add('open');
    renderDrawer();
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('open');
    document.getElementById('drawerBg').classList.remove('open');
}

function renderDrawer() {
    const el = document.getElementById('drawerItems');
    const ft = document.getElementById('drawerFoot');

    if (!cart.length) {
        el.innerHTML = `
      <div class="cart-empty">
        <span class="ce-icon">🛒</span>
        <p>Your cart is empty.</p>
      </div>`;
        ft.innerHTML = '';
        return;
    }

    el.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="ci-emoji">
        ${c.image ? `<img src="${c.image}" alt="${c.name}">` : c.emoji}
      </div>
      <div class="ci-info">
        <div class="ci-name">${c.name}</div>
        <div class="ci-price">₹${(c.price * c.qty).toLocaleString('en-IN')}</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQty(${c.id}, -1)">−</button>
          <span class="qty-n">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty(${c.id}, 1)">+</button>
        </div>
      </div>
      <button class="ci-del" onclick="removeItem(${c.id})">✕</button>
    </div>`).join('');

    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    ft.innerHTML = `
    <div class="drawer-foot">
      <div class="drawer-total">
        <span>Subtotal</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>
      <button class="btn btn-primary btn-full" style="padding:12px;" onclick="goCheckout()">
        Proceed to Checkout
      </button>
    </div>`;
}

// ── CHECKOUT ──────────────────────────────────────────────
function goCheckout() {
    if (!user) { closeCart(); openModal(); toast('Please sign in to checkout'); return; }
    closeCart();
    couponApplied = false;
    document.getElementById('couponSuccess').classList.remove('show');
    document.getElementById('discountLine').style.display = 'none';
    document.getElementById('couponInput').disabled = false;
    document.getElementById('couponInput').value = '';
    buildOrderSummary();
    goStep(1);
    showPage('pageCheckout');
}

function buildOrderSummary() {
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const discount = couponApplied ? Math.round(sub * 0.1) : 0;
    const taxBase = sub - discount;
    const tax = Math.round(taxBase * 0.18);
    const tot = taxBase + tax + PLATFORM_FEE;

    document.getElementById('orderItems').innerHTML = cart.map(c => `
    <div class="oi-item">
      <div class="oi-thumb">${c.emoji}</div>
      <div class="oi-detail">
        <div class="oi-name">${c.name}</div>
        <div class="oi-qty">Qty: ${c.qty}</div>
      </div>
      <div class="oi-amt">₹${(c.price * c.qty).toLocaleString('en-IN')}</div>
    </div>`).join('');

    document.getElementById('ckSubtotal').textContent = '₹' + sub.toLocaleString('en-IN');
    document.getElementById('ckTax').textContent = '₹' + tax.toLocaleString('en-IN');
    document.getElementById('ckFee').textContent = '₹' + PLATFORM_FEE.toLocaleString('en-IN');
    document.getElementById('ckTotal').textContent = '₹' + tot.toLocaleString('en-IN');

    if (couponApplied) {
        document.getElementById('discountLine').style.display = 'flex';
        document.getElementById('ckDiscount').textContent = '-₹' + discount.toLocaleString('en-IN');
    }

    // Dynamic QR Code Generation
    const upiId = '7774034616@slc';
    const upiName = 'NEXUS';
    const upiUrl = `upi://pay?pa=${upiId}&pn=${upiName}&am=${tot}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    const qrImg = document.getElementById('upiQrImg');
    if (qrImg) qrImg.src = qrUrl;
}

function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    if (code === 'NEXUS10') {
        couponApplied = true;
        document.getElementById('couponSuccess').classList.add('show');
        document.getElementById('couponInput').disabled = true;
        buildOrderSummary();
        toast('Coupon applied — 10% off!');
    } else {
        toast('Invalid promo code. Try NEXUS10');
    }
}

// ── CHECKOUT STEPS ────────────────────────────────────────
function goStep(n) {
    if (n > currentStep) return; // Can't skip ahead
    currentStep = n;

    document.querySelectorAll('.ck-panel').forEach((p, i) =>
        p.classList.toggle('active', i + 1 === n)
    );

    ['ckStep1', 'ckStep2', 'ckStep3'].forEach((id, i) => {
        const el = document.getElementById(id);
        const num = document.getElementById('ckNum' + (i + 1));
        el.classList.remove('active', 'done');
        if (i + 1 === n) { el.classList.add('active'); num.textContent = i + 1; }
        else if (i + 1 < n) { el.classList.add('done'); num.textContent = '✓'; }
        else { num.textContent = i + 1; }
    });
}

function nextStep(from) {
    if (from === 1) {
        if (!document.getElementById('ckFirst').value.trim() ||
            !document.getElementById('ckEmail').value.trim()) {
            toast('Please fill in your name and email');
            return;
        }
    }
    if (from === 2) {
        buildReview();
    }
    currentStep = from + 1;
    goStep(currentStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildReview() {
    const fname = document.getElementById('ckFirst').value;
    const lname = document.getElementById('ckLast').value;
    const email = document.getElementById('ckEmail').value;
    const phone = document.getElementById('ckPhone').value;
    const addr = document.getElementById('ckAddr').value;
    const city = document.getElementById('ckCity').value;
    const pin = document.getElementById('ckPin').value;
    const pmNames = { razorpay: 'Razorpay / UPI', cod: 'Cash on Delivery' };

    document.getElementById('reviewShipping').innerHTML = `
    <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-3);margin-bottom:10px;">Shipping To</div>
    <div style="font-size:0.95rem;font-weight:600;color:var(--white);margin-bottom:4px;">${fname} ${lname}</div>
    <div style="font-size:0.85rem;color:var(--text-2);line-height:1.7;">
      ${email}${phone ? '<br>' + phone : ''}
      ${addr ? '<br>' + addr : ''}
      ${city ? '<br>' + city + (pin ? ' — ' + pin : '') : ''}
    </div>`;

    document.getElementById('reviewPayment').innerHTML = `
    <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-3);margin-bottom:10px;">Payment Method</div>
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="font-size:0.95rem;font-weight:600;color:var(--white);">${pmNames[selPM] || 'Razorpay / UPI'}</div>
      <span style="font-size:0.75rem;color:var(--green);border:1px solid rgba(34,197,94,0.3);background:rgba(34,197,94,0.1);padding:2px 8px;border-radius:5px;">Verified Securely</span>
    </div>`;
}

// ── PAYMENT ───────────────────────────────────────────────
function selectPM(el, m) {
    document.querySelectorAll('.pm-option').forEach(x => x.classList.remove('selected'));
    el.classList.add('selected');
    selPM = m;

    // Toggle manual UPI QR visibility if the "upi" option is selected
    const upiDetails = document.getElementById('upiDetails');
    if (upiDetails) {
        upiDetails.classList.toggle('show', m === 'upi');
    }
}

function fmtCard(el) {
    let v = el.value.replace(/\D/g, '').substr(0, 16);
    el.value = v.replace(/(.{4})/g, '$1  ').trim();
}

function fmtExpiry(el) {
    let v = el.value.replace(/\D/g, '').substr(0, 4);
    if (v.length >= 3) v = v.substr(0, 2) + ' / ' + v.substr(2);
    el.value = v;
}

function placeOrder() {
    const btn = document.getElementById('placeBtn');
    const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const discount = couponApplied ? Math.round(sub * 0.1) : 0;
    const taxBase = sub - discount;
    const tax = Math.round(taxBase * 0.18);
    const total = taxBase + tax + PLATFORM_FEE;

    // Handle Cash on Delivery or Manual UPI
    if (selPM === 'cod' || selPM === 'upi') {
        processOrderLocally();
        return;
    }

    // Razorpay Integration
    if (selPM === 'razorpay') {
        const options = {
            "key": "MqpmqS4tvntThgTp5nNh2UYz", // Replace with your actual Razorpay Key ID
            "amount": total * 100, // Amount in paise
            "currency": "INR",
            "name": "NEXUS GAMING STORE",
            "description": "Payment for gaming gear and titles",
            "image": "https://image2url.com/r2/default/images/1771852641367-1d91d00a-8faf-4743-acb9-87a130e45da8.png",
            "handler": function (response) {
                // Payment Success Logic
                console.log("Payment ID:", response.razorpay_payment_id);
                toast('Payment Successful!');
                processOrderLocally(response.razorpay_payment_id);
            },
            "prefill": {
                "name": document.getElementById('ckFirst').value + ' ' + document.getElementById('ckLast').value,
                "email": document.getElementById('ckEmail').value,
                "contact": document.getElementById('ckPhone').value
            },
            "notes": {
                "address": document.getElementById('ckAddr').value
            },
            "theme": {
                "color": "#6366f1"
            },
            "modal": {
                "ondismiss": function () {
                    btn.disabled = false;
                    btn.textContent = 'Place Order';
                }
            }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            toast('Payment Failed: ' + response.error.description);
            btn.disabled = false;
            btn.textContent = 'Place Order';
        });

        btn.textContent = 'Opening Secure Gateway…';
        btn.disabled = true;
        rzp.open();
    }
}

function processOrderLocally(paymentId = null) {
    const btn = document.getElementById('placeBtn');
    btn.textContent = 'Finalizing Order…';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = 'Place Order';
        btn.disabled = false;
        const oid = 'NXS-' + Math.random().toString(36).toUpperCase().substr(2, 8);
        document.getElementById('orderIdPill').textContent = 'Order ID: ' + oid + (paymentId ? ` (PID: ${paymentId})` : '');
        cart = [];
        saveCart();
        couponApplied = false;
        showPage('pageSuccess');
    }, 1800);
}

// ── AUTH ──────────────────────────────────────────────────
function openModal() { document.getElementById('modalBg').classList.add('open'); }
function closeModal() { document.getElementById('modalBg').classList.remove('open'); }

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalBg').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
});

function switchTab(t) {
    document.getElementById('tabLogin').classList.toggle('active', t === 'login');
    document.getElementById('tabSignup').classList.toggle('active', t === 'signup');
    document.getElementById('formLogin').classList.toggle('active', t === 'login');
    document.getElementById('formSignup').classList.toggle('active', t === 'signup');
}

function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('liEmail').value;
    login({ name: email.split('@')[0], email });
}

function doSignup(e) {
    e.preventDefault();
    const name = document.getElementById('suName').value;
    const email = document.getElementById('suEmail').value;
    login({ name, email });
}

function googleLogin() {
    login({ name: 'Player_' + Math.floor(Math.random() * 9999), email: 'player@gmail.com' });
}

function login(u) {
    user = u;
    localStorage.setItem('nexus_user', JSON.stringify(u));
    applyUser(u);
    closeModal();
    toast('Welcome, ' + u.name + '!');
}

function applyUser(u) {
    document.getElementById('navUser').classList.add('show');
    document.getElementById('navName').textContent = u.name;
    document.getElementById('navAvatar').textContent = u.name[0].toUpperCase();
    const btn = document.getElementById('authBtn');
    btn.textContent = 'Sign Out';
    btn.onclick = signOut;
}

function signOut() {
    user = null;
    localStorage.removeItem('nexus_user');
    document.getElementById('navUser').classList.remove('show');
    const btn = document.getElementById('authBtn');
    btn.textContent = 'Sign In';
    btn.onclick = openModal;
    toast('Signed out.');
}

// ── TOAST ─────────────────────────────────────────────────
let toastTimer;
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.style.display = 'none', 2800);
}