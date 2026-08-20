// ================================
// SERVER CONFIGURATION
// ================================
const express = require("express");
const path = require("path");

// ================================
// EXPRESS SERVER
// ================================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve the single file application
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(HTML_TEMPLATE);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartStore POS & Inventory System running on port ${PORT}`);
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

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #f3f4f6;
    color: var(--dark);
    height: 100vh;
    overflow: hidden;
}

#app {
    display: flex;
    height: 100vh;
    width: 100vw;
}

/* Auth Screen */
#auth-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.auth-card {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.auth-card h2 {
    margin-bottom: 1.5rem;
    color: var(--dark);
    text-align: center;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
}

.form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 1rem;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    text-align: center;
    width: 100%;
    transition: background 0.2s;
}

.btn:hover {
    background-color: var(--primary-hover);
}

.btn-success { background-color: var(--success); }
.btn-success:hover { background-color: #059669; }
.btn-danger { background-color: var(--danger); }
.btn-danger:hover { background-color: #dc2626; }
.btn-warning { background-color: var(--warning); color: white; }
.btn-warning:hover { background-color: #d97706; }
.btn-secondary { background-color: #6b7280; }
.btn-secondary:hover { background-color: #4b5563; }

/* Sidebar Navigation */
aside {
    width: var(--sidebar-width);
    background: var(--dark);
    color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.3s ease;
    z-index: 100;
}

.sidebar-header {
    padding: 1.5rem;
    font-size: 1.25rem;
    font-weight: bold;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar-menu {
    list-style: none;
    padding: 1rem 0;
    overflow-y: auto;
    flex-grow: 1;
}

.sidebar-menu li a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.75rem 1.5rem;
    color: #9ca3af;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
}

.sidebar-menu li a:hover, .sidebar-menu li.active a {
    color: white;
    background-color: rgba(255,255,255,0.05);
    border-left: 4px solid var(--primary);
}

/* Main Content Wrapper */
.main-wrapper {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

header.topbar {
    height: 70px;
    background: white;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Views Container */
.views-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem;
    background-color: #f3f4f6;
    position: relative;
}

.view-section {
    display: none;
}

.view-section.active {
    display: block;
}

/* Dashboard Grid */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid var(--primary);
}

.metric-card.success { border-left-color: var(--success); }
.metric-card.warning { border-left-color: var(--warning); }
.metric-card.danger { border-left-color: var(--danger); }

.metric-card h3 {
    font-size: 0.875rem;
    color: var(--gray);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.metric-card .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--dark);
}

/* Tables & Lists */
.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}

th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.95rem;
}

th {
    background-color: #f9fafb;
    font-weight: 600;
}

/* POS Layout */
.pos-container {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 1.5rem;
    height: calc(100vh - 140px);
}

.pos-left, .pos-right {
    background: white;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    height: 100%;
    overflow: hidden;
}

.pos-scanner-box {
    background: #000;
    border-radius: 6px;
    height: 200px;
    position: relative;
    margin-bottom: 1rem;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

#interactive.viewport {
    width: 100%;
    height: 100%;
    position: absolute;
}
#interactive.viewport canvas, #interactive.viewport video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cart-items-list {
    flex-grow: 1;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-bottom: 1rem;
}

.cart-summary-box {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid var(--border);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.summary-row.total {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--primary);
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
    margin-top: 0.5rem;
}

/* Responsive Utilities */
@media(max-width: 900px) {
    aside {
        position: fixed;
        left: -260px;
        height: 100%;
    }
    aside.mobile-open {
        left: 0;
    }
    .menu-toggle {
        display: block;
    }
    .pos-container {
        grid-template-columns: 1fr;
        height: auto;
        overflow-y: auto;
    }
}

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
}
.badge-success { background: #d1fae5; color: #065f46; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }

/* Modals */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    display: none;
}
.modal.active {
    display: flex;
}
.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}
`;

