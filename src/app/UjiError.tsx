// Hanya terdaftar di router saat DEV, untuk mencoba tampilan RouteError.
export function UjiError(): never {
  throw new Error('Uji error boundary (hanya dev)');
}
