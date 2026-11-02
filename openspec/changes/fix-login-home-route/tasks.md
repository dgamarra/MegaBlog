## 1. AuthContext — restaurar sesión desde localStorage

- [x] 1.1 Agregar `useState` lazy initializer en `AuthProvider` que lea `user` y `token` de `localStorage` al montar y restaure el estado
- [x] 1.2 Agregar `try/catch` al parsear `JSON.parse(localStorage.getItem('user'))` para manejar datos corruptos
- [x] 1.3 Verificar que login guarda correctamente en `localStorage` y actualiza el estado
- [x] 1.4 Verificar que logout limpia `localStorage` y resetea el estado

## 2. Express — servir SPA en producción

- [x] 2.1 Agregar `path` import en `server/src/app.js`
- [x] 2.2 Agregar `express.static('client/dist')` condicional por `NODE_ENV=production`
- [x] 2.3 Agregar catch-all route `app.get('*', ...)` para servir `index.html` en rutas SPA
- [x] 2.4 Asegurar que catch-all no intercepte rutas `/api/*`

## 3. Verificación

- [x] 3.1 Probar login → recarga → usuario sigue autenticado
- [x] 3.2 Probar que rutas protegidas (dashboard, create, edit) son accesibles tras recarga
- [x] 3.3 Probar logout → recarga → usuario no autenticado
- [x] 3.4 Probar que API routes (`/api/posts`, `/api/auth`) siguen funcionando
