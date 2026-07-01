/**
 * Database installer — creates the schema and seeds initial data using the
 * configured DB_* environment variables. Safe to run repeatedly.
 *
 *   node server/dist/scripts/install-db.js   (production, after build)
 *   npx tsx server/src/scripts/install-db.ts (dev)
 */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

function splitStatements(sql: string): string[] {
  const cleaned = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return cleaned
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function run() {
  const dbDir = path.resolve(process.cwd(), 'database');
  const schema = fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf8');

  const root = await mysql.createConnection({
    host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password,
    multipleStatements: false,
  });
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await root.end();

  const conn = await mysql.createConnection({
    host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password,
    database: env.db.name, multipleStatements: false,
  });

  console.log('Installing schema...');
  for (const stmt of splitStatements(schema)) await conn.query(stmt);
  console.log('Seeding data...');
  for (const stmt of splitStatements(seed)) await conn.query(stmt);
  await conn.end();
  console.log('✔ Database installed successfully.');
  console.log('  Login: admin@abilix.ai  /  Admin@12345');
}

run().catch((err) => {
  console.error('✖ Database installation failed:', err);
  process.exit(1);
});
