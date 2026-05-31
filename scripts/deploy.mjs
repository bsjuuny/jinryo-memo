/**
 * deploy.mjs — jinryo-memo 정적 빌드 후 Café24 FTP 업로드
 *
 * 사용: npm run deploy
 * 전제: npm run build 가 먼저 실행되어 out/ 디렉토리가 생성되어 있어야 함
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ftp from 'basic-ftp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Café24 FTP 인증 정보를 scheduler .env.local 에서 읽음
function loadEnv(filePath) {
  try {
    const lines = readFileSync(filePath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // 파일 없으면 무시
  }
}

loadEnv('C:/github/scheduler/.env.local');
loadEnv('C:/github/scheduler/.env');

const HOST = process.env.CAFE24_FTP_HOST;
const USER = process.env.CAFE24_FTP_USER;
const PASS = process.env.CAFE24_FTP_PASS;
const SERVER_DIR = 'www/jinryo-memo';
const LOCAL_DIR = path.join(ROOT, 'out');

if (!HOST || !USER || !PASS) {
  console.error('❌ FTP 인증 정보 없음. CAFE24_FTP_HOST / USER / PASS 확인 필요');
  process.exit(1);
}

console.log(`📤 FTP 업로드 시작: ${LOCAL_DIR} → ${SERVER_DIR}`);

const client = new ftp.Client();
client.ftp.verbose = false;

try {
  await client.access({ host: HOST, user: USER, password: PASS, secure: false });
  await client.uploadFromDir(LOCAL_DIR, SERVER_DIR);
  console.log('✅ FTP 업로드 완료');
} catch (err) {
  console.error('❌ FTP 업로드 실패:', err.message);
  process.exit(1);
} finally {
  client.close();
}
