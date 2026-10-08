import { getAuthService, type AuthService } from '@cor/auth';

/**
 * Igual que `EXPO_PUBLIC_FAL_KEY` en aiService.ts: vienen de `.env.local`
 * (nunca subido al repositorio). Sin estas dos, la app sigue entrando en
 * modo demo (un solo usuario, sin login) — con ellas, cada asesor necesita
 * su propia cuenta real para entrar.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function hasRealAuthProvider(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function resolveAuthService(): AuthService {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return getAuthService({ provider: 'supabase', url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });
  }
  return getAuthService({ provider: 'mock' });
}
