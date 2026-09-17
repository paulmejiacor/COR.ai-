import type { AuthService } from './AuthService';
import { MockAuthService } from './MockAuthService';

export * from './AuthService';
export { MockAuthService } from './MockAuthService';

let instance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!instance) instance = new MockAuthService();
  return instance;
}
