import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, Pressable, View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Header, Text, SectionLabel, Surface, Button, Icon, useTheme } from '@cor/design-system';
import { getStorageService } from '@cor/storage';
import type { Project, ProjectStatus } from '@cor/shared-types';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const STATUS_LABEL_ES: Record<ProjectStatus, string> = {
  draft: 'Borrador',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Fallido',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} · ${hh}:${mm}`;
}

function projectToResultParams(project: Project): RootStackParamList['Result'] | null {
  const { latestResult } = project;
  if (!latestResult) return null;
  return {
    photoUri: project.vehicle.sourcePhoto.uri,
    photoWidth: project.vehicle.sourcePhoto.width,
    photoHeight: project.vehicle.sourcePhoto.height,
    source: project.vehicle.sourcePhoto.source,
    sceneDescription: project.scene.prompt,
    composition: latestResult.requestSnapshot.composition,
    resultImageUri: latestResult.resultImageUri,
  };
}

export function HistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[] | null>(null);

  const reload = useCallback(() => {
    getStorageService()
      .listProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleOpen = (project: Project) => {
    const params = projectToResultParams(project);
    if (!params) {
      Alert.alert('Sin resultado', 'Este proyecto todavía no tiene una imagen generada.');
      return;
    }
    navigation.navigate('Result', params);
  };

  const handleDuplicate = async (project: Project) => {
    await getStorageService().duplicateProject(project.id);
    reload();
  };

  const handleDelete = (project: Project) => {
    Alert.alert('Eliminar proyecto', `¿Eliminar "${project.name}" del historial? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await getStorageService().deleteProject(project.id);
          reload();
        },
      },
    ]);
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.xl }}>
        <Header title="Mis proyectos" onBack={() => navigation.goBack()} />
      </View>

      {projects === null ? (
        <View style={styles.centered}>
          <Text variant="bodySmall" color="secondary">
            Cargando historial...
          </Text>
        </View>
      ) : projects.length === 0 ? (
        <View style={[styles.centered, { paddingHorizontal: theme.spacing.xl }]}>
          <Icon name="folder" size={32} color={theme.colors.textSecondary} />
          <Text variant="title" align="center" style={{ marginTop: theme.spacing.lg }}>
            Aún no hay proyectos
          </Text>
          <Text variant="bodySmall" color="secondary" align="center" style={{ marginTop: theme.spacing.xs }}>
            Cada creación que guardes desde "Resultado" aparecerá aquí.
          </Text>
          <View style={{ marginTop: theme.spacing.xxl, width: '100%' }}>
            <Button label="NUEVA CREACIÓN" fullWidth onPress={() => navigation.navigate('NewCreation')} />
          </View>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }}
          ListHeaderComponent={
            <SectionLabel>
              {`${projects.length} ${projects.length === 1 ? 'proyecto guardado' : 'proyectos guardados'}`}
            </SectionLabel>
          }
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onOpen={() => handleOpen(item)}
              onDuplicate={() => handleDuplicate(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </Screen>
  );
}

function ProjectCard({
  project,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const thumbnailUri = project.latestResult?.resultImageUri ?? project.vehicle.sourcePhoto.uri;
  const statusColor =
    project.status === 'completed'
      ? theme.semantic.success
      : project.status === 'failed'
        ? theme.semantic.danger
        : theme.colors.textSecondary;

  return (
    <Surface style={{ marginTop: theme.spacing.md }} bordered>
      <Pressable onPress={onOpen} style={styles.row}>
        <Image
          source={{ uri: thumbnailUri }}
          style={[styles.thumb, { borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceAlt }]}
        />
        <View style={styles.info}>
          <Text variant="bodySmall" numberOfLines={1}>
            {project.name || 'Proyecto sin nombre'}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 3 }}>
            {project.scene.prompt || 'Escenario personalizado'}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text variant="caption" color="secondary">
              {STATUS_LABEL_ES[project.status]} · {formatDate(project.updatedAt)}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={[styles.actions, { borderTopColor: theme.colors.border, marginTop: theme.spacing.md }]}>
        <Pressable onPress={onDuplicate} hitSlop={8} style={styles.actionButton}>
          <Icon name="copy" size={17} color={theme.colors.textSecondary} />
          <Text variant="caption" color="secondary">
            Duplicar
          </Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.actionButton}>
          <Icon name="trash" size={17} color={theme.semantic.danger} />
          <Text variant="caption" style={{ color: theme.semantic.danger }}>
            Eliminar
          </Text>
        </Pressable>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  thumb: {
    width: 64,
    height: 64,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
