## Why

La aplicación actual restaura la sesión del usuario desde `localStorage` al iniciar, lo que mantiene al usuario autenticado entre recargas de página sin validar el token. Esto puede causar estados inconsistentes si el token expiró. El requerimiento es que la aplicación siempre inicie en la ruta home (`/`) con ningún usuario logueado.

## What Changes

- Eliminar la restauración automática de sesión desde `localStorage` en `AuthContext` al montar la aplicación
- El estado `user` debe iniciar como `null` siempre
- La ruta home (`/`) ya existe como ruta pública por defecto — no requiere cambios

## Capabilities

### New Capabilities

- `auth-startup`: Comportamiento de autenticación al iniciar la aplicación — sin restauración de sesión

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- `client/src/context/AuthContext.jsx`: eliminar el `useEffect` que lee `user` de `localStorage`
- Los usuarios deberán iniciar sesión explícitamente después de recargar la página
