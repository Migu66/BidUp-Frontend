# BidUp Frontend - Instrucciones para Agentes AI

## Contexto General

Frontend de una plataforma de subastas en tiempo real estilo Catawiki. Este es un proyecto Next.js 15 con App Router que se conecta a un backend en .NET para gestionar subastas en tiempo real usando SignalR.

**Backend Repository**: https://github.com/Migu66/BidUp-Backend

## Stack Tecnológico

- Next.js 15 (App Router con Turbopack)
- React 19 + TypeScript (modo estricto)
- SignalR client (para WebSocket en tiempo real)
- Tailwind CSS (estilos únicamente)

## Arquitectura y Principio Fundamental

### Regla de Oro

**El frontend NUNCA controla lógica crítica. El backend es la única fuente de verdad.**

Si algo puede decidirlo el backend o el frontend, **siempre lo decide el backend**.

### ❌ El Frontend NO Debe:

- Implementar timers locales como fuente de verdad
- Validar pujas (precio, tiempo, usuario, antifraude)
- Resolver conflictos entre pujas
- Calcular ganadores
- Sincronizar tiempo local
- Aplicar rate limiting

### ✅ Responsabilidades del Frontend:

- Mostrar estado de subastas usando datos del servidor
- Actualizar en tiempo real vía SignalR
- Mostrar tiempo restante **enviado por el backend**
- Enviar pujas y esperar confirmación del servidor
- Implementar UX optimista solo a nivel visual
- Mostrar errores cuando el backend rechaza acciones
- Manejar estados de conexión y reconexión

## Flujo de Tiempo Real (SignalR)

### Conexión

```typescript
// Conectarse al montar componentes
// Escuchar eventos: BidPlaced, AuctionUpdated, AuctionEnded, TimerSync
// Actualizar estado solo con datos recibidos
// Limpiar conexiones al desmontar
```

**IMPORTANTE**: Antes de implementar eventos SignalR, consultar al usuario sobre el contrato exacto del backend.

## Convenciones de Código

### TypeScript

- Modo estricto habilitado
- Tipar todos los eventos SignalR
- **Evitar `any`** en todo momento
- Separar lógica de UI
- Crear hooks reutilizables

### Estructura de Archivos

- App Router: Todo en `app/`
- Alias de rutas: `@/*` apunta a la raíz del proyecto
- Componentes: `app/components/` (cuando sea necesario)
- Hooks: `app/hooks/` (cuando sea necesario)

### Estilos

- Tailwind CSS únicamente
- No escribir CSS personalizado a menos que sea absolutamente necesario
- Variables CSS en `globals.css`: `--background`, `--foreground`

## Comandos de Desarrollo

```bash
# Desarrollo (con Turbopack)
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start

# Linting
npm run lint
```

## Proceso Antes de Implementar

1. **Consultar al usuario** si tienes dudas sobre el comportamiento del backend
2. **No inventar** implementaciones sin verificar con el backend
3. **Verificar** el repositorio del backend si es necesario
4. **Preguntar primero**, implementar después
5. **Cambio en backend**: Si hay que cambiar el backend, notificar al usuario

## Metadatos

- Idioma: Español (`lang="es"`)
- Título base: "BidUp"
- Descripción: "Aplicación de subastas"
