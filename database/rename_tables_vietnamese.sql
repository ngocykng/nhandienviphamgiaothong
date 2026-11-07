-- Run once on the existing VietTraffic database after backing up the database.
-- The users table intentionally keeps its current name.
RENAME TABLE
  penalty_matrix TO bang_muc_phat,
  legal_queries TO lich_su_tu_van,
  violation_records TO ho_so_vi_pham;
