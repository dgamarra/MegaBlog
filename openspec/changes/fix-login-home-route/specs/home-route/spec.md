## Home Route

## Purpose

Define el comportamiento de la ruta raíz `GET /` en el servidor Express para servir la aplicación React (SPA) en entornos de producción.

## Requirements

### Requirement: Servir SPA en producción

El servidor Express DEBE servir los archivos estáticos del build de React (`client/dist/`) cuando `NODE_ENV=production`, y redirigir todas las rutas del SPA a `index.html` para que React Router maneje el enrutamiento del cliente.

#### Scenario: Acceso a ruta raíz en producción
- **WHEN** un navegador solicita `GET /` al servidor Express en producción
- **THEN** el servidor responde con `index.html` de la carpeta `client/dist/`

#### Scenario: Acceso a ruta SPA en producción
- **WHEN** un navegador solicita `GET /dashboard` al servidor Express en producción
- **THEN** el servidor responde con `index.html` de la carpeta `client/dist/` (para que React Router maneje la ruta)

#### Scenario: API routes no se ven afectadas
- **WHEN** un navegador solicita `GET /api/posts` al servidor Express
- **THEN** el servidor responde con JSON de la API, no con `index.html`
