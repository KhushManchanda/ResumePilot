import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ResumeJSON, VariantKey, ResumeVersion } from '../types';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../db/resumes.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_key TEXT NOT NULL UNIQUE,
      json_content TEXT NOT NULL,
      last_compiled_hash TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resume_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_key TEXT NOT NULL,
      json_content TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compiled_pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latex_hash TEXT NOT NULL UNIQUE,
      pdf_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Resume CRUD operations
export function getResume(variantKey: VariantKey): ResumeJSON | null {
  const stmt = db.prepare('SELECT json_content FROM resumes WHERE variant_key = ?');
  const row = stmt.get(variantKey) as { json_content: string } | undefined;

  if (!row) return null;
  return JSON.parse(row.json_content);
}

export function saveResume(resume: ResumeJSON): void {
  const stmt = db.prepare(`
    INSERT INTO resumes (variant_key, json_content, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(variant_key) 
    DO UPDATE SET 
      json_content = excluded.json_content,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(resume.variantKey, JSON.stringify(resume));
}

export function createVersion(variantKey: VariantKey, note?: string): number {
  const resume = getResume(variantKey);
  if (!resume) throw new Error(`Resume not found: ${variantKey}`);

  const stmt = db.prepare(`
    INSERT INTO resume_versions (variant_key, json_content, note)
    VALUES (?, ?, ?)
  `);

  const result = stmt.run(variantKey, JSON.stringify(resume), note || null);
  return result.lastInsertRowid as number;
}

export function getVersions(variantKey: VariantKey): ResumeVersion[] {
  const stmt = db.prepare(`
    SELECT id, variant_key, json_content, note, created_at
    FROM resume_versions
    WHERE variant_key = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(variantKey) as any[];
  return rows.map(row => ({
    id: row.id,
    variantKey: row.variant_key,
    jsonContent: row.json_content,
    note: row.note,
    createdAt: row.created_at
  }));
}

export function getVersion(versionId: number): ResumeVersion | null {
  const stmt = db.prepare(`
    SELECT id, variant_key, json_content, note, created_at
    FROM resume_versions
    WHERE id = ?
  `);

  const row = stmt.get(versionId) as any;
  if (!row) return null;

  return {
    id: row.id,
    variantKey: row.variant_key,
    jsonContent: row.json_content,
    note: row.note,
    createdAt: row.created_at
  };
}

// PDF cache operations
export function getCachedPDF(latexHash: string): string | null {
  const stmt = db.prepare('SELECT pdf_path FROM compiled_pdfs WHERE latex_hash = ?');
  const row = stmt.get(latexHash) as { pdf_path: string } | undefined;
  return row?.pdf_path || null;
}

export function cachePDF(latexHash: string, pdfPath: string): void {
  const stmt = db.prepare(`
    INSERT INTO compiled_pdfs (latex_hash, pdf_path)
    VALUES (?, ?)
    ON CONFLICT(latex_hash) DO NOTHING
  `);

  stmt.run(latexHash, pdfPath);
}

export function updateCompiledHash(variantKey: VariantKey, hash: string): void {
  const stmt = db.prepare(`
    UPDATE resumes
    SET last_compiled_hash = ?
    WHERE variant_key = ?
  `);

  stmt.run(hash, variantKey);
}

export default db;
