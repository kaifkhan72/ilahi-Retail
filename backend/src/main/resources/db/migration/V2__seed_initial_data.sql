-- =============================================================================
-- V2__seed_initial_data.sql: Seed Initial Roles, Categories and Starter Products
-- =============================================================================

-- 1. Insert Standard Roles
INSERT INTO roles (id, name) VALUES
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert The Three Core Categories
INSERT INTO categories (id, name, description, active) VALUES
(1, 'Toys', 'Fun, educational, and engaging toys for all ages', TRUE),
(2, 'Kitchen', 'Durable cookware, kitchen essentials, and dining accessories', TRUE),
(3, 'Clothes', 'Comfortable, stylish, and high quality apparel', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Starter Products (Active with initial stock)
INSERT INTO products (id, name, description, price, stock, category_id, image_url, active) VALUES
(1, 'Remote Control Racing Car', 'High speed rechargeable drift race car with remote control.', 1499.00, 25, 1, '/uploads/sample-rc-car.jpg', TRUE),
(2, 'Wooden Educational Building Blocks', '100-piece natural wood building blocks for creative play.', 799.00, 40, 1, '/uploads/sample-blocks.jpg', TRUE),
(3, 'Stainless Steel Chef Knife Set', 'Set of 5 professional chef knives with ergonomic handles.', 1999.00, 20, 2, '/uploads/sample-knives.jpg', TRUE),
(4, 'Non-Stick Ceramic Frying Pan', 'Durable 28cm non-stick ceramic skillet for healthy cooking.', 1250.00, 30, 2, '/uploads/sample-pan.jpg', TRUE),
(5, 'Classic Cotton Crew Neck T-Shirt', '100% breathable combed cotton relaxed fit unisex t-shirt.', 499.00, 50, 3, '/uploads/sample-tshirt.jpg', TRUE),
(6, 'Slim Fit Denim Jeans', 'Premium stretchable denim jeans with classic 5-pocket styling.', 1599.00, 35, 3, '/uploads/sample-jeans.jpg', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);
