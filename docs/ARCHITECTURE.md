# COR AI Automotive Studio — Arquitectura (Fase 1)

## 1. Decisión de stack

**React Native + Expo + TypeScript**, en monorepo (npm workspaces).

| Criterio | React Native (Expo) | Flutter |
|---|---|---|
| Cámara + galería | `expo-camera`, `expo-image-picker` maduros, acceso nativo | Buenos plugins, algo más de fricción en Expo-equivalente |
| Procesamiento de imagen | `expo-image-manipulator`, `@shopify/react-native-skia` (compositing, máscaras, comparador antes/después) | `dart:ui`/Skia nativo, muy capaz pero ecosistema de terceros más chico |
| Integración futura con APIs de IA | Ecosistema JS/TS enorme, mismo lenguaje que un backend Node/TS futuro | Requiere HTTP clients Dart, menos librerías de referencia para SDKs de IA |
| Iteración por fases / demo | Expo Go + hot reload, `expo export` para validar sin simulador | Requiere toolchain Flutter completo |
| Costo/mantenimiento | Un solo lenguaje end-to-end (app + backend + tipos compartidos) | Dart solo en el front, duplica tipos con el backend |

Flutter se consideró seriamente por su control de renderizado (útil para el editor de composición), pero para este producto —que depende de conectar proveedores de IA externos, iterar rápido por fases, y eventualmente compartir tipos con un backend— React Native/Expo tiene mejor balance costo/velocidad/escalabilidad. Si más adelante el compositing en tiempo real exige más control de GPU, Skia (vía `react-native-skia`) cubre ese caso sin cambiar de framework.

## 2. Estructura del monorepo

```
/apps
  /mobile                 Frontend (Expo, React Native, TypeScript)
/packages
  /shared-types           Tipos TS compartidos: Vehicle, Scene, Project, Generation, Export, Account
  /ai-image-service       AI_IMAGE_SERVICE — capa de servicio de IA, provider-agnostic
  /image-processing       Matemática de composición, watermark, presets de exportación
  /storage                Contrato de persistencia de proyectos (mock en memoria hoy)
  /auth                   Contrato de identidad/plan/créditos (mock hoy)
/docs
  ARCHITECTURE.md         Este documento
```

Cada paquete se resuelve como `@cor/<nombre>` vía npm workspaces; Metro (bundler de Expo) los enlaza automáticamente por symlink — ya verificado con `expo export --platform web` (192 módulos, incluyendo los 5 paquetes).

## 3. Separación de responsabilidades (instrucción 19)

- **Frontend** (`apps/mobile`): pantallas, navegación, estado de UI, sistema visual COR.
- **AI_IMAGE_SERVICE** (`packages/ai-image-service`): única puerta de entrada a todo lo relacionado con IA. Interfaz `AIImageService` con `detectVehicle`, `assistPrompt`, `generate`, `checkVehicleIntegrity`. Hoy implementada por `MockAIImageService` (delays simulados, passthrough de imagen). Conectar un proveedor real = escribir una clase nueva que implemente la misma interfaz y cambiar una línea en la factory `getAIImageService()`. Ninguna pantalla depende de la implementación concreta.
- **Image Processing** (`packages/image-processing`): funciones puras — transformar `CompositionSettings` en una transformación de capa (posición/escala/rotación/distancia, nunca deforma el vehículo), calcular la posición del watermark, resolver especificaciones de exportación por preset.
- **Storage** (`packages/storage`): contrato `StorageService` (listar/guardar/duplicar/eliminar proyectos). Hoy en memoria; se reemplaza por AsyncStorage on-device y luego por backend en la nube sin tocar pantallas.
- **Auth** (`packages/auth`): contrato `AuthService` (usuario actual, plan, créditos). Hoy un usuario demo fijo; listo para login real y facturación.

## 4. Pipeline de generación (instrucción 29)

```
FOTOGRAFÍA ORIGINAL
  → SEGMENTACIÓN DEL VEHÍCULO       (AIImageService.detectVehicle)
  → MÁSCARA + PROTECCIÓN            (VehicleMask, Vehicle Lock)
  → GENERACIÓN DEL FONDO
  → COMPOSICIÓN                     (image-processing: computeVehicleTransform)
  → MATCHING DE ILUMINACIÓN
  → COLOR GRADING
  → UPSCALE
  → EXPORTACIÓN                     (image-processing: resolveExportSpec)
```