// ================================
// HTML TEMPLATE
// ================================
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">SmartStore POS & Inventory System</title>
    <style>${EMBEDDED_CSS}</style>
    <!-- External CDN Libraries for Barcodes, QR, Charts -->
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <!-- Login Screen -->
    <div id="auth-screen">
        <div class="auth-card">
            <h2 id="login-store-title">SmartStore POS</h2>
            <form id="login-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-user" class="form-control" value="admin" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-pass" class="form-control" value="admin123" required>
                </div>
                <button type="submit" class="btn">Login</button>
            </form>
            <div style="margin-top: 1rem; font-size: 0.8rem; color: #666; text-align: center;">
                Default Admin: admin / admin123
            </div>
        </div>
    </div>

    <!-- Main App Container -->
    <div id="app" style="display:none;">
        <aside id="sidebar">
            <div class="sidebar-header" id="sidebar-store-name">
                SmartStore
            </div>
            <ul class="sidebar-menu">
                <li class="active" data-target="dashboard-view"><a href="#">Dashboard</a></li>
                <li data-target="pos-view"><a href="#">POS / Scanner</a></li>
                <li data-target="products-view"><a href="#">Products</a></li>
                <li data-target="inventory-view"><a href="#">Inventory</a></li>
                <li data-target="stockin-view"><a href="#">Stock In</a></li>
                <li data-target="stockout-view"><a href="#">Stock Out</a></li>
                <li data-target="sales-view"><a href="#">Sales</a></li>
                <li data-target="utang-view"><a href="#">Utang / Credit</a></li>
                <li data-target="customers-view"><a href="#">Customers</a></li>
                <li data-target="expenses-view"><a href="#">Expenses</a></li>
                <li data-target="reports-view"><a href="#">Reports</a></li>
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
                    <span id="logged-in-user-label" style="font-weight:600;">Admin</span>
                </div>
            </header>

            <div class="views-container">
                <!-- DASHBOARD VIEW -->
                <section id="dashboard-view" class="view-section active">
                    <div class="dashboard-grid">
                        <div class="metric-card">
                            <h3>Total Sales Today</h3>
                            <div class="value" id="dash-total-sales">₱0.00</div>
                        </div>
                        <div class="metric-card success">
                            <h3>Total Orders Today</h3>
                            <div class="value" id="dash-total-orders">0</div>
                        </div>
                        <div class="metric-card">
                            <h3>Total Products</h3>
                            <div class="value" id="dash-total-products">0</div>
                        </div>
                        <div class="metric-card warning">
                            <h3>Low Stock Products</h3>
                            <div class="value" id="dash-low-stock">0</div>
                        </div>
                        <div class="metric-card success">
                            <h3>Today's Profit</h3>
                            <div class="value" id="dash-todays-profit">₱0.00</div>
                        </div>
                        <div class="metric-card danger">
                            <h3>Outstanding Utang</h3>
                            <div class="value" id="dash-outstanding-utang">₱0.00</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 2rem; flex-wrap: wrap;">
                        <button class="btn" style="width: auto;" onclick="switchView('pos-view')">Open POS</button>
                        <button class="btn btn-success" style="width: auto;" onclick="openAddProductModal()">Add Product</button>
                        <button class="btn btn-warning" style="width: auto;" onclick="switchView('stockin-view')">Stock In</button>
                        <button class="btn btn-danger" style="width: auto;" onclick="switchView('utang-view')">View Utang</button>
                    </div>
                </section>

                <!-- POS / SCANNER VIEW -->
                <section id="pos-view" class="view-section">
                    <div class="pos-container">
                        <div class="pos-left">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                                <h3>Scanner & Product Selection</h3>
                                <div>
                                    <button class="btn btn-success" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="startScanner()">Start Camera</button>
                                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="stopScanner()">Stop Camera</button>
                                </div>
                            </div>
                            <div class="pos-scanner-box">
                                <div id="interactive" class="viewport"></div>
                                <div id="scanner-placeholder" style="color:#aaa; position:absolute;">Camera Preview / Click Start</div>
                            </div>
                            <div style="display:flex; gap:10px; margin-bottom:10px;">
                                <input type="text" id="manual-barcode-input" class="form-control" placeholder="Scan barcode or type & press enter...">
                                <button class="btn" style="width:auto;" onclick="handleManualBarcode()">Add</button>
                            </div>
                            <div style="flex-grow:1; overflow-y:auto;">
                                <table id="pos-product-search-table">
                                    <thead>
                                        <tr><th>Product</th><th>Price</th><th>Stock</th><th>Action</th></tr>
                                    </thead>
                                    <tbody id="pos-product-search-tbody">
                                        <!-- Filled via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="pos-right">
                            <h3>Current Cart</h3>
                            <div class="cart-items-list">
                                <table>
                                    <thead>
                                        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th><th></th></tr>
                                    </thead>
                                    <tbody id="cart-items-tbody">
                                        <!-- Cart Items -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="cart-summary-box">
                                <div class="summary-row"><span>Subtotal:</span><span id="cart-subtotal">₱0.00</span></div>
                                <div class="summary-row"><span>Tax:</span><span id="cart-tax">₱0.00</span></div>
                                <div class="summary-row total"><span>Total to Pay:</span><span id="cart-grand-total">₱0.00</span></div>
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
                                    <div class="form-group">
                                        <label>Amount Paid</label>
                                        <input type="number" id="pos-amount-paid" class="form-control" value="0" oninput="calculateChange()">
                                    </div>
                                    <div class="summary-row"><span>Change:</span><span id="pos-change-display" style="color:var(--success);">₱0.00</span></div>
                                </div>
                                <div id="utang-payment-fields" style="display:none;">
                                    <div class="form-group">
                                        <label>Customer</label>
                                        <select id="pos-utang-customer" class="form-control">
                                            <!-- Customers -->
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Amount Paid Now</label>
                                        <input type="number" id="pos-utang-paid-now" class="form-control" value="0">
                                    </div>
                                    <div class="form-group">
                                        <label>Due Date</label>
                                        <input type="date" id="pos-utang-duedate" class="form-control">
                                    </div>
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
                            <h3>Product Management</h3>
                            <button class="btn btn-success" style="width:auto;" onclick="openAddProductModal()">Add New Product</button>
                        </div>
                        <div style="margin-bottom: 1rem; display: flex; gap: 10px;">
                            <input type="text" id="product-search-input" class="form-control" placeholder="Search products..." oninput="renderProductsTable()">
                        </div>
                        <table>
                            <thead>
                                <tr><th>Barcode</th><th>Name</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody id="products-table-tbody">
                                <!-- Populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- INVENTORY VIEW -->
                <section id="inventory-view" class="view-section">
                    <div class="card">
                        <h3>Inventory Movements Log</h3>
                        <table>
                            <thead>
                                <tr><th>Date/Time</th><th>Product</th><th>Type</th><th>Qty</th><th>Prev</th><th>New</th><th>Reason</th><th>User</th></tr>
                            </thead>
                            <tbody id="inventory-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- STOCK IN VIEW -->
                <section id="stockin-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>Stock In / Restock</h3>
                        <form id="stockin-form" onsubmit="handleStockIn(event)">
                            <div class="form-group">
                                <label>Product</label>
                                <select id="stockin-product" class="form-control" required></select>
                            </div>
                            <div class="form-group">
                                <label>Quantity to Add</label>
                                <input type="number" id="stockin-qty" class="form-control" min="1" required>
                            </div>
                            <div class="form-group">
                                <label>Supplier</label>
                                <input type="text" id="stockin-supplier" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Cost Price</label>
                                <input type="number" step="0.01" id="stockin-cost" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Reference / Notes</label>
                                <input type="text" id="stockin-notes" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-success">Save Stock In</button>
                        </form>
                    </div>
                </section>

                <!-- STOCK OUT VIEW -->
                <section id="stockout-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>Stock Out / Adjustments</h3>
                        <form id="stockout-form" onsubmit="handleStockOut(event)">
                            <div class="form-group">
                                <label>Product</label>
                                <select id="stockout-product" class="form-control" required></select>
                            </div>
                            <div class="form-group">
                                <label>Quantity to Remove</label>
                                <input type="number" id="stockout-qty" class="form-control" min="1" required>
                            </div>
                            <div class="form-group">
                                <label>Reason</label>
                                <select id="stockout-reason" class="form-control">
                                    <option value="Damaged">Damaged</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Lost">Lost</option>
                                    <option value="Manual Adjustment">Manual Adjustment</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <input type="text" id="stockout-notes" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-danger">Save Stock Out</button>
                        </form>
                    </div>
                </section>

                <!-- SALES VIEW -->
                <section id="sales-view" class="view-section">
                    <div class="card">
                        <h3>Sales History</h3>
                        <table>
                            <thead>
                                <tr><th>Trans #</th><th>Date/Time</th><th>Items</th><th>Total</th><th>Paid</th><th>Method</th><th>Status</th><th>Action</th></tr>
                            </thead>
                            <tbody id="sales-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- UTANG VIEW -->
                <section id="utang-view" class="view-section">
                    <div class="card">
                        <h3>Utang / Credit Management</h3>
                        <table>
                            <thead>
                                <tr><th>Customer</th><th>Original</th><th>Paid</th><th>Remaining</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
                            </thead>
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
                            <thead>
                                <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Action</th></tr>
                            </thead>
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
                            <thead>
                                <tr><th>Name</th><th>Category</th><th>Amount</th><th>Date</th><th>Notes</th></tr>
                            </thead>
                            <tbody id="expenses-table-tbody"></tbody>
                        </table>
                    </div>
                </section>

                <!-- REPORTS VIEW -->
                <section id="reports-view" class="view-section">
                    <div class="card">
                        <h3>Business Reports</h3>
                        <div id="reports-content">
                            <p>Comprehensive summaries of sales, profits, and inventory status.</p>
                        </div>
                    </div>
                </section>

                <!-- SETTINGS VIEW -->
                <section id="settings-view" class="view-section">
                    <div class="card" style="max-width:600px; margin:0 auto;">
                        <h3>System Settings</h3>
                        <form id="settings-form" onsubmit="saveSettings(event)">
                            <div class="form-group">
                                <label>Store Name</label>
                                <input type="text" id="setting-store-name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label>Store Address</label>
                                <input type="text" id="setting-store-address" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Store Phone</label>
                                <input type="text" id="setting-store-phone" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Tax Rate (%)</label>
                                <input type="number" step="0.01" id="setting-tax-rate" class="form-control">
                            </div>
                            <button type="submit" class="btn">Save Settings</button>
                        </form>
                        <hr style="margin:20px 0;">
                        <h4>Data Backup / Restore</h4>
                        <button class="btn btn-secondary" onclick="exportDataBackup()" style="margin-top:10px;">Backup All Data (JSON)</button>
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
                <div class="form-group">
                    <label>Barcode</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="prod-barcode" class="form-control" placeholder="Leave empty to auto-generate">
                        <button type="button" class="btn" style="width:auto;" onclick="generateAutoBarcode()">Generate</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="prod-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" id="prod-category" class="form-control">
                </div>
                <div class="form-group">
                    <label>Cost Price</label>
                    <input type="number" step="0.01" id="prod-cost" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Selling Price</label>
                    <input type="number" step="0.01" id="prod-price" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Initial Stock</label>
                    <input type="number" id="prod-stock" class="form-control" value="0" required>
                </div>
                <div style="display:flex; gap:10px;">
                    <button type="submit" class="btn btn-success">Save Product</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModals()">Cancel</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Customer Modal -->
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

    <!-- Expense Modal -->
    <div id="expense-modal" class="modal">
        <div class="modal-content">
            <h3>Add Expense</h3>
            <form id="expense-form" onsubmit="saveExpense(event)">
                <div class="form-group"><label>Expense Name</label><input type="text" id="exp-name" class="form-control" required></div>
                <div class="form-group"><label>Category</label>
                    <select id="exp-cat" class="form-control">
                        <option value="Rent">Rent</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Water">Water</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group"><label>Amount</label><input type="number" step="0.01" id="exp-amount" class="form-control" required></div>
                <div class="form-group"><label>Notes</label><input type="text" id="exp-notes" class="form-control"></div>
                <button type="submit" class="btn btn-success">Save Expense</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <!-- Utang Payment Modal -->
    <div id="utang-payment-modal" class="modal">
        <div class="modal-content">
            <h3>Record Utang Payment</h3>
            <form id="utang-pay-form" onsubmit="processUtangPayment(event)">
                <input type="hidden" id="pay-utang-id">
                <div class="form-group"><label>Customer: <span id="pay-cust-name"></span></label></div>
                <div class="form-group"><label>Remaining Balance: <span id="pay-remaining-balance"></span></label></div>
                <div class="form-group"><label>Amount to Pay</label><input type="number" step="0.01" id="pay-amount" class="form-control" required></div>
                <button type="submit" class="btn btn-success">Confirm Payment</button>
                <button type="button" class="btn btn-secondary" onclick="closeModals()" style="margin-top:10px;">Cancel</button>
            </form>
        </div>
    </div>

    <!-- Application JavaScript Engine -->
    <script>
    // ================================
    // INDEXEDDB & STORAGE ARCHITECTURE
    // ================================
    let db;
    const DB_NAME = "SmartStoreDB";
    const DB_VERSION = 1;

    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = (e) => reject(e);
            request.onsuccess = (e) => {
                db = e.target.result;
                resolve(db);
            };
            request.onupgradeneeded = (e) => {
                db = e.target.result;
                if (!db.objectStoreNames.contains("products")) db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("sales")) db.createObjectStore("sales", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("inventory")) db.createObjectStore("inventory", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("customers")) db.createObjectStore("customers", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("expenses")) db.createObjectStore("expenses", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("utang")) db.createObjectStore("utang", { keyPath: "id", autoIncrement: true });
                if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "id" });
            };
        });
    }

    function dbQuery(storeName, mode, callback) {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        return callback(store, transaction);
    }

    function getAll(storeName) {
        return new Promise((resolve) => {
            dbQuery(storeName, "readonly", (store) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
            });
        });
    }

    function addRecord(storeName, data) {
        return new Promise((resolve) => {
            dbQuery(storeName, "readwrite", (store) => {
                const req = store.add(data);
                req.onsuccess = () => resolve(req.result);
            });
        });
    }

    function updateRecord(storeName, data) {
        return new Promise((resolve) => {
            dbQuery(storeName, "readwrite", (store) => {
                const req = store.put(data);
                req.onsuccess = () => resolve(req.result);
            });
        });
    }

    function deleteRecord(storeName, id) {
        return new Promise((resolve) => {
            dbQuery(storeName, "readwrite", (store) => {
                const req = store.delete(id);
                req.onsuccess = () => resolve(req.result);
            });
        });
    }

    // ================================
    // APPLICATION STATE & INIT
    // ================================
    let currentUser = null;
    let cart = [];
    let appSettings = {
        storeName: "SmartStore POS",
        storeAddress: "Philippines",
        storePhone: "09123456789",
        taxRate: 0.00
    };
    let html5QrCode = null;

    window.addEventListener("DOMContentLoaded", async () => {
        await initDB();
        await loadSettings();
        setupNavigation();
        setupAuth();
    });

    async function loadSettings() {
        const settingsList = await getAll("settings");
        if (settingsList.length > 0) {
            appSettings = settingsList[0];
        } else {
            await addRecord("settings", { id: 1, ...appSettings });
        }
        document.getElementById("login-store-title").innerText = appSettings.storeName;
        document.getElementById("sidebar-store-name").innerText = appSettings.storeName;
        document.getElementById("page-title").innerText = appSettings.storeName;
        document.getElementById("setting-store-name").value = appSettings.storeName;
        document.getElementById("setting-store-address").value = appSettings.storeAddress;
        document.getElementById("setting-store-phone").value = appSettings.storePhone;
        document.getElementById("setting-tax-rate").value = appSettings.taxRate;
    }

    function setupAuth() {
        document.getElementById("login-form").addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.getElementById("login-user").value;
            const pass = document.getElementById("login-pass").value;
            if ((user === "admin" && pass === "admin123") || (user === "cashier" && pass === "cashier123")) {
                currentUser = { username: user, role: user === "admin" ? "ADMIN" : "CASHIER" };
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
            if (i.getAttribute("data-target") === target) {
                i.click();
            }
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
    }

    function refreshViewData(target) {
        if (target === "dashboard-view") renderDashboard();
        if (target === "products-view") renderProductsTable();
        if (target === "pos-view") { renderPOSProducts(); populateDropdowns(); }
        if (target === "inventory-view") renderInventoryTable();
        if (target === "sales-view") renderSalesTable();
        if (target === "utang-view") renderUtangTable();
        if (target === "customers-view") renderCustomersTable();
        if (target === "expenses-view") renderExpensesTable();
        if (target === "stockin-view" || target === "stockout-view" || target === "pos-view") populateDropdowns();
    }

    // ================================
    // DASHBOARD
    // ================================
    async function renderDashboard() {
        const sales = await getAll("sales");
        const products = await getAll("products");
        const utang = await getAll("utang");
        const expenses = await getAll("expenses");

        const today = new Date().toISOString().slice(0, 10);
        let totalSalesToday = 0;
        let totalOrdersToday = 0;
        let todaysProfit = 0;

        sales.forEach(s => {
            if (s.date && s.date.startsWith(today)) {
                totalSalesToday += s.total;
                totalOrdersToday++;
                s.items.forEach(item => {
                    todaysProfit += (item.sellingPrice - item.costPrice) * item.quantity;
                });
            }
        });

        let lowStockCount = 0;
        products.forEach(p => {
            if (p.stock <= 5) lowStockCount++;
        });

        let outstandingUtang = 0;
        utang.forEach(u => {
            if (u.status !== "Paid") outstandingUtang += u.remainingBalance;
        });

        document.getElementById("dash-total-sales").innerText = formatCurrency(totalSalesToday);
        document.getElementById("dash-total-orders").innerText = totalOrdersToday;
        document.getElementById("dash-total-products").innerText = products.length;
        document.getElementById("dash-low-stock").innerText = lowStockCount;
        document.getElementById("dash-todays-profit").innerText = formatCurrency(todaysProfit);
        document.getElementById("dash-outstanding-utang").innerText = formatCurrency(outstandingUtang);
    }

    // ================================
    // PRODUCTS & BARCODE GENERATION
    // ================================
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

    async function saveProduct(e) {
        e.preventDefault();
        const id = document.getElementById("product-edit-id").value;
        const barcode = document.getElementById("prod-barcode").value;
        const name = document.getElementById("prod-name").value;
        const category = document.getElementById("prod-category").value;
        const costPrice = parseFloat(document.getElementById("prod-cost").value);
        const sellingPrice = parseFloat(document.getElementById("prod-price").value);
        const stock = parseInt(document.getElementById("prod-stock").value);

        const productData = {
            barcode, name, category, costPrice, sellingPrice, stock,
            minimumStock: 5,
            createdAt: new Date().toISOString()
        };

        if (id) {
            productData.id = parseInt(id);
            await updateRecord("products", productData);
        } else {
            const newProdId = await addRecord("products", productData);
            await addRecord("inventory", {
                productId: newProdId, productName: name, type: "Stock In", quantity: stock,
                previousStock: 0, newStock: stock, reason: "Initial Stock", date: new Date().toISOString(), user: currentUser.username
            });
        }

        closeModals();
        refreshAllViews();
    }

    async function renderProductsTable() {
        const products = await getAll("products");
        const tbody = document.getElementById("products-table-tbody");
        tbody.innerHTML = "";
        const search = document.getElementById("product-search-input") ? document.getElementById("product-search-input").value.toLowerCase() : "";

        products.forEach(p => {
            if (search && !p.name.toLowerCase().includes(search) && !p.barcode.includes(search)) return;
            let statusBadge = '<span class="badge badge-success">In Stock</span>';
            if (p.stock <= 0) statusBadge = '<span class="badge badge-danger">Out of Stock</span>';
            else if (p.stock <= 5) statusBadge = '<span class="badge badge-warning">Low Stock</span>';

            tbody.innerHTML += \`
                <tr>
                    <td>\${p.barcode}</td>
                    <td>\${p.name}</td>
                    <td>\${p.category || '-'}</td>
                    <td>\${formatCurrency(p.costPrice)}</td>
                    <td>\${formatCurrency(p.sellingPrice)}</td>
                    <td>\${p.stock}</td>
                    <td>\${statusBadge}</td>
                    <td>
                        <button class="btn" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="editProduct(\${p.id})">Edit</button>
                        <button class="btn btn-danger" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;" onclick="deleteProduct(\${p.id})">Delete</button>
                    </td>
                </tr>
            \`;
        });
    }

    async function editProduct(id) {
        const products = await getAll("products");
        const p = products.find(x => x.id === id);
        if (!p) return;
        document.getElementById("product-edit-id").value = p.id;
        document.getElementById("prod-barcode").value = p.barcode;
        document.getElementById("prod-name").value = p.name;
        document.getElementById("prod-category").value = p.category;
        document.getElementById("prod-cost").value = p.costPrice;
        document.getElementById("prod-price").value = p.sellingPrice;
        document.getElementById("prod-stock").value = p.stock;
        document.getElementById("product-modal-title").innerText = "Edit Product";
        document.getElementById("product-modal").classList.add("active");
    }

    async function deleteProduct(id) {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteRecord("products", id);
            refreshAllViews();
        }
    }

    // ================================
    // POS, CART & SCANNER
    // ================================
    async function renderPOSProducts() {
        const products = await getAll("products");
        const tbody = document.getElementById("pos-product-search-tbody");
        tbody.innerHTML = "";
        products.forEach(p => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${p.name}</td>
                    <td>\${formatCurrency(p.sellingPrice)}</td>
                    <td>\${p.stock}</td>
                    <td><button class="btn" style="padding:0.25rem 0.5rem; width:auto;" onclick="addToCart(\${p.id})">Add</button></td>
                </tr>
            \`;
        });
    }

    async function addToCart(productId, qty = 1) {
        const products = await getAll("products");
        const product = products.find(p => p.id === productId);
        if (!product) return;
        if (product.stock < qty) {
            alert("Insufficient stock available!");
            return;
        }

        const existing = cart.find(item => item.productId === productId);
        if (existing) {
            if (product.stock < existing.quantity + qty) {
                alert("Insufficient stock available!");
                return;
            }
            existing.quantity += qty;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                barcode: product.barcode,
                sellingPrice: product.sellingPrice,
                costPrice: product.costPrice,
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
            tbody.innerHTML += \`
                <tr>
                    <td>\${item.name}</td>
                    <td>
                        <button onclick="updateCartQty(\size, -1)">-</button>
                        \${item.quantity}
                        <button onclick="updateCartQty(\${index}, 1)">+</button>
                    </td>
                    <td>\${formatCurrency(item.sellingPrice)}</td>
                    <td>\${formatCurrency(itemSub)}</td>
                    <td><button class="btn btn-danger" style="padding:0.1rem 0.3rem; width:auto;" onclick="removeFromCart(\${index})">X</button></td>
                </tr>
            \`;
        });

        const tax = subtotal * (appSettings.taxRate / 100);
        const grandTotal = subtotal + tax;

        document.getElementById("cart-subtotal").innerText = formatCurrency(subtotal);
        document.getElementById("cart-tax").innerText = formatCurrency(tax);
        document.getElementById("cart-grand-total").innerText = formatCurrency(grandTotal);
        calculateChange();
    }

    function updateCartQty(index, delta) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        renderCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCart();
    }

    async function handleManualBarcode() {
        const barcodeInput = document.getElementById("manual-barcode-input");
        const code = barcodeInput.value.trim();
        if (!code) return;
        const products = await getAll("products");
        const product = products.find(p => p.barcode === code);
        if (product) {
            addToCart(product.id);
            barcodeInput.value = "";
        } else {
            alert("Product not found with barcode: " + code);
        }
    }

    function togglePaymentFields() {
        const method = document.getElementById("pos-payment-method").value;
        if (method === "Utang") {
            document.getElementById("cash-payment-fields").style.display = "none";
            document.getElementById("utang-payment-fields").style.display = "block";
        } else {
            document.getElementById("cash-payment-fields").style.display = "block";
            document.getElementById("utang-payment-fields").style.display = "none";
        }
    }

    function calculateChange() {
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (appSettings.taxRate / 100);
        const grandTotal = subtotal + tax;
        const amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
        const change = amountPaid - grandTotal;
        document.getElementById("pos-change-display").innerText = formatCurrency(change >= 0 ? change : 0);
    }

    async function completeCheckout() {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }
        const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        const tax = subtotal * (appSettings.taxRate / 100);
        const grandTotal = subtotal + tax;
        const paymentMethod = document.getElementById("pos-payment-method").value;
        let amountPaid = 0;
        let change = 0;

        if (paymentMethod === "Cash") {
            amountPaid = parseFloat(document.getElementById("pos-amount-paid").value) || 0;
            if (amountPaid < grandTotal) {
                alert("Insufficient payment!");
                return;
            }
            change = amountPaid - grandTotal;
        } else if (paymentMethod === "Utang") {
            const customerId = document.getElementById("pos-utang-customer").value;
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            if (!customerId) {
                alert("Please select a customer for Utang!");
                return;
            }
            if (paidNow > grandTotal) {
                alert("Amount paid now cannot exceed grand total!");
                return;
            }
            amountPaid = paidNow;
        } else {
            amountPaid = grandTotal;
        }

        const transactionNumber = "TXN-" + Date.now();
        const saleRecord = {
            transactionNumber,
            items: [...cart],
            subtotal,
            tax,
            total: grandTotal,
            amountPaid,
            change,
            paymentMethod,
            status: paymentMethod === "Utang" ? "Credit / Utang" : "Paid",
            cashier: currentUser.username,
            date: new Date().toISOString()
        };

        const saleId = await addRecord("sales", saleRecord);

        if (paymentMethod === "Utang") {
            const customerId = parseInt(document.getElementById("pos-utang-customer").value);
            const customers = await getAll("customers");
            const cust = customers.find(c => c.id === customerId);
            const paidNow = parseFloat(document.getElementById("pos-utang-paid-now").value) || 0;
            const remaining = grandTotal - paidNow;
            const dueDate = document.getElementById("pos-utang-duedate").value || new Date().toISOString();

            await addRecord("utang", {
                customerId,
                customerName: cust ? cust.name : "Unknown",
                transactionId: saleId,
                originalAmount: grandTotal,
                amountPaid: paidNow,
                remainingBalance: remaining,
                status: remaining <= 0 ? "Paid" : (paidNow > 0 ? "Partially Paid" : "Unpaid"),
                dateCreated: new Date().toISOString(),
                dueDate,
                paymentHistory: paidNow > 0 ? [{ date: new Date().toISOString(), amount: paidNow, method: "Cash", receivedBy: currentUser.username }] : []
            });
        }

        // Deduct inventory
        for (const item of cart) {
            const products = await getAll("products");
            const prod = products.find(p => p.id === item.productId);
            if (prod) {
                const prevStock = prod.stock;
                prod.stock -= item.quantity;
                await updateRecord("products", prod);
                await addRecord("inventory", {
                    productId: prod.id, productName: prod.name, type: "Sale", quantity: item.quantity,
                    previousStock: prevStock, newStock: prod.stock, reason: "Sold via POS (" + transactionNumber + ")", date: new Date().toISOString(), user: currentUser.username
                });
            }
        }

        alert("Transaction completed successfully!");
        cart = [];
        renderCart();
        refreshAllViews();
    }

    // Camera Scanner implementation using html5-qrcode
    function startScanner() {
        const config = { fps: 10, qrbox: { width: 250, height: 150 } };
        html5QrCode = new Html5Qrcode("interactive");
        html5QrCode.start({ facingMode: "environment" }, config, async (decodedText) => {
            const products = await getAll("products");
            const product = products.find(p => p.barcode === decodedText);
            if (product) {
                addToCart(product.id);
            }
        }).catch(err => {
            console.error("Camera start error:", err);
            alert("Camera initialization failed or permission denied.");
        });
    }

    function stopScanner() {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                html5QrCode.clear();
            }).catch(err => console.error(err));
        }
    }

    // ================================
    // INVENTORY, STOCK IN & STOCK OUT
    // ================================
    async function renderInventoryTable() {
        const logs = await getAll("inventory");
        const tbody = document.getElementById("inventory-table-tbody");
        tbody.innerHTML = "";
        logs.reverse().forEach(l => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${new Date(l.date).toLocaleString()}</td>
                    <td>\${l.productName}</td>
                    <td><span class="badge \${l.type === 'Stock In' ? 'badge-success' : 'badge-danger'}">\${l.type}</span></td>
                    <td>\${l.quantity}</td>
                    <td>\${l.previousStock}</td>
                    <td>\${l.newStock}</td>
                    <td>\${l.reason || '-'}</td>
                    <td>\${l.user}</td>
                </tr>
            \`;
        });
    }

    async function handleStockIn(e) {
        e.preventDefault();
        const productId = parseInt(document.getElementById("stockin-product").value);
        const qty = parseInt(document.getElementById("stockin-qty").value);
        const notes = document.getElementById("stockin-notes").value;

        const products = await getAll("products");
        const prod = products.find(p => p.id === productId);
        if (prod) {
            const prevStock = prod.stock;
            prod.stock += qty;
            await updateRecord("products", prod);
            await addRecord("inventory", {
                productId: prod.id, productName: prod.name, type: "Stock In", quantity: qty,
                previousStock: prevStock, newStock: prod.stock, reason: notes || "Restock", date: new Date().toISOString(), user: currentUser.username
            });
            alert("Stock added successfully!");
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

        const products = await getAll("products");
        const prod = products.find(p => p.id === productId);
        if (prod) {
            if (prod.stock < qty) {
                alert("Cannot remove more than available stock!");
                return;
            }
            const prevStock = prod.stock;
            prod.stock -= qty;
            await updateRecord("products", prod);
            await addRecord("inventory", {
                productId: prod.id, productName: prod.name, type: "Stock Out", quantity: qty,
                previousStock: prevStock, newStock: prod.stock, reason: reason + ": " + notes, date: new Date().toISOString(), user: currentUser.username
            });
            alert("Stock removed successfully!");
            document.getElementById("stockout-form").reset();
            refreshAllViews();
        }
    }

    // ================================
    // SALES & UTANG MANAGEMENT
    // ================================
    async function renderSalesTable() {
        const sales = await getAll("sales");
        const tbody = document.getElementById("sales-table-tbody");
        tbody.innerHTML = "";
        sales.reverse().forEach(s => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${s.transactionNumber}</td>
                    <td>\${new Date(s.date).toLocaleString()}</td>
                    <td>\${s.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                    <td>\${formatCurrency(s.total)}</td>
                    <td>\${formatCurrency(s.amountPaid)}</td>
                    <td>\${s.paymentMethod}</td>
                    <td><span class="badge \${s.status === 'Paid' ? 'badge-success' : 'badge-warning'}">\${s.status}</span></td>
                    <td><button class="btn btn-danger" style="padding:0.25rem 0.5rem; width:auto;" onclick="voidTransaction(\${s.id})">Void</button></td>
                </tr>
            \`;
        });
    }

    async function voidTransaction(id) {
        if (confirm("Are you sure you want to void this transaction? Stock will be restored.")) {
            const sales = await getAll("sales");
            const sale = sales.find(s => s.id === id);
            if (!sale) return;

            for (const item of sale.items) {
                const products = await getAll("products");
                const prod = products.find(p => p.id === item.productId);
                if (prod) {
                    const prevStock = prod.stock;
                    prod.stock += item.quantity;
                    await updateRecord("products", prod);
                    await addRecord("inventory", {
                        productId: prod.id, productName: prod.name, type: "Stock In", quantity: item.quantity,
                        previousStock: prevStock, newStock: prod.stock, reason: "Void Transaction (" + sale.transactionNumber + ")", date: new Date().toISOString(), user: currentUser.username
                    });
                }
            }
            await deleteRecord("sales", id);
            refreshAllViews();
        }
    }

    async function renderUtangTable() {
        const utangList = await getAll("utang");
        const tbody = document.getElementById("utang-table-tbody");
        tbody.innerHTML = "";
        utangList.forEach(u => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${u.customerName}</td>
                    <td>\${formatCurrency(u.originalAmount)}</td>
                    <td>\${formatCurrency(u.amountPaid)}</td>
                    <td>\${formatCurrency(u.remainingBalance)}</td>
                    <td>\${u.dueDate ? new Date(u.dueDate).toLocaleDateString() : '-'}</td>
                    <td><span class="badge \${u.status === 'Paid' ? 'badge-success' : 'badge-warning'}">\${u.status}</span></td>
                    <td>
                        \${u.remainingBalance > 0 ? '<button class="btn btn-success" style="padding:0.25rem 0.5rem; width:auto;" onclick="openUtangPaymentModal(' + u.id + ')">Pay</button>' : ''}
                    </td>
                </tr>
            \`;
        });
    }

    async function openUtangPaymentModal(id) {
        const utangList = await getAll("utang");
        const u = utangList.find(x => x.id === id);
        if (!u) return;
        document.getElementById("pay-utang-id").value = u.id;
        document.getElementById("pay-cust-name").innerText = u.customerName;
        document.getElementById("pay-remaining-balance").innerText = formatCurrency(u.remainingBalance);
        document.getElementById("pay-amount").value = "";
        document.getElementById("utang-payment-modal").classList.add("active");
    }

    async function processUtangPayment(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("pay-utang-id").value);
        const amount = parseFloat(document.getElementById("pay-amount").value);

        const utangList = await getAll("utang");
        const u = utangList.find(x => x.id === id);
        if (!u) return;

        if (amount > u.remainingBalance) {
            alert("Payment amount cannot exceed remaining balance!");
            return;
        }

        u.amountPaid += amount;
        u.remainingBalance -= amount;
        if (u.remainingBalance <= 0) u.status = "Paid";
        else u.status = "Partially Paid";

        if (!u.paymentHistory) u.paymentHistory = [];
        u.paymentHistory.push({
            date: new Date().toISOString(),
            amount,
            method: "Cash",
            receivedBy: currentUser.username
        });

        await updateRecord("utang", u);
        closeModals();
        refreshAllViews();
    }

    // ================================
    // CUSTOMERS & EXPENSES
    // ================================
    function openAddCustomerModal() {
        document.getElementById("customer-form").reset();
        document.getElementById("customer-modal").classList.add("active");
    }

    async function saveCustomer(e) {
        e.preventDefault();
        const name = document.getElementById("cust-name").value;
        const phone = document.getElementById("cust-phone").value;
        const email = document.getElementById("cust-email").value;
        const address = document.getElementById("cust-address").value;

        await addRecord("customers", { name, phone, email, address, createdAt: new Date().toISOString() });
        closeModals();
        refreshAllViews();
    }

    async function renderCustomersTable() {
        const customers = await getAll("customers");
        const tbody = document.getElementById("customers-table-tbody");
        tbody.innerHTML = "";
        customers.forEach(c => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${c.name}</td>
                    <td>\${c.phone || '-'}</td>
                    <td>\${c.email || '-'}</td>
                    <td>\${c.address || '-'}</td>
                    <td><button class="btn btn-danger" style="padding:0.25rem 0.5rem; width:auto;" onclick="deleteCustomer(\${c.id})">Delete</button></td>
                </tr>
            \`;
        });
    }

    async function deleteCustomer(id) {
        if (confirm("Delete customer?")) {
            await deleteRecord("customers", id);
            refreshAllViews();
        }
    }

    function openAddExpenseModal() {
        document.getElementById("expense-form").reset();
        document.getElementById("expense-modal").classList.add("active");
    }

    async function saveExpense(e) {
        e.preventDefault();
        const name = document.getElementById("exp-name").value;
        const category = document.getElementById("exp-cat").value;
        const amount = parseFloat(document.getElementById("exp-amount").value);
        const notes = document.getElementById("exp-notes").value;

        await addRecord("expenses", { name, category, amount, notes, date: new Date().toISOString() });
        closeModals();
        refreshAllViews();
    }

    async function renderExpensesTable() {
        const expenses = await getAll("expenses");
        const tbody = document.getElementById("expenses-table-tbody");
        tbody.innerHTML = "";
        expenses.forEach(e => {
            tbody.innerHTML += \`
                <tr>
                    <td>\${e.name}</td>
                    <td>\${e.category}</td>
                    <td>\${formatCurrency(e.amount)}</td>
                    <td>\${new Date(e.date).toLocaleDateString()}</td>
                    <td>\${e.notes || '-'}</td>
                </tr>
            \`;
        });
    }

    // ================================
    // SETTINGS & UTILITIES
    // ================================
    async function saveSettings(e) {
        e.preventDefault();
        appSettings.storeName = document.getElementById("setting-store-name").value;
        appSettings.storeAddress = document.getElementById("setting-store-address").value;
        appSettings.storePhone = document.getElementById("setting-store-phone").value;
        appSettings.taxRate = parseFloat(document.getElementById("setting-tax-rate").value) || 0;

        await updateRecord("settings", { id: 1, ...appSettings });
        alert("Settings saved successfully!");
        loadSettings();
    }

    async function exportDataBackup() {
        const products = await getAll("products");
        const sales = await getAll("sales");
        const inventory = await getAll("inventory");
        const customers = await getAll("customers");
        const utang = await getAll("utang");
        const expenses = await getAll("expenses");

        const backup = { products, sales, inventory, customers, utang, expenses, settings: appSettings };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "SmartStore_Backup_" + new Date().toISOString().slice(0,10) + ".json";
        a.click();
    }

    async function populateDropdowns() {
        const products = await getAll("products");
        const customers = await getAll("customers");

        const stockinSelect = document.getElementById("stockin-product");
        const stockoutSelect = document.getElementById("stockout-product");
        const utangCustSelect = document.getElementById("pos-utang-customer");

        if (stockinSelect) {
            stockinSelect.innerHTML = "";
            products.forEach(p => stockinSelect.innerHTML += '<option value="' + p.id + '">' + p.name + ' (Stock: ' + p.stock + ')</option>');
        }
        if (stockoutSelect) {
            stockoutSelect.innerHTML = "";
            products.forEach(p => stockoutSelect.innerHTML += '<option value="' + p.id + '">' + p.name + ' (Stock: ' + p.stock + ')</option>');
        }
        if (utangCustSelect) {
            utangCustSelect.innerHTML = "";
            customers.forEach(c => utangCustSelect.innerHTML += '<option value="' + c.id + '">' + c.name + ' (' + (c.phone || 'No Phone') + ')</option>');
        }
    }

    function closeModals() {
        document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
    }

    function formatCurrency(amount) {
        return "₱" + parseFloat(amount || 0).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,');
    }
    </script>
</body>
</html>
`;