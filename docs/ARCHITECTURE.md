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

`App.tsx` ahora es una **pantalla de verificación del sistema visual** (paleta, tipografía, botones, logo) — no es el Home todavía, eso es la Fase 3.

## 7. Estado verificado

- `npm run typecheck` — pasa en los 7 workspaces (mobile + 6 paquetes).
- `npx expo export --platform web` — bundlea correctamente resolviendo todos los paquetes `@cor/*` vía symlinks de npm workspaces (283 módulos).
- Verificación visual: bundle exportado, servido localmente y capturado con Chromium (Playwright) a 390×844 — paleta, tipografía, botones y logo se renderizan como se espera.

## 8. Próximas fases (según el plan acordado)

1. ~~Arquitectura~~ ✅
2. ~~Sistema visual COR~~ ✅
3. Home
4. Flujo "Nueva Creación"
5. Carga de fotografía (cámara/galería)
6. Detección del vehículo
7. Selección de escenario
8. Editor de composición
9. Pantalla de procesamiento
10. Resultado
11. Comparador antes/después
12. Exportación
13. Historial ("Mis proyectos")
14. Preparación de integración real de IA

No se avanza a la Fase 3 hasta confirmación.