Las etapas intermedias de generación están modeladas como `GenerationStage` (`analyzing_vehicle`, `protecting_identity`, `building_scene`, `matching_lighting`, `applying_finish`, `preparing_output`), cada una con su copy en español ya definido para la pantalla de procesamiento (Fase 9).

`VehicleIntegrityReport` modela la validación conceptual post-generación (instrucción 28): compara la región del vehículo contra la referencia y marca atributos sospechosos (rines, faros, silueta, color, carrocería, emblemas, proporciones).

## 5. Preparado para escalar (instrucción 22/23)

Ya definidos en `shared-types` sin backend real todavía:
- `User`, `Plan` (`free` / `pro` / `dealer` / `enterprise`), `CreditBalance`.
- `Project` con `history: GenerationResult[]` — soporta directamente "mismo vehículo, múltiples spots" (instrucción 27) sin cambios de modelo.

Cuando exista backend, `storage` y `auth` pasan de mock a clientes HTTP/SDK sin cambiar el resto de la app.

## 6. Sistema visual COR (Fase 2)

Nuevo paquete `packages/design-system` (`@cor/design-system`), consumido por `apps/mobile`:

- **Tokens** (`src/tokens`): paleta oficial (`brand`), tema oscuro/claro derivado semánticamente (nunca colores nuevos), escala de espaciado/radios, escala tipográfica.
- **Tipografía**: Proxima Nova Alt (la del manual) no está disponible como archivo licenciado en este entorno; se usa **Plus Jakarta Sans** como sustituto temporal (geometría y calidez cercanas). Cambiar a la fuente real es editar `tokens/typography.ts` — ningún componente depende del nombre de la fuente directamente.
- **Logo**: `packages/design-system/src/components/Logo.tsx` es una **reconstrucción provisional** del isologo (no existe el vectorial oficial en el repo). Sigue la propia lógica de construcción del manual: el símbolo ∞ ("intervención tipográfica") dibujado en SVG + la "R" ("tipografía principal") en la fuente del sistema con el peso más pesado. Debe reemplazarse por el asset oficial (.svg/.ai exportado) en cuanto el equipo de marca lo entregue — está aislado en un único componente para que ese reemplazo sea trivial.
- **Componentes base**: `Text` (variantes de la escala tipográfica), `Button` (primary/secondary/ghost), `Surface` (tarjeta), `Screen` (contenedor con fondo + safe area), `SectionLabel` (etiqueta mayúscula subrayada, tal como aparece en el manual), `CornerBrackets` (motivo decorativo de esquinas del manual, solo para momentos hero), `Divider`.
- Tema oscuro como identidad primaria (fondo `Black`/`Moss`, texto `Aloe`), por ser el tratamiento que usa el propio manual en sus páginas de marca.

`App.tsx` en la Fase 2 fue una pantalla de verificación del sistema visual (paleta, tipografía, botones, logo); en la Fase 3 se reemplaza por la navegación real (ver sección 7).

## 7. Home y navegación (Fase 3)

- `@react-navigation/native` + `native-stack` como router. Header nativo desactivado (`headerShown: false`): cada pantalla usa el componente `Header` propio del design system para mantener el look COR consistente (sin la barra nativa de iOS/Android).
- `apps/mobile/src/navigation/RootNavigator.tsx` define el stack: `Home` y `Placeholder`. `Placeholder` es un destino genérico y reutilizable — muestra el título de la sección y la fase del roadmap en la que se construye su contenido real. Los 5 accesos de Home (Nueva Creación, Mis proyectos, Plantillas, Exportaciones, Configuración) navegan ahí hasta que cada fase construya su pantalla definitiva; así el flujo es "probable" en cada fase sin dejar botones muertos.
- `HomeScreen` sigue la sección 3 del brief: título/logo, subtítulo "Transforma el escenario. Conserva el auto.", CTA principal "NUEVA CREACIÓN" y una grilla 2×2 de accesos secundarios (Mis proyectos / Plantillas / Exportaciones / Configuración).
- Nuevos componentes de design system que nacen aquí porque los va a reutilizar toda pantalla futura: `Header` (con back button), `Icon` (set mínimo propio: chevronLeft, folder, grid, download, sliders — sin librería de íconos externa) y `NavCard`.

## 8. Estado verificado

