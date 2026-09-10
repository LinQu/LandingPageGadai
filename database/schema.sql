CREATE DATABASE IF NOT EXISTS gadai_sakti
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gadai_sakti;

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'editor') NOT NULL DEFAULT 'editor',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_sessions_token_hash (token_hash),
  KEY idx_admin_sessions_expiry (expires_at),
  CONSTRAINT fk_admin_sessions_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pawn item master. Records are never deleted; use status = inactive instead.
CREATE TABLE IF NOT EXISTS pawn_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  image_url VARCHAR(1000) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_pawn_categories_slug (slug), KEY idx_pawn_categories_list (status, sort_order, name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pawn_brands (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  logo_url VARCHAR(1000) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_pawn_brands_slug (slug), KEY idx_pawn_brands_list (status, sort_order, name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pawn_products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  brand_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  description TEXT NULL, search_keywords TEXT NULL, image_url VARCHAR(1000) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_pawn_products_slug (slug), KEY idx_pawn_products_list (status, category_id, brand_id, sort_order, name),
  CONSTRAINT fk_pawn_products_category FOREIGN KEY (category_id) REFERENCES pawn_categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pawn_products_brand FOREIGN KEY (brand_id) REFERENCES pawn_brands(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pawn_product_variants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL, name VARCHAR(180) NOT NULL, api_code VARCHAR(190) NOT NULL,
  default_price BIGINT UNSIGNED NULL,
  internal_note TEXT NULL, sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_pawn_variants_product (product_id, status, sort_order, name), KEY idx_pawn_variants_api_code (api_code),
  CONSTRAINT fk_pawn_variants_product FOREIGN KEY (product_id) REFERENCES pawn_products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pawn_category_brands (
  category_id BIGINT UNSIGNED NOT NULL,
  brand_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id, brand_id),
  KEY idx_pawn_cat_brand_brand (brand_id),
  CONSTRAINT fk_pawn_cat_brand_category FOREIGN KEY (category_id) REFERENCES pawn_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_pawn_cat_brand_brand FOREIGN KEY (brand_id) REFERENCES pawn_brands(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, admin_user_id BIGINT UNSIGNED NULL,
  entity_type VARCHAR(80) NOT NULL, entity_id BIGINT UNSIGNED NOT NULL, action VARCHAR(80) NOT NULL,
  before_data LONGTEXT NULL, after_data LONGTEXT NULL, ip_address VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_admin_audit_entity (entity_type, entity_id, created_at),
  CONSTRAINT fk_admin_audit_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  cover_image_url VARCHAR(1000) NULL,
  author VARCHAR(120) NOT NULL DEFAULT 'Tim Gadai Sakti',
  category VARCHAR(100) NOT NULL DEFAULT 'Edukasi',
  published_at DATETIME NOT NULL,
  read_time SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_public (status, published_at),
  KEY idx_articles_category (category),
  CONSTRAINT fk_articles_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS company_archives (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  description TEXT NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  document_type VARCHAR(120) NOT NULL DEFAULT 'Laporan Keberlanjutan',
  file_url VARCHAR(1000) NULL,
  cover_image_url VARCHAR(1000) NULL,
  published_at DATETIME NOT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_company_archives_slug (slug),
  KEY idx_company_archives_public (status, year, published_at),
  CONSTRAINT fk_company_archives_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- Career recruitment management
CREATE TABLE IF NOT EXISTS job_positions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL,
  summary TEXT NOT NULL,
  description LONGTEXT NOT NULL,
  responsibilities LONGTEXT NOT NULL,
  qualifications LONGTEXT NOT NULL,
  benefits LONGTEXT NOT NULL,
  location_city VARCHAR(120) NOT NULL,
  location_province VARCHAR(120) NOT NULL,
  placement_detail VARCHAR(255) NULL,
  employment_type VARCHAR(80) NOT NULL DEFAULT 'Full Time',
  work_mode VARCHAR(80) NOT NULL DEFAULT 'On Site',
  experience_level VARCHAR(120) NOT NULL DEFAULT 'Fresh Graduate',
  education VARCHAR(120) NOT NULL DEFAULT 'SMA/SMK',
  salary_min DECIMAL(15,2) NULL,
  salary_max DECIMAL(15,2) NULL,
  application_deadline DATETIME NULL,
  application_url VARCHAR(1000) NULL,
  published_at DATETIME NULL,
  status ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_job_positions_slug (slug),
  KEY idx_job_positions_public (status, published_at, application_deadline),
  KEY idx_job_positions_location (location_province, location_city),
  CONSTRAINT fk_job_positions_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS job_applications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_position_id BIGINT UNSIGNED NOT NULL,
  application_code VARCHAR(32) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  province VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(190) NOT NULL,
  status ENUM('submitted','hr_review','psychotest_invited','psychotest_completed','interview_hr','interview_user','document_check','offering','hired','rejected','withdrawn') NOT NULL DEFAULT 'submitted',
  internal_notes TEXT NULL,
  consent_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_job_applications_code (application_code),
  KEY idx_job_applications_job (job_position_id, created_at),
  KEY idx_job_applications_status (status, created_at),
  KEY idx_job_applications_email (email),
  CONSTRAINT fk_job_applications_position FOREIGN KEY (job_position_id) REFERENCES job_positions(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_sets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  instructions LONGTEXT NOT NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_psychotest_sets_status (status),
  CONSTRAINT fk_psychotest_sets_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_sections (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  test_set_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  instructions TEXT NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  section_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_psychotest_section_order (test_set_id, section_order),
  CONSTRAINT fk_psychotest_sections_set FOREIGN KEY (test_set_id) REFERENCES psychotest_sets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  section_id BIGINT UNSIGNED NOT NULL,
  question_text LONGTEXT NOT NULL,
  question_type ENUM('single_choice','multiple_choice','short_text','scale_1_5') NOT NULL DEFAULT 'single_choice',
  scoring_mode ENUM('none','objective') NOT NULL DEFAULT 'none',
  answer_key_json LONGTEXT NULL,
  weight DECIMAL(8,2) NOT NULL DEFAULT 1,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  question_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_psychotest_questions_section (section_id, question_order),
  CONSTRAINT fk_psychotest_questions_section FOREIGN KEY (section_id) REFERENCES psychotest_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_question_options (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  question_id BIGINT UNSIGNED NOT NULL,
  option_key VARCHAR(20) NOT NULL,
  option_text TEXT NOT NULL,
  display_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_psychotest_question_option (question_id, option_key),
  CONSTRAINT fk_psychotest_options_question FOREIGN KEY (question_id) REFERENCES psychotest_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  application_id BIGINT UNSIGNED NOT NULL,
  test_set_id BIGINT UNSIGNED NOT NULL,
  access_token_hash CHAR(64) NOT NULL,
  status ENUM('invited','in_progress','submitted','expired','cancelled') NOT NULL DEFAULT 'invited',
  expires_at DATETIME NOT NULL,
  started_at DATETIME NULL,
  submitted_at DATETIME NULL,
  current_section_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  section_started_at DATETIME NULL,
  raw_score DECIMAL(10,2) NULL,
  max_score DECIMAL(10,2) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_psychotest_assignment_token (access_token_hash),
  KEY idx_psychotest_assignment_application (application_id, created_at),
  KEY idx_psychotest_assignment_status (status, expires_at),
  CONSTRAINT fk_psychotest_assignments_application FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_psychotest_assignments_set FOREIGN KEY (test_set_id) REFERENCES psychotest_sets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_psychotest_assignments_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychotest_answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  assignment_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  answer_json LONGTEXT NOT NULL,
  is_correct TINYINT(1) NULL,
  score_value DECIMAL(10,2) NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_psychotest_answer (assignment_id, question_id),
  CONSTRAINT fk_psychotest_answers_assignment FOREIGN KEY (assignment_id) REFERENCES psychotest_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_psychotest_answers_question FOREIGN KEY (question_id) REFERENCES psychotest_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Live Chat customer service HO
CREATE TABLE IF NOT EXISTS live_chat_conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_token_hash CHAR(64) NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  status ENUM('open','assigned','closed') NOT NULL DEFAULT 'open',
  assigned_admin_id BIGINT UNSIGNED NULL,
  admin_last_read_at DATETIME NULL,
  source_page VARCHAR(500) NULL,
  last_message_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_live_chat_conversations_token (public_token_hash),
  KEY idx_live_chat_conversations_status (status, last_message_at),
  KEY idx_live_chat_conversations_phone (customer_phone, created_at),
  KEY idx_live_chat_conversations_admin (assigned_admin_id, status, last_message_at),
  CONSTRAINT fk_live_chat_conversations_admin FOREIGN KEY (assigned_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_chat_quick_replies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Umum',
  message TEXT NOT NULL,
  keywords TEXT NOT NULL,
  priority SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  auto_send TINYINT(1) NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_live_chat_quick_replies_active (active, auto_send, priority),
  CONSTRAINT fk_live_chat_quick_replies_admin FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_chat_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_type ENUM('customer','admin','bot') NOT NULL,
  sender_admin_id BIGINT UNSIGNED NULL,
  quick_reply_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  is_auto_reply TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_live_chat_messages_conversation (conversation_id, id),
  KEY idx_live_chat_messages_sender (conversation_id, sender_type, created_at),
  KEY idx_live_chat_messages_quick_reply (conversation_id, quick_reply_id),
  CONSTRAINT fk_live_chat_messages_conversation FOREIGN KEY (conversation_id) REFERENCES live_chat_conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_live_chat_messages_admin FOREIGN KEY (sender_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_live_chat_messages_quick_reply FOREIGN KEY (quick_reply_id) REFERENCES live_chat_quick_replies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_chat_agent_presence (
  admin_user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('online','busy','offline') NOT NULL DEFAULT 'offline',
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_user_id),
  KEY idx_live_chat_agent_presence_status (status, last_seen_at),
  CONSTRAINT fk_live_chat_agent_presence_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Syarat Gadai', 'Syarat', 'Untuk proses gadai, silakan siapkan KTP dan barang yang akan digadaikan. Admin HO akan membantu menjelaskan persyaratan sesuai jenis barang Anda.', 'syarat, persyaratan, ktp, dokumen', 100, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Syarat Gadai' LIMIT 1);
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Gadai Handphone', 'Produk', 'Handphone dapat digadaikan di Gadai Sakti. Boleh informasikan merk, tipe, kapasitas, dan kondisi HP Anda agar Admin HO dapat membantu lebih lanjut?', 'hp, handphone, smartphone, iphone, android', 90, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Gadai Handphone' LIMIT 1);
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Gadai Laptop', 'Produk', 'Laptop dapat digadaikan di Gadai Sakti. Boleh informasikan merk, tipe, spesifikasi utama, dan kondisi laptop Anda?', 'laptop, notebook, macbook', 90, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Gadai Laptop' LIMIT 1);
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Gadai Motor / BPKB', 'Produk', 'Untuk informasi gadai motor atau BPKB, boleh informasikan jenis kendaraan dan domisili Anda? Admin HO akan membantu mengarahkan proses berikutnya.', 'motor, sepeda motor, bpkb, kendaraan', 90, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Gadai Motor / BPKB' LIMIT 1);
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Lokasi Cabang', 'Cabang', 'Kami memiliki beberapa cabang Gadai Sakti. Boleh informasikan kota atau kabupaten domisili Anda agar Admin HO dapat membantu mencarikan cabang terdekat?', 'lokasi, cabang, alamat, terdekat, dimana', 80, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Lokasi Cabang' LIMIT 1);
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active)
SELECT 'Estimasi Pencairan', 'Simulasi', 'Nilai pencairan menyesuaikan jenis, tipe, kondisi barang, dan cabang. Silakan informasikan detail barang Anda, kemudian Admin HO akan membantu mengarahkan ke simulasi yang sesuai.', 'harga, taksiran, estimasi, cair, pencairan, berapa', 70, 0, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Estimasi Pencairan' LIMIT 1);
