import pg from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pgPool = null;
let sqliteDb = null;
let usePostgres = false;

if (process.env.DATABASE_URL || process.env.PGHOST) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'clf_db'}`,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
    usePostgres = true;
    console.log('[Database] Initialized PostgreSQL pool connection.');
  } catch (err) {
    console.warn('[Database] PostgreSQL connection fallback to SQL database:', err.message);
  }
}

if (!usePostgres) {
  const dbPath = path.join(__dirname, 'clf_database.db');
  const sqliteInstance = sqlite3.verbose();
  sqliteDb = new sqliteInstance.Database(dbPath);
  console.log('[Database] Connected to SQL database file at:', dbPath);
}

export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (usePostgres) {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    }
  });
}

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (usePostgres) {
      let paramIndex = 1;
      const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve({ changes: res.rowCount });
      });
    } else {
      sqliteDb.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    }
  });
}

export async function initDb() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schemaSql.split(';').map(s => s.trim()).filter(Boolean);
  
  for (const stmt of statements) {
    try {
      await run(stmt);
    } catch (err) {
      // Ignore existing table errors
    }
  }

  const existingAdmin = await query('SELECT * FROM users WHERE role = ?', ['admin']);
  if (existingAdmin.length === 0) {
    await run(
      'INSERT INTO users (id, name, matric_number, student_id, email, password, role, is_banned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['user-admin', 'OAU Admin Moderation', 'ADMIN/OAU/001', 'ADMIN/OAU/001', 'admin@student.oauife.edu.ng', 'admin001', 'admin', false]
    );
  }
  
  console.log('[Database] PostgreSQL / SQL Schema initialized successfully.');
}
