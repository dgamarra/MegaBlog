## Context

El `AuthContext` actualmente restaura la sesión del usuario desde `localStorage` al montar el componente `<AuthProvider>`, sin validar el JWT contra el servidor. Esto significa que al recargar la página, el usuario permanece "logueado" aunque el token pueda haber expirado. Se requiere que la aplicación inicie siempre con `user = null`.

## Goals / Non-Goals

**Goals:**
- Eliminar la restauración automática de sesión desde `localStorage` en el montaje de `AuthProvider`
- El estado `user` debe inicializarse como `null`
- La ruta home (`/`) ya es la ruta por defecto — no se modifica

**Non-Goals:**
- No se cambia el flujo de login/logout existente
- No se agrega validación de token contra el servidor
- No se modifican otras partes del sistema de autenticación

## Decisions

- Eliminar el `useEffect` en `AuthContext.jsx` que lee `localStorage.getItem('user')` y llama a `setUser(...)` — esta es la única fuente de la restauración automática de sesión
- El estado `user` se inicializa como `useState(null)`, que es el valor por defecto correcto

## Risks / Trade-offs

- Los usuarios perderán la sesión al recargar la página y deberán volver a iniciar sesión — este es el comportamiento deseado
- El `localStorage` aún se usa para almacenar `token` y `user` durante la sesión activa (login/logout), solo se elimina la lectura automática al inicio
