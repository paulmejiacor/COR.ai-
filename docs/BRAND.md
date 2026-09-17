# Manual de Marca COR — Extracto para Fase 2

Análisis del manual de marca oficial adjunto (32 páginas). Esto prevalece sobre cualquier instrucción del prompt original que lo contradiga (regla explícita del cliente).

## Isologo

- Wordmark "COR" donde el símbolo ∞ (infinito) reemplaza las letras "CO"; construcción geométrica propia (no es una tipografía existente).
- Reducción mínima: 2.75 cm de ancho / 0.89 cm de alto (50%). No reducir por debajo de eso.
- Márgen de protección: 2x en los cuatro lados (x = altura de la "R").
- Versiones de color permitidas: negro, blanco, gris, y cada uno de los tonos de la paleta (Moss, Cypress, Olive, Cedar, Aloe). **Nunca** otros colores (el manual muestra explícitamente como incorrecto: violeta, verde lima, magenta).
- Prohibido: deformar, cambiar el orden de los elementos (∞ siempre antes que R), usarlo sobre texturas ajenas ilegibles, cambiar la tipografía de apoyo, reducir por debajo del mínimo.
- Tratamiento "chrome"/metálico plateado es el acabado hero (portadas, señalética física, moodboards) — para UI de producto se usa la versión sólida (negro sobre claro / blanco sobre oscuro), reservando el chrome para momentos de marca puntuales (splash, hero shots), nunca como color de texto o ícono funcional.

## Tipografía

- Principal: la del propio isologo (geométrica, custom, solo para la marca).
- Secundaria / texto de apoyo: **Proxima Nova Alt** (sans-serif). Es la que se usará en toda la interfaz.

## Paleta oficial

| Nombre | HEX | Uso |
|---|---|---|
| Moss | `#2C3424` | Verde oscuro profundo — fondo dark hero, texto sobre claro |
| Cypress | `#4C583E` | Verde medio — acentos, estados activos |
| Olive | `#768064` | Verde neutro — soporte, iconografía secundaria |
| Cedar | `#959581` | Beige-verde cálido — superficies neutras, bordes |
| Aloe | `#DEDED8` | Blanco roto / off-white — fondos claros, texto sobre oscuro |
| Black | `#0A0A0A` | Negro real — texto principal, fondos dark |
| Principal 2 | `#231F20` | Negro cálido secundario |

No se inventan colores adicionales como principales (instrucción explícita del cliente y del manual).

## Tono y lenguaje visual

- "Design without limits." / "Design is intelligence made visible." / "Every shape, a reason. Every detail, a choice." — EST. 2024.
- Motivo decorativo recurrente: esquinas tipo "corner brackets" (┌ ┐ └ ┘) en las páginas del manual — usar como acento decorativo sutil en pantallas hero, no en cada pantalla.
- Etiquetas de sección en mayúsculas, tracking amplio, subrayado fino (ej. "CONSTRUCCIÓN DE LA MARCA").
- Fotografía/ambientación: showroom oscuro cinematográfico, luz cálida puntual (spotlight ovalado), superficies pulidas, reflejos controlados, mucho espacio negativo.
- Evitar: gradientes excesivos, iconografía infantil, estética genérica de app de IA.

## Aplicación a la Fase 2 (sistema visual COR)

- Modo oscuro como identidad primaria de la app (Moss/Black de fondo, Aloe como texto/superficie clara), con superficies claras (Aloe) para tarjetas y contenido, siguiendo el contraste que usa el propio manual.
- Wordmark COR en negro/blanco sólido en UI; reservar el chrome para el splash/onboarding.
- Proxima Nova Alt como fuente del sistema (con fallback a una geométrica del sistema si la licencia no está disponible en el MVP).
- Motivo de corner brackets como accesorio visual opcional en pantallas hero (Home, Splash, Resultado).

## Isologo real (actualizado durante la Fase 6)

El componente `Logo` (`packages/design-system/src/components/Logo.tsx`) ya **no** es una reconstrucción dibujada a mano — se reemplazó por las versiones sólidas oficiales, recortadas y recolorizadas por umbral directamente de la página "Colorimetría, versiones de color" del manual (400 DPI, transparencia real):
- `packages/design-system/assets/brand/cor-logo-white.png` — tinta blanca, para fondos oscuros.
- `packages/design-system/assets/brand/cor-logo-black.png` — tinta negra, para fondos claros.

Sigue pendiente que el equipo de marca entregue el archivo vectorial (.ai/.svg) original; cuando esté disponible, solo hay que sustituir estos dos PNG por exports del vector real, sin tocar el resto del código (`Logo` ya centraliza el asset en un solo lugar).
