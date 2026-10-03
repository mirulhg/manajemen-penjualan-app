type SessionErrorCode = 'PIN_NOT_SET' | 'PIN_ALREADY_SET' | 'WRONG_PIN' | 'LOCKED' | 'INVALID_PIN_FORMAT';

type SessionErrorDetail = { lockedUntil?: string; remainingAttempts?: number };

const MESSAGES: Record<SessionErrorCode, string> = {
  PIN_NOT_SET: 'PIN belum dibuat. Buat PIN di halaman Pengaturan.',
  PIN_ALREADY_SET: 'PIN sudah dibuat. Gunakan Ubah PIN.',
  WRONG_PIN: 'PIN salah.',
  LOCKED: 'Terlalu banyak percobaan.',
  INVALID_PIN_FORMAT: 'PIN harus 4–6 angka.',
};

export class SessionError extends Error {
  readonly code: SessionErrorCode;
  readonly lockedUntil: string | null;
  readonly remainingAttempts: number | null;

  constructor(code: SessionErrorCode, detail: SessionErrorDetail = {}) {
    super(MESSAGES[code]);
    this.name = 'SessionError';
    this.code = code;
    this.lockedUntil = detail.lockedUntil ?? null;
    this.remainingAttempts = detail.remainingAttempts ?? null;
  }
}
