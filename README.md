# BidUp Frontend

Frontend de una plataforma de subastas en tiempo real estilo Catawiki.

## Stack Tecnológico

- Next.js 15 (App Router con Turbopack)
- React 19 + TypeScript
- SignalR client (WebSocket en tiempo real)
- Tailwind CSS
- Cloudinary (gestión de imágenes)

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:5240
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diutn68vx
```

**Nota**: Para uploads unsigned (sin firma), solo necesitas el Cloud Name. No expongas el API Key ni Secret en el frontend.

### ⚠️ Configuración de Cloudinary (REQUERIDO)

**IMPORTANTE:** Antes de usar la funcionalidad de crear subastas, debes crear un upload preset en Cloudinary.

**📖 Ver guía completa**: [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)

**Resumen rápido**:
1. Ve a https://console.cloudinary.com/settings/upload
2. Crea un preset llamado `bidup_unsigned` con signing mode **"Unsigned"**
3. Guarda

❌ Sin este preset, obtendrás el error: `"Upload preset not found"`

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Solución de Problemas

### Errores Comunes

- **"Upload preset not found"**: [Ver solución →](./CLOUDINARY_SETUP.md)
- **"Connection stopped during negotiation"**: [Ver solución →](./TROUBLESHOOTING.md#-error-the-connection-was-stopped-during-negotiation)
- **Errores de CORS**: [Ver solución →](./TROUBLESHOOTING.md#-errores-de-cors)

📖 **Guía completa**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Funcionamiento sin Backend

La aplicación puede ejecutarse **sin el backend** en modo desarrollo con funcionalidad limitada:

### ✅ Funciona:
- Navegación entre páginas
- Interfaz y diseño completo
- Formularios (validación frontend)
- Subida de imágenes a Cloudinary

### ❌ No Funciona:
- Autenticación (login/registro)
- Listado de subastas (requiere API)
- Crear subastas (requiere API + autenticación)
- Actualizaciones en tiempo real (SignalR)
- Pujas

### Indicador de Estado

En desarrollo, verás una **notificación amarilla** en la esquina inferior derecha si el backend no está disponible. Puedes:
- Cerrarla haciendo clic en la X
- Ignorarla y seguir trabajando en el frontend
- Iniciar el backend para que desaparezca automáticamente

## Backend

El backend debe estar ejecutándose en `http://localhost:5240`

Repository: https://github.com/Migu66/BidUp-Backend
