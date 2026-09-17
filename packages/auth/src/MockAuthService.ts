import type { User, CreditBalance } from '@cor/shared-types';
import type { AuthService } from './AuthService';

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Equipo COR',
  email: 'demo@cor-design.com',
  planId: 'dealer',
};

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

  async signOut(): Promise<void> {
    // No-op in the demo build.
  }
}
