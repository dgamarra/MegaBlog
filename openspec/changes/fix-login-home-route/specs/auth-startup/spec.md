## MODIFIED Requirements

### Requirement: Sesión restaurada al iniciar la aplicación

El sistema DEBE restaurar la sesión del usuario desde `localStorage` al montar la aplicación. Si existe un token y un usuario guardados, el estado `user` debe recuperarse automáticamente.

#### Scenario: Recarga de página con sesión previa
- **WHEN** el usuario recarga la página (F5 / navegación) teniendo un token y usuario en `localStorage`
- **THEN** el estado `user` en `AuthContext` se restaura desde `localStorage`
- **AND** el usuario permanece autenticado en la ruta actual

#### Scenario: Apertura en nueva pestaña con sesión previa
- **WHEN** el usuario abre la aplicación en una nueva pestaña del navegador teniendo sesión activa
- **THEN** el estado `user` en `AuthContext` se restaura desde `localStorage`
- **AND** el usuario ve la ruta home (`/`) autenticado

### Requirement: Login explícito sigue funcionando

El usuario PUEDE iniciar sesión explícitamente mediante el formulario de login en `/login`, y al hacerlo el estado `user` se establece correctamente y se persiste en `localStorage`.

#### Scenario: Login exitoso
- **WHEN** el usuario navega a `/login`, ingresa credenciales válidas y hace submit
- **THEN** el estado `user` se establece con los datos del usuario
- **AND** se guarda el token y usuario en `localStorage`
- **AND** el usuario es redirigido a `/`

#### Scenario: Logout después de inicio de sesión
- **WHEN** el usuario hace clic en "Logout"
- **THEN** el estado `user` vuelve a `null`
- **AND** se eliminan token y usuario de `localStorage`
- **AND** el usuario es redirigido a `/login`
