# Directriz de diseño COR — App Studio (concesionario de alta gama)

Referencia visual aprobada: `COR Studio.dc.html` (prototipo navegable de 8 pantallas). Complementa `docs/BRAND.md`; si algo choca, prevalece BRAND.md.

## Principios

- Modo oscuro como identidad: fondo `black #0A0A0A`, superficies `principal2 #231F20`, texto `aloe #DEDED8`, secundario `cedar #959581`.
- Un solo objeto sólido por pantalla: el botón primario en Aloe con texto negro. Todo lo demás es línea fina o superficie oscura.
- Mucho espacio negativo, fotografía de showroom cinematográfica, nada de gradientes decorativos (solo fundidos a negro sobre fotos).
- Corner brackets solo en momentos hero: Home (sobre el isologo), Cámara (guía de encuadre), Detección (análisis), vehículo en el Editor.

## Color (solo paleta oficial)

| Rol | Valor |
|---|---|
| Fondo | `#0A0A0A` |
| Superficie / tarjetas / inputs | `#231F20` |
| Estado activo (segmentado, tile seleccionado) | `#2C3424` Moss, borde `#768064` Olive |
| Acento funcional (sliders, progreso, máscara "agregar", punto "completado") | `#768064` Olive |
| Texto primario / botón primario | `#DEDED8` Aloe (hover `#FFFFFF`) |
| Texto secundario / labels | `#959581` Cedar |
| Borde hairline | `rgba(222,222,216,.12)`; fuerte `.24` |
| Peligro (eliminar, máscara "quitar", fallido) | `#B4544A` |
| Aviso (procesando) | `#B98A4A` |

Cypress `#4C583E` no se usa como color de texto sobre negro (contraste insuficiente).

## Tipografía

Plus Jakarta Sans (sustituto de Proxima Nova Alt).

| Estilo | Tamaño / interlínea | Peso | Notas |
|---|---|---|---|
| Hero (Home) | 28 / 34 | 600 | tracking -0.3 |
| Título de pantalla | 24 / 30 | 600 | `text-wrap: balance` |
| Etapa de proceso | 22 / 28 | 600 | |
| Cuerpo | 14 / 21 | 400 | Cedar |
| Cuerpo pequeño | 13 / 18 | 400–500 | |
| Label / header | 11 / 16 | 600 | MAYÚSCULAS, tracking 2.4 |
| Marca del vehículo | 10 | 600 | MAYÚSCULAS, tracking 1.6, Olive |
| Botón primario | 13 | 700 | MAYÚSCULAS, tracking 2.4 |

SectionLabel: label + subrayado de 28×1 px en `rgba(222,222,216,.24)`, 6 px debajo.

## Componentes

- **Header**: 48 px de alto, botón atrás circular de 36 px con borde hairline, título como label centrado, acción opcional a la derecha (36 px).
- **Botón primario**: pill, 54–56 px de alto, ancho completo, Aloe. **Secundario**: pill 50 px, transparente, borde `.24`.
- **Barra de acción inferior**: fija, `padding 14 24 38`, borde superior `rgba(222,222,216,.08)`.
- **Tarjetas**: radio 18, fondo `#231F20`, borde hairline; hover sube el borde a `.28`.
- **Imágenes**: radio 14 (miniaturas) / 20 (lienzos); seleccionada = borde 2 px Aloe + check circular.
- **Segmented**: contenedor radio 12 con padding 4; opción activa Moss con texto Aloe.
- **Chips**: pill de 32–34 px; activo Aloe con texto negro; inactivo transparente con borde `.18`.
- **Slider**: pista de 2 px, relleno Olive, thumb de 18 px en Aloe con halo negro de 4 px.
- **Íconos**: set propio de `Icon.tsx`, trazo 1.6, extremos redondeados.

## Pantallas

1. **Home**: foto de showroom a sangre (452 px) con fundido a negro, brackets, isologo, "AI Automotive Studio", tagline. Luego NUEVA CREACIÓN, cuadrícula 2×2 y "Recientes" en carrusel.
2. **Cámara**: visor a pantalla completa, cuadrícula de tercios, brackets de encuadre, chip del ángulo actual, selector de ángulo (Frontal 3/4, Lateral, Trasera 3/4, Frontal, Trasera, Interior), galería + obturador.
3. **Detección / máscara**: análisis con barrido Olive; al detectar, scrim fuera de la unidad y etiqueta "Unidad protegida · %". La revisión dibuja agregar (Olive) / quitar (rojo) con deshacer/restaurar.
4. **Escenario**: descripción libre + ejemplos como chips, Showroom COR (tarjetas 200×132), Mis escenarios.
5. **Editor**: lienzo 16:10 con el vehículo arrastrable, posición segmentada, sliders de escala/altura/distancia/rotación y restablecer en el header.
6. **Procesando**: anillo giratorio con isologo, etapa actual, progreso en %, lista de etapas.
7. **Exportar**: vista previa real del formato con marca de agua, 7 formatos en cuadrícula de 3, marca COR (variante, esquina, tamaño, opacidad), confirmación "Exportación lista".
8. **Historial**: filtro por marca (Maserati, BMW, Mercedes-Benz, Land Rover, Porsche, Ferrari, Lotus, Audi, Jaguar, Volvo); tarjeta con miniatura, marca, modelo, estado y fecha; eliminar pide confirmación.

## Flujo

Home → Cámara → Detección (→ Revisar selección) → Escenario → Editor → Procesando → Exportar. Historial abre directamente Exportar para proyectos completados.
