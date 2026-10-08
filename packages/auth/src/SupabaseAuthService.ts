import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type { User, CreditBalance } from '@cor/shared-types';
import type { AuthService } from './AuthService';

function mapSession(session: Session | null): User | null {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    name: (user.user_metadata?.name as string | undefined) || user.email || 'Asesor COR',
    email: user.email || '',
    planId: 'dealer',
  };
}

function mapAuthError(error: { message: string } | null | undefined, fallback: string): Error {
  if (!error) return new Error(fallback);
  // Supabase devuelve estos mensajes en inglés — se traducen los más comunes
  // para no mostrarle texto en inglés a un asesor durante la demo.
  if (/invalid login credentials/i.test(error.message)) {
    return new Error('Correo o contraseña incorrectos.');
  }
  if (/user already registered/i.test(error.message)) {
    return new Error('Ya existe una cuenta con ese correo.');
  }
  if (/password should be at least/i.test(error.message)) {
    return new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  return new Error(error.message || fallback);
}

/**
 * Proveedor real de cuentas (una por asesor) vía Supabase Auth
 * (email + contraseña). Necesita que el proyecto de Supabase tenga
 * desactivada la confirmación por correo ("Confirm email" en
 * Authentication → Providers → Email) para que crear una cuenta deje a
 * la persona adentro de inmediato — importante para una demo en vivo.
 */
export class SupabaseAuthService implements AuthService {
  private readonly client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.client.auth.getSession();
    return mapSession(data.session);
  }

  async getCreditBalance(): Promise<CreditBalance> {
    const user = await this.getCurrentUser();
    return {
      userId: user?.id ?? 'unknown',
      remaining: 1000,
      resetsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await this.client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw mapAuthError(error, 'No se pudo iniciar sesión.');
    const user = mapSession(data.session);
    if (!user) throw new Error('No se pudo iniciar sesión.');
    return user;
  }

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await this.client.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw mapAuthError(error, 'No se pudo crear la cuenta.');
    const user = mapSession(data.session);
    if (!user) {
      // El proyecto tiene activada la confirmación por correo: la cuenta se
      // creó pero todavía no hay sesión hasta que confirme el enlace.
      throw new Error('Cuenta creada. Revisa tu correo para confirmarla antes de entrar.');
    }
    return user;
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(mapSession(session));
    });
    return () => data.subscription.unsubscribe();
  }
}
