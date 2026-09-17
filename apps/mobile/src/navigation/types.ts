/**
 * Rutas "próximamente": pantallas que ya se pueden abrir pero cuyo
 * contenido real se construye en una fase posterior del plan acordado.
 * Cuando la fotografía ya existe (Fase 5), se adjunta para previsualizarla
 * aunque la detección real del vehículo todavía no esté construida.
 */
export type PlaceholderRoute = {
  title: string;
  phase: string;
  photoUri?: string;
};

export type RootStackParamList = {
  Home: undefined;
  NewCreation: undefined;
  Camera: undefined;
  Placeholder: PlaceholderRoute;
};
