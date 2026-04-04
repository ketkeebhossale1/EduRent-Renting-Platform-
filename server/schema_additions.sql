-- Run in pgAdmin on database `postgres` after `user_orders` exists.
-- Stores listings, security deposits lifecycle, and damage reports.

CREATE TABLE IF NOT EXISTS rental_objects (
  id              VARCHAR(64) PRIMARY KEY,
  name            TEXT NOT NULL,
  category        VARCHAR(50) NOT NULL,
  price_per_day   NUMERIC(10, 2) NOT NULL,
  image_url       TEXT NOT NULL,
  condition       VARCHAR(20) NOT NULL
                    CHECK (condition IN ('excellent', 'good', 'fair')),
  description     TEXT NOT NULL,
  owner_name      VARCHAR(255) NOT NULL,
  owner_phone     VARCHAR(50) NOT NULL,
  owner_address   TEXT NOT NULL,
  owner_lat       DOUBLE PRECISION NOT NULL,
  owner_lng       DOUBLE PRECISION NOT NULL,
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  deposit_amount  NUMERIC(10, 2) NOT NULL,
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS deposit_records (
  id                 VARCHAR(64) PRIMARY KEY,
  username           VARCHAR(100) NOT NULL,
  rental_object_id   VARCHAR(64) REFERENCES rental_objects (id) ON DELETE SET NULL,
  object_name        TEXT NOT NULL,
  amount             NUMERIC(10, 2) NOT NULL,
  paid_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  return_date        TIMESTAMPTZ,
  status             VARCHAR(20) NOT NULL
                     CHECK (status IN ('held', 'returned'))
);

CREATE INDEX IF NOT EXISTS idx_deposit_records_username ON deposit_records (username);

CREATE TABLE IF NOT EXISTS damage_reports (
  id                   VARCHAR(64) PRIMARY KEY,
  username             VARCHAR(100) NOT NULL,
  object_name          TEXT NOT NULL,
  damage_description   TEXT NOT NULL,
  estimated_cost       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  report_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url            TEXT,
  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'reviewed', 'resolved'))
);

CREATE INDEX IF NOT EXISTS idx_damage_reports_username ON damage_reports (username);
