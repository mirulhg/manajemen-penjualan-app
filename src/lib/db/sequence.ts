import Dexie from 'dexie';

import { db } from './database';

// Mengambil `count` nomor berurutan dan mengembalikan nomor pertamanya. Harus dipanggil di dalam transaksi
// pemanggil yang mencakup db.counters, supaya nomor dan penulisan data yang memakainya selalu satu kesatuan.
export async function nextSequences(name: string, count: number): Promise<number> {
  const transaction = Dexie.currentTransaction;
  if (!transaction?.storeNames.includes('counters')) {
    throw new Error('nextSequences harus dipanggil di dalam transaksi yang mencakup db.counters.');
  }

  const current = await db.counters.get(name);
  const first = (current?.value ?? 0) + 1;
  await db.counters.put({ name, value: first + count - 1 });
  return first;
}
