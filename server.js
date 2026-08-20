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
                taxrate NUMERIC
            );
        `);
        
        const settingsCheck = await pool.query("SELECT * FROM settings WHERE id = 1");
        if (settingsCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO settings (id, storename, storeaddress, storephone, taxrate) 
                VALUES (1, 'SmartStore POS', 'Philippines', '09123456789', 0.00)
            `);
        }
        
        console.log("Database tables verified/created successfully.");
    } catch (err) {
        console.error("Error creating tables:", err);
    }
}

initTables();

// ================================
// REST API ENDPOINTS
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

// ================================
// HTML & FRONTEND CODE (CONCATENATED)
// ================================
const HTML_TEMPLATE = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title id="page-title">SmartStore POS & Inventory System</title>\n' +
'    <style>\n' +
'    :root {\n' +
'        --primary: #4f46e5;\n' +
'        --primary-hover: #4338ca;\n' +
'        --success: #10b981;\n' +
'        --warning: #f59e0b;\n' +
'        --danger: #ef4444;\n' +
'        --dark: #1f2937;\n' +
'        --light: #f9fafb;\n' +
'        --gray: #9ca3af;\n' +
'        --border: #e5e7eb;\n' +
'        --card-bg: #ffffff;\n' +
'        --sidebar-width: 260px;\n' +
'    }\n' +
'    * { box-sizing: border-box; margin: 0; padding: 0; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; }\n' +
'    body { background-color: #f3f4f6; color: var(--dark); height: 100vh; overflow: hidden; }\n' +
'    #app { display: flex; height: 100vh; width: 100vw; }\n' +
'    #auth-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); display: flex; justify-content: center; align-items: center; z-index: 9999; }\n' +
'    .auth-card { background: white; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }\n' +
'    .auth-card h2 { margin-bottom: 1.5rem; color: var(--dark); text-align: center; }\n' +
'    .form-group { margin-bottom: 1.25rem; }\n' +
'    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; }\n' +
'    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 1rem; }\n' +
'    .form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }\n' +
'    .btn { display: inline-block; padding: 0.75rem 1.5rem; background-color: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-align: center; width: 100%; transition: background 0.2s; }\n' +
'    .btn:hover { background-color: var(--primary-hover); }\n' +
'    .btn-success { background-color: var(--success); } .btn-success:hover { background-color: #059669; }\n' +
'    .btn-danger { background-color: var(--danger); } .btn-danger:hover { background-color: #dc2626; }\n' +
'    .btn-warning { background-color: var(--warning); color: white; } .btn-warning:hover { background-color: #d97706; }\n' +
'    .btn-secondary { background-color: #6b7280; } .btn-secondary:hover { background-color: #4b5563; }\n' +
'    aside { width: var(--sidebar-width); background: var(--dark); color: white; display: flex; flex-direction: column; height: 100%; transition: transform 0.3s ease; z-index: 100; }\n' +
'    .sidebar-header { padding: 1.5rem; font-size: 1.25rem; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 10px; }\n' +
'    .sidebar-menu { list-style: none; padding: 1rem 0; overflow-y: auto; flex-grow: 1; }\n' +
'    .sidebar-menu li a { display: flex; align-items: center; gap: 12px; padding: 0.75rem 1.5rem; color: #9ca3af; text-decoration: none; font-weight: 500; transition: all 0.2s; }\n' +
'    .sidebar-menu li a:hover, .sidebar-menu li.active a { color: white; background-color: rgba(255,255,255,0.05); border-left: 4px solid var(--primary); }\n' +
'    .main-wrapper { flex-grow: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; }\n' +
'    header.topbar { height: 70px; background: white; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 2rem; }\n' +
'    .topbar-left { display: flex; align-items: center; gap: 15px; }\n' +
'    .menu-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }\n' +
'    .user-profile { display: flex; align-items: center; gap: 10px; }\n' +
'    .views-container { flex-grow: 1; overflow-y: auto; padding: 2rem; background-color: #f3f4f6; position: relative; }\n' +
'    .view-section { display: none; }\n' +
'    .view-section.active { display: block; }\n' +
'    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }\n' +
'    .metric-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid var(--primary); }\n' +
'    .metric-card.success { border-left-color: var(--success); }\n' +
'    .metric-card.warning { border-left-color: var(--warning); }\n' +
'    .metric-card.danger { border-left-color: var(--danger); }\n' +
'    .metric-card h3 { font-size: 0.875rem; color: var(--gray); margin-bottom: 0.5rem; text-transform: uppercase; }\n' +
'    .metric-card .value { font-size: 1.5rem; font-weight: bold; color: var(--dark); }\n' +
'    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; margin-bottom: 1.5rem; }\n' +
'    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }\n' +
'    table { width: 100%; border-collapse: collapse; text-align: left; }\n' +
'    th, td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }\n' +
'    th { background-color: #f9fafb; font-weight: 600; }\n' +
'    .pos-container { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1.5rem; height: calc(100vh - 140px); }\n' +
'    .pos-left, .pos-right { background: white; border-radius: 8px; display: flex; flex-direction: column; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); height: 100%; overflow: hidden; }\n' +
'    .pos-scanner-box { background: #000; border-radius: 6px; height: 200px; position: relative; margin-bottom: 1rem; overflow: hidden; display: flex; justify-content: center; align-items: center; }\n' +
'    #interactive.viewport { width: 100%; height: 100%; position: absolute; }\n' +
'    #interactive.viewport canvas, #interactive.viewport video { width: 100%; height: 100%; object-fit: cover; }\n' +
'    .cart-items-list { flex-grow: 1; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; margin-bottom: 1rem; }\n' +
'    .cart-summary-box { background: #f9fafb; padding: 1rem; border-radius: 6px; border: 1px solid var(--border); }\n' +
'    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 1rem; }\n' +
'    .summary-row.total { font-size: 1.25rem; font-weight: bold; color: var(--primary); border-top: 1px solid var(--border); padding-top: 0.5rem; margin-top: 0.5rem; }\n' +
'    @media(max-width: 900px) {\n' +
'        aside { position: fixed; left: -260px; height: 100%; }\n' +
'        aside.mobile-open { left: 0; }\n' +
'        .menu-toggle { display: block; }\n' +
'        .pos-container { grid-template-columns: 1fr; height: auto; overflow-y: auto; }\n' +
'    }\n' +
'    .badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }\n' +
'    .badge-success { background: #d1fae5; color: #065f46; }\n' +
'    .badge-warning { background: #fef3c7; color: #92400e; }\n' +
'    .badge-danger { background: #fee2e2; color: #991b1b; }\n' +
'    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; display: none; }\n' +
'    .modal.active { display: flex; }\n' +
'    .modal-content { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }\n' +
'    </style>\n' +
'    <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>\n' +
'    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>\n' +
'</head>\n' +
'<body>\n' +
'    <!-- Login Screen -->\n' +
'    <div id="auth-screen">\n' +
'        <div class="auth-card">\n' +
'            <h2 id="login-store-title">SmartStore POS</h2>\n' +
'            <form id="login-form">\n' +
'                <div class="form-group">\n' +
'                    <label>Username</label>\n' +
'                    <input type="text" id="login-user" class="form-control" value="admin" required>\n' +
'                </div>\n' +
'                <div class="form-group">\n' +
'                    <label>Password</label>\n' +
'                    <input type="password" id="login-pass" class="form-control" value="admin123" required>\n' +
'                </div>\n' +
'                <button type="submit" class="btn">Login</button>\n' +
'            </form>\n' +
'            <div style="margin-top: 1rem; font-size: 0.8rem; color: #666; text-align: center;">\n' +
'                Admin: admin / admin123<br>Cashier Portal: cashier / cashier123\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Main App Container -->\n' +
'    <div id="app" style="display:none;">\n' +
'        <aside id="sidebar">\n' +
'            <div class="sidebar-header" id="sidebar-store-name">SmartStore</div>\n' +
'            <ul class="sidebar-menu" id="sidebar-menu-list">\n' +
'                <!-- Dynamic based on user role -->\n' +
'            </ul>\n' +
'        </aside>\n' +
'\n' +
'        <div class="main-wrapper">\n' +
'            <header class="topbar">\n' +
'                <div class="topbar-left">\n' +
'                    <button class="menu-toggle" id="menu-toggle-btn">&#9776;</button>\n' +
'                    <h2 id="current-view-title" style="font-size: 1.25rem;">Dashboard</h2>\n' +
'                </div>\n' +
'                <div class="user-profile">\n' +
'                    <span id="logged-in-user-label" style="font-weight:600;">Admin</span>\n' +
'                </div>\n' +
'            </header>\n' +
'\n' +
'            <div class="views-container">\n' +
'                <!-- DASHBOARD VIEW -->\n' +
'                <section id="dashboard-view" class="view-section active">\n' +
'                    <div class="dashboard-grid">\n' +
'                        <div class="metric-card"><h3>Total Sales Today</h3><div class="value" id="dash-total-sales">₱0.00</div></div>\n' +
'                        <div class="metric-card success"><h3>Total Orders Today</h3><div class="value" id="dash-total-orders">0</div></div>\n' +
'                        <div class="metric-card"><h3>Total Products</h3><div class="value" id="dash-total-products">0</div></div>\n' +
'                        <div class="metric-card warning"><h3>Low Stock Products</h3><div class="value" id="dash-low-stock">0</div></div>\n' +
'                        <div class="metric-card success"><h3>Today\'s Profit</h3><div class="value" id="dash-todays-profit">₱0.00</div></div>\n' +
'                        <div class="metric-card danger"><h3>Outstanding Utang</h3><div class="value" id="dash-outstanding-utang">₱0.00</div></div>\n' +
'                    </div>\n' +
'                    <div style="display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap;">\n' +
'                        <button class="btn" style="width: auto;" onclick="switchView(\'pos-view\')">Open POS</button>\n' +
'                        <button class="btn btn-success" style="width: auto;" onclick="openAddProductModal()">Add Product</button>\n' +
'                        <button class="btn btn-warning" style="width: auto;" onclick="switchView(\'stockin-view\')">Stock In</button>\n' +
'                        <button class="btn btn-danger" style="width: auto;" onclick="switchView(\'utang-view\')">View Utang</button>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- POS VIEW -->\n' +
'                <section id="pos-view" class="view-section">\n' +
'                    <div class="pos-container">\n' +
'                        <div class="pos-left">\n' +
'                            <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">\n' +
'                                <h3>Scanner & Products</h3>\n' +
'                                <div>\n' +
'                                    <button class="btn btn-success" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="startScanner()">Start Cam</button>\n' +
'                                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="stopScanner()">Stop Cam</button>\n' +
'                                </div>\n' +
'                            </div>\n' +
'                            <div class="pos-scanner-box">\n' +
'                                <div id="interactive" class="viewport"></div>\n' +
'                                <div id="scanner-placeholder" style="color:#aaa; position:absolute;">Camera Preview</div>\n' +
'                            </div>\n' +
'                            <div style="display:flex; gap:10px; margin-bottom:10px;">\n' +
'                                <input type="text" id="manual-barcode-input" class="form-control" placeholder="Scan barcode or type & enter...">\n' +
'                                <button class="btn" style="width:auto;" onclick="handleManualBarcode()">Add</button>\n' +
'                            </div>\n' +
'                            <div style="flex-grow:1; overflow-y:auto;">\n' +
'                                <table id="pos-product-search-table">\n' +
'                                    <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>\n' +
'                                    <tbody id="pos-product-search-tbody"></tbody>\n' +
'                                </table>\n' +
'                            </div>\n' +
'                        </div>\n' +
'                        <div class="pos-right">\n' +
'                            <h3>Current Cart</h3>\n' +
'                            <div class="cart-items-list">\n' +
'                                <table>\n' +
'                                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Sub</th><th></th></tr></thead>\n' +
'                                    <tbody id="cart-items-tbody"></tbody>\n' +
'                                </table>\n' +
'                            </div>\n' +
'                            <div class="cart-summary-box">\n' +
'                                <div class="summary-row"><span>Subtotal:</span><span id="cart-subtotal">₱0.00</span></div>\n' +
'                                <div class="summary-row"><span>Tax:</span><span id="cart-tax">₱0.00</span></div>\n' +
'                                <div class="summary-row total"><span>Total:</span><span id="cart-grand-total">₱0.00</span></div>\n' +
'                                <div class="form-group" style="margin-top:10px;">\n' +
'                                    <label>Payment Method</label>\n' +
'                                    <select id="pos-payment-method" class="form-control" onchange="togglePaymentFields()">\n' +
'                                        <option value="Cash">Cash</option>\n' +
'                                        <option value="GCash">GCash</option>\n' +
'                                        <option value="Maya">Maya</option>\n' +
'                                        <option value="Card">Card</option>\n' +
'                                        <option value="Utang">Utang / Credit</option>\n' +
'                                    </select>\n' +
'                                </div>\n' +
'                                <div id="cash-payment-fields">\n' +
'                                    <div class="form-group"><label>Amount Paid</label><input type="number" id="pos-amount-paid" class="form-control" value="0" oninput="calculateChange()"></div>\n' +
'                                    <div class="summary-row"><span>Change:</span><span id="pos-change-display" style="color:var(--success);">₱0.00</span></div>\n' +
'                                </div>\n' +
'                                <div id="utang-payment-fields" style="display:none;">\n' +
'                                    <div class="form-group"><label>Customer</label><select id="pos-utang-customer" class="form-control"></select></div>\n' +
'                                    <div class="form-group"><label>Paid Now</label><input type="number" id="pos-utang-paid-now" class="form-control" value="0"></div>\n' +
'                                    <div class="form-group"><label>Due Date</label><input type="date" id="pos-utang-duedate" class="form-control"></div>\n' +
'                                </div>\n' +
'                                <button class="btn btn-success" style="margin-top:10px;" onclick="completeCheckout()">Complete Payment</button>\n' +
'                            </div>\n' +
'                        </div>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- PRODUCTS VIEW -->\n' +
'                <section id="products-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <div class="card-header">\n' +
'                            <h3>Product Management</h3>\n' +
'                            <button class="btn btn-success" style="width:auto;" onclick="openAddProductModal()">Add Product</button>\n' +
'                        </div>\n' +
'                        <div style="margin-bottom: 1rem;"><input type="text" id="product-search-input" class="form-control" placeholder="Search..." oninput="renderProductsTable()"></div>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Barcode</th><th>Name</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>\n' +
'                            <tbody id="products-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- INVENTORY VIEW -->\n' +
'                <section id="inventory-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <h3>Inventory Logs</h3>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Date/Time</th><th>Product</th><th>Type</th><th>Qty</th><th>Prev</th><th>New</th><th>Reason</th><th>User</th></tr></thead>\n' +
'                            <tbody id="inventory-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- STOCK IN VIEW -->\n' +
'                <section id="stockin-view" class="view-section">\n' +
'                    <div class="card" style="max-width:600px; margin:0 auto;">\n' +
'                        <h3>Stock In / Restock</h3>\n' +
'                        <form id="stockin-form" onsubmit="handleStockIn(event)">\n' +
'                            <div class="form-group"><label>Product</label><select id="stockin-product" class="form-control" required></select></div>\n' +
'                            <div class="form-group"><label>Quantity</label><input type="number" id="stockin-qty" class="form-control" min="1" required></div>\n' +
'                            <div class="form-group"><label>Notes / Supplier</label><input type="text" id="stockin-notes" class="form-control"></div>\n' +
'                            <button type="submit" class="btn btn-success">Save Stock In</button>\n' +
'                        </form>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- STOCK OUT VIEW -->\n' +
'                <section id="stockout-view" class="view-section">\n' +
'                    <div class="card" style="max-width:600px; margin:0 auto;">\n' +
'                        <h3>Stock Out / Adjustments</h3>\n' +
'                        <form id="stockout-form" onsubmit="handleStockOut(event)">\n' +
'                            <div class="form-group"><label>Product</label><select id="stockout-product" class="form-control" required></select></div>\n' +
'                            <div class="form-group"><label>Quantity</label><input type="number" id="stockout-qty" class="form-control" min="1" required></div>\n' +
'                            <div class="form-group"><label>Reason</label>\n' +
'                                <select id="stockout-reason" class="form-control">\n' +
'                                    <option value="Damaged">Damaged</option>\n' +
'                                    <option value="Expired">Expired</option>\n' +
'                                    <option value="Lost">Lost</option>\n' +
'                                    <option value="Manual Adjustment">Manual Adjustment</option>\n' +
'                                </select>\n' +
'                            </div>\n' +
'                            <div class="form-group"><label>Notes</label><input type="text" id="stockout-notes" class="form-control"></div>\n' +
'                            <button type="submit" class="btn btn-danger">Save Stock Out</button>\n' +
'                        </form>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- SALES VIEW -->\n' +
'                <section id="sales-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <h3>Sales History</h3>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Trans #</th><th>Date/Time</th><th>Items</th><th>Total</th><th>Paid</th><th>Method</th><th>Status</th><th>Action</th></tr></thead>\n' +
'                            <tbody id="sales-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- UTANG VIEW -->\n' +
'                <section id="utang-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <h3>Utang / Credit</h3>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Customer</th><th>Original</th><th>Paid</th><th>Remaining</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>\n' +
'                            <tbody id="utang-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- CUSTOMERS VIEW -->\n' +
'                <section id="customers-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <div class="card-header">\n' +
'                            <h3>Customers</h3>\n' +
'                            <button class="btn btn-success" style="width:auto;" onclick="openAddCustomerModal()">Add Customer</button>\n' +
'                        </div>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Action</th></tr></thead>\n' +
'                            <tbody id="customers-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- EXPENSES VIEW -->\n' +
'                <section id="expenses-view" class="view-section">\n' +
'                    <div class="card">\n' +
'                        <div class="card-header">\n' +
'                            <h3>Expenses</h3>\n' +
'                            <button class="btn btn-success" style="width:auto;" onclick="openAddExpenseModal()">Add Expense</button>\n' +
'                        </div>\n' +
'                        <table>\n' +
'                            <thead><tr><th>Name</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th></tr></thead>\n' +
'                            <tbody id="expenses-table-tbody"></tbody>\n' +
'                        </table>\n' +
'                    </div>\n' +
'                </section>\n' +
'\n' +
'                <!-- SETTINGS VIEW -->\n' +
'                <section id="settings-view" class="view-section">\n' +
'                    <div class="card" style="max-width:600px; margin:0 auto;">\n' +
'                        <h3>System Settings</h3>\n' +
'                        <form id="settings-form" onsubmit="saveSettings(event)">\n' +
'                            <div class="form-group"><label>Store Name</label><input type="text" id="setting-store-name" class="form-control" required></div>\n' +
'                            <div class="form-group"><label>Store Address</label><input type="text" id="setting-store-address" class="form-control"></div>\n' +
'                            <div class="form-group"><label>Store Phone</label><input type="text" id="setting-store-phone" class="form-control"></div>\n' +
'                            <div class="form-group"><label>Tax Rate (%)</label><input type="number" step="0.01" id="setting-tax-rate" class="form-control"></div>\n' +
'                            <button type="submit" class="btn">Save Settings</button>\n' +
'                        </form>\n' +
'                    </div>\n' +
'                </section>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Modals -->\n' +
'    <div id="product-modal" class="modal">\n' +
'        <div class="modal-content">\n' +
'            <h3 id="product-modal-title">Add Product</h3>\n' +
'            <form id="product-form" onsubmit="saveProduct(event)">\n' +
'                <input type="hidden" id="product-edit-id">\n' +
'                <div class="form-group"><label>Barcode</label>\n' +
'                    <div style="display:flex; gap:10px;">\n' +
'                        <input type="text" id="prod-barcode" class="form-control" placeholder="Auto">\n' +
'                        <button type="button" class="btn" style="width:auto;" onclick="generateAutoBarcode()">Generate</button>\n' +
'                    </div>\n' +
'                </div>\n' +
'                <div class="form-group"><label>Name</label><input type="text" id="prod-name" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Category</label><input type="text" id="prod-category" class="form-control"></div>\n' +
'                <div class="form-group"><label>Cost Price</label><input type="number" step="0.01" id="prod-cost" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Selling Price</label><input type="number" step="0.01" id="prod-price" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Stock</label><input type="number" id="prod-stock" class="form-control" value="0" required></div>\n' +
'                <button type="submit" class="btn btn-success">Save Product</button>\n' +
'                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>\n' +
'            </form>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <div id="customer-modal" class="modal">\n' +
'        <div class="modal-content">\n' +
'            <h3>Add Customer</h3>\n' +
'            <form id="customer-form" onsubmit="saveCustomer(event)">\n' +
'                <div class="form-group"><label>Name</label><input type="text" id="cust-name" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Phone</label><input type="text" id="cust-phone" class="form-control"></div>\n' +
'                <div class="form-group"><label>Email</label><input type="email" id="cust-email" class="form-control"></div>\n' +
'                <div class="form-group"><label>Address</label><input type="text" id="cust-address" class="form-control"></div>\n' +
'                <button type="submit" class="btn btn-success">Save Customer</button>\n' +
'                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>\n' +
'            </form>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <div id="expense-modal" class="modal">\n' +
'        <div class="modal-content">\n' +
'            <h3>Add Expense</h3>\n' +
'            <form id="expense-form" onsubmit="saveExpense(event)">\n' +
'                <div class="form-group"><label>Name</label><input type="text" id="exp-name" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Category</label>\n' +
'                    <select id="exp-cat" class="form-control">\n' +
'                        <option value="Rent">Rent</option><option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Supplies">Supplies</option><option value="Other">Other</option>\n' +
'                    </select>\n' +
'                </div>\n' +
'                <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="exp-amount" class="form-control" required></div>\n' +
'                <div class="form-group"><label>Notes</label><input type="text" id="exp-notes" class="form-control"></div>\n' +
'                <button type="submit" class="btn btn-success">Save Expense</button>\n' +
'                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>\n' +
'            </form>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <div id="utang-payment-modal" class="modal">\n' +
'        <div class="modal-content">\n' +
'            <h3>Record Utang Payment</h3>\n' +
'            <form id="utang-pay-form" onsubmit="processUtangPayment(event)">\n' +
'                <input type="hidden" id="pay-utang-id">\n' +
'                <div class="form-group"><label>Customer: <span id="pay-cust-name"></span></label></div>\n' +
'                <div class="form-group"><label>Remaining: <span id="pay-remaining-balance"></span></label></div>\n' +
'                <div class="form-group"><label>Amount to Pay</label><input type="number" step="0.01" id="pay-amount" class="form-control" required></div>\n' +
'                <button type="submit" class="btn btn-success">Confirm Payment</button>\n' +
'                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>\n' +
'            </form>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- Barcode Print Modal -->\n' +
'    <div id="barcode-print-modal" class="modal">\n' +
'        <div class="modal-content" style="text-align: center;">\n' +
'            <h3>Print Barcode Sticker</h3>\n' +
'            <div style="margin: 20px 0; background: #fff; padding: 15px; display: inline-block; border: 1px dashed #ccc;">\n' +
'                <p id="print-prod-name" style="font-weight: bold; margin-bottom: 5px;"></p>\n' +
'                <p id="print-prod-price" style="color: #4f46e5; font-weight: bold; margin-bottom: 10px;"></p>\n' +
'                <svg id="barcode-svg"></svg>\n' +
'            </div>\n' +
'            <div>\n' +
'                <button class="btn btn-success" onclick="window.print()" style="margin-bottom: 10px;">Print Barcode</button>\n' +
'                <button class="btn btn-secondary" onclick="closeModals()">Close</button>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    <!-- CLIENT SCRIPT ENGINE -->\n' +
'    <script>\n' +
'    let currentUser = null;\n' +
'    let cart = [];\n' +
'    let appSettings = { storeName: "SmartStore POS", storeAddress: "Philippines", storePhone: "09123456789", taxRate: 0.00 };\n' +
'    let html5QrCode = null;\n' +
'\n' +
'    window.addEventListener("DOMContentLoaded", async () => {\n' +
'        await loadSettings();\n' +
'        setupAuth();\n' +
'    });\n' +
'\n' +
'    async function apiFetch(endpoint, method = "GET", data = null) {\n' +
'        const options = { method, headers: { "Content-Type": "application/json" } };\n' +
'        if (data) options.body = JSON.stringify(data);\n' +
'        const res = await fetch("/api/" + endpoint, options);\n' +
'        return await res.json();\n' +
'    }\n' +
'\n' +
'    async function loadSettings() {\n' +
'        const settingsList = await apiFetch("settings");\n' +
'        if (settingsList.length > 0) {\n' +
'            appSettings = settingsList[0];\n' +
'        }\n' +
'        document.getElementById("login-store-title").innerText = appSettings.storename;\n' +
'        document.getElementById("sidebar-store-name").innerText = appSettings.storename;\n' +
'        document.getElementById("page-title").innerText = appSettings.storename;\n' +
'        document.getElementById("setting-store-name").value = appSettings.storename;\n' +
'        document.getElementById("setting-store-address").value = appSettings.storeaddress || "";\n' +
'        document.getElementById("setting-store-phone").value = appSettings.storephone || "";\n' +
'        document.getElementById("setting-tax-rate").value = appSettings.taxrate || 0;\n' +
'    }\n' +
'\n' +
'    function setupAuth() {\n' +
'        document.getElementById("login-form").addEventListener("submit", (e) => {\n' +
'            e.preventDefault();\n' +
'            const user = document.getElementById("login-user").value;\n' +
'            const pass = document.getElementById("login-pass").value;\n' +
'\n' +
'            if (user === "admin" && pass === "admin123") {\n' +
'                currentUser = { username: user, role: "ADMIN" };\n' +
'                buildMenuForAdmin();\n' +
'                loginSuccess();\n' +
'            } else if (user === "cashier" && pass === "cashier123") {\n' +
'                currentUser = { username: user, role: "CASHIER" };\n' +
'                buildMenuForCashier();\n' +
'                loginSuccess();\n' +
'                switchView("pos-view");\n' +
'            } else {\n' +
'                alert("Invalid username or password");\n' +
'            }\n' +
'        });\n' +
'    }\n' +
'\n' +
'    function loginSuccess() {\n' +
'        document.getElementById("auth-screen").style.display = "none";\n' +
'        document.getElementById("app").style.display = "flex";\n' +
'        document.getElementById("logged-in-user-label").innerText = currentUser.username + " (" + currentUser.role + ")";\n' +
'        setupNavigation();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'\n' +
'    function buildMenuForAdmin() {\n' +
'        const menu = document.getElementById("sidebar-menu-list");\n' +
'        menu.innerHTML = \n' +
'            \'<li class="active" data-target="dashboard-view"><a href="#">Dashboard</a></li>\' +\n' +
'            \'<li data-target="pos-view"><a href="#">POS / Scanner</a></li>\' +\n' +
'            \'<li data-target="products-view"><a href="#">Products</a></li>\' +\n' +
'            \'<li data-target="inventory-view"><a href="#">Inventory</a></li>\' +\n' +
'            \'<li data-target="stockin-view"><a href="#">Stock In</a></li>\' +\n' +
'            \'<li data-target="stockout-view"><a href="#">Stock Out</a></li>\' +\n' +
'            \'<li data-target="sales-view"><a href="#">Sales</a></li>\' +\n' +
'            \'<li data-target="utang-view"><a href="#">Utang / Credit</a></li>\' +\n' +
'            \'<li data-target="customers-view"><a href="#">Customers</a></li>\' +\n' +
'            \'<li data-target="expenses-view"><a href="#">Expenses</a></li>\' +\n' +
'            \'<li data-target="settings-view"><a href="#">Settings</a></li>\' +\n' +
'            \'<li><a href="#" id="logout-btn">Logout</a></li>\';\n' +
'        rebindLogout();\n' +
'    }\n' +
'\n' +
'    function buildMenuForCashier() {\n' +
'        const menu = document.getElementById("sidebar-menu-list");\n' +
'        menu.innerHTML = \n' +
'            \'<li class="active" data-target="pos-view"><a href="#">POS / Scanner Portal</a></li>\' +\n' +
'            \'<li data-target="utang-view"><a href="#">Utang Records</a></li>\' +\n' +
'            \'<li><a href="#" id="logout-btn">Logout</a></li>\';\n' +
'        rebindLogout();\n' +
'    }\n' +
'\n' +
'    function rebindLogout() {\n' +
'        document.getElementById("logout-btn").addEventListener("click", () => {\n' +
'            currentUser = null;\n' +
'            stopScanner();\n' +
'            document.getElementById("app").style.display = "none";\n' +
'            document.getElementById("auth-screen").style.display = "flex";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    function setupNavigation() {\n' +
'        document.querySelectorAll(".sidebar-menu li[data-target]").forEach(item => {\n' +
'            const newItem = item.cloneNode(true);\n' +
'            item.parentNode.replaceChild(newItem, item);\n' +
'        });\n' +
'\n' +
'        document.querySelectorAll(".sidebar-menu li[data-target]").forEach(item => {\n' +
'            item.addEventListener("click", (e) => {\n' +
'                e.preventDefault();\n' +
'                document.querySelectorAll(".sidebar-menu li").forEach(i => i.classList.remove("active"));\n' +
'                item.classList.add("active");\n' +
'                const target = item.getAttribute("data-target");\n' +
'                document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));\n' +
'                document.getElementById(target).classList.add("active");\n' +
'                document.getElementById("current-view-title").innerText = item.innerText;\n' +
'                refreshViewData(target);\n' +
'            });\n' +
'        });\n' +
'\n' +
'        document.getElementById("menu-toggle-btn").addEventListener("click", () => {\n' +
'            document.getElementById("sidebar").classList.toggle("mobile-open");\n' +
'        });\n' +
'    }\n' +
'\n' +
'    function switchView(target) {\n' +
'        document.querySelectorAll(".sidebar-menu li").forEach(i => {\n' +
'            if (i.getAttribute("data-target") === target) i.click();\n' +
'        });\n' +
'    }\n' +
'\n' +
'    function refreshAllViews() {\n' +
'        if(currentUser && currentUser.role === "ADMIN") {\n' +
'            renderDashboard();\n' +
'            renderProductsTable();\n' +
'            renderInventoryTable();\n' +
'            renderSalesTable();\n' +
'            renderExpensesTable();\n' +
'            renderCustomersTable();\n' +
'        }\n' +
'        renderPOSProducts();\n' +
'        renderUtangTable();\n' +
'        populateDropdowns();\n' +
'    }\n' +
'\n' +
'    function refreshViewData(target) {\n' +
'        if (target === "dashboard-view") renderDashboard();\n' +
'        if (target === "products-view") renderProductsTable();\n' +
'        if (target === "pos-view") { renderPOSProducts(); populateDropdowns(); }\n' +
'        if (target === "inventory-view") renderInventoryTable();\n' +
'        if (target === "sales-view") renderSalesTable();\n' +
'        if (target === "utang-view") renderUtangTable();\n' +
'        if (target === "customers-view") renderCustomersTable();\n' +
'        if (target === "expenses-view") renderExpensesTable();\n' +
'        if (["stockin-view", "stockout-view", "pos-view"].includes(target)) populateDropdowns();\n' +
'    }\n' +
'\n' +
'    async function renderDashboard() {\n' +
'        const sales = await apiFetch("sales");\n' +
'        const products = await apiFetch("products");\n' +
'        const utang = await apiFetch("utang");\n' +
'\n' +
'        const today = new Date().toISOString().slice(0, 10);\n' +
'        let totalSalesToday = 0, totalOrdersToday = 0, todaysProfit = 0;\n' +
'\n' +
'        sales.forEach(s => {\n' +
'            if (s.date && s.date.startsWith(today)) {\n' +
'                totalSalesToday += Number(s.total);\n' +
'                totalOrdersToday++;\n' +
'                if (s.items) {\n' +
'                    const parsedItems = typeof s.items === "string" ? JSON.parse(s.items) : s.items;\n' +
'                    parsedItems.forEach(item => {\n' +
'                        todaysProfit += (Number(item.sellingPrice) - Number(item.costPrice)) * Number(item.quantity);\n' +
'                    });\n' +
'                }\n' +
'            }\n' +
'        });\n' +
'\n' +
'        let lowStockCount = products.filter(p => Number(p.stock) <= Number(p.minimumstock || 5)).length;\n' +
'        let outstandingUtang = utang.filter(u => u.status !== "Paid").reduce((sum, u) => sum + Number(u.remainingbalance), 0);\n' +
'\n' +
'        document.getElementById("dash-total-sales").innerText = formatCurrency(totalSalesToday);\n' +
'        document.getElementById("dash-total-orders").innerText = totalOrdersToday;\n' +
'        document.getElementById("dash-total-products").innerText = products.length;\n' +
'        document.getElementById("dash-low-stock").innerText = lowStockCount;\n' +
'        document.getElementById("dash-todays-profit").innerText = formatCurrency(todaysProfit);\n' +
'        document.getElementById("dash-outstanding-utang").innerText = formatCurrency(outstandingUtang);\n' +
'    }\n' +
'\n' +
'    function generateAutoBarcode() {\n' +
'        const randomNum = Math.floor(10000000000 + Math.random() * 90000000000);\n' +
'        document.getElementById("prod-barcode").value = "2" + randomNum.toString().substring(0, 11);\n' +
'    }\n' +
'\n' +
'    function openAddProductModal() {\n' +
'        document.getElementById("product-form").reset();\n' +
'        document.getElementById("product-edit-id").value = "";\n' +
'        document.getElementById("product-modal-title").innerText = "Add Product";\n' +
'        generateAutoBarcode();\n' +
'        document.getElementById("product-modal").classList.add("active");\n' +
'    }\n' +
'\n' +
'    async function saveProduct(e) {\n' +
'        e.preventDefault();\n' +
'        const id = document.getElementById("product-edit-id").value;\n' +
'        const barcode = document.getElementById("prod-barcode").value;\n' +
'        const name = document.getElementById("prod-name").value;\n' +
'        const category = document.getElementById("prod-category").value;\n' +
'        const costprice = parseFloat(document.getElementById("prod-cost").value);\n' +
'        const sellingprice = parseFloat(document.getElementById("prod-price").value);\n' +
'        const stock = parseInt(document.getElementById("prod-stock").value);\n' +
'\n' +
'        const productData = { barcode, name, category, costprice, sellingprice, stock, minimumstock: 5, createdat: new Date().toISOString() };\n' +
'\n' +
'        if (id) {\n' +
'            await apiFetch("products/" + id, "PUT", productData);\n' +
'        } else {\n' +
'            const res = await apiFetch("products", "POST", productData);\n' +
'            await apiFetch("inventory", "POST", {\n' +
'                productid: res.id, productname: name, type: "Stock In", quantity: stock,\n' +
'                previousstock: 0, newstock: stock, reason: "Initial Stock", date: new Date().toISOString(), user: currentUser.username\n' +
'            });\n' +
'        }\n' +
'        closeModals();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'\n' +
'    async function renderProductsTable() {\n' +
'        const products = await apiFetch("products");\n' +
'        const tbody = document.getElementById("products-table-tbody");\n' +
'        tbody.innerHTML = "";\n' +
'        const search = document.getElementById("product-search-input")?.value.toLowerCase() || "";\n' +
'\n' +
'        products.forEach(p => {\n' +
'            if (search && !p.name.toLowerCase().includes(search) && !p.barcode?.includes(search)) return;\n' +
'            let statusBadge = \'<span class="badge badge-success">In Stock</span>\';\n' +
'            if (p.stock <= 0) statusBadge = \'<span class="badge badge-danger">Out of Stock</span>\';\n' +
'            else if (p.stock <= 5) statusBadge = \'<span class="badge badge-warning">Low Stock</span>\';\n' +
'\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + (p.barcode || "-") + "</td>" +\n' +
'                "<td>" + p.name + "</td>" +\n' +
'                "<td>" + (p.category || "-") + "</td>" +\n' +
'                "<td>" + formatCurrency(p.costprice) + "</td>" +\n' +
'                "<td>" + formatCurrency(p.sellingprice) + "</td>" +\n' +
'                "<td>" + p.stock + "</td>" +\n' +
'                "<td>" + statusBadge + "</td>" +\n' +
'                "<td>" +\n' +
'                "<button class=\'btn\' style=\'padding:0.25rem 0.5rem; font-size:0.8rem; width:auto; background:#10b981;\' onclick=\\'openPrintBarcode(\\\"" + (p.barcode || "") + "\\\", \\\"" + p.name.replace(/'/g, "\\\\'") + "\\\", " + p.sellingprice + ")\\'>Barcode</button> " +\n' +
'                "<button class=\'btn\' style=\'padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;\' onclick=\'editProduct(" + p.id + ")\'>Edit</button> " +\n' +
'                "<button class=\'btn btn-danger\' style=\'padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;\' onclick=\'deleteProduct(" + p.id + ")\'>Del</button>" +\n' +
'                "</td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    function openPrintBarcode(barcode, name, price) {\n' +
'        if (!barcode) { alert("This product has no barcode!"); return; }\n' +
'        document.getElementById("print-prod-name").innerText = name;\n' +
'        document.getElementById("print-prod-price").innerText = formatCurrency(price);\n' +
'        document.getElementById("barcode-print-modal").classList.add("active");\n' +
'        try {\n' +
'            JsBarcode("#barcode-svg", barcode, {\n' +
'                format: "CODE128",\n' +
'                lineColor: "#000",\n' +
'                width: 2,\n' +
'                height: 60,\n' +
'                displayValue: true\n' +
'            });\n' +
'        } catch (err) {\n' +
'            console.error("Barcode generation error:", err);\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function editProduct(id) {\n' +
'        const products = await apiFetch("products");\n' +
'        const p = products.find(x => x.id === id);\n' +
'        if (!p) return;\n' +
'        document.getElementById("product-edit-id").value = p.id;\n' +
'        document.getElementById("prod-barcode").value = p.barcode || "";\n' +
'        document.getElementById("prod-name").value = p.name;\n' +
'        document.getElementById("prod-category").value = p.category || "";\n' +
'        document.getElementById("prod-cost").value = p.costprice;\n' +
'        document.getElementById("prod-price").value = p.sellingprice;\n' +
'        document.getElementById("prod-stock").value = p.stock;\n' +
'        document.getElementById("product-modal-title").innerText = "Edit Product";\n' +
'        document.getElementById("product-modal").classList.add("active");\n' +
'    }\n' +
'\n' +
'    async function deleteProduct(id) {\n' +
'        if (confirm("Delete this product?")) {\n' +
'            await apiFetch("products/" + id, "DELETE");\n' +
'            refreshAllViews();\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function renderPOSProducts() {\n' +
'        const products = await apiFetch("products");\n' +
'        const tbody = document.getElementById("pos-product-search-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        products.forEach(p => {\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + p.name + "</td>" +\n' +
'                "<td>" + formatCurrency(p.sellingprice) + "</td>" +\n' +
'                "<td>" + p.stock + "</td>" +\n' +
'                "<td><button class=\'btn\' style=\'padding:0.25rem 0.5rem; width:auto;\' onclick=\'addToCart(" + p.id + ")\'>Add</button></td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    async function addToCart(productId, qty = 1) {\n' +
'        const products = await apiFetch("products");\n' +
'        const product = products.find(p => p.id === productId);\n' +
'        if (!product) return;\n' +
'        if (product.stock < qty) { alert("Insufficient stock!"); return; }\n' +
'\n' +
'        const existing = cart.find(item => item.productId === productId);\n' +
'        if (existing) {\n' +
'            if (product.stock < existing.quantity + qty) { alert("Insufficient stock!"); return; }\n' +
'            existing.quantity += qty;\n' +
'        } else {\n' +
'            cart.push({\n' +
'                productId: product.id,\n' +
'                name: product.name,\n' +
'                barcode: product.barcode,\n' +
'                sellingPrice: Number(product.sellingprice),\n' +
'                costPrice: Number(product.costprice),\n' +
'                quantity: qty\n' +
'            });\n' +
'        }\n' +
'        renderCart();\n' +
'    }\n' +
'\n' +
'    function renderCart() {\n' +
'        const tbody = document.getElementById("cart-items-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        let subtotal = 0;\n' +
'\n' +
'        cart.forEach((item, index) => {\n' +
'            const itemSub = item.sellingPrice * item.quantity;\n' +
'            subtotal += itemSub;\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + item.name + "</td>" +\n' +
'                "<td><button onclick=\'updateCartQty(" + index + ", -1)\'>-</button> " + item.quantity + " <button onclick=\'updateCartQty(" + index + ", 1)\'>+</button></td>" +\n' +
'                "<td>" + formatCurrency(item.sellingPrice) + "</td>" +\n' +
'                "<td>" + formatCurrency(itemSub) + "</td>" +\n' +
'                "<td><button class=\'btn btn-danger\' style=\'padding:0.1rem 0.3rem; width:auto;\' onclick=\'removeFromCart(" + index + ")\'>X</button></td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'\n' +
'        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);\n' +
'        document.getElementById("cart-subtotal").innerText = formatCurrency(subtotal);\n' +
'        document.getElementById("cart-tax").innerText = formatCurrency(tax);\n' +
'        document.getElementById("cart-grand-total").innerText = formatCurrency(subtotal + tax);\n' +
'        calculateChange();\n' +
'    }\n' +
'\n' +
'    function updateCartQty(index, delta) {\n' +
'        cart[index].quantity += delta;\n' +
'        if (cart[index].quantity <= 0) cart.splice(index, 1);\n' +
'        renderCart();\n' +
'    }\n' +
'\n' +
'    function removeFromCart(index) { cart.splice(index, 1); renderCart(); }\n' +
'\n' +
'    async function handleManualBarcode() {\n' +
'        const code = document.getElementById("manual-barcode-input").value.trim();\n' +
'        if (!code) return;\n' +
'        const products = await apiFetch("products");\n' +
'        const product = products.find(p => p.barcode === code);\n' +
'        if (product) {\n' +
'            addToCart(product.id);\n' +
'            document.getElementById("manual-barcode-input").value = "";\n' +
'        } else {\n' +
'            alert("Product not found: " + code);\n' +
'        }\n' +
'    }\n' +
'\n' +
'    function togglePaymentFields() {\n' +
'        const method = document.getElementById("pos-payment-method").value;\n' +
'        document.getElementById("cash-payment-fields").style.display = method === "Utang" ? "none" : "block";\n' +
'        document.getElementById("utang-payment-fields").style.display = method === "Utang" ? "block" : "none";\n' +
'    }\n' +
'\n' +
'    function calculateChange() {\n' +
'        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);\n' +
'        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);\n' +
'        const grandTotal = subtotal + tax;\n' +
'        const amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;\n' +
'        const change = amountPaid - grandTotal;\n' +
'        document.getElementById("pos-change-display").innerText = formatCurrency(change >= 0 ? change : 0);\n' +
'    }\n' +
'\n' +
'    async function completeCheckout() {\n' +
'        if (cart.length === 0) { alert("Cart is empty!"); return; }\n' +
'        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);\n' +
'        const tax = subtotal * (Number(appSettings.taxrate || 0) / 100);\n' +
'        const grandTotal = subtotal + tax;\n' +
'        const paymentMethod = document.getElementById("pos-payment-method").value;\n' +
'        let amountPaid = 0, change = 0;\n' +
'\n' +
'        if (paymentMethod === "Cash") {\n' +
'            amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;\n' +
'            if (amountPaid < grandTotal) { alert("Insufficient payment!"); return; }\n' +
'            change = amountPaid - grandTotal;\n' +
'        } else if (paymentMethod === "Utang") {\n' +
'            const customerId = document.getElementById("pos-utang-customer").value;\n' +
'            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;\n' +
'            if (!customerId) { alert("Select customer for Utang!"); return; }\n' +
'            if (paidNow > grandTotal) { alert("Paid now cannot exceed total!"); return; }\n' +
'            amountPaid = paidNow;\n' +
'        } else {\n' +
'            amountPaid = grandTotal;\n' +
'        }\n' +
'\n' +
'        const transactionNumber = "TXN-" + Date.now();\n' +
'        const saleRecord = {\n' +
'            transactionnumber: transactionNumber,\n' +
'            items: JSON.stringify(cart),\n' +
'            subtotal, tax, total: grandTotal, amountpaid: amountPaid, change,\n' +
'            paymentmethod: paymentMethod,\n' +
'            status: paymentMethod === "Utang" ? "Credit / Utang" : "Paid",\n' +
'            cashier: currentUser.username,\n' +
'            date: new Date().toISOString()\n' +
'        };\n' +
'\n' +
'        const saleRes = await apiFetch("sales", "POST", saleRecord);\n' +
'\n' +
'        if (paymentMethod === "Utang") {\n' +
'            const customerId = parseInt(document.getElementById("pos-utang-customer").value);\n' +
'            const customers = await apiFetch("customers");\n' +
'            const cust = customers.find(c => c.id === customerId);\n' +
'            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;\n' +
'            const remaining = grandTotal - paidNow;\n' +
'            const dueDate = document.getElementById("pos-utang-duedate").value || new Date().toISOString();\n' +
'\n' +
'            await apiFetch("utang", "POST", {\n' +
'                customerid: customerId,\n' +
'                customername: cust ? cust.name : "Unknown",\n' +
'                transactionid: saleRes.id,\n' +
'                originalamount: grandTotal,\n' +
'                amountpaid: paidNow,\n' +
'                remainingbalance: remaining,\n' +
'                status: remaining <= 0 ? "Paid" : (paidNow > 0 ? "Partially Paid" : "Unpaid"),\n' +
'                datecreated: new Date().toISOString(),\n' +
'                duedate: dueDate,\n' +
'                paymenthistory: JSON.stringify(paidNow > 0 ? [{ date: new Date().toISOString(), amount: paidNow, method: "Cash", receivedBy: currentUser.username }] : [])\n' +
'            });\n' +
'        }\n' +
'\n' +
'        for (const item of cart) {\n' +
'            const products = await apiFetch("products");\n' +
'            const prod = products.find(p => p.id === item.productId);\n' +
'            if (prod) {\n' +
'                const prevStock = prod.stock;\n' +
'                prod.stock -= item.quantity;\n' +
'                await apiFetch("products/" + prod.id, "PUT", {\n' +
'                    barcode: prod.barcode, name: prod.name, category: prod.category,\n' +
'                    costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock\n' +
'                });\n' +
'                await apiFetch("inventory", "POST", {\n' +
'                    productid: prod.id, productname: prod.name, type: "Sale", quantity: item.quantity,\n' +
'                    previousstock: prevStock, newstock: prod.stock, reason: "Sold via POS (" + transactionNumber + ")", date: new Date().toISOString(), user: currentUser.username\n' +
'                });\n' +
'            }\n' +
'        }\n' +
'\n' +
'        alert("Transaction complete!");\n' +
'        cart = [];\n' +
'        renderCart();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'\n' +
'    function startScanner() {\n' +
'        const config = { fps: 10, qrbox: { width: 250, height: 150 } };\n' +
'        html5QrCode = new Html5Qrcode("interactive");\n' +
'        html5QrCode.start({ facingMode: "environment" }, config, async (decodedText) => {\n' +
'            const products = await apiFetch("products");\n' +
'            const product = products.find(p => p.barcode === decodedText);\n' +
'            if (product) addToCart(product.id);\n' +
'        }).catch(err => alert("Camera error: " + err));\n' +
'    }\n' +
'    function stopScanner() {\n' +
'        if (html5QrCode) {\n' +
'            html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});\n' +
'            html5QrCode = null;\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function renderInventoryTable() {\n' +
'        const logs = await apiFetch("inventory");\n' +
'        const tbody = document.getElementById("inventory-table-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        logs.forEach(l => {\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + new Date(l.date).toLocaleString() + "</td>" +\n' +
'                "<td>" + l.productname + "</td>" +\n' +
'                "<td><span class=\'badge " + (l.type === "Stock In" ? "badge-success" : "badge-danger") + "\'>" + l.type + "</span></td>" +\n' +
'                "<td>" + l.quantity + "</td>" +\n' +
'                "<td>" + l.previousstock + "</td>" +\n' +
'                "<td>" + l.newstock + "</td>" +\n' +
'                "<td>" + (l.reason || "-") + "</td>" +\n' +
'                "<td>" + l.user + "</td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    async function handleStockIn(e) {\n' +
'        e.preventDefault();\n' +
'        const productId = parseInt(document.getElementById("stockin-product").value);\n' +
'        const qty = parseInt(document.getElementById("stockin-qty").value);\n' +
'        const notes = document.getElementById("stockin-notes").value;\n' +
'\n' +
'        const products = await apiFetch("products");\n' +
'        const prod = products.find(p => p.id === productId);\n' +
'        if (prod) {\n' +
'            const prevStock = prod.stock;\n' +
'            prod.stock += qty;\n' +
'            await apiFetch("products/" + prod.id, "PUT", {\n' +
'                barcode: prod.barcode, name: prod.name, category: prod.category,\n' +
'                costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock\n' +
'            });\n' +
'            await apiFetch("inventory", "POST", {\n' +
'                productid: prod.id, productname: prod.name, type: "Stock In", quantity: qty,\n' +
'                previousstock: prevStock, newstock: prod.stock, reason: notes || "Restock", date: new Date().toISOString(), user: currentUser.username\n' +
'            });\n' +
'            alert("Restocked successfully!");\n' +
'            document.getElementById("stockin-form").reset();\n' +
'            refreshAllViews();\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function handleStockOut(e) {\n' +
'        e.preventDefault();\n' +
'        const productId = parseInt(document.getElementById("stockout-product").value);\n' +
'        const qty = parseInt(document.getElementById("stockout-qty").value);\n' +
'        const reason = document.getElementById("stockout-reason").value;\n' +
'        const notes = document.getElementById("stockout-notes").value;\n' +
'\n' +
'        const products = await apiFetch("products");\n' +
'        const prod = products.find(p => p.id === productId);\n' +
'        if (prod) {\n' +
'            if (prod.stock < qty) { alert("Exceeds current stock!"); return; }\n' +
'            const prevStock = prod.stock;\n' +
'            prod.stock -= qty;\n' +
'            await apiFetch("products/" + prod.id, "PUT", {\n' +
'                barcode: prod.barcode, name: prod.name, category: prod.category,\n' +
'                costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock\n' +
'            });\n' +
'            await apiFetch("inventory", "POST", {\n' +
'                productid: prod.id, productname: prod.name, type: "Stock Out", quantity: qty,\n' +
'                previousstock: prevStock, newstock: prod.stock, reason: reason + ": " + notes, date: new Date().toISOString(), user: currentUser.username\n' +
'            });\n' +
'            alert("Stock removed successfully!");\n' +
'            document.getElementById("stockout-form").reset();\n' +
'            refreshAllViews();\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function renderSalesTable() {\n' +
'        const sales = await apiFetch("sales");\n' +
'        const tbody = document.getElementById("sales-table-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        sales.forEach(s => {\n' +
'            const itemsParsed = typeof s.items === "string" ? JSON.parse(s.items) : s.items;\n' +
'            const totalQty = itemsParsed ? itemsParsed.reduce((sum, i) => sum + i.quantity, 0) : 0;\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + s.transactionnumber + "</td>" +\n' +
'                "<td>" + new Date(s.date).toLocaleString() + "</td>" +\n' +
'                "<td>" + totalQty + "</td>" +\n' +
'                "<td>" + formatCurrency(s.total) + "</td>" +\n' +
'                "<td>" + formatCurrency(s.amountpaid) + "</td>" +\n' +
'                "<td>" + s.paymentmethod + "</td>" +\n' +
'                "<td><span class=\'badge " + (s.status === "Paid" ? "badge-success" : "badge-warning") + "\'>" + s.status + "</span></td>" +\n' +
'                "<td><button class=\'btn btn-danger\' style=\'padding:0.25rem 0.5rem; width:auto;\' onclick=\'voidTransaction(" + s.id + ")\'>Void</button></td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    async function voidTransaction(id) {\n' +
'        if (confirm("Void transaction? Stock will be returned.")) {\n' +
'            const sales = await apiFetch("sales");\n' +
'            const sale = sales.find(s => s.id === id);\n' +
'            if (!sale) return;\n' +
'            const itemsParsed = typeof sale.items === "string" ? JSON.parse(sale.items) : sale.items;\n' +
'\n' +
'            for (const item of itemsParsed) {\n' +
'                const products = await apiFetch("products");\n' +
'                const prod = products.find(p => p.id === item.productId);\n' +
'                if (prod) {\n' +
'                    const prevStock = prod.stock;\n' +
'                    prod.stock += item.quantity;\n' +
'                    await apiFetch("products/" + prod.id, "PUT", {\n' +
'                        barcode: prod.barcode, name: prod.name, category: prod.category,\n' +
'                        costprice: prod.costprice, sellingprice: prod.sellingprice, stock: prod.stock, minimumstock: prod.minimumstock\n' +
'                    });\n' +
'                    await apiFetch("inventory", "POST", {\n' +
'                        productid: prod.id, productname: prod.name, type: "Stock In", quantity: item.quantity,\n' +
'                        previousstock: prevStock, newstock: prod.stock, reason: "Void (" + sale.transactionnumber + ")", date: new Date().toISOString(), user: currentUser.username\n' +
'                    });\n' +
'                }\n' +
'            }\n' +
'            await apiFetch("sales/" + id, "DELETE");\n' +
'            refreshAllViews();\n' +
'        }\n' +
'    }\n' +
'\n' +
'    async function renderUtangTable() {\n' +
'        const utangList = await apiFetch("utang");\n' +
'        const tbody = document.getElementById("utang-table-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        utangList.forEach(u => {\n' +
'            tbody.innerHTML += \n' +
'                "<tr>" +\n' +
'                "<td>" + u.customername + "</td>" +\n' +
'                "<td>" + formatCurrency(u.originalamount) + "</td>" +\n' +
'                "<td>" + formatCurrency(u.amountpaid) + "</td>" +\n' +
'                "<td>" + formatCurrency(u.remainingbalance) + "</td>" +\n' +
'                "<td>" + (u.duedate ? new Date(u.duedate).toLocaleDateString() : "-") + "</td>" +\n' +
'                "<td><span class=\'badge " + (u.status === "Paid" ? "badge-success" : "badge-warning") + "\'>" + u.status + "</span></td>" +\n' +
'                "<td>" + (u.remainingbalance > 0 ? "<button class=\'btn btn-success\' style=\'padding:0.25rem 0.5rem; width:auto;\' onclick=\'openUtangPaymentModal(" + u.id + ")\'>Pay</button>" : "") + "</td>" +\n' +
'                "</tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    async function openUtangPaymentModal(id) {\n' +
'        const utangList = await apiFetch("utang");\n' +
'        const u = utangList.find(x => x.id === id);\n' +
'        if (!u) return;\n' +
'        document.getElementById("pay-utang-id").value = u.id;\n' +
'        document.getElementById("pay-cust-name").innerText = u.customername;\n' +
'        document.getElementById("pay-remaining-balance").innerText = formatCurrency(u.remainingbalance);\n' +
'        document.getElementById("pay-amount").value = "";\n' +
'        document.getElementById("utang-payment-modal").classList.add("active");\n' +
'    }\n' +
'\n' +
'    async function processUtangPayment(e) {\n' +
'        e.preventDefault();\n' +
'        const id = parseInt(document.getElementById("pay-utang-id").value);\n' +
'        const amount = parseFloat(document.getElementById("pay-amount").value);\n' +
'        const utangList = await apiFetch("utang");\n' +
'        const u = utangList.find(x => x.id === id);\n' +
'        if (!u || amount > u.remainingbalance) { alert("Invalid amount!"); return; }\n' +
'\n' +
'        u.amountpaid = Number(u.amountpaid) + amount;\n' +
'        u.remainingbalance = Number(u.remainingbalance) - amount;\n' +
'        u.status = u.remainingbalance <= 0 ? "Paid" : "Partially Paid";\n' +
'\n' +
'        let history = typeof u.paymenthistory === "string" ? JSON.parse(u.paymenthistory || "[]") : (u.paymenthistory || []);\n' +
'        history.push({ date: new Date().toISOString(), amount, method: "Cash", receivedBy: currentUser.username });\n' +
'\n' +
'        await apiFetch("utang/" + u.id, "PUT", {\n' +
'            customerid: u.customerid, customername: u.customername, transactionid: u.transactionid,\n' +
'            originalamount: u.originalamount, amountpaid: u.amountpaid, remainingbalance: u.remainingbalance,\n' +
'            status: u.status, datecreated: u.datecreated, duedate: u.duedate, paymenthistory: JSON.stringify(history)\n' +
'        });\n' +
'        closeModals();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'\n' +
'    function openAddCustomerModal() { document.getElementById("customer-form").reset(); document.getElementById("customer-modal").classList.add("active"); }\n' +
'    async function saveCustomer(e) {\n' +
'        e.preventDefault();\n' +
'        await apiFetch("customers", "POST", {\n' +
'            name: document.getElementById("cust-name").value,\n' +
'            phone: document.getElementById("cust-phone").value,\n' +
'            email: document.getElementById("cust-email").value,\n' +
'            address: document.getElementById("cust-address").value,\n' +
'            createdat: new Date().toISOString()\n' +
'        });\n' +
'        closeModals();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'    async function renderCustomersTable() {\n' +
'        const customers = await apiFetch("customers");\n' +
'        const tbody = document.getElementById("customers-table-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        customers.forEach(c => {\n' +
'            tbody.innerHTML += "<tr><td>" + c.name + "</td><td>" + (c.phone || "-") + "</td><td>" + (c.email || "-") + "</td><td>" + (c.address || "-") + "</td><td><button class=\'btn btn-danger\' style=\'padding:0.25rem 0.5rem; width:auto;\' onclick=\'deleteCustomer(" + c.id + ")\'>Delete</button></td></tr>";\n' +
'        });\n' +
'    }\n' +
'    async function deleteCustomer(id) { if (confirm("Delete customer?")) { await apiFetch("customers/" + id, "DELETE"); refreshAllViews(); } }\n' +
'\n' +
'    function openAddExpenseModal() { document.getElementById("expense-form").reset(); document.getElementById("expense-modal").classList.add("active"); }\n' +
'    async function saveExpense(e) {\n' +
'        e.preventDefault();\n' +
'        await apiFetch("expenses", "POST", {\n' +
'            name: document.getElementById("exp-name").value,\n' +
'            category: document.getElementById("exp-cat").value,\n' +
'            amount: parseFloat(document.getElementById("exp-amount").value),\n' +
'            notes: document.getElementById("exp-notes").value,\n' +
'            date: new Date().toISOString()\n' +
'        });\n' +
'        closeModals();\n' +
'        refreshAllViews();\n' +
'    }\n' +
'    async function renderExpensesTable() {\n' +
'        const expenses = await apiFetch("expenses");\n' +
'        const tbody = document.getElementById("expenses-table-tbody");\n' +
'        if (!tbody) return;\n' +
'        tbody.innerHTML = "";\n' +
'        expenses.forEach(e => {\n' +
'            tbody.innerHTML += "<tr><td>" + e.name + "</td><td>" + e.category + "</td><td>" + formatCurrency(e.amount) + "</td><td>" + new Date(e.date).toLocaleDateString() + "</td><td>" + (e.notes || "-") + "</td></tr>";\n' +
'        });\n' +
'    }\n' +
'\n' +
'    async function saveSettings(e) {\n' +
'        e.preventDefault();\n' +
'        appSettings.storename = document.getElementById("setting-store-name").value;\n' +
'        appSettings.storeaddress = document.getElementById("setting-store-address").value;\n' +
'        appSettings.storephone = document.getElementById("setting-store-phone").value;\n' +
'        appSettings.taxrate = parseFloat(document.getElementById("setting-tax-rate").value) || 0;\n' +
'\n' +
'        await apiFetch("settings/1", "PUT", appSettings);\n' +
'        alert("Settings saved!");\n' +
'        loadSettings();\n' +
'    }\n' +
'\n' +
'    async function populateDropdowns() {\n' +
'        const products = await apiFetch("products");\n' +
'        const customers = await apiFetch("customers");\n' +
'        const stockinSelect = document.getElementById("stockin-product");\n' +
'        const stockoutSelect = document.getElementById("stockout-product");\n' +
'        const utangCustSelect = document.getElementById("pos-utang-customer");\n' +
'\n' +
'        if (stockinSelect) { stockinSelect.innerHTML = ""; products.forEach(p => stockinSelect.innerHTML += "<option value=\'" + p.id + "\'>" + p.name + " (Stock: " + p.stock + ")</option>"); }\n' +
'        if (stockoutSelect) { stockoutSelect.innerHTML = ""; products.forEach(p => stockoutSelect.innerHTML += "<option value=\'" + p.id + "\'>" + p.name + " (Stock: " + p.stock + ")</option>"); }\n' +
'        if (utangCustSelect) { utangCustSelect.innerHTML = ""; customers.forEach(c => utangCustSelect.innerHTML += "<option value=\'" + c.id + "\'>" + c.name + "</option>"); }\n' +
'    }\n' +
'\n' +
'    function closeModals() { document.querySelectorAll(".modal").forEach(m => m.classList.remove("active")); }\n' +
'    function formatCurrency(amount) { return "₱" + parseFloat(amount || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, "$&,"); }\n' +
'    </script>\n' +
'</body>\n' +
'</html>';

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(HTML_TEMPLATE);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartStore POS running on port ${PORT}`);
});
