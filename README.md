# FishFlow — Fresh fish. Less waiting.

> **AI-Assisted Fish Market Pre-Order & Smart Queue Management System**

FishFlow is a full working web application prototype designed to streamline fish market operations. By allowing customers to select their fish, weight, and preparation choices before arriving at the counter, FishFlow eliminates standing in long physical queues and optimizes stall worker throughput.

---

## 1. Problem Statement

At traditional fish markets, customers physically wait at the counter through a sequential process: selecting fish, weighing, descaling/cleaning, cutting into slices, and wrapping. 

Initial prototype field observations indicated an approximate customer waiting time of **4–8 minutes per customer** for typical purchases around **1–2 kg** across approximately **6 observed counter workers**. 

> **Important Disclaimer:** These numbers are field-observation inputs used for prototype setup and queue modeling. They do NOT represent statistically validated market research data.

---

## 2. Solution Overview

FishFlow digitizes the pre-ordering process into two synchronized interfaces:

1. **Customer Application (`/`)**: Customers browse the fresh catch catalog, select quantity (in kg), choose preparation requirements (*Whole*, *Cut*, *Cleaned*, or *Cut + Cleaned*), and place an instant pre-order to generate a **Digital Market Token** (e.g. `FF-108`). Customers receive a client-side **downloadable PDF token** with an embedded **QR code** and can track their order status live at `/track/:token`.
2. **Market Staff Dashboard (`/dashboard`)**: Market staff view a real-time live queue, monitor active counter dispatch (**"Now Serving"**), update order statuses (*Waiting* → *Preparing* → *Ready* → *Completed*), adjust active staff worker counts dynamically, view AI prediction accuracy, and analyze operational market insights.

Both interfaces share identical design tokens, colors (Ocean Blue `#0284c7`, Deep Navy `#0f172a`, Fresh Teal `#0d9488`), typography, and visual language.

---

## 3. Key Features

- 🐟 **Interactive Fish Catalog**: Real-time fish cards (Mackerel, Sardine, Tuna, Pomfret, Kingfish, Red Snapper) with availability, demo pricing, and descriptions.
- 🔪 **Custom Preparation Selection**: Choose between *Whole*, *Cut*, *Cleaned*, or *Cut + Cleaned*.
- 🛒 **Multi-Item Cart & Checkout**: Add multiple fish selections in a single pre-order.
- 🎟️ **Digital Token & PDF Generation**: Instant generation of unique tokens (`FF-10X`). Downloadable printable PDF with FishFlow branding, order breakdown, and SVG QR code.
- 📱 **Real-Time Order Tracking (`/track/:token`)**: Multi-step visual tracker (Placed → Preparing → Ready → Completed) that automatically updates in real-time when staff change status in the dashboard.
- 📣 **"Now Serving" Counter Dispatch**: One-click **"Call Next Token"** button for staff to immediately call the next waiting customer.
- 🤖 **AI Queue & Wait-Time Prediction Engine**: Dedicated module (`src/ai/waitTimePrediction.ts`) calculating estimated wait times based on queue length, preparation complexity, item weight, and active worker count.
- 🎛️ **Active Worker Scaling Slider**: Staff can adjust the active worker slider (1–12 staff) on the dashboard and observe real-time wait time recalculations across all active tokens.
- 🔄 **Multi-Tab Real-Time Sync**: Uses `BroadcastChannel` and `localStorage` events to keep Customer Tracking and Staff Dashboard synchronized across browser windows without requiring a database server.
- 📊 **Operational Insights & Analytics**: Visual charts for hourly order throughput, preparation requirement share, peak queue size, and feedback accuracy metrics.

---

## 4. How AI Waiting-Time Prediction Works

