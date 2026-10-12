-- =============================================================================
-- V4__add_coupons_wishlist_reviews_settings_and_order_tracking.sql
-- Step 1: Complete persistence for Coupons, Wishlist, Reviews, Settings & Tracking
-- =============================================================================

-- 1. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL, -- 'PERCENTAGE' or 'FLAT'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, active, description)
VALUES 
('ILAHI10', 'PERCENTAGE', 10.00, 0.00, TRUE, '10% Storewide Discount on all items'),
('FLAT100', 'FLAT', 100.00, 500.00, TRUE, '₹100 Flat Savings on orders over ₹500'),
('FIRSTORDER', 'PERCENTAGE', 15.00, 0.00, TRUE, '15% First Order Special Discount')
ON DUPLICATE KEY UPDATE code=code;

-- 2. Extend Orders Table with coupon, discount & courier tracking info
ALTER TABLE orders 
ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL,
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN courier_name VARCHAR(100) DEFAULT NULL,
ADD COLUMN tracking_number VARCHAR(100) DEFAULT NULL,
ADD COLUMN order_notes TEXT DEFAULT NULL;

-- 3. Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uk_user_product UNIQUE (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default initial store settings
INSERT INTO store_settings (setting_key, setting_value)
VALUES 
('storeName', 'Ilahi Retail'),
('storeTagline', 'Toys, Kitchen & Clothes at Honest Prices'),
('logoText', 'IR'),
('logoImageUrl', ''),
('heroBadge', 'Premium Everyday Essentials'),
('heroTitle', 'Toys, Kitchen & Clothes at'),
('heroTitleHighlight', 'Ilahi Retail'),
('heroSubtitle', 'Discover our carefully curated collection for your family and home. Enjoy honest prices and safe Cash on Delivery.'),
('heroBgImage', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200'),
('promoBannerImage', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200'),
('announcementActive', 'true'),
('announcementText', '⚡ Festive Offer: Free Delivery on orders over ₹499! Use code ILAHI10 for 10% OFF'),
('announcementLink', '/products'),
('freeShippingThreshold', '499'),
('estimatedDeliveryDays', '2 - 4 Business Days'),
('codEnabled', 'true'),
('supportPhone', '+91 98765 43210'),
('supportEmail', 'support@ilahiretail.com'),
('whatsappNumber', '919876543210'),
('storeAddress', 'Shop No. 14, Main Market, Ilahi Retail Center, India'),
('businessHours', 'Mon - Sun: 9:00 AM - 10:00 PM'),
('instagramUrl', 'https://instagram.com'),
('facebookUrl', 'https://facebook.com'),
('twitterUrl', 'https://twitter.com')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
