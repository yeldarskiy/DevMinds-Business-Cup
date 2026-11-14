CREATE TABLE IF NOT EXISTS stores (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    channel VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY,
    sku VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(40) NOT NULL,
    package_size DECIMAL(12,3) NOT NULL,
    package_unit VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    regular_price DECIMAL(12,2) NOT NULL,
    loyalty_price DECIMAL(12,2),
    buy_quantity INT NOT NULL DEFAULT 0,
    free_quantity INT NOT NULL DEFAULT 0,
    availability VARCHAR(20) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    source_url VARCHAR(500),
    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(36) PRIMARY KEY,
    store_name VARCHAR(120) NOT NULL,
    parsed_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipt_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_id VARCHAR(36) NOT NULL,
    description VARCHAR(120) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    matched_product_id BIGINT,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id),
    FOREIGN KEY (matched_product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS saved_baskets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_basket_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    basket_id VARCHAR(36) NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (basket_id) REFERENCES saved_baskets(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
