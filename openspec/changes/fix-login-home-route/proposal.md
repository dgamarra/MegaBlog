## Why

La aplicación pierde la sesión del usuario al recargar la página porque `AuthContext` nunca restaura el estado desde `localStorage`. Esto hace que rutas protegidas (dashboard, crear/editar posts) y la experiencia post-login sean inaccesibles tras un refresh. El error de inicio impide que el usuario permanezca autenticado después del login.

## What Changes

- Modificar `AuthContext` para restaurar el usuario y token desde `localStorage` al montar la aplicación, sin necesidad de un nuevo login tras recarga de página.
- Reflejar el estado de autenticación persistente en Navbar y rutas protegidas.
- Agregar una ruta `GET /` en Express que sirva la app React para entornos de producción (Docker, despliegue).
- Modificar el spec existente `auth-startup` para reflejar el comportamiento correcto: la sesión DEBE persistir en recarga.

## Capabilities

### New Capabilities
- `home-route`: Ruta raíz `GET /` en Express para servir la SPA de React en producción.

### Modified Capabilities
- `auth-startup`: Cambiar requirement de "NO restaurar sesión" a "DEBE restaurar sesión desde localStorage al montar la aplicación".

## Impact

- `client/src/context/AuthContext.jsx` — agregar inicialización desde `localStorage`
- `client/src/pages/Login.jsx` — sin cambios (ya navega a `/`)
- `client/src/pages/Register.jsx` — sin cambios (ya navega a `/`)
- `client/src/pages/Home.jsx` — sin cambios
- `server/src/app.js` — agregar `express.static()` y catch-all route
- `openspec/specs/auth-startup/spec.md` — invertir requirement principal
