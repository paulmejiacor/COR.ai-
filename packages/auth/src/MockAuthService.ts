import type { User, CreditBalance } from '@cor/shared-types';
import type { AuthService } from './AuthService';

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Equipo COR',
  email: 'demo@cor-design.com',
  planId: 'dealer',
};

/**
 * Sin Supabase configurado, la app sigue entrando directo (sin login) como
 * el usuario demo — así todo lo probado hasta ahora (incluido este sandbox,
 * que no tiene acceso de red) sigue funcionando igual que antes de agregar
 * cuentas reales.
 */
export class MockAuthService implements AuthService {
  async getCurrentUser(): Promise<User> {
    return DEMO_USER;
  }

  async getCreditBalance(): Promise<CreditBalance> {
    return {
      userId: DEMO_USER.id,
      remaining: 1000,
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async signInWithEmail(): Promise<User> {
    return DEMO_USER;
  }

  async signUpWithEmail(): Promise<User> {
    return DEMO_USER;
  }

  async signOut(): Promise<void> {
    // No-op en el build demo.
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    callback(DEMO_USER);
    return () => {};
  }
}
