import type { User, CreditBalance } from '@cor/shared-types';

/**
 * Contract for identity and entitlement. A no-op mock backs this today
 * (single implicit demo user, unlimited credits) so screens can already
 * read "current user" / "plan" / "credits" without a real login flow.
 * A real provider (email/SSO + billing-linked credits) implements the
 * same three methods later.
 */
export interface AuthService {
  getCurrentUser(): Promise<User>;
  getCreditBalance(): Promise<CreditBalance>;
  signOut(): Promise<void>;
}
