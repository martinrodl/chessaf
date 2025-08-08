import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function dateParts(d = new Date()) {
  const y = d.getFullYear().toString();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  return { y, m };
}

export async function ensureDir(p: string): Promise<void> {
  await fs.mkdir(p, { recursive: true });
}

export function hmacSignature(secret: string, body: string): string {
  const h = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${h}`;
}
