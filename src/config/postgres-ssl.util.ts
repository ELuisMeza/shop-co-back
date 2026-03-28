import type { TlsOptions } from 'tls';

/** Neon y otros Postgres en la nube suelen exigir TLS. Local: omitir DB_SSL o false. */
export function postgresSslFromEnv(): boolean | TlsOptions {
  if (process.env.DB_SSL === 'true') {
    return { rejectUnauthorized: true };
  }
  return false;
}
