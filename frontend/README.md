# GIMZUP frontend

GIMZUP is a family shopping intelligence platform for US households: build a basket, detect promotions that cost more than they save, find the cheapest retailer for the whole basket, and verify real savings with receipts.

The app works immediately, with no sign-up. Without a backend it runs on a built-in sample dataset, and every figure from that dataset is labeled as demo data in the UI.

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, then click **Build Basket** or **View Demo** (loads a five-item sample basket).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Type-check the project with TypeScript (strict) |
| `npm run build` | Type-check, then build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

## Screens (hackathon MVP)

| Route | Screen |
| --- | --- |
| `/` | Landing page: navbar, hero, how it works, features, supported retailers, call to action, footer |
| `/app/basket` | Basket Builder: search, category filters, product grid, quantity controls, basket summary |
| `/app/report` | Basket Intelligence Report: false deals, misleading sale tags, quantity warnings, opportunities, recommendations |
| `/app/optimizer` | Smart Basket Optimizer: best store, savings, reasoning, store comparison with price breakdown, alternatives |
| `/app/receipt` | Receipt Verification: upload (JPG, JPEG, PNG, PDF), processing, extracted line items, predicted vs actual, verified savings |
| `/app/dashboard` | Savings Dashboard: monthly spending, savings, verified savings, score, trends, category breakdown, top retailers |

Demo flow for judges: Landing → View Demo → Analyze Basket (false deal on peanut butter) → Optimize Basket (Walmart) → Verify With Receipt → View Savings Dashboard.

## Retailers and catalog

Retailers: Walmart, Amazon, Costco, Dollar General, CVS Pharmacy.

29 products in four categories, each priced at every retailer that carries it:

- **Groceries:** Milk, Eggs, Bread, Peanut Butter, Rice, Pasta, Coffee, Bananas, Apples, Chicken Breast, Snacks, Fresh Produce
- **Household:** Laundry Detergent, Dish Soap, Toilet Paper, Paper Towels, Trash Bags, Cleaning Sponges
- **Baby & Kids:** Diapers, Baby Wipes, Baby Shampoo, Baby Formula, Baby Food
- **Health & Pharmacy:** Bandages, Thermometer, Pain Relief, First Aid Kit, Sunscreen, Vitamins

Prices (`src/data/prices.ts`) are derived from reference US shelf prices with per-retailer, per-category factors and a small seeded variation, so they are stable between reloads. Dollar General doesn't carry chicken breast or fresh produce; CVS doesn't carry chicken breast, apples, fresh produce or rice. Promotions live in `src/data/promotions.ts`. All of it is illustrative, not live, and implies no partnership with any retailer.

## How the logic works

- **Savings baseline:** the same everywhere: the basket priced at the average shelf price across the five retailers. Estimated savings (optimizer) and verified savings (receipt) are both measured against it.
- **Basket Intelligence** (`src/utils/basketIntelligence.ts`): flags multi-buy promotions that require more units than you need, promotions beaten by another retailer's everyday price, "was/now" sale tags whose sale price is still above average, and large quantities of perishables. Also surfaces genuine deals, bulk opportunities and big price gaps. Each insight has reasoning, a cost impact and a recommended action.
- **Deal analysis** (`src/utils/dealAnalyzer.ts`): deterministic rules. Promotions apply in full bundles. 20%+ off at your quantity is a great deal, 8%+ is good. Buying extra units only counts as good for non-perishables with at least 20% off (12% for warehouse bulk packs). If another retailer's everyday price beats the promo unit price, it's not worth it.
- **Optimizer** (`src/utils/optimizer.ts`): prices the whole basket at each retailer, ranks complete baskets first, explains the winner (items cheapest vs average, gap to the runner-up, membership and pickup notes), and suggests a two-store split when it beats the best store after a $4.50 extra-trip cost, or CVS as the convenience option for pharmacy-heavy baskets.
- **Receipt verification:** compares the receipt with the saved plan. With `VITE_API_BASE_URL` set, the file goes to the OCR endpoint. Without it, the app runs a clearly labeled demo OCR that returns what the chosen store would print for your plan, including small register price differences. It never claims to have read the uploaded file.

## Connecting the Spring Boot backend

Copy `.env.example` to `.env.local` and set the API base URL:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

All HTTP calls go through `src/services/`. Each method calls the backend when configured, checks the response against the contract in `src/types/index.ts`, and falls back to the demo dataset (reporting `source: 'demo'`) if the request fails or the shape doesn't match.

| Frontend method | Endpoint (`ENDPOINTS` in `src/services/api.ts`) |
| --- | --- |
| `productService.getProducts` | `GET /api/products` (products with a `quotes` array) |
| `basketService.analyze` | `POST /api/basket/analyze` → `BasketReport` |
| `basketService.optimize` | `POST /api/basket/optimize` → `OptimizeResult` |
| `receiptService.upload` | `POST /api/receipts/upload` (multipart `file`) |
| `dashboardService.getSummary` | `GET /api/dashboard` → `DashboardSummary` |

## State

There are no accounts. The basket, the chosen shopping plan and verified receipts are kept in `localStorage` under `gimzup:v1` (`src/state/AppState.tsx`). **Reset demo** in the sidebar clears them.

## Project structure

```
src/
  components/
    charts/       Recharts wrappers and chart theme
    layout/       App shell, journey sidebar, top bar
    marketing/    Landing page pieces
    products/     Product artwork, availability, price comparison modal
    ui/           Buttons, panels, inputs, modal, badges, state views
  data/           Demo dataset: retailers, catalog, prices, promotions, history
  hooks/          useAsync (loading / error / success)
  pages/          One file per screen, lazy loaded
  services/       API client and service layer with demo fallback
  state/          Basket, plan and receipts, persisted to localStorage
  types/          Shared TypeScript types / API contract
  utils/          Basket intelligence, optimizer, deal analysis, dashboard, formatting
```

Design tokens (colors, radii, shadows, font) live in `src/index.css` under `@theme`.
