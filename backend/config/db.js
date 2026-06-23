const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

pool.connect((err, client, release) => {
  if (err) { console.error('❌ DB connection failed:', err.message); process.exit(1) }
  console.log('✅ Database connected')
  release()
})

module.exports = pool
