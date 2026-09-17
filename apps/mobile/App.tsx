import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { getAuthService } from '@cor/auth';
import { getStorageService } from '@cor/storage';
import { getAIImageService } from '@cor/ai-image-service';
import type { User } from '@cor/shared-types';

/**
 * Fase 1 placeholder: proves the monorepo wiring works end-to-end
 * (mobile app -> auth / storage / ai-image-service packages) before any
 * COR visual design (Fase 2) or real screens (Fase 3+) are built.
 */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    (async () => {
      const auth = getAuthService();
      const storage = getStorageService();
      const ai = getAIImageService();

      const [currentUser, projects] = await Promise.all([
        auth.getCurrentUser(),
        storage.listProjects(),
      ]);

      setUser(currentUser);
      setProjectCount(projects.length);
      setProviderReady(Boolean(ai));
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>COR AI AUTOMOTIVE STUDIO</Text>
      <Text style={styles.subtitle}>Fase 1 — Arquitectura</Text>
      <View style={styles.statusBlock}>
        <Text style={styles.statusLine}>Auth service: {user ? `OK (${user.name})` : 'cargando...'}</Text>
        <Text style={styles.statusLine}>Storage service: {projectCount === null ? 'cargando...' : `OK (${projectCount} proyectos)`}</Text>
        <Text style={styles.statusLine}>AI image service: {providerReady ? 'OK (mock provider)' : 'cargando...'}</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  statusBlock: {
    marginTop: 24,
    gap: 6,
    alignItems: 'flex-start',
  },
  statusLine: {
    fontSize: 13,
    color: '#333',
  },
});
