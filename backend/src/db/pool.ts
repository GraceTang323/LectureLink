import "dotenv/config";
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const result = await pool.query('SELECT NOW()');
console.log('Database connection successful. Current time:', result.rows[0].now);

export default pool;