The prediction pipeline resides in a modular, pluggable file: [`src/ai/waitTimePrediction.ts`](file:///Users/shymafathima/FishFlow/src/ai/waitTimePrediction.ts).

### Prediction Inputs:
1. **Orders Ahead**: Number of waiting/preparing orders currently in front of the customer.
2. **Item Quantity**: Total weight in kilograms.
3. **Preparation Complexity Weight**:
   - `Whole`: 1.2 min/kg
   - `Cut`: 2.2 min/kg
   - `Cleaned`: 2.8 min/kg
   - `Cut + Cleaned`: 3.8 min/kg
4. **Active Worker Count**: Number of active market staff on duty (default 6).
5. **Queue Workload Backlog**: Total weight in kg awaiting preparation.

### Formula:
$$\text{Target Order Prep Time} = \sum (\text{Qty}_{\text{kg}} \times \text{PrepWeight})$$
$$\text{Queue Backload} = (\text{OrdersAhead} \times 4.8) + (\text{Workload}_{\text{kg}} \times 1.5)$$
$$\text{Effective Throughput} = \text{ActiveWorkers} \times 0.85$$
$$\text{Estimated Wait (mins)} = \max\left(2, \left\lceil \frac{\text{Queue Backload} + (\text{Target Prep} \times 0.5)}{\text{Effective Throughput}} \right\rceil\right)$$

### Pluggable Architecture Notice:
This logic is structured behind a clean Interface contract. In a production environment, this module can be swapped with a trained Machine Learning Regression model (e.g. XGBoost or PyTorch model API) without modifying any UI components or routing.

---

## 5. Technology Stack

- **Frontend Core**: React 18 with TypeScript
- **Build Tool & Dev Server**: Vite 6
- **Styling**: Tailwind CSS with custom design tokens (Ocean Blue, Deep Navy, Fresh Teal)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF (client-side A5 ticket generation)
- **QR Code Generation**: qrcode (data URL canvas embedding)
- **Effects**: canvas-confetti
- **State & Multi-Tab Sync**: LocalStorage + `BroadcastChannel` API

---

## 6. Folder Structure

```
FishFlow/
├── index.html                  # HTML entry point with Inter font & meta tags
├── package.json                # Project dependencies & scripts
├── vite.config.ts              # Vite configuration & path aliases
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Custom FishFlow theme colors & tokens
├── postcss.config.js           # PostCSS configuration
├── README.md                   # Project documentation
└── src/
    ├── main.tsx                # React DOM root render
    ├── App.tsx                 # App layout wrapper & React Router setup
    ├── index.css               # Global CSS & glassmorphism utilities
    ├── types/
    │   └── index.ts            # TypeScript interfaces (Order, FishItem, Metrics)
    ├── ai/
    │   └── waitTimePrediction.ts # AI wait-time prediction engine & feedback loop
    ├── data/
    │   └── seedData.ts         # Initial fish catalog & realistic demo orders
    ├── services/
    │   └── store.ts            # Centralized reactive state store & sync bus
    ├── utils/
    │   └── pdfGenerator.ts     # Client-side PDF token generator with QR code
    ├── components/
    │   ├── common/             # Reusable UI (Navbar, Footer, StatusBadge, Toast, Modal)
    │   ├── customer/           # Customer UI (FishCard, PrepSelector, CartDrawer, TokenCard)
    │   └── dashboard/          # Staff UI (StatCard, NowServingCard, QueueTable, AiPredictionPanel, MarketInsights)
    └── pages/
        ├── CustomerHome.tsx    # Customer landing page & fish ordering ( / )
        ├── OrderConfirmation.tsx # Post-checkout token details page ( /confirm/:token )
        ├── OrderTracker.tsx    # Real-time order tracking page ( /track/:token )
        ├── RecentOrders.tsx    # Customer order history ( /recent )
        └── StaffDashboard.tsx  # Market staff operational dashboard ( /dashboard )
```

---

## 7. Installation & Running Locally

### Prerequisites
- Node.js 18+ and npm installed.

### Steps
1. Open terminal in the project directory:
   ```bash
   cd /Users/shymafathima/FishFlow
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   - **Customer View**: [http://localhost:3000/](http://localhost:3000/)
   - **Staff Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

*Tip: Open Customer View and Staff Dashboard side-by-side in two browser windows to watch real-time status updates!*

---

## 8. Critical Distinctions (Simulated vs Real)

1. **Observed Field Information**: Prototype inputs based on preliminary field observations (~4–8 min wait, 1–2 kg purchases, 6 workers). They are used as baseline parameters for the prototype simulation.
2. **Simulated / Demo Data**: Pre-seeded demo orders (`FF-101` to `FF-104`) provided so the dashboard is immediately populated upon first launch.
3. **Prototype Prediction Logic**: Empirical mathematical weighting algorithm in `ai/waitTimePrediction.ts` simulating wait times.
4. **Future Trained AI Model**: Production system architecture designed to collect real preparation timestamps to train a regression model.

---

## 9. Limitations & Production Readiness

- **Current Prototype Scope**: Runs in-browser using local storage and `BroadcastChannel` for tab-to-tab sync.
- **Production Requirements**: For a full enterprise market deployment, replace local storage sync with a real-time backend database (e.g. Supabase, PostgreSQL + WebSockets, or Firebase Cloud Messaging) and integrate SMS notification gateways (e.g., Twilio/AWS SNS) for customer phone alerts.
