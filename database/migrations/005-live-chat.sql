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
