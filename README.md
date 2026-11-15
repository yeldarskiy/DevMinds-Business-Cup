# GIMZUP

**Shop smarter. Save more.**

GIMZUP is a web shopping assistant that helps people compare everyday products and plan more affordable shopping trips. Users can search for products, compare store offers, check promotion rules, optimize a shopping basket, and turn past receipts into reusable shopping lists. The goal is to spend less time comparing stores and make better purchasing decisions.

## Who it's for

Our main audience is adults aged **25–45 in the United States**, especially working parents who regularly shop for their families. GIMZUP focuses on four categories: **Groceries, Household, Baby & Kids, and Health & Pharmacy**.

The first version contains sample product offers for Walmart, Amazon, Costco, Dollar General, and CVS Pharmacy. These are clearly marked as **demo data**, not live prices, inventory, or official retailer integrations.

## Run locally

You'll need **Java 17+** and **Maven 3.9+**.

From the project folder, run:

```bash
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`. To confirm it is running, open:

```text
http://localhost:8080/api/health
http://localhost:8080/api/products?q=peanut
```

The default setup uses an in-memory H2 database and loads sample data automatically. You don't need to install MySQL to try the backend.

## Run with MySQL and Docker

You'll need **Docker** with Docker Compose.

Copy `.env.example` to `.env` and change the passwords, then run:

```bash
docker compose up --build
```

The backend will be available at `http://localhost:8080`. Docker Compose starts both the Java API and MySQL.

## Tests

```bash
mvn clean verify
```

This runs the Maven tests and checks the configured minimum 50% line coverage using JaCoCo. The HTML coverage report is generated at `target/site/jacoco/index.html`.

## Frontend and backend together

This repository includes both applications without moving their source files: Spring Boot is in `src/`, and React/Vite is in `frontend/`.

Start the Java API in the project root:

```bash
mvn spring-boot:run
```

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api/*` to the Java application at `http://localhost:8080`. No extra environment variable is needed locally. You can confirm the proxy by running:

```bash
curl -i "http://localhost:5173/api/health"
curl -i "http://localhost:5173/api/products?q=milk"
```

Both should return JSON instead of HTML. The product list uses `/api/products`, `/api/stores`, and `/api/offers?productId=...`. Basket optimization calls `/api/cart/optimize` and adapts its response to the React display. Prices and promotions remain **sample data**, including when returned by Java, and are not verified live retailer feeds.

If the API is unreachable, the React catalog and calculations can fall back to the bundled demo dataset. To run the standalone frontend without an API on purpose, set `VITE_USE_DEMO=true` in `frontend/.env`. `VITE_API_BASE_URL` can optionally point to a backend origin such as `http://localhost:8080`; leave it empty for the Vite proxy or a same-origin deployment.

Receipt images are read with Tesseract.js in the browser and parsed by the existing Java receipt API. The dashboard stores uploaded receipt results in browser storage. The backend persists extracted receipt lines, not the original photos.

## One-server deployment

The existing full-stack Dockerfile builds the React frontend and serves it from Spring Boot on the same origin:

```bash
docker build -f Dockerfile.fullstack -t gimzup-fullstack .
docker run --rm -p 8080:8080 gimzup-fullstack
```

Open `http://localhost:8080` or `http://localhost:8080/app/basket`. The regular `Dockerfile` and `compose.yaml` remain backend-only and have not been rearranged. Local Node dependencies, Maven output, IDE settings, Git history, and macOS metadata are excluded from this source archive; install Java/Node dependencies normally on your machine.


## Receipt scanning

GIMZUP recognizes JPG and PNG receipt photos in the browser with Tesseract.js (English), then sends the extracted text to `POST /api/receipts/analyze` for server-side parsing, product matching and persistence. The Java API never receives the image. OCR may require a network connection to download its language model on the first use. Receipts with unclear photos or unusual item abbreviations may contain unmatched lines; review them before relying on savings estimates. Scanned PDFs are not supported.

After extracting this archive run `cd frontend && npm install` to install the OCR dependency and update `package-lock.json`, then `npm run dev`. Run the Java backend separately with `mvn spring-boot:run`. The Vite proxy forwards `/api` calls to port 8080.
