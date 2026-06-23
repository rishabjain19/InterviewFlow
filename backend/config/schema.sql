CREATE TABLE IF NOT EXISTS apc_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apc_id INTEGER NOT NULL REFERENCES apc_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  has_students BOOLEAN DEFAULT FALSE,
  has_cubicles BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  roll_no VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  cubicle_id INTEGER,
  whatsapp_sent BOOLEAN DEFAULT FALSE,
  whatsapp_failed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (session_id, roll_no)
);

CREATE TABLE IF NOT EXISTS cubicles (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  label VARCHAR(20) NOT NULL,
  current_student_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (session_id, label)
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id SERIAL PRIMARY KEY,
  cubicle_id INTEGER NOT NULL REFERENCES cubicles(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'done')),
  assigned_at TIMESTAMP DEFAULT NOW(),
  done_at TIMESTAMP,
  UNIQUE (cubicle_id, student_id)
);

ALTER TABLE students ADD CONSTRAINT IF NOT EXISTS fk_student_cubicle FOREIGN KEY (cubicle_id) REFERENCES cubicles(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE cubicles ADD CONSTRAINT IF NOT EXISTS fk_cubicle_current_student FOREIGN KEY (current_student_id) REFERENCES students(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS idx_students_session ON students(session_id);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(session_id, roll_no);
CREATE INDEX IF NOT EXISTS idx_cubicles_session ON cubicles(session_id);
CREATE INDEX IF NOT EXISTS idx_queue_cubicle ON queue_entries(cubicle_id);
CREATE INDEX IF NOT EXISTS idx_queue_student ON queue_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_entries(cubicle_id, status);
