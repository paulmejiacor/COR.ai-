/**
 * Rutas "próximamente": pantallas que Home ya puede abrir pero cuyo
 * contenido real se construye en una fase posterior del plan acordado.
 */
export type PlaceholderRoute = {
  title: string;
  phase: string;
};

export type RootStackParamList = {
  Home: undefined;
  Placeholder: PlaceholderRoute;
};
