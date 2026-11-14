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

## Frontend

The React interface is developed separately. During development, it can call the backend at `http://localhost:8080/api`. For deployment under one public URL, the React production build can be served by Spring Boot alongside its API.
