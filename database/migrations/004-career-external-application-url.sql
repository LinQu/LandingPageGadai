USE gadai_sakti;

-- Alur lamaran baru: kandidat diarahkan ke sistem rekrutmen eksternal.
-- Nullable agar data lowongan lama tetap valid; API mewajibkannya saat status Published.
ALTER TABLE job_positions
  ADD COLUMN IF NOT EXISTS application_url VARCHAR(1000) NULL AFTER application_deadline;
