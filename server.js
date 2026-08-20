// ================================
// SERVER CONFIGURATION & DATABASE
// ================================
const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PostgreSQL Connection Pool (Supabase / External DB)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

// Auto-create database tables kung wala pa
async function initTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                barcode TEXT,
                name TEXT NOT NULL,
                category TEXT,
                costprice NUMERIC,
                sellingprice NUMERIC,
                stock INT,
                minimumstock INT DEFAULT 5,
                createdat TEXT
            );
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                transactionnumber TEXT,
                items JSONB,
                subtotal NUMERIC,
                tax NUMERIC,
                total NUMERIC,
                amountpaid NUMERIC,
                change NUMERIC,
                paymentmethod TEXT,
                status TEXT,
                cashier TEXT,
                date TEXT
            );
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                productid INT,
                productname TEXT,
                type TEXT,
                quantity INT,
                previousstock INT,
                newstock INT,
                reason TEXT,
                date TEXT,
                "user" TEXT
            );
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name TEXT,
                phone TEXT,
                email TEXT,
                address TEXT,
                createdat TEXT
            );
            CREATE TABLE IF NOT EXISTS utang (
                id SERIAL PRIMARY KEY,
                customerid INT,
                customername TEXT,
                transactionid INT,
                originalamount NUMERIC,
                amountpaid NUMERIC,
                remainingbalance NUMERIC,
                status TEXT,
                datecreated TEXT,
                duedate TEXT,
                paymenthistory JSONB
            );
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                name TEXT,
                category TEXT,
                amount NUMERIC,
                notes TEXT,
                date TEXT
            );
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY,
                storename TEXT,
                storeaddress TEXT,
                storephone TEXT,
                taxrate NUMERIC,
                startingcash NUMERIC
            );
        `);
        
        const settingsCheck = await pool.query("SELECT * FROM settings WHERE id = 1");
        if (settingsCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO settings (id, storename, storeaddress, storephone, taxrate, startingcash) 
                VALUES (1, 'SmartStore POS', 'Philippines', '09123456789', 0.00, 0.00)
            `);
        } else {
            // Siguraduhing may startingcash column kung lumang database ang meron
            await pool.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS startingcash NUMERIC DEFAULT 0.00;`);
        }
        
        console.log("Database tables verified/created successfully.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

initTables();

// ================================
// REST API ENDPOINTS FOR EXTERNAL DB
// ================================
app.get("/api/:table", async (req, res) => {
    try {
        const { table } = req.params;
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/:table", async (req, res) => {
    try {
        const { table } = req.params;
        const data = req.body;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const columns = keys.map(k => `"${k}"`).join(", ");

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id;`;
        const result = await pool.query(query, values);
        res.json({ id: result.rows[0].id, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/:table/:id", async (req, res) => {
    try {
        const { table, id } = req.params;
        const data = req.body;
        delete data.id;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setString = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");

        const query = `UPDATE ${table} SET ${setString} WHERE id = $${keys.length + 1};`;
        await pool.query(query, [...values, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/:table/:id", async (req, res) => {
    try {
        const { table, id } = req.params;
        await pool.query(`DELETE FROM ${table} WHERE id = $1;`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Custom endpoint para i-reset ang lahat ng sales at inventory logs kung kinakailangan
app.post("/api/admin/resetsales", async (req, res) => {
    try {
        await pool.query("DELETE FROM sales;");
        await pool.query("DELETE FROM inventory WHERE type = 'Sale' OR type = 'Void';");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// EMBEDDED CSS
// ================================
const EMBEDDED_CSS = `
:root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #1f2937;
    --light: #f9fafb;
    --gray: #9ca3af;
    --border: #e5e7eb;
    --card-bg: #ffffff;
    --sidebar-width: 260px;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
body { background-color: #f3f4f6; color: var(--dark); height: 100vh; overflow: hidden; }
#app { display: flex; height: 100vh; width: 100vw; }
#auth-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.auth-card { background: white; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.auth-card h2 { margin-bottom: 1.5rem; color: var(--dark); text-align: center; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 1rem; }
.form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; width: 100%; transition: background 0.2s; text-decoration: none; }
.btn:hover { background-color: var(--primary-hover); }
.btn-success { background-color: var(--success); } .btn-success:hover { background-color: #059669; }
.btn-danger { background-color: var(--danger); } .btn-danger:hover { background-color: #dc2626; }
.btn-warning { background-color: var(--warning); color: white; } .btn-warning:hover { background-color: #d97706; }
.btn-secondary { background-color: #6b7280; } .btn-secondary:hover { background-color: #4b5563; }
aside { width: var(--sidebar-width); background: var(--dark); color: white; display: flex; flex-direction: column; height: 100%; transition: transform 0.3s ease; z-index: 100; }
.sidebar-header { padding: 1.5rem; font-size: 1.25rem; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px; }
.sidebar-menu { list-style: none; padding: 1rem 0; overflow-y: auto; flex-grow: 1; }
.sidebar-menu li a { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1.5rem; color: #9ca3af; text-decoration: none; font-weight: 500; transition: all 0.2s; }
.sidebar-menu li a:hover, .sidebar-menu li.active a { color: white; background-color: rgba(255,255,255,0.05); border-left: 4px solid var(--primary); }
.main-wrapper { flex-grow: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
header.topbar { height: 70px; background: white; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
.topbar-left { display: flex; align-items: center; gap: 15px; }
.menu-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.user-profile { display: flex; align-items: center; gap: 10px; }
.views-container { flex-grow: 1; overflow-y: auto; padding: 2rem; background-color: #f3f4f6; position: relative; }
.view-section { display: none; }
.view-section.active { display: block; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.metric-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid var(--primary); }
.metric-card.success { border-left-color: var(--success); }
.metric-card.warning { border-left-color: var(--warning); }
.metric-card.danger { border-left-color: var(--danger); }
.metric-card h3 { font-size: 0.875rem; color: var(--gray); margin-bottom: 0.5rem; text-transform: uppercase; }
.metric-card .value { font-size: 1.5rem; font-weight: bold; color: var(--dark); }
.card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
th { background-color: #f9fafb; font-weight: 600; }
.pos-container { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; height: calc(100vh - 140px); }
.pos-left, .pos-right { background: white; border-radius: 8px; display: flex; flex-direction: column; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: 100%; overflow: hidden; }
.pos-scanner-box { background: #000; border-radius: 6px; height: 180px; position: relative; margin-bottom: 1rem; overflow: hidden; display: flex; justify-content: center; align-items: center; }
#interactive.viewport { width: 100%; height: 100%; position: absolute; }
#interactive.viewport canvas, #interactive.viewport video { width: 100%; height: 100%; object-fit: cover; }
.cart-items-list { flex-grow: 1; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 1rem; }
.cart-summary-box { background: #f9fafb; padding: 1rem; border-radius: 6px; border: 1px solid var(--border); }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 1rem; }
.summary-row.total { font-size: 1.25rem; font-weight: bold; color: var(--primary); border-top: 1px solid var(--border); padding-top: 0.5rem; margin-top: 0.5rem; }
@media(max-width: 900px) {
    aside { position: fixed; left: -260px; height: 100%; }
    aside.mobile-open { left: 0; }
    .menu-toggle { display: block; }
    .pos-container { grid-template-columns: 1fr; height: auto; overflow-y: auto; }
}
.badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; display: none; }
.modal.active { display: flex; }
.modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
@media print {
    body * { visibility: hidden; }
    #printable-barcodes, #printable-barcodes * { visibility: visible; }
    #printable-barcodes { position: absolute; left: 0; top: 0; width: 100%; }
}
.barcode-card { display: inline-block; border: 1px dashed #999; padding: 15px; margin: 10px; text-align: center; border-radius: 6px; background: #fff; width: 220px; }
`;

// ================================
// HTML TEMPLATE (ADMIN PORTAL)
// ================================
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">SmartStore POS & Inventory System</title>
    <style>${EMBEDDED_CSS}</style>
    <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body>
    <!-- Login Screen -->
    <div id="auth-screen">
        <div class="auth-card">
            <h2 id="login-store-title">SmartStore Admin</h2>
            <form id="login-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-user" class="form-control" value="admin" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-pass" class="form-control" value="admin123" required>
                </div>
                <button type="submit" class="btn">Login as Admin</button>
            </form>
            <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid #eee; padding-top: 1rem;">
                <a href="/cashier" class="btn btn-success" style="font-size: 0.9rem;">Pumunta sa Cashier Portal (Walang Password)</a>
            </div>
        </div>
    </div>

    <!-- Main App Container -->
    <div id="app" style="display:none;">
        <aside id="sidebar">
            <div class="sidebar-header" id="sidebar-store-name">SmartStore</div>
            <ul class="sidebar-menu">
                <li class="active" data-target="dashboard-view"><a href="#">Dashboard</a></li>
                <li data-target="pos-view"><a href="#">POS / Scanner</a></li>
                <li data-target="products-view"><a href="#">Products & Barcodes</a></li>
                <li data-target="inventory-view"><a href="#">Inventory</a></li>
                <li data-target="stockin-view"><a href="#">Stock In</a></li>
                <li data-target="stockout-view"><a href="#">Stock Out</a></li>
                <li data-target="sales-view"><a href="#">Sales</a></li>
                <li data-target="utang-view"><a href="#">Utang / Credit</a></li>
                <li data-target="customers-view"><a href="#">Customers</a></li>
                <li data-target="expenses-view"><a href="#">Expenses</a></li>
                <li data-target="settings-view"><a href="#">Settings</a></li>
                <li><a href="#" id="logout-btn">Logout</a></li>
            </ul>
        </aside>

        <div class="main-wrapper">
            <header class="topbar">
                <div class="topbar-left">
                    <button class="menu-toggle" id="menu-toggle-btn">&#9776;</button>
                    <h2 id="current-view-title" style="font-size: 1.25rem;">Dashboard</h2>
                </div>
                <div class="user-profile">
                    <a href="/cashier" target="_blank" class="btn btn-warning" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; width:auto; margin-right: 10px;">Open Cashier Tab</a>
                    <span id="logged-in-user-label" style="font-weight:600;">Admin</span>
                </div>
            </header>

            <div class="views-container">
                <!-- DASHBOARD VIEW -->
                <section id="dashboard-view" class="view-section active">
                    <div class="dashboard-grid">
                        <div class="metric-card"><h3>Total Sales Today</h3><div class="value" id="dash-total-sales">₱0.00</div></div>
                        <div class="metric-card success"><h3>Total Orders Today</h3><div class="value" id="dash-total-orders">0</div></div>
                        <div class="metric-card"><h3>Total Products</h3><div class="value" id="dash-total-products">0</div></div>
                        <div class="metric-card warning"><h3>Low Stock Products</h3><div class="value" id="dash-low-stock">0</div></div>
                        <div class="metric-card success"><h3>Today's Profit</h3><div class="value" id="dash-todays-profit">₱0.00</div></div>
                        <div class="metric-card danger"><h3>Outstanding Utang</h3><div class="value" id="dash-outstanding-utang">₱0.00</div></div>
                    </div>

                    <!-- CASH DRAWER BREAKDOWN CARD -->
                    <div class="card" style="background: #ffffff; border-left: 4px solid var(--success);">
                        <div class="card-header">
                            <h3>Cash Drawer / Kaha Breakdown (Today)</h3>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="font-size: 0.85rem; color: var(--gray);">Starting Cash (Puhunan)</label>
                                <div style="font-size: 1.25rem; font-weight: bold;" id="dash-starting-cash-display">₱0.00</div>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; color: var(--gray);">Total Cash Sales</label>
                                <div style="font-size: 1.25rem; font-weight: bold; color: var(--success);" id="dash-cash-sales-display">₱0.00</div>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; color: var(--gray);">Expected Cash in Drawer</label>
                                <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary);" id="dash-expected-cash-display">₱0.00</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; background: #f9fafb; padding: 10px; border-radius: 6px;">
                            <input type="number" step="0.01" id="quick-starting-cash-input" class="form-control" placeholder="Ilagay ang bagong puhunan..." style="max-width: 250px;">
                            <button class="btn btn-success" style="width: auto;" onclick="updateStartingCashQuick()">I-update ang Puhunan</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <button class="btn" style="width: auto;" onclick="switchView('pos-view')">Open POS</button>
                        <button class="btn btn-success" style="width: auto;" onclick="openAddProductModal()">Add Product</button>
                        <button class="btn btn-warning" style="width: auto;" onclick="switchView('stockin-view')">Stock In</button>
                        <button class="btn btn-danger" style="width: auto;" onclick="resetAllSalesData()">Reset All Sales</button>
                    </div>
                </section>

                <!-- POS VIEW -->
                <section id="pos-view" class="view-section">
                    <div class="pos-container">
                        <div class="pos-left">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                                <h3>Scanner & Products</h3>
                                <div>
                                    <button class="btn btn-success" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="startScanner()">Start Cam</button>
                                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="stopScanner()">Stop Cam</button>
                                </div>
                            </div>
                            <div class="pos-scanner-box">
                                <div id="interactive" class="viewport"></div>
                                <div id="scanner-placeholder" style="color:#aaa; position:absolute;">Camera Preview</div>
                            </div>
                            <div style="display:flex; gap:10px; margin-bottom:10px;">
                                <input type="text" id="manual-barcode-input" class="form-control" placeholder="Scan barcode or type & enter..." autofocus>
                                <button class="btn" style="width:auto;" onclick="handleManualBarcode()">Add</button>
                            </div>
                            <div style="flex-grow:1; overflow-y:auto;">
                                <table id="pos-product-search-table">
                                    <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
                                    <tbody id="pos-product-search-tbody"></tbody>
                                </table>
                            </div>
                        </div>
                        <div class="pos-right">
                            <h3>Current Cart</h3>
                            <div class="cart-items-list">
                                <table>
                                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Sub</th><th></th></tr></thead>
                                    <tbody id="cart-items-tbody"></tbody>
                                </table>
                            </div>
                            <div class="cart-summary-box">
                                <div class="summary-row"><span>Subtotal:</span><span id="cart-subtotal">₱0.00</span></div>
                                <div class="summary-row"><span>Tax:</span><span id="cart-tax">₱0.00</span></div>
                                <div class="summary-row total"><span>Total:</span><span id="cart-grand-total">₱0.00</span></div>
                                <div class="form-group" style="margin-top:10px;">
                                    <label>Payment Method</label>
                                    <select id="pos-payment-method" class="form-control" onchange="togglePaymentFields()">
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="Card">Card</option>
                                        <option value="Utang">Utang / Credit</option>
                                    </select>
                                </div>
                                <div id="cash-payment-fields">
                                    <div class="form-group"><label>Amount Paid</label><input type="number" id="pos-amount-paid" class="form-control" value="0" oninput="calculateChange()"></div>
                                    <div class="summary-row"><span>Change:</span><span id="pos-change-display" style="color:var(--success);">₱0.00</span></div>
                                </div>
                                <div id="utang-payment-fields" style="display:none;">
                                    <div class="form-group"><label>Customer</label><select id="pos-utang-customer" class="form-control"></select></div>
                                    <div class="form-group"><label>Paid Now</label><input type="number" id="pos-utang-paid-now" class="form-control" value="0"></div>
                                    <div class="form-group"><label>Due Date</label><input type="date" id="pos-utang-duedate" class="form-control"></div>
                                </div>
                                <button class="btn btn-success" style="margin-top:10px;" onclick="completeCheckout()">Complete Payment</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- PRODUCTS VIEW -->
                <section id="products-view" class="view-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>Product & Barcode Management</h3>
                            <div>
                                <button class="btn btn-warning" style="width:auto; margin-right: 5px;" onclick="openPrintBarcodeModal()">Print Barcodes</button>
                                <button class="btn btn-success" style="width:auto;" onclick="openAddProductModal()">Add Product</button>
                            </div>
                        </div>
                        <div style="margin-bottom: 1rem;"><input type="text" id="product-search-input" class="form-control" placeholder="Search..." oninput="renderProductsTable()"></div>
                        <table>
                            <thead><tr><th>Barcode</th><th>Name</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody id="products-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- INVENTORY VIEW -->
                <section id="inventory-view" class="view-section">
                    <div class="card">
                        <h3>Inventory Logs</h3>
                        <table>
                            <thead><tr><th>Date/Time</th><th>Product</th><th>Type</th><th>Qty</th><th>Prev</th><th>New</th><th>Reason</th><th>User</th></tr></thead>
                            <tbody id="inventory-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- STOCK IN VIEW -->
                <section id="stockin-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>Stock In / Restock</h3>
                        <form id="stockin-form" onsubmit="handleStockIn(event)">
                            <div class="form-group"><label>Product</label><select id="stockin-product" class="form-control" required></select></div>
                            <div class="form-group"><label>Quantity</label><input type="number" id="stockin-qty" class="form-control" min="1" required></div>
                            <div class="form-group"><label>Notes / Supplier</label><input type="text" id="stockin-notes" class="form-control"></div>
                            <button type="submit" class="btn btn-success">Save Stock In</button>
                        </form>
                    </div>
                </section>

                <!-- STOCK OUT VIEW -->
                <section id="stockout-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>Stock Out / Adjustments</h3>
                        <form id="stockout-form" onsubmit="handleStockOut(event)">
                            <div class="form-group"><label>Product</label><select id="stockout-product" class="form-control" required></select></div>
                            <div class="form-group"><label>Quantity</label><input type="number" id="stockout-qty" class="form-control" min="1" required></div>
                            <div class="form-group"><label>Reason</label>
                                <select id="stockout-reason" class="form-control">
                                    <option value="Damaged">Damaged</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Lost">Lost</option>
                                    <option value="Manual Adjustment">Manual Adjustment</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Notes</label><input type="text" id="stockout-notes" class="form-control"></div>
                            <button type="submit" class="btn btn-danger">Save Stock Out</button>
                        </form>
                    </div>
                </section>

                <!-- SALES VIEW -->
                <section id="sales-view" class="view-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>Sales History</h3>
                            <button class="btn btn-danger" style="width: auto;" onclick="resetAllSalesData()">Reset All Sales</button>
                        </div>
                        <table>
                            <thead><tr><th>Trans #</th><th>Date/Time</th><th>Items</th><th>Total</th><th>Paid</th><th>Method</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody id="sales-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- UTANG VIEW -->
                <section id="utang-view" class="view-section">
                    <div class="card">
                        <h3>Utang / Credit</h3>
                        <table>
                            <thead><tr><th>Customer</th><th>Original</th><th>Paid</th><th>Remaining</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody id="utang-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- CUSTOMERS VIEW -->
                <section id="customers-view" class="view-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>Customers</h3>
                            <button class="btn btn-success" style="width:auto;" onclick="openAddCustomerModal()">Add Customer</button>
                        </div>
                        <table>
                            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Action</th></tr></thead>
                            <tbody id="customers-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- EXPENSES VIEW -->
                <section id="expenses-view" class="view-section">
                    <div class="card">
                        <div class="card-header">
                            <h3>Expenses</h3>
                            <button class="btn btn-success" style="width:auto;" onclick="openAddExpenseModal()">Add Expense</button>
                        </div>
                        <table>
                            <thead><tr><th>Name</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th></tr></thead>
                            <tbody id="expenses-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- SETTINGS VIEW -->
                <section id="settings-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>System Settings & Starting Cash</h3>
                        <form id="settings-form" onsubmit="saveSettings(event)">
                            <div class="form-group"><label>Store Name</label><input type="text" id="setting-store-name" class="form-control" required></div>
                            <div class="form-group"><label>Store Address</label><input type="text" id="setting-store-address" class="form-control"></div>
                            <div class="form-group"><label>Store Phone</label><input type="text" id="setting-store-phone" class="form-control"></div>
                            <div class="form-group"><label>Tax Rate (%)</label><input type="number" step="0.01" id="setting-tax-rate" class="form-control"></div>
                            <div class="form-group"><label>Starting Cash (Puhunan sa Kaha)</label><input type="number" step="0.01" id="setting-starting-cash" class="form-control" value="0"></div>
                            <button type="submit" class="btn">Save Settings</button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="product-modal" class="modal">
        <div class="modal-content">
            <h3 id="product-modal-title">Add Product</h3>
            <form id="product-form" onsubmit="saveProduct(event)">
                <input type="hidden" id="product-edit-id">
                <div class="form-group"><label>Barcode</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="prod-barcode" class="form-control" placeholder="Auto">
                        <button type="button" class="btn" style="width:auto;" onclick="generateAutoBarcode()">Generate</button>
                    </div>
                </div>
                <div class="form-group"><label>Name</label><input type="text" id="prod-name" class="form-control" required></div>
                <div class="form-group"><label>Category</label><input type="text" id="prod-category" class="form-control"></div>
                <div class="form-group"><label>Cost Price</label><input type="number" step="0.01" id="prod-cost" class="form-control" required></div>
                <div class="form-group"><label>Selling Price</label><input type="number" step="0.01" id="prod-price" class="form-control" required></div>
                <div class="form-group"><label>Stock</label><input type="number" id="prod-stock" class="form-control" value="0" required></div>
                <button type="submit" class="btn btn-success">Save Product</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <div id="print-barcode-modal" class="modal">
        <div class="modal-content" style="max-width: 700px;">
            <h3>Print Barcodes</h3>
            <p style="margin-bottom: 10px; font-size: 0.9rem; color: #666;">Pumili o i-print ang lahat ng barcode para sa mga produkto.</p>
            <div id="printable-barcodes" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 15px; background: #f9f9f9;"></div>
            <button type="button" class="btn btn-success" onclick="window.print()">I-print ang mga Barcode</button>
            <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Isara</button>
        </div>
    </div>

    <div id="customer-modal" class="modal">
        <div class="modal-content">
            <h3>Add Customer</h3>
            <form id="customer-form" onsubmit="saveCustomer(event)">
                <div class="form-group"><label>Name</label><input type="text" id="cust-name" class="form-control" required></div>
                <div class="form-group"><label>Phone</label><input type="text" id="cust-phone" class="form-control"></div>
                <div class="form-group"><label>Email</label><input type="email" id="cust-email" class="form-control"></div>
                <div class="form-group"><label>Address</label><input type="text" id="cust-address" class="form-control"></div>
                <button type="submit" class="btn btn-success">Save Customer</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <div id="expense-modal" class="modal">
        <div class="modal-content">
            <h3>Add Expense</h3>
            <form id="expense-form" onsubmit="saveExpense(event)">
                <div class="form-group"><label>Name</label><input type="text" id="exp-name" class="form-control" required></div>
                <div class="form-group"><label>Category</label>
                    <select id="exp-cat" class="form-control">
                        <option value="Rent">Rent</option><option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Supplies">Supplies</option><option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="exp-amount" class="form-control" required></div>
                <div class="form-group"><label>Notes</label><input type="text" id="exp-notes" class="form-control"></div>
                <button type="submit" class="btn btn-success">Save Expense</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <div id="utang-payment-modal" class="modal">
        <div class="modal-content">
            <h3>Record Utang Payment</h3>
            <form id="utang-pay-form" onsubmit="processUtangPayment(event)">
                <input type="hidden" id="pay-utang-id">
                <div class="form-group"><label>Customer: <span id="pay-cust-name"></span></label></div>
                <div class="form-group"><label>Remaining: <span id="pay-remaining-balance"></span></label></div>
                <div class="form-group"><label>Amount to Pay</label><input type="number" step="0.01" id="pay-amount" class="form-control" required></div>
                <button type="submit" class="btn btn-success">Confirm Payment</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <!-- CLIENT SCRIPT ENGINE -->
    <script>
    let currentUser = null;
    let cart = [];
    let appSettings = { storeName: "SmartStore POS", storeAddress: "Philippines", storePhone: "09123456789", taxRate: 0.00, startingCash: 0.00 };
    let html5QrCode = null;

    window.addEventListener("DOMContentLoaded", async () => {
        await loadSettings();
        setupNavigation();
        setupAuth();
    });

    async function apiFetch(endpoint, method = "GET", data = null) {
        const options = { method, headers: { "Content-Type": "application/json" } };
        if (data) options.body = JSON.stringify(data);
        const res = await fetch("/api/" + endpoint, options);
        return await res.json();
    }

    async function loadSettings() {
        const settingsList = await apiFetch("settings");
        if (settingsList.length > 0) {
            appSettings = settingsList[0];
        }
        document.getElementById("login-store-title").innerText = appSettings.storename;
        document.getElementById("sidebar-store-name").innerText = appSettings.storename;
        document.getElementById("page-title").innerText = appSettings.storename;
        document.getElementById("setting-store-name").value = appSettings.storename;
        document.getElementById("setting-store-address").value = appSettings.storeaddress || "";
        document.getElementById("setting-store-phone").value = appSettings.storephone || "";
        document.getElementById("setting-tax-rate").value = appSettings.taxrate || 0;
        document.getElementById("setting-starting-cash").value = appSettings.startingcash || 0;
        const quickInput = document.getElementById("quick-starting-cash-input");
        if(quickInput) quickInput.value = appSettings.startingcash || 0;
    }

    async function updateStartingCashQuick() {
        const val = parseFloat(document.getElementById("quick-starting-cash-input").value) || 0;
        appSettings.startingcash = val;
        await apiFetch("settings/1", "PUT", appSettings);
        alert("Na-update na ang Starting Cash (Puhunan)!");
        refreshAllViews();
    }

    async function resetAllSalesData() {
        if (confirm("Babala: Gusto mo bang i-reset at burahin ang lahat ng sales at history ngayon? Hindi na ito maibabalik.")) {
            await apiFetch("admin/resetsales", "POST");
            alert("Na-reset na ang lahat ng sales at records.");
            refreshAllViews();
        }
    }

    function setupAuth() {
        document.getElementById("login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("login-user").value;
            const pass = document.getElementById("login-pass").value;
            if (user === "admin" && pass === "admin123") {
                currentUser = { username: user, role: "ADMIN" };
                document.getElementById("auth-screen").style.display = "none";
                document.getElementById("app").style.display = "flex";
                document.getElementById("logged-in-user-label").innerText = currentUser.username + " (" + currentUser.role + ")";
                refreshAllViews();
            } else {
                alert("Invalid username or password");
            }
        });

        document.getElementById("logout-btn").addEventListener("click", () => {
            currentUser = null;
            document.getElementById("app").style.display = "none";
            document.getElementById("auth-screen").style.display = "flex";
        });
    }

    function setupNavigation() {
        const menuItems = document.querySelectorAll(".sidebar-menu li[data-target]");
        menuItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                menuItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                const target = item.getAttribute("data-target");
                document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
                document.getElementById(target).classList.add("active");
                document.getElementById("current-view-title").innerText = item.innerText;
                refreshViewData(target);
            });
        });

        document.getElementById("menu-toggle-btn").addEventListener("click", () => {
            document.getElementById("sidebar").classList.toggle("mobile-open");
        });
    }

    function switchView(target) {
        document.querySelectorAll(".sidebar-menu li").forEach(i => {
            if (i.getAttribute("data-target") === target) i.click();
        });
    }

    function refreshAllViews() {
        renderDashboard();
        renderProductsTable();
        renderPOSProducts();
        renderInventoryTable();
        renderSalesTable();
        renderUtangTable();
        renderCustomersTable();
        renderExpensesTable();
        populateDropdowns();
        setupManualBarcodeListener();
    }

    function refreshViewData(target) {
        if (target === "dashboard-view") renderDashboard();
        if (target === "products-view") renderProductsTable();
        if (target === "pos-view") { renderPOSProducts(); populateDropdowns(); setupManualBarcodeListener(); }
        if (target === "inventory-view") renderInventoryTable();
        if (target === "sales-view") renderSalesTable();
        if (target === "utang-view") renderUtangTable();
        if (target === "customers-view") renderCustomersTable();
        if (target === "expenses-view") renderExpensesTable();
        if (["stockin-view", "stockout-view", "pos-view"].includes(target)) populateDropdowns();
    }

    function setupManualBarcodeListener() {
        const input = document.getElementById("manual-barcode-input");
        if (input && !input.dataset.listenerAttached) {
            input.dataset.listenerAttached = "true";
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualBarcode();
                }
            });
        }
    }

    async function renderDashboard() {
        const sales = await apiFetch("sales");
        const products = await apiFetch("products");
        const utang = await apiFetch("utang");

        const today = new Date().toISOString().slice(0, 10);
        let totalSalesToday = 0, totalOrdersToday = 0, todaysProfit = 0, totalCashSalesToday = 0;

        sales.forEach(s => {
            if (s.date && s.date.startsWith(today)) {
                totalSalesToday += Number(s.total);
                totalOrdersToday++;
                if(s.paymentmethod === "Cash") {
                    totalCashSalesToday += Number(s.total);
                }
                if (s.items) {
                    let itemsArr = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
                    itemsArr.forEach(item => {
                        todaysProfit += (Number(item.sellingPrice) - Number(item.costPrice)) * Number(item.quantity);
                    });
                }
            }
        });

        let lowStockCount = products.filter(p => Number(p.stock) <= Number(p.minimumstock || 5)).length;
        let outstandingUtang = utang.filter(u => u.status !== "Paid").reduce((sum, u) => sum + Number(u.remainingbalance), 0);

        let startingCash = Number(appSettings.startingcash || 0);
        let expectedCash = startingCash + totalCashSalesToday;

        document.getElementById("dash-total-sales").innerText = formatCurrency(totalSalesToday);
        document.getElementById("dash-total-orders").innerText = totalOrdersToday;
        document.getElementById("dash-total-products").innerText = products.length;
        document.getElementById("dash-low-stock").innerText = lowStockCount;
        document.getElementById("dash-todays-profit").innerText = formatCurrency(todaysProfit);
        document.getElementById("dash-outstanding-utang").innerText = formatCurrency(outstandingUtang);

        document.getElementById("dash-starting-cash-display").innerText = formatCurrency(startingCash);
        document.getElementById("dash-cash-sales-display").innerText = formatCurrency(totalCashSalesToday);
        document.getElementById("dash-expected-cash-display").innerText = formatCurrency(expectedCash);
    }

    function generateAutoBarcode() {
        const randomNum = Math.floor(10000000000 + Math.random() * 90000000000);
        document.getElementById("prod-barcode").value = "2" + randomNum.toString().substring(0, 11);
    }

    function openAddProductModal() {
        document.getElementById("product-form").reset();
        document.getElementById("product-edit-id").value = "";
        document.getElementById("product-modal-title").innerText = "Add Product";
        generateAutoBarcode();
        document.getElementById("product-modal").classList.add("active");
    }

    async function openPrintBarcodeModal() {
        const products = await apiFetch("products");
        const container = document.getElementById("printable-barcodes");
        container.innerHTML = "";
        products.forEach((p, idx) => {
            if (!p.barcode) return;
            container.innerHTML += `
                <div class="barcode-card">
                    <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div>
                    <svg id="barcode-svg-${idx}"></svg>
                    <div style="font-size: 0.8rem; font-weight: bold; margin-top: 3px;">${formatCurrency(p.sellingprice)}</div>
                </div>
            `;
        });
        document.getElementById("print-barcode-modal").classList.add("active");
        setTimeout(() => {
            products.forEach((p, idx) => {
                if (p.barcode && document.getElementById("barcode-svg-" + idx)) {
                    try {
                        JsBarcode("#barcode-svg-" + idx, p.barcode, { format: "CODE128", width: 1.5, height: 40, displayValue: true, fontSize: 12 });
                    } catch(err) {}
                }
            });
        }, 200);
    }

    async function saveProduct(e) {
        e.preventDefault();
        const id = document.getElementById("product-edit-id").value;
        const barcode = document.getElementById("prod-barcode").value;
        const name = document.getElementById("prod-name").value;
        const category = document.getElementById("prod-category").value;
        const costprice = parseFloat(document.getElementById("prod-cost").value);
        const sellingprice = parseFloat(document.getElementById("prod-price").value);
        const stock = parseInt(document.getElementById("prod-stock").value);

        const productData = { barcode, name, category, costprice, sellingprice, stock, minimumstock: 5, createdat: new Date().toISOString() };

        if (id) {
            await apiFetch(`products/${id}`, "PUT", productData);
        } else {
            const res = await apiFetch("products", "POST", productData);
            await apiFetch("inventory", "POST", {
                productid: res.id, productname: name, type: "Stock In", quantity: stock,
                previousstock: 0, newstock: stock, reason: "Initial Stock", date: new Date().toISOString(), user: currentUser ? currentUser.username : "Admin"
            });
        }
        closeModals();
        refreshAllViews();
    }

    async function renderProductsTable() {
        const products = await apiFetch("products");
        const tbody = document.getElementById("products-table-tbody");
        tbody.innerHTML = "";
        const search = document.getElementById("product-search-input")?.value.toLowerCase() || "";

        products.forEach(p => {
            if (search && !p.name.toLowerCase().includes(search) && !p.barcode?.includes(search)) return;
            let statusBadge = '<span class="badge badge-success">In Stock</span>';
            if (p.stock <= 0) statusBadge = '<span class="badge badge-danger">Out of Stock</span>';
            else if (p.stock <= 5) statusBadge = '<span class="badge badge-warning">Low Stock</span>';

            tbody.innerHTML += `
                <tr>
                    <td>${p.barcode || '-'}</td>
                    <td>${p.name}</td>
                    <td>${p.category || '-'}</td>
                    <td>${formatCurrency(p.costprice)}</td>
                    <td>${formatCurrency(p.sellingprice)}</td>
                    <td>${p.stock}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="editProduct(${p.id})">Edit</button>
                        <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="deleteProduct(${p.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    async function editProduct(id) {
        const products = await apiFetch("products");
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById("product-edit-id").value = p.id;
        document.getElementById("prod-barcode").value = p.barcode || '';
        document.getElementById("prod-name").value = p.name;
        document.getElementById("prod-category").value = p.category || '';
        document.getElementById("prod-cost").value = p.costprice;
        document.getElementById("prod-price").value = p.sellingprice;
        document.getElementById("prod-stock").value = p.stock;
        document.getElementById("product-modal-title").innerText = "Edit Product";
        document.getElementById("product-modal").classList.add("active");
    }

    async function deleteProduct(id) {
        if (confirm("Delete this product?")) {
            await apiFetch(`products/${id}`, "DELETE");
            refreshAllViews();
        }
    }

    async function renderPOSProducts() {
        const products = await apiFetch("products");
        const tbody = document.getElementById("pos-product-search-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        products.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${formatCurrency(p.sellingprice)}</td>
                    <td>${p.stock}</td>
                    <td><button class="btn" style="padding:0.25rem 0.5rem; width:auto;" onclick="addToCart(${p.id})">Add</button></td>
                </tr>
            `;
        });
    }

    async function addToCart(productId, qty = 1) {
        const products = await apiFetch("products");
        const product = products.find(p => p.id === productId);
        if (!product) return;
        if (product.stock < qty) { alert("Insufficient stock!"); return; }

        const existing = cart.find(item => item.productId === productId);
        if (existing) {
            if (product.stock < existing.quantity + qty) { alert("Insufficient stock!"); return; }
            existing.quantity += qty;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                barcode: product.barcode,
                sellingPrice: Number(product.sellingprice),
                costPrice: Number(product.costprice),
                quantity: qty
            });
        }
        renderCart();
    }

    function renderCart() {
        const tbody = document.getElementById("cart-items-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemSub = item.sellingPrice * item.quantity;
            subtotal += itemSub;
            tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>
                        <button onclick="updateCartQty(${index}, -1)">-</button>
                        ${item.quantity}
                        <button onclick="updateCartQty(${index}, 1)">+</button>
                    </td>
                    <td>${formatCurrency(item.sellingPrice)}</td>
                    <td>${formatCurrency(itemSub)}</td>
                    <td><button class="btn btn-danger" style="padding:0.1rem 0.3rem; width:auto;" onclick="removeFromCart(${index})">X</button></td>
                </tr>
            `;
        });

        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        document.getElementById("cart-subtotal").innerText = formatCurrency(subtotal);
        document.getElementById("cart-tax").innerText = formatCurrency(tax);
        document.getElementById("cart-grand-total").innerText = formatCurrency(subtotal + tax);
        calculateChange();
    }

    function updateCartQty(index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        renderCart();
    }

    function removeFromCart(index) { cart.splice(index, 1); renderCart(); }

    async function handleManualBarcode() {
        const inputField = document.getElementById("manual-barcode-input");
        const code = inputField.value.trim();
        if (!code) return;
        const products = await apiFetch("products");
        const product = products.find(p => p.barcode === code);
        if (product) {
            addToCart(product.id);
            inputField.value = "";
            inputField.focus();
        } else {
            alert("Product not found: " + code);
            inputField.value = "";
            inputField.focus();
        }
    }

    function togglePaymentFields() {
        const method = document.getElementById("pos-payment-method").value;
        document.getElementById("cash-payment-fields").style.display = method === "Utang" ? "none" : "block";
        document.getElementById("utang-payment-fields").style.display = method === "Utang" ? "block" : "none";
    }

    function calculateChange() {
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        const grandTotal = subtotal + tax;
        const amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
        const change = amountPaid - grandTotal;
        const changeDisplay = document.getElementById("pos-change-display");
        if (changeDisplay) changeDisplay.innerText = formatCurrency(change >= 0 ? change : 0);
    }

    async function completeCheckout() {
        if (cart.length === 0) { alert("Cart is empty!"); return; }
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        const grandTotal = subtotal + tax;
        const paymentMethod = document.getElementById("pos-payment-method").value;
        let amountPaid = 0, change = 0;

        if (paymentMethod === "Cash") {
            amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
            if (amountPaid < grandTotal) { alert("Insufficient payment!"); return; }
            change = amountPaid - grandTotal;
        } else if (paymentMethod === "Utang") {
            const customerId = document.getElementById("pos-utang-customer").value;
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            if (!customerId) { alert("Select customer for Utang!"); return; }
            if (paidNow > grandTotal) { alert("Paid now cannot exceed total!"); return; }
            amountPaid = paidNow;
        } else {
            amountPaid = grandTotal;
        }

        const transactionNumber = "TXN-" + Date.now();
        const saleRecord = {
            transactionnumber: transactionNumber,
            items: JSON.stringify(cart),
            subtotal, tax, total: grandTotal, amountpaid: amountPaid, change,
            paymentmethod: paymentMethod,
            status: paymentMethod === "Utang" ? "Credit / Utang" : "Paid",
            cashier: currentUser ? currentUser.username : "Cashier",
            date: new Date().toISOString()
        };

        const saleRes = await apiFetch("sales", "POST", saleRecord);

        if (paymentMethod === "Utang") {
            const customerId = parseInt(document.getElementById("pos-utang-customer").value);
            const customers = await apiFetch("customers");
            const cust = customers.find(c => c.id === customerId);
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            const remaining = grandTotal - paidNow;
            const dueDate = document.getElementById("pos-utang-duedate").value || new Date().toISOString();

            await apiFetch("utang", "POST", {
                customerid: customerId,
                customername: cust ? cust.name : "Unknown",
                transactionid: saleRes.id,
                originalamount: grandTotal,
                amountpaid: paidNow,
                remainingbalance: remaining,
                status: remaining <= 0 ? "Paid" : (paidNow > 0 ? "Partially Paid" : "Unpaid"),
                datecreated: new Date().toISOString(),
                duedate: dueDate,
                paymenthistory: JSON.stringify(paidNow > 0 ? [{ date: new Date().toISOString(), amount: paidNow, method: "Cash", receivedBy: currentUser ? currentUser.username : "Cashier" }] : [])
            });
        }

        for (const item of cart) {
            const products = await apiFetch("products");
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                const prevStock = prod.stock;
                prod.stock -= item.quantity;
                await apiFetch(`products/${prod.id}`, "PUT", {
                    barcode: prod.barcode, name: prod.name, category: prod.category,
                    costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock
                });
                await apiFetch("inventory", "POST", {
                    productid: prod.id, productname: prod.name, type: "Sale", quantity: item.quantity,
                    previousstock: prevStock, newstock: prod.stock, reason: "Sold via POS (" + transactionNumber + ")", date: new Date().toISOString(), user: currentUser ? currentUser.username : "Cashier"
                });
            }
        }

        alert("Transaction complete!");
        cart = [];
        renderCart();
        if (typeof renderDashboard === 'function') refreshAllViews();
    }

    function startScanner() {
        const config = { fps: 10, qrbox: { width: 250, height: 150 } };
        html5QrCode = new Html5Qrcode("interactive");
        html5QrCode.start({ facingMode: "environment" }, config, async (decodedText) => {
            const products = await apiFetch("products");
            const product = products.find(p => p.barcode === decodedText);
            if (product) addToCart(product.id);
        }).catch(err => alert("Camera error: " + err));
    }
    function stopScanner() {
        if (html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
    }

    async function renderInventoryTable() {
        const logs = await apiFetch("inventory");
        const tbody = document.getElementById("inventory-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        logs.forEach(l => {
            tbody.innerHTML += `
                <tr>
                    <td>${new Date(l.date).toLocaleString()}</td>
                    <td>${l.productname}</td>
                    <td><span class="badge ${l.type === 'Stock In' ? 'badge-success' : 'badge-danger'}">${l.type}</span></td>
                    <td>${l.quantity}</td>
                    <td>${l.previousstock}</td>
                    <td>${l.newstock}</td>
                    <td>${l.reason || '-'}</td>
                    <td>${l.user}</td>
                </tr>
            `;
        });
    }

    async function handleStockIn(e) {
        e.preventDefault();
        const productId = parseInt(document.getElementById("stockin-product").value);
        const qty = parseInt(document.getElementById("stockin-qty").value);
        const notes = document.getElementById("stockin-notes").value;

        const products = await apiFetch("products");
        const prod = products.find(p => p.id === productId);
        if (prod) {
            const prevStock = prod.stock;
            prod.stock += qty;
            await apiFetch(`products/${prod.id}`, "PUT", {
                barcode: prod.barcode, name: prod.name, category: prod.category,
                costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock
            });
            await apiFetch("inventory", "POST", {
                productid: prod.id, productname: prod.name, type: "Stock In", quantity: qty,
                previousstock: prevStock, newstock: prod.stock, reason: notes || "Restock", date: new Date().toISOString(), user: currentUser ? currentUser.username : "Admin"
            });
            alert("Restocked successfully!");
            document.getElementById("stockin-form").reset();
            refreshAllViews();
        }
    }

    async function handleStockOut(e) {
        e.preventDefault();
        const productId = parseInt(document.getElementById("stockout-product").value);
        const qty = parseInt(document.getElementById("stockout-qty").value);
        const reason = document.getElementById("stockout-reason").value;
        const notes = document.getElementById("stockout-notes").value;

        const products = await apiFetch("products");
        const prod = products.find(p => p.id === productId);
        if (prod) {
            if (prod.stock < qty) { alert("Exceeds current stock!"); return; }
            const prevStock = prod.stock;
            prod.stock -= qty;
            await apiFetch(`products/${prod.id}`, "PUT", {
                barcode: prod.barcode, name: prod.name, category: prod.category,
                costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock
            });
            await apiFetch("inventory", "POST", {
                productid: prod.id, productname: prod.name, type: "Stock Out", quantity: qty,
                previousstock: prevStock, newstock: prod.stock, reason: reason + ": " + notes, date: new Date().toISOString(), user: currentUser ? currentUser.username : "Admin"
            });
            alert("Stock removed successfully!");
            document.getElementById("stockout-form").reset();
            refreshAllViews();
        }
    }

    async function renderSalesTable() {
        const sales = await apiFetch("sales");
        const tbody = document.getElementById("sales-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        sales.forEach(s => {
            const itemsParsed = typeof s.items === 'string' ? JSON.parse(s.items) : s.items;
            const totalQty = itemsParsed ? itemsParsed.reduce((sum, i) => sum + i.quantity, 0) : 0;
            tbody.innerHTML += `
                <tr>
                    <td>${s.transactionnumber}</td>
                    <td>${new Date(s.date).toLocaleString()}</td>
                    <td>${totalQty}</td>
                    <td>${formatCurrency(s.total)}</td>
                    <td>${formatCurrency(s.amountpaid)}</td>
                    <td>${s.paymentmethod}</td>
                    <td><span class="badge ${s.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${s.status}</span></td>
                    <td><button class="btn btn-danger" style="padding:0.25rem 0.5rem; width:auto;" onclick="voidTransaction(${s.id})">Void</button></td>
                </tr>
            `;
        });
    }

    async function voidTransaction(id) {
        if (confirm("Void transaction? Stock will be returned.")) {
            const sales = await apiFetch("sales");
            const sale = sales.find(s => s.id === id);
            if (!sale) return;
            const itemsParsed = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items;

            for (const item of itemsParsed) {
                const products = await apiFetch("products");
                const prod = products.find(p => p.id === item.productId);
                if (prod) {
                    const prevStock = prod.stock;
                    prod.stock += item.quantity;
                    await apiFetch(`products/${prod.id}`, "PUT", {
                        barcode: prod.barcode, name: prod.name, category: prod.category,
                        costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock
                    });
                    await apiFetch("inventory", "POST", {
                        productid: prod.id, productname: prod.name, type: "Stock In", quantity: item.quantity,
                        previousstock: prevStock, newstock: prod.stock, reason: "Void (" + sale.transactionnumber + ")", date: new Date().toISOString(), user: currentUser ? currentUser.username : "Admin"
                    });
                }
            }
            await apiFetch(`sales/${id}`, "DELETE");
            refreshAllViews();
        }
    }

    async function renderUtangTable() {
        const utangList = await apiFetch("utang");
        const tbody = document.getElementById("utang-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        utangList.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.customername}</td>
                    <td>${formatCurrency(u.originalamount)}</td>
                    <td>${formatCurrency(u.amountpaid)}</td>
                    <td>${formatCurrency(u.remainingbalance)}</td>
                    <td>${u.duedate ? new Date(u.duedate).toLocaleDateString() : '-'}</td>
                    <td><span class="badge ${u.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${u.status}</span></td>
                    <td>${u.remainingbalance > 0 ? '<button class="btn btn-success" style="padding:0.25rem 0.5rem; width:auto;" onclick="openUtangPaymentModal(' + u.id + ')">Pay</button>' : ''}</td>
                </tr>
            `;
        });
    }

    async function openUtangPaymentModal(id) {
        const utangList = await apiFetch("utang");
        const u = utangList.find(x => x.id === id);
        if (!u) return;
        document.getElementById("pay-utang-id").value = u.id;
        document.getElementById("pay-cust-name").innerText = u.customername;
        document.getElementById("pay-remaining-balance").innerText = formatCurrency(u.remainingbalance);
        document.getElementById("pay-amount").value = "";
        document.getElementById("utang-payment-modal").classList.add("active");
    }

    async function processUtangPayment(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("pay-utang-id").value);
        const amount = parseFloat(document.getElementById("pay-amount").value);
        const utangList = await apiFetch("utang");
        const u = utangList.find(x => x.id === id);
        if (!u || amount > u.remainingbalance) { alert("Invalid amount!"); return; }

        u.amountpaid = Number(u.amountpaid) + amount;
        u.remainingbalance = Number(u.remainingbalance) - amount;
        u.status = u.remainingbalance <= 0 ? "Paid" : "Partially Paid";

        let history = typeof u.paymenthistory === 'string' ? JSON.parse(u.paymenthistory || '[]') : (u.paymenthistory || []);
        history.push({ date: new Date().toISOString(), amount, method: "Cash", receivedBy: currentUser ? currentUser.username : "Admin" });

        await apiFetch(`utang/${u.id}`, "PUT", {
            customerid: u.customerid, customername: u.customername, transactionid: u.transactionid,
            originalamount: u.originalamount, amountpaid: u.amountpaid, remainingbalance: u.remainingbalance,
            status: u.status, datecreated: u.datecreated, duedate: u.duedate, paymenthistory: JSON.stringify(history)
        });
        closeModals();
        refreshAllViews();
    }

    function openAddCustomerModal() { document.getElementById("customer-form").reset(); document.getElementById("customer-modal").classList.add("active"); }
    async function saveCustomer(e) {
        e.preventDefault();
        await apiFetch("customers", "POST", {
            name: document.getElementById("cust-name").value,
            phone: document.getElementById("cust-phone").value,
            email: document.getElementById("cust-email").value,
            address: document.getElementById("cust-address").value,
            createdat: new Date().toISOString()
        });
        closeModals();
        refreshAllViews();
    }
    async function renderCustomersTable() {
        const customers = await apiFetch("customers");
        const tbody = document.getElementById("customers-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        customers.forEach(c => {
            tbody.innerHTML += `<tr><td>${c.name}</td><td>${c.phone || '-'}</td><td>${c.email || '-'}</td><td>${c.address || '-'}</td><td><button class="btn btn-danger" style="padding:0.25rem 0.5rem; width:auto;" onclick="deleteCustomer(${c.id})">Delete</button></td></tr>`;
        });
    }
    async function deleteCustomer(id) { if (confirm("Delete customer?")) { await apiFetch(`customers/${id}`, "DELETE"); refreshAllViews(); } }

    function openAddExpenseModal() { document.getElementById("expense-form").reset(); document.getElementById("expense-modal").classList.add("active"); }
    async function saveExpense(e) {
        e.preventDefault();
        await apiFetch("expenses", "POST", {
            name: document.getElementById("exp-name").value,
            category: document.getElementById("exp-cat").value,
            amount: parseFloat(document.getElementById("exp-amount").value),
            notes: document.getElementById("exp-notes").value,
            date: new Date().toISOString()
        });
        closeModals();
        refreshAllViews();
    }
    async function renderExpensesTable() {
        const expenses = await apiFetch("expenses");
        const tbody = document.getElementById("expenses-table-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        expenses.forEach(e => {
            tbody.innerHTML += `<tr><td>${e.name}</td><td>${e.category}</td><td>${formatCurrency(e.amount)}</td><td>${new Date(e.date).toLocaleDateString()}</td><td>${e.notes || '-'}</td></tr>`;
        });
    }

    async function saveSettings(e) {
        e.preventDefault();
        appSettings.storename = document.getElementById("setting-store-name").value;
        appSettings.storeaddress = document.getElementById("setting-store-address").value;
        appSettings.storephone = document.getElementById("setting-store-phone").value;
        appSettings.taxrate = parseFloat(document.getElementById("setting-tax-rate").value) || 0;
        appSettings.startingcash = parseFloat(document.getElementById("setting-starting-cash").value) || 0;

        await apiFetch("settings/1", "PUT", appSettings);
        alert("Settings saved!");
        loadSettings();
        refreshAllViews();
    }

    async function populateDropdowns() {
        const products = await apiFetch("products");
        const customers = await apiFetch("customers");
        const stockinSelect = document.getElementById("stockin-product");
        const stockoutSelect = document.getElementById("stockout-product");
        const utangCustSelect = document.getElementById("pos-utang-customer");

        if (stockinSelect) { stockinSelect.innerHTML = ""; products.forEach(p => stockinSelect.innerHTML += `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`); }
        if (stockoutSelect) { stockoutSelect.innerHTML = ""; products.forEach(p => stockoutSelect.innerHTML += `<option value="${p.id}">${p.name} (Stock: ${p.stock})</option>`); }
        if (utangCustSelect) { utangCustSelect.innerHTML = ""; customers.forEach(c => utangCustSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`); }
    }

    function closeModals() { document.querySelectorAll(".modal").forEach(m => m.classList.remove("active")); }
    function formatCurrency(amount) { return "₱" + parseFloat(amount || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,'); }
    </script>
</body>
</html>
`;

// ================================
// HTML TEMPLATE (CASHIER PORTAL - NO PASSWORD)
// ================================
const CASHIER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cashier POS Portal - SmartStore</title>
    <style>${EMBEDDED_CSS}
    body { height: 100vh; overflow: hidden; background: #f3f4f6; }
    .cashier-topbar { height: 60px; background: var(--dark); color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }
    .cashier-main { height: calc(100vh - 60px); padding: 1rem; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="cashier-topbar">
        <h2 id="cashier-store-title" style="font-size: 1.2rem;">SmartStore - Cashier Portal</h2>
        <div>
            <span style="font-size: 0.9rem; margin-right: 15px; color: #10b981; font-weight: bold;">● Online POS Terminal</span>
            <a href="/" class="btn btn-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.85rem; width: auto; display:inline-block;">Admin Login</a>
        </div>
    </div>

    <div class="cashier-main">
        <div class="pos-container" style="height: 100%;">
            <div class="pos-left">
                <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                    <h3>Barcode Scanner & Products</h3>
                    <div>
                        <button class="btn btn-success" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="startScanner()">Start Cam</button>
                        <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="stopScanner()">Stop Cam</button>
                    </div>
                </div>
                <div class="pos-scanner-box">
                    <div id="interactive" class="viewport"></div>
                    <div id="scanner-placeholder" style="color:#aaa; position:absolute;">Camera Preview</div>
                </div>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" id="manual-barcode-input" class="form-control" placeholder="Scan barcode or type & enter..." autofocus>
                    <button class="btn" style="width:auto;" onclick="handleManualBarcode()">Add</button>
                </div>
                <div style="flex-grow:1; overflow-y:auto;">
                    <table id="pos-product-search-table">
                        <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
                        <tbody id="pos-product-search-tbody"></tbody>
                    </table>
                </div>
            </div>
            <div class="pos-right">
                <h3>Current Cart</h3>
                <div class="cart-items-list">
                    <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Sub</th><th></th></tr></thead>
                        <tbody id="cart-items-tbody"></tbody>
                    </table>
                </div>
                <div class="cart-summary-box">
                    <div class="summary-row"><span>Subtotal:</span><span id="cart-subtotal">₱0.00</span></div>
                    <div class="summary-row"><span>Tax:</span><span id="cart-tax">₱0.00</span></div>
                    <div class="summary-row total"><span>Total:</span><span id="cart-grand-total">₱0.00</span></div>
                    <div class="form-group" style="margin-top:10px;">
                        <label>Payment Method</label>
                        <select id="pos-payment-method" class="form-control" onchange="togglePaymentFields()">
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                            <option value="Maya">Maya</option>
                            <option value="Card">Card</option>
                            <option value="Utang">Utang / Credit</option>
                        </select>
                    </div>
                    <div id="cash-payment-fields">
                        <div class="form-group"><label>Amount Paid</label><input type="number" id="pos-amount-paid" class="form-control" value="0" oninput="calculateChange()"></div>
                        <div class="summary-row"><span>Change:</span><span id="pos-change-display" style="color:var(--success);">₱0.00</span></div>
                    </div>
                    <div id="utang-payment-fields" style="display:none;">
                        <div class="form-group"><label>Customer</label><select id="pos-utang-customer" class="form-control"></select></div>
                        <div class="form-group"><label>Paid Now</label><input type="number" id="pos-utang-paid-now" class="form-control" value="0"></div>
                        <div class="form-group"><label>Due Date</label><input type="date" id="pos-utang-duedate" class="form-control"></div>
                    </div>
                    <button class="btn btn-success" style="margin-top:10px;" onclick="completeCheckout()">Complete Payment</button>
                </div>
            </div>
        </div>
    </div>

    <script>
    let cart = [];
    let appSettings = { storeName: "SmartStore POS", storeAddress: "Philippines", storePhone: "09123456789", taxRate: 0.00, startingCash: 0.00 };
    let currentUser = { username: "Cashier Terminal", role: "CASHIER" };
    let html5QrCode = null;

    window.addEventListener("DOMContentLoaded", async () => {
        await loadSettings();
        await renderPOSProducts();
        await populateDropdowns();
        setupManualBarcodeListener();
    });

    async function apiFetch(endpoint, method = "GET", data = null) {
        const options = { method, headers: { "Content-Type": "application/json" } };
        if (data) options.body = JSON.stringify(data);
        const res = await fetch("/api/" + endpoint, options);
        return await res.json();
    }

    async function loadSettings() {
        const settingsList = await apiFetch("settings");
        if (settingsList.length > 0) {
            appSettings = settingsList[0];
        }
        document.getElementById("cashier-store-title").innerText = appSettings.storename + " - Cashier Portal";
    }

    function setupManualBarcodeListener() {
        const input = document.getElementById("manual-barcode-input");
        if (input) {
            input.focus();
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualBarcode();
                }
            });
        }
    }

    async function renderPOSProducts() {
        const products = await apiFetch("products");
        const tbody = document.getElementById("pos-product-search-tbody");
        if (!tbody) return;
        tbody.innerHTML = "";
        products.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${formatCurrency(p.sellingprice)}</td>
                    <td>${p.stock}</td>
                    <td><button class="btn" style="padding:0.25rem 0.5rem; width:auto;" onclick="addToCart(${p.id})">Add</button></td>
                </tr>
            `;
        });
    }

    async function addToCart(productId, qty = 1) {
        const products = await apiFetch("products");
        const product = products.find(p => p.id === productId);
        if (!product) return;
        if (product.stock < qty) { alert("Insufficient stock!"); return; }

        const existing = cart.find(item => item.productId === productId);
        if (existing) {
            if (product.stock < existing.quantity + qty) { alert("Insufficient stock!"); return; }
            existing.quantity += qty;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                barcode: product.barcode,
                sellingPrice: Number(product.sellingprice),
                costPrice: Number(product.costprice),
                quantity: qty
            });
        }
        renderCart();
    }

    function renderCart() {
        const tbody = document.getElementById("cart-items-tbody");
        tbody.innerHTML = "";
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemSub = item.sellingPrice * item.quantity;
            subtotal += itemSub;
            tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>
                        <button onclick="updateCartQty(${index}, -1)">-</button>
                        ${item.quantity}
                        <button onclick="updateCartQty(${index}, 1)">+</button>
                    </td>
                    <td>${formatCurrency(item.sellingPrice)}</td>
                    <td>${formatCurrency(itemSub)}</td>
                    <td><button class="btn btn-danger" style="padding:0.1rem 0.3rem; width:auto;" onclick="removeFromCart(${index})">X</button></td>
                </tr>
            `;
        });

        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        document.getElementById("cart-subtotal").innerText = formatCurrency(subtotal);
        document.getElementById("cart-tax").innerText = formatCurrency(tax);
        document.getElementById("cart-grand-total").innerText = formatCurrency(subtotal + tax);
        calculateChange();
    }

    function updateCartQty(index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        renderCart();
    }

    function removeFromCart(index) { cart.splice(index, 1); renderCart(); }

    async function handleManualBarcode() {
        const inputField = document.getElementById("manual-barcode-input");
        const code = inputField.value.trim();
        if (!code) return;
        const products = await apiFetch("products");
        const product = products.find(p => p.barcode === code);
        if (product) {
            addToCart(product.id);
            inputField.value = "";
            inputField.focus();
        } else {
            alert("Product not found: " + code);
            inputField.value = "";
            inputField.focus();
        }
    }

    function togglePaymentFields() {
        const method = document.getElementById("pos-payment-method").value;
        document.getElementById("cash-payment-fields").style.display = method === "Utang" ? "none" : "block";
        document.getElementById("utang-payment-fields").style.display = method === "Utang" ? "block" : "none";
    }

    function calculateChange() {
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        const grandTotal = subtotal + tax;
        const amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
        const change = amountPaid - grandTotal;
        document.getElementById("pos-change-display").innerText = formatCurrency(change >= 0 ? change : 0);
    }

    async function completeCheckout() {
        if (cart.length === 0) { alert("Cart is empty!"); return; }
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);
        const grandTotal = subtotal + tax;
        const paymentMethod = document.getElementById("pos-payment-method").value;
        let amountPaid = 0, change = 0;

        if (paymentMethod === "Cash") {
            amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
            if (amountPaid < grandTotal) { alert("Insufficient payment!"); return; }
            change = amountPaid - grandTotal;
        } else if (paymentMethod === "Utang") {
            const customerId = document.getElementById("pos-utang-customer").value;
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            if (!customerId) { alert("Select customer for Utang!"); return; }
            if (paidNow > grandTotal) { alert("Paid now cannot exceed total!"); return; }
            amountPaid = paidNow;
        } else {
            amountPaid = grandTotal;
        }

        const transactionNumber = "TXN-" + Date.now();
        const saleRecord = {
            transactionnumber: transactionNumber,
            items: JSON.stringify(cart),
            subtotal, tax, total: grandTotal, amountpaid: amountPaid, change,
            paymentmethod: paymentMethod,
            status: paymentMethod === "Utang" ? "Credit / Utang" : "Paid",
            cashier: "Cashier Terminal",
            date: new Date().toISOString()
        };

        const saleRes = await apiFetch("sales", "POST", saleRecord);

        if (paymentMethod === "Utang") {
            const customerId = parseInt(document.getElementById("pos-utang-customer").value);
            const customers = await apiFetch("customers");
            const cust = customers.find(c => c.id === customerId);
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            const remaining = grandTotal - paidNow;
            const dueDate = document.getElementById("pos-utang-duedate").value || new Date().toISOString();

            await apiFetch("utang", "POST", {
                customerid: customerId,
                customername: cust ? cust.name : "Unknown",
                transactionid: saleRes.id,
                originalamount: grandTotal,
                amountpaid: paidNow,
                remainingbalance: remaining,
                status: remaining <= 0 ? "Paid" : (paidNow > 0 ? "Partially Paid" : "Unpaid"),
                datecreated: new Date().toISOString(),
                duedate: dueDate,
                paymenthistory: JSON.stringify(paidNow > 0 ? [{ date: new Date().toISOString(), amount: paidNow, method: "Cash", receivedBy: "Cashier Terminal" }] : [])
            });
        }

        for (const item of cart) {
            const products = await apiFetch("products");
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                const prevStock = prod.stock;
                prod.stock -= item.quantity;
                await apiFetch(`products/${prod.id}`, "PUT", {
                    barcode: prod.barcode, name: prod.name, category: prod.category,
                    costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock
                });
                await apiFetch("inventory", "POST", {
                    productid: prod.id, productname: prod.name, type: "Sale", quantity: item.quantity,
                    previousstock: prevStock, newstock: prod.stock, reason: "Sold via POS (" + transactionNumber + ")", date: new Date().toISOString(), user: "Cashier Terminal"
                });
            }
        }

        alert("Transaction complete!");
        cart = [];
        renderCart();
        renderPOSProducts();
        populateDropdowns();
        document.getElementById("manual-barcode-input").focus();
    }

    function startScanner() {
        const config = { fps: 10, qrbox: { width: 250, height: 150 } };
        html5QrCode = new Html5Qrcode("interactive");
        html5QrCode.start({ facingMode: "environment" }, config, async (decodedText) => {
            const products = await apiFetch("products");
            const product = products.find(p => p.barcode === decodedText);
            if (product) addToCart(product.id);
        }).catch(err => alert("Camera error: " + err));
    }
    function stopScanner() {
        if (html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
    }

    async function populateDropdowns() {
        const customers = await apiFetch("customers");
        const utangCustSelect = document.getElementById("pos-utang-customer");
        if (utangCustSelect) { utangCustSelect.innerHTML = ""; customers.forEach(c => utangCustSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`); }
    }

    function formatCurrency(amount) { return "₱" + parseFloat(amount || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,'); }
    </script>
</body>
</html>
`;

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(HTML_TEMPLATE);
});

app.get("/cashier", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(CASHIER_TEMPLATE);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartStore POS running on port ${PORT}`);
});
