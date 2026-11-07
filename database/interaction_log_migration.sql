-- Run once to record authenticated users' visits to the main citizen sections.
CREATE TABLE IF NOT EXISTS nhat_ky_tuong_tac (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  section ENUM('tracking', 'consultant', 'matrix') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY nhat_ky_tuong_tac_user_created (user_id, created_at),
  CONSTRAINT nhat_ky_tuong_tac_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
