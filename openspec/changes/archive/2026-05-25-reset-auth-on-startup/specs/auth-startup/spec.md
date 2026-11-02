## ADDED Requirements

### Requirement: Sesión no restaurada al iniciar la aplicación

El sistema NO DEBE restaurar la sesión del usuario desde `localStorage` al montar la aplicación. El estado `user` debe ser `null` al iniciar.

#### Scenario: Recarga de página con sesión previa
- **WHEN** el usuario recarga la página (F5 / navegación)
- **THEN** el estado `user` en `AuthContext` es `null`
- **AND** el usuario ve la ruta home (`/`) sin estar autenticado

#### Scenario: Apertura en nueva pestaña con sesión previa
- **WHEN** el usuario abre la aplicación en una nueva pestaña del navegador
- **THEN** el estado `user` en `AuthContext` es `null`
- **AND** el usuario ve la ruta home (`/`) sin estar autenticado

### Requirement: Login explícito sigue funcionando

El usuario PUEDE iniciar sesión explícitamente mediante el formulario de login en `/login`, y al hacerlo el estado `user` se establece correctamente.

#### Scenario: Login exitoso después de recarga
- **WHEN** el usuario (sin sesión) navega a `/login`, ingresa credenciales válidas y hace submit
- **THEN** el estado `user` se establece con los datos del usuario
- **AND** el usuario es redirigido a la ruta correspondiente

#### Scenario: Logout después de inicio de sesión
- **WHEN** el usuario hace clic en "Logout"
- **THEN** el estado `user` vuelve a `null`
- **AND** el usuario es redirigido a `/login`
