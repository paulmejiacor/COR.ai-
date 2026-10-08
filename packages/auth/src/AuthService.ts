import type { User, CreditBalance } from '@cor/shared-types';

/**
 * Contrato de identidad. `MockAuthService` resuelve siempre al mismo
 * usuario demo (sin pantalla de login) para no romper las pruebas y el modo
 * demo que ya funcionan en toda la app; `SupabaseAuthService` implementa
 * los mismos métodos contra cuentas reales (email + contraseña), una por
 * asesor.
 */
export interface AuthService {
  /** `null` = no hay sesión activa (debe mostrarse el login). */
  getCurrentUser(): Promise<User | null>;
  getCreditBalance(): Promise<CreditBalance>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(email: string, password: string, name: string): Promise<User>;
  signOut(): Promise<void>;
  /** Se dispara al iniciar/cerrar sesión. Devuelve una función para dejar de escuchar. */
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
