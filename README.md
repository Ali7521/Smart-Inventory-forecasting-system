# Smart Inventory Forecasting System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed for small and medium businesses to track inventory levels, log sales transactions, predict future product demand, and automatically flag reorder requirements before stockouts happen.

---

## Key Features

- **Landing Page & Instant Demo Mode**: Includes an introductory landing page with a 4-step workflow visual, feature overview, and a zero-login "Try Demo Mode" button.
- **Role-Based Authentication**: JWT-based security with **Admin** (full CRUD, user management, CSV import) and **Staff** (sales recording, stock viewing) roles.
- **Statistical Forecasting Engine**:
  - **Weighted Moving Average (WMA)**: Applies higher weights to recent sales days to adapt quickly to demand shifts.
  - **Simple Moving Average (SMA)**: Baseline average daily demand over window $N$.
  - **Linear Regression Trend Line**: Fits an ordinary least squares line ($y = mx + b$) to project growth trajectories.
  - **Confidence Score Indicator**: Measures sales consistency based on variance and coefficient of variation ($CV = \frac{\sigma}{\mu}$).
- **Automated Reorder Alerts**:
  - Compares current stock vs. (Forecasted Demand + Safety Stock Buffer).
  - Categorizes status into **Low Stock**, **Reorder Soon**, or **Healthy**.
  - Provides instant **"Mark as Ordered"** action to update stock.
- **Interactive Visualizations (Recharts)**:
  - Daily Sales Volume Trend chart.
  - Forecasted Demand vs Current In-Stock comparison bar chart.
  - 60-day product daily sales sparklines.
- **Bulk CSV Import & Export**:
  - Bulk import products via CSV file or raw text.
  - Export inventory valuation summaries and sales transaction logs to CSV and printable PDF.

---

## Statistical Forecasting Explanation

### 1. Weighted Moving Average (WMA)
$$\text{Demand Rate} = \frac{\sum_{i=1}^{N} i \times \text{Sales}_i}{\sum_{i=1}^{N} i}$$
Where recent days receive higher linear weights ($1, 2, \dots, N$).

### 2. Linear Regression (LR)
$$y = mx + b, \quad m = \frac{N \sum (xy) - \sum x \sum y}{N \sum (x^2) - (\sum x)^2}$$
Projects daily demand rate into future periods ($P$ days).

### 3. Suggested Reorder Quantity
$$\text{Reorder Qty} = \max\left(0, \text{Math.ceil}(\text{Predicted Demand} + \text{Safety Stock} - \text{Current Stock})\right)$$

---

## Project Structure

```
smart-inventory-forecasting/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js with mongodb-memory-server fallback)
│   │   ├── controllers/
│   │   ├── middleware/ (auth.js, role.js)
│   │   ├── models/ (User.js, Product.js, Sale.js, StockAdjustment.js, Forecast.js, Settings.js)
│   │   ├── services/ (forecastingEngine.js, seedData.js)
│   │   ├── routes/ (auth.js, products.js, sales.js, forecast.js, alerts.js, reports.js, settings.js, seed.js)
│   │   └── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, Sidebar, StatCard, HowForecastingWorksModal, CSVImportModal)
    │   ├── pages/ (LandingPage, Login, Register, Dashboard, ProductsPage, SalesPage, ForecastPage, AlertsPage, ReportsPage, SettingsPage)
    │   ├── context/ (AuthContext.jsx, AppContext.jsx)
    │   ├── utils/ (api.js, exportHelpers.js)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## Quick Start Instructions

### Prerequisites
- Node.js (v18+) & npm

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev # Starts server on port 5000 with auto MongoDB Memory Server fallback & auto mock data seeding
```

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev # Starts Vite dev server on port 3000
```

Open `http://localhost:3000` in your browser. Click **"Explore Demo Mode"** to test immediately with 90 days of pre-seeded historical sales data!

---

## API Reference Summary

- `POST /api/auth/register` — Create user
- `POST /api/auth/login` — Sign in
- `POST /api/auth/demo` — Quick guest demo login
- `GET /api/products` — List products (search, category filter)
- `POST /api/products` — Add product
- `POST /api/products/:id/adjust-stock` — Log stock adjustment
- `POST /api/sales` — Record sale (auto-decrements stock)
- `GET /api/forecast` — Generate demand forecasts (SMA/WMA/LR)
- `GET /api/alerts` — Reorder alerts summary
- `POST /api/alerts/mark-ordered/:id` — Mark order received
- `GET /api/reports/inventory` — Inventory valuation report
- `GET /api/reports/sales` — Sales performance report
- `POST /api/seed` — Reset & seed 90-day mock sales data
