-- Migration 004: Explicit category and brand relationship
CREATE TABLE IF NOT EXISTS pawn_category_brands (
  category_id BIGINT UNSIGNED NOT NULL,
  brand_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id, brand_id),
  KEY idx_pawn_cat_brand_brand (brand_id),
  CONSTRAINT fk_pawn_cat_brand_category FOREIGN KEY (category_id) REFERENCES pawn_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_pawn_cat_brand_brand FOREIGN KEY (brand_id) REFERENCES pawn_brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Backfill relationships from existing pawn_products if any
INSERT IGNORE INTO pawn_category_brands (category_id, brand_id)
SELECT DISTINCT category_id, brand_id
FROM pawn_products
WHERE category_id IS NOT NULL AND brand_id IS NOT NULL;

