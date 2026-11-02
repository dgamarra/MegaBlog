## Context

El cliente React usa `AuthContext` con un estado `user` inicializado como `null`. Aunque `login` guarda el token y usuario en `localStorage`, nunca se leen al montar la aplicación. Tras una recarga (F5), el usuario aparece deslogueado y las rutas protegidas redirigen a `/login`. En producción (Docker), Express tampoco sirve archivos estáticos, por lo que rutas como `/` o `/dashboard` devuelven 404.

## Goals / Non-Goals

**Goals:**
- Restaurar sesión desde `localStorage` al montar `AuthContext`
- Mantener sincronizados el estado React y `localStorage` en login/logout
- Agregar `express.static()` + catch-all route en Express para servir el build de producción
- Actualizar spec `auth-startup` para reflejar el comportamiento correcto

**Non-Goals:**
- No se modifica el flujo de login/logout existente
- No se agregan nuevas dependencias externas
- No se modifica el sistema de JWT ni la lógica del servidor

## Decisions

1. **`useEffect` en AuthContext para restaurar sesión** — Al montar el provider, leer `localStorage.getItem('user')` y `localStorage.getItem('token')`. Si ambos existen, parsear el usuario y llamar `setUser()`. Esto es simple, sin dependencias adicionales, y mantiene el patrón existente.

2. **`express.static` con carpeta `client/dist`** — En producción, Express debe servir los archivos estáticos del build de Vite. Se agrega `app.use(express.static(path.join(__dirname, '../../client/dist')))` seguido de un catch-all que sirve `index.html` para las rutas del SPA.

3. **No cambiar el spec `auth-startup` in-place** — Se crea un delta spec dentro del cambio que documenta las modificaciones. Al archivar, se aplicará el delta al spec principal.

4. **Variable de entorno `NODE_ENV` para static serving** — Solo habilitar `express.static` cuando `NODE_ENV=production` para no interferir con Vite dev server.

## Risks / Trade-offs

- **[Riesgo] Token expirado en localStorage** → El authMiddleware del server rechazará tokens vencidos. El cliente debe manejar errores 401 y redirigir a `/login`. Esto ya existe parcialmente pero se puede mejorar en el futuro.
- **[Riesgo] Datos corruptos en localStorage** → Usar `try/catch` al parsear `JSON.parse(localStorage.getItem('user'))` para no romper el render.
