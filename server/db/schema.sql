CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS endpoints (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  expected_status INTEGER DEFAULT 200,
  check_interval INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ping_logs (
  id SERIAL PRIMARY KEY,
  endpoint_id INTEGER REFERENCES endpoints(id) ON DELETE CASCADE,
  status_code INTEGER,
  response_time_ms INTEGER,
  schema_changed BOOLEAN DEFAULT false,
  is_up BOOLEAN DEFAULT true,
  checked_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schema_snapshots (
  id SERIAL PRIMARY KEY,
  endpoint_id INTEGER REFERENCES endpoints(id) ON DELETE CASCADE,
  schema JSONB,
  captured_at TIMESTAMP DEFAULT NOW()
);