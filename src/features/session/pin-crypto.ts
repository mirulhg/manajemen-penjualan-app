import type { HashedSecret } from '../../lib/db/records';

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;
// Tanpa 0/O/1/I/L agar kode yang ditulis tangan tidak ambigu.
const RECOVERY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const RECOVERY_LENGTH = 8;

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

async function derive(secret: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, HASH_BITS);
  return new Uint8Array(bits);
}

export async function hashSecret(secret: string): Promise<HashedSecret> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(secret, salt, ITERATIONS);
  return { hash: toBase64(hash), salt: toBase64(salt), iterations: ITERATIONS };
}

export async function verifySecret(secret: string, stored: HashedSecret): Promise<boolean> {
  const expected = fromBase64(stored.hash);
  const actual = await derive(secret, fromBase64(stored.salt), stored.iterations);
  if (actual.length !== expected.length) return false;

  // Seluruh byte dibandingkan; tidak berhenti di selisih pertama.
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= (actual[index] ?? 0) ^ (expected[index] ?? 0);
  }
  return difference === 0;
}

// Pengguna boleh mengetik huruf kecil, spasi, atau tanpa tanda hubung.
export function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, '');
}

export function formatRecoveryCode(normalized: string): string {
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

export function generateRecoveryCode(): string {
  const limit = 256 - (256 % RECOVERY_ALPHABET.length);
  let code = '';
  // Byte di atas batas dibuang agar setiap karakter punya peluang sama.
  while (code.length < RECOVERY_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(RECOVERY_LENGTH))) {
      if (byte < limit && code.length < RECOVERY_LENGTH) code += RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length];
    }
  }
  return formatRecoveryCode(code);
}
