USE gadai_sakti;

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
  employment_type VARCHAR(80) NOT NULL DEFAULT 'Full Time',
  work_mode VARCHAR(80) NOT NULL DEFAULT 'On Site',
  experience_level VARCHAR(120) NOT NULL DEFAULT 'Fresh Graduate',
  education VARCHAR(120) NOT NULL DEFAULT 'SMA/SMK',
  salary_min DECIMAL(15,2) NULL,
  salary_max DECIMAL(15,2) NULL,
  application_deadline DATETIME NULL,
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

CREATE TABLE IF NOT EXISTS barang_api_mappings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  branch_code VARCHAR(80) NOT NULL,
  category_code VARCHAR(80) NOT NULL,
  brand_id VARCHAR(80) NOT NULL,
  product_id VARCHAR(80) NOT NULL,
  variant_id VARCHAR(80) NOT NULL,
  api_code VARCHAR(120) NOT NULL,
  request_code VARCHAR(80) NOT NULL DEFAULT 'BARANGGADAI',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_barang_api_mapping (branch_code, category_code, brand_id, product_id, variant_id),
  KEY idx_barang_api_mapping_active (is_active, branch_code, category_code),
  KEY idx_barang_api_mapping_api_code (api_code)
) ENGINE=InnoDB;
