-- =============================================================================
-- V3__add_original_price.sql: Add original MRP price for discounts
-- =============================================================================

ALTER TABLE products ADD COLUMN original_price DECIMAL(10, 2) DEFAULT NULL AFTER price;

-- Set realistic market MRPs for initial seeded catalog to showcase immediate savings
UPDATE products SET original_price = 1999.00 WHERE id = 1;
UPDATE products SET original_price = 1199.00 WHERE id = 2;
UPDATE products SET original_price = 2999.00 WHERE id = 3;
UPDATE products SET original_price = 1799.00 WHERE id = 4;
UPDATE products SET original_price = 899.00 WHERE id = 5;
UPDATE products SET original_price = 2499.00 WHERE id = 6;
