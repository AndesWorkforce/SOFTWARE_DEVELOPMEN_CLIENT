# Resumen

Corrección de la ruta de registro de usuarios para apuntar al endpoint correcto de autenticación y mejora en el manejo de valores nulos en la transformación de datos.

## Tipo de cambio

- [x] Bugfix
- [ ] Nueva funcionalidad
- [ ] Refactor
- [ ] Docs
- [ ] Chore

## Issue relacionada

N/A

## Descripción detallada

### Cambios principales:

1. **Actualización de ruta de creación de usuarios**: Se modificó el endpoint de creación de usuarios de `POST /users` a `POST /auth/register/user` en el servicio de usuarios (`users.service.ts`).

2. **Mejora en manejo de datos nulos**: Se actualizó la función `splitName` para manejar correctamente casos donde el campo `name` viene como `undefined` o `null` desde el backend, evitando errores de tipo "can't access property 'trim', fullName is undefined".

### Payload enviado al backend:

```json
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Nombre Apellido",
  "role": "TeamAdmin"
}
```

La transformación de `firstName` + `lastName` a `name` completo se mantiene intacta mediante la función `transformToBackendPayload`.

## Cómo probar / QA

1. Navegar a la sección de Super Admin > Roles
2. Hacer clic en "Add User"
3. Completar el formulario con:
   - First Name: "David"
   - Last Name: "Morcillo"
   - Email: "test@example.com"
   - Password: "Password123!"
   - Role: "TeamAdmin"
4. Verificar que el usuario se crea correctamente
5. Verificar en la red (DevTools) que la petición se envía a `/auth/register/user`
6. Verificar que no se genera error cuando el backend responde con usuarios sin campo `name`

## Checklist

- [x] Mis cambios siguen las convenciones de commits (Conventional Commits).
- [x] Concurrency, performance y edge cases revisados si aplica.
- [ ] Tests unitarios/integ. añadidos o actualizados cuando corresponda.
- [ ] Documentación actualizada cuando corresponde.
- [x] El build y linter pasan localmente.

## Notas para el reviewer

- El cambio es mínimo e impacta únicamente en la ruta del endpoint de creación de usuarios
- La función `splitName` ahora es más robusta y previene errores cuando el backend devuelve valores nulos
- No se modificó la lógica de transformación de datos existente
- El componente `AddUserModal.tsx` no requiere cambios, ya que el servicio maneja internamente la transformación

## Capturas (si aplica)

N/A - Cambio en servicio backend, sin cambios visuales en UI.

---

**Título sugerido del PR:**
`fix(users): actualizar ruta de registro a /auth/register/user`
