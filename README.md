# COR AI Automotive Studio

Herramienta de creación y edición fotográfica automotriz asistida por IA para COR. Toma la fotografía real de un vehículo, aísla el vehículo (protegido, nunca rediseñado por la IA) y lo integra fotorealísticamente en un nuevo escenario descrito por el usuario.

Estado actual: **Fase 1 — Arquitectura** (ver `docs/ARCHITECTURE.md` y `docs/BRAND.md`).

## Estructura

```
apps/mobile          App Expo (React Native + TypeScript)
packages/            Servicios desacoplados (ai-image-service, image-processing, storage, auth, shared-types)
docs/                Arquitectura y extracto del manual de marca
```

## Desarrollo

```bash
npm install
npm run typecheck      # valida todos los paquetes
npm run mobile         # expo start (apps/mobile)
```