- `npm run typecheck` — pasa en los 7 workspaces (mobile + 6 paquetes).
- `npx expo export --platform web` — bundlea correctamente resolviendo todos los paquetes `@cor/*` y `@react-navigation/*` (542 módulos).
- Verificación visual (Chromium headless, 390×844): Home renderiza según spec; tocar "NUEVA CREACIÓN" navega al placeholder con header, back button y la etiqueta de fase correctas; sin errores de consola.

## 9. Flujo "Nueva Creación" (Fase 4)

`NewCreationScreen` (ruta `NewCreation`) es el punto de entrada al que lleva el botón "NUEVA CREACIÓN" de Home. Ofrece exactamente las dos opciones del brief — "Tomar foto" y "Usar galería" — usando el nuevo componente `OptionTile` (icono + título + descripción + chevron, reutilizable en futuras listas de selección como escenarios o plantillas). La captura real de cámara/galería es la Fase 5, así que ambas opciones navegan por ahora al placeholder etiquetado con esa fase. Íconos nuevos en el set propio: `camera`, `image`, `chevronRight`.

## 10. Carga de fotografía real (Fase 5)

- `expo-camera`: `CameraCaptureScreen` (ruta `Camera`) — vista de cámara en vivo a pantalla completa con overlay propio (back button, `CornerBrackets` como guía de encuadre, texto "Encuadra el vehículo completo", botón disparador). Maneja el estado de permiso con `useCameraPermissions` mostrando una pantalla de solicitud si aún no fue concedido, en vez de dejar que el sistema operativo lo resuelva sin contexto.
- `expo-image-picker`: la opción "Usar galería" en `NewCreationScreen` pide permiso con `requestMediaLibraryPermissionsAsync` y abre el selector nativo con `launchImageLibraryAsync`.
- Ambos caminos producen un `SourcePhoto` real (`@cor/shared-types`) — no un mock — y navegan al placeholder de la Fase 6 pasándole la URI de la foto. `PlaceholderScreen` ahora sabe mostrar esa previsualización cuando existe, así que el flujo se siente completo aunque la detección del vehículo todavía no esté construida.
- Permisos declarados en `app.json` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` en iOS; plugins `expo-camera`/`expo-image-picker` para Android).

## 11. Estado verificado (Fase 5)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores (569 módulos).
- Verificación real en Chromium: **galería** — se seleccionó un archivo real vía el file chooser del navegador y la foto llegó correctamente al placeholder de Fase 6. **Cámara** — con un dispositivo de video simulado (`--use-fake-device-for-media-stream`) el preview en vivo se renderizó (overlay, guía de encuadre, disparador) y `takePictureAsync` capturó un frame real que también llegó al placeholder. Sin errores de consola en ningún caso.

## 12. Detección del vehículo (Fase 6)

- `DetectionScreen` (ruta `Detection`): pantalla de preparación. Llama a `getAIImageService().detectVehicle(photo)` — hoy el mock, mañana el proveedor real, sin cambiar esta pantalla. Mientras responde muestra "Analizando vehículo..." con un pulso animado sobre `CornerBrackets`; al resolver muestra "Vehículo detectado", el porcentaje de confianza y una previsualización tipo spotlight (la zona detectada se resalta, el resto se atenúa) — es una heurística visual, no segmentación real por píxel, ya que el proveedor de IA todavía es un mock.
- `MaskReviewScreen` (ruta `MaskReview`, abierta desde "Revisar selección"): corrección manual real de la máscara con las 4 herramientas del brief — **Agregar área** / **Eliminar área** (dibujo a mano alzada con `PanResponder` + `react-native-svg`, un color por modo), **Deshacer** (quita el último trazo) y **Restaurar** (limpia todos). El trazo en sí es una interacción real, no simulada — lo único mock sigue siendo la máscara automática de fondo que se corrige.
- `MaskEditOp` (`@cor/shared-types`) se ajustó: `restore` ya no pide un `pathId` (es un reinicio completo, no restaurar una región puntual).
- Bug encontrado y corregido durante la verificación: el `<Svg>` de la máscara no tenía `width`/`height` explícitos, así que el navegador le aplicaba el tamaño por defecto de un `<svg>` (300×150) en vez de llenar el marco — los trazos se creaban pero no se veían. Se corrigió pasando `width="100%" height="100%"` al componente.

## 13. Estado verificado (Fase 6)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores.
- Verificación real en Chromium: foto real (galería) → "Analizando vehículo..." → "Vehículo detectado" con el spotlight y confianza (97%) → "Revisar selección" → se dibujaron trazos reales de agregar (verde) y quitar (rojo), el contador de correcciones se actualizó, y "Deshacer" quitó el último trazo correctamente. Sin errores de consola.

## 14. Selección de escenario (Fase 7)

- `SceneSelectionScreen` (ruta `SceneSelection`): campo de texto libre "Describe el escenario..." + plantillas agrupadas por categoría (`Showroom COR`, `Automotriz`, `Urbano`, `Naturaleza`, `Noche`) en filas horizontales con scroll, tal como pide el brief. Tocar una plantilla llena el texto con su `basePrompt` y la resalta; editar el texto a mano la deselecciona.
- **Plantillas reales, sin stock genérico inventado**: dos de las plantillas de "Showroom COR" son los propios renders del manual de marca (la fachada al atardecer y el interior con el isologo en la pared) — recortados de las páginas de "Aplicaciones gráficas" del PDF, redimensionados y empacados como `apps/mobile/assets/scenes/*.jpg`. El resto (Dark Studio, Marble Showroom, Ciudad Moderna, Montaña, Desierto, Playa, Pista de Carreras, Garage, Ciudad de Noche) son fotos de Unsplash — licencia gratuita, uso comercial permitido, sin atribución obligatoria — buscadas vía el conector de Unsplash y referenciadas por URL en `apps/mobile/src/data/scenePresets.ts`.
- Ese archivo define `UIScenePreset` (con `thumbnail: ImageSourcePropType`) deliberadamente **fuera** de `@cor/shared-types`, para no acoplar el paquete de dominio (pensado para reutilizarse en un futuro backend) a tipos de React Native.
- Al continuar, la descripción final (manual o de plantilla) viaja como `note` en `PlaceholderRoute` hacia el placeholder de la Fase 8, que ya sabe mostrarla junto a la foto — el mismo patrón usado en fases anteriores.

## 15. Estado verificado (Fase 7)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores, assets locales (`cor-showroom-*.jpg`) incluidos en el bundle.
- Verificación real en Chromium: las dos plantillas propias de COR (imágenes locales) cargan correctamente; las plantillas de Unsplash no cargaron en esta verificación porque el proxy de red de este entorno de pruebas bloquea `images.unsplash.com` — confirmado con una prueba de conexión directa (403 del proxy) — pero es una CDN pública sin restricciones, así que cargarán con normalidad en el teléfono del usuario. Seleccionar una plantilla rellena el texto correctamente, y "CONTINUAR" navega a la Fase 8 con el escenario elegido visible. Sin errores de consola relacionados con el código de la app.

## 16. Editor de composición (Fase 8)

- `CompositionEditorScreen` (ruta `CompositionEditor`): controles de **Posición** (`SegmentedControl` izquierda/centro/derecha), **Escala**, **Altura visual**, **Distancia** y **Rotación** (opcional), todos usando `computeVehicleTransform` de `@cor/image-processing` (ya existía desde la Fase 1) para convertir los valores en una transformación de capa — el vehículo se mueve/escala/rota como imagen completa, nunca se deforma.
- Nuevos componentes de design system, reutilizables en fases futuras: `Slider` (control deslizante propio, sin dependencia nativa) y `SegmentedControl` (genérico, tipado).
- La vista previa compone la fotografía del vehículo sobre la miniatura del escenario elegido en la Fase 7 (o un fondo neutro si el usuario escribió texto libre sin elegir plantilla).
- Al continuar, un resumen legible de la composición (posición/escala/rotación/distancia) se agrega a la descripción del escenario y viaja hacia el placeholder de la Fase 9.
- **Manipulación directa** (pedido por el usuario tras probar la Fase 8): además de los controles, el vehículo se puede arrastrar con un dedo y escalar con pellizco de dos dedos directamente sobre la vista previa, con `PanResponder` detectando 1 vs. 2 toques (sin dependencia nativa de gestos). El arrastre mueve un offset manual que se superpone a la posición elegida en el `SegmentedControl`; tocar un preset de posición reinicia ese offset. El pellizco escribe directamente sobre `settings.scale`, así que el slider de Escala siempre queda sincronizado con lo que se ve.

## 17. Estado verificado (Fase 8)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores.
- Verificación real en Chromium: arrastrar el slider de Escala cambia el tamaño del vehículo en vivo (probado hasta 1.35x); tocar "Izquierda" lo reposiciona sin deformarlo; arrastrar Rotación lo gira visiblemente (probado a 6°); "CONTINUAR" navega a la Fase 9 con el resumen completo de la composición. Sin errores de consola.
- Verificación del arrastre directo: simular un drag de mouse sobre el vehículo lo mueve en tiempo real siguiendo el cursor, y tocar un preset de posición después reinicia limpiamente el offset manual. El pellizco de dos dedos no se pudo simular en este entorno headless (no hay multi-touch real), así que su confirmación final queda pendiente de prueba en el teléfono del usuario — la lógica es simétrica a la del arrastre, ya verificada.

## 18. Pantalla de procesamiento (Fase 9)

- `ProcessingScreen` (ruta `Processing`): arma un `GenerationRequest` real (vehículo + máscara + escena + composición de la Fase 8 + watermark por defecto) y llama a `getAIImageService().generate(request, onProgress)` — el mismo mock definido desde la Fase 1, sin cambios. Cuando se conecte un proveedor real (Fase 14), esta pantalla no cambia: solo cambia qué clase devuelve `getAIImageService()`.
- Muestra los 6 mensajes exactos del brief ("Analizando vehículo...", "Protegiendo características originales...", "Construyendo escenario...", "Adaptando iluminación...", "Aplicando acabado COR...", "Preparando imagen final...") como un checklist en vivo — paso activo con anillo pulsante, pasos completados con check, barra de progreso superior sincronizada con el `progress` real que emite el servicio.
- Sin botón de regreso (no se puede interrumpir la generación) y usa `navigation.replace` al terminar, para que el usuario no pueda volver a la pantalla de procesamiento con el botón atrás.
- Al completar, navega al placeholder de la Fase 10 con la imagen resultante (`resultImageUri`, hoy un passthrough del mock). Se ajustó el texto genérico de `PlaceholderScreen` para que tenga sentido tanto después de la detección como después de la generación.

## 19. Estado verificado (Fase 9)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores.
- Verificación real en Chromium: el flujo completo (foto → escenario → composición → "CONTINUAR") dispara la generación, se ven los 6 pasos avanzar en orden con sus checks y la barra de progreso, y al terminar navega solo a "Fase 10 — Resultado" mostrando la imagen. Sin errores de consola.

## 20. Resultado (Fase 10)

`ResultScreen` (ruta `Result`) implementa el dashboard del brief (imagen grande, metadatos, botones). Mezcla intencionalmente dos tipos de botón:

- **Reales, funcionan de verdad hoy**: `Editar` (vuelve al editor de composición), `Regenerar` (vuelve a correr `getAIImageService().generate()` con los mismos datos), `Compartir` (`expo-sharing`, con verificación de disponibilidad y manejo de error), `Guardar` (persiste un `Project` real en `@cor/storage`, la misma pieza definida desde la Fase 1 — esto es lo que la Fase 13 "Mis proyectos" va a leer), y `Crear otra versión` (reutiliza la misma foto del vehículo y abre la selección de escenario de nuevo, sin repetir la captura — la función "mismo vehículo, múltiples spots" del brief).
- **Placeholder hacia su propia fase**: `Comparar` → Fase 11, `Exportar` → Fase 12, porque son pantallas completas en sí mismas.

Metadatos mostrados: Vehículo (origen cámara/galería), Escenario (la descripción elegida en la Fase 7), Resolución (dimensiones reales de la foto) y Formato (inferido de la URI). Nuevos íconos propios: `edit`, `share`, `save`, `compare`.

## 21. Estado verificado (Fase 10)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores (incluye `expo-sharing`).
- Verificación real en Chromium: tras la generación llega a Resultado con la imagen, los 4 metadatos correctos y la grilla de 6 acciones con sus íconos distintos. `Guardar` y `Compartir` no lanzan errores. Importante: `Alert.alert` (usado para confirmar Guardar/errores) es una API nativa de React Native que no tiene equivalente real en `react-native-web` — en este navegador de pruebas no aparece el diálogo visualmente, pero en el teléfono del usuario (iOS/Android reales) sí es un alert nativo funcional; no se pudo verificar el diálogo en sí en este entorno, solo que la lógica no falla.

## 22. Comparador antes/después (Fase 11)

- `BeforeAfterSlider` (design system): componente interactivo genérico — imagen "after" de base, imagen "before" recortada por un contenedor cuyo ancho sigue la posición del arrastre (0–1), sin reescalar ninguna de las dos imágenes (efecto "revelar", no "zoom"). Línea divisoria + grip circular con doble chevron, badges "ANTES"/"DESPUÉS" fijos en las esquinas. Un solo `PanResponder` sobre todo el contenedor, así que se puede arrastrar desde cualquier punto, no solo desde el grip.
- `CompareScreen` (ruta `Compare`): usa el slider con la foto original (`photoUri`) como "antes" y el resultado (`resultImageUri`) como "después", con la proporción real de la foto. El botón "Comparar" de la Fase 10 ya no es un placeholder — navega aquí de verdad.

## 23. Estado verificado (Fase 11)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores.
- Verificación real en Chromium: arrastrar desde el centro hasta ~20% del ancho mueve el grip y la línea divisoria exactamente hasta ese punto, revelando más o menos de la imagen "antes" en tiempo real. Sin errores de consola.

## 24. Exportación (Fase 12)

`ExportScreen` (ruta `Export`) implementa las secciones 14 y 15 del brief juntas, porque el watermark solo tiene sentido en el contexto de exportar:

- **Formatos**: los 6 presets exactos del brief (Instagram Post, Instagram Story, Web, WhatsApp, Facebook, Original) más "Personalizado" (ancho/alto/formato JPG·PNG·WebP), usando `EXPORT_PRESETS` y `resolveExportSpec` de `@cor/shared-types`/`@cor/image-processing` — ya definidos desde la Fase 1, sin cambios.
- **Exportación real, no simulada**: `computeCoverCropRect` (nuevo, en `@cor/image-processing`) calcula un recorte centrado que conserva la relación de aspecto del formato elegido sin deformar la imagen; `apps/mobile/src/lib/exportImage.ts` aplica ese recorte y el resize final con `expo-image-manipulator`. El botón "Exportar" de la Fase 10 ya no es un placeholder: produce un archivo nuevo, del tamaño y formato correctos, que se puede compartir con `expo-sharing`.
- **Marca COR (watermark)**: Logo / Logo + nombre / Sin marca, las 4 esquinas, y sliders de Tamaño y Opacidad — usando `computeWatermarkLayout` de `@cor/image-processing` (Fase 1) para posicionar el isologo real (Fase 6). El watermark **se hornea en los píxeles reales del archivo exportado** (ver sección 29, agregada tras la verificación inicial de esta fase), no solo se previsualiza.

## 25. Estado verificado (Fase 12)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores (incluye `expo-image-manipulator`).
- Verificación real en Chromium: la vista previa muestra el watermark COR real compuesto en la esquina inferior derecha; los 7 formatos y los controles de marca (esquina, tamaño, opacidad) responden correctamente; al tocar "EXPORTAR" se genera un archivo real recortado y redimensionado a 1080×1080 (verificado con las dimensiones exactas devueltas por `expo-image-manipulator`), mostrado en una tarjeta de confirmación con opción de compartir. Sin errores de consola.

## 26. Historial — "Mis proyectos" (Fase 13)

`HistoryScreen` (ruta `History`, abierta desde el NavCard "Mis proyectos" en Home) implementa la sección 16 del brief:

- **Persistencia real en el dispositivo**: `@cor/storage` cambia su implementación por defecto de `MemoryStorageService` (se perdía todo al recargar) a `AsyncStorageService` (nueva, usa `@react-native-async-storage/async-storage`), que serializa `Project[]` en una sola clave de AsyncStorage. `getStorageService()` sigue siendo el único punto de acceso — ninguna pantalla cambió — así que el guardado que ya existía desde la Fase 10 ahora sobrevive a cerrar y reabrir la app. `MemoryStorageService` se conserva exportado para pruebas.
- **Lista real**: `FlatList` de proyectos ordenados por `updatedAt` (más reciente primero), con miniatura real (`latestResult.resultImageUri`), nombre, prompt del escenario, punto de estado (`draft/processing/completed/failed`) y fecha formateada. Estado vacío con CTA a "Nueva creación" cuando no hay proyectos.
- **Abrir**: reconstruye los parámetros completos de `Result` a partir del `Project` guardado (foto origen, escenario, composición, imagen resultado) y navega a la pantalla real de Resultado — no es una vista de solo lectura aparte, es la misma pantalla de la Fase 10 con los datos reales del proyecto.
- **Duplicar**: `duplicateProject` (ya existía en la interfaz desde la Fase 1) crea una copia independiente persistida.
- **Eliminar**: confirmación vía `Alert.alert` (destructivo) antes de `deleteProject`. Nota de entorno: `Alert.alert` no tiene equivalente visual en este sandbox web, así que el flujo de confirmación de borrado no se pudo grabar en captura aquí — el código y el resto de las acciones (crear, listar, abrir, duplicar) sí están verificados en video/captura.
- Dos íconos nuevos en el set propio de `@cor/design-system`: `copy` y `trash`.

## 27. Estado verificado (Fase 13)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores (incluye `@react-native-async-storage/async-storage`).
- Verificación real en Chromium: estado vacío correcto → se crea y guarda un proyecto real → aparece en el historial con miniatura y metadatos correctos → "Duplicar" crea una segunda entrada independiente → tocar una tarjeta navega a la pantalla real de Resultado con los datos exactos del proyecto → **recarga completa de página (equivalente a relanzar la app) y los 2 proyectos siguen ahí**, confirmando que la persistencia es real en disco y no solo en memoria. Sin errores de consola.

## 29. Marca de agua horneada en el archivo exportado (mejora sobre la Fase 12)

Pendiente que quedó anotado explícitamente al cerrar la Fase 12: el watermark solo se veía en la vista previa, no en el archivo descargado. Se implementó a petición explícita:

- **Técnica**: `react-native-view-shot` monta, fuera de la pantalla visible, la imagen ya recortada (salida de `exportImageToSpec`) más el logo real posicionado con la misma lógica de `computeWatermarkLayout`/`computeWatermarkBox` que usa la vista previa, y rasteriza esa composición a un PNG sin pérdida exactamente en la resolución del formato elegido (`captureRef({ width: spec.width, height: spec.height, format: 'png' }`). Después, `reencodeImage` (nuevo, en `apps/mobile/src/lib/exportImage.ts`) usa `expo-image-manipulator` para convertir ese PNG al formato/calidad final que el usuario pidió (JPG/PNG/WebP) — separar la captura (siempre PNG sin pérdida) de la re-codificación evita el límite de `react-native-view-shot`, que en iOS nativo no acepta salida WebP directamente.
- Funciona igual en web (usa `html2canvas` internamente, dependencia propia de `react-native-view-shot`) y en nativo (captura de vista real), así que se pudo verificar aquí igual que el resto de la app.
- Cuando la marca es "Sin marca", se salta por completo este paso y se usa el recorte tal cual — no hay costo ni riesgo extra cuando no hay watermark.

## 30. Estado verificado (mejora del watermark horneado)

- `npm run typecheck` — limpio en los 7 workspaces.
- `expo export --platform web` — bundlea sin errores (incluye `react-native-view-shot`).
- Verificación real en Chromium: se extrajo el archivo exportado real (no la vista previa) y se confirmó a resolución completa (1080×1080) que el logo COR está compuesto directamente en los píxeles, en la esquina y opacidad elegidas. Se repitió con "Sin marca" (archivo limpio, sin logo) y con la esquina cambiada a "Sup. izquierda" (el logo se mueve correctamente en el archivo final). Sin errores de consola en ninguno de los tres casos.

## 31. Próximas fases (según el plan acordado)

1. ~~Arquitectura~~ ✅
2. ~~Sistema visual COR~~ ✅
3. ~~Home~~ ✅
4. ~~Flujo "Nueva Creación"~~ ✅
5. ~~Carga de fotografía (cámara/galería)~~ ✅
6. ~~Detección del vehículo~~ ✅
7. ~~Selección de escenario~~ ✅
8. ~~Editor de composición~~ ✅
9. ~~Pantalla de procesamiento~~ ✅
10. ~~Resultado~~ ✅
11. ~~Comparador antes/después~~ ✅
12. ~~Exportación~~ ✅
13. ~~Historial ("Mis proyectos")~~ ✅
14. Preparación de integración real de IA

No se avanza a la Fase 14 hasta confirmación.
