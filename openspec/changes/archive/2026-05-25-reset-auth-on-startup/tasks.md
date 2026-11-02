## 1. Eliminar restauración de sesión en AuthContext

- [x] 1.1 Eliminar el `useEffect` en `client/src/context/AuthContext.jsx` que lee `user` de `localStorage` al montar el componente
- [x] 1.2 Verificar que el estado `user` se inicializa como `null` (ya está: `useState(null)`)
