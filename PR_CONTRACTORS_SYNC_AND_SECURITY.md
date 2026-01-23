# Sincronización de Secciones de Contratistas y Mejoras de Seguridad

## Tipo de cambio

- [x] Nueva funcionalidad
- [x] Bugfix
- [x] Refactor
- [ ] Docs
- [ ] Chore

## Issue relacionada

N/A

## Descripción detallada

Este PR incluye múltiples mejoras y correcciones en la sección de contratistas, sincronización entre vistas de admin y super-admin, implementación de medidas de seguridad para datos sensibles, y corrección de bugs críticos en los formularios de creación y edición.

### Cambios principales:

#### 1. **Sincronización de Secciones de Contratistas**

- **Sincronización completa entre Admin y Super-Admin**: Se actualizó la sección de contratistas de `super-admin` para que sea idéntica a la de `admin`, incluyendo:
  - Configuración de tabla (`DataTable`) con columnas personalizadas
  - Filtros avanzados (país, cliente, equipo, posición de trabajo)
  - Componente de Activation Key con funcionalidad de copiado seguro
  - Estilos y comportamientos consistentes

#### 2. **Seguridad en Activation Key**

- **Enmascaramiento en Backend**: La clave de activación ahora llega enmascarada desde el backend en formato `Qwd******Xr5Lkt` para proteger información sensible.
- **Eliminación de botón "Ver"**: Se removió el botón del ojo que permitía ver la clave completa en el frontend.
- **Copiado Seguro**: El botón de copiar ahora realiza una petición asíncrona al backend para obtener la clave completa en tiempo real, asegurando que la información sensible nunca esté expuesta en el DOM del frontend.
- **Implementación de estados de carga**: Se agregó estado `isCopying` para deshabilitar el botón durante la operación y mostrar feedback visual al usuario.

#### 3. **Horario de Almuerzo (Lunch Time)**

- **Campo "Hora de Fin de Almuerzo"**: Se agregó un nuevo campo de tiempo en los modales de "Agregar" y "Editar" contratistas.
- **Cálculo Automático**: El campo está bloqueado (`readOnly`) y se calcula automáticamente como exactamente 1 hora después de la "Hora de Inicio de Almuerzo".
- **Sincronización en Tiempo Real**: Se implementó lógica reactiva que actualiza el campo `lunch_end` cada vez que cambia `lunch_start`.
- **Integración con Backend**: Se actualizó el payload de creación y actualización para incluir el campo `lunch_end`.

#### 4. **Corrección de Bugs en Formularios**

- **Fix de Referencias en Time Pickers**: Se corrigió un conflicto de referencias que impedía que los valores de `work_schedule_start`, `work_schedule_end`, `lunch_start` y `lunch_end` fueran capturados correctamente por `react-hook-form`.
- **Cambio de `disabled` a `readOnly`**: El campo `lunch_end` ahora usa `readOnly` en lugar de `disabled` para asegurar que su valor se incluya en el payload de envío.
- **Sincronización de Estado**: Se mejoró la lógica de actualización automática de `lunch_end` para notificar correctamente al formulario sobre los cambios (`shouldDirty: true`).

#### 5. **Protección de Rutas Basada en Roles**

- **Redirección Automática**: Se implementó protección de rutas en los layouts de `admin`, `super-admin` y `client`:
  - Usuarios con rol `Superadmin` solo pueden acceder a vistas de `super-admin`
  - Usuarios con rol `TeamAdmin` solo pueden acceder a vistas de `admin`
  - Usuarios con rol `Visualizer` solo pueden acceder a vistas de `client`
- **Header con Información del Usuario**: Se actualizó el componente `Header` en todos los layouts para mostrar el nombre real del usuario autenticado.

#### 6. **Mejoras en Componentes Reutilizables**

- **FormModal**: Se mejoró el componente para soportar callbacks `onValueChange` que permiten a los campos reaccionar a cambios en otros campos.
- **Validación de Inputs Deshabilitados**: Se agregó validación para prevenir errores al intentar abrir el selector de tiempo en campos deshabilitados.

### Archivos modificados:

#### Modales de Contratistas:

- `app/[locale]/(authorized)/app/admin/contractors/@modal/(.)add/AddContractorModal.tsx`
- `app/[locale]/(authorized)/app/admin/contractors/@modal/(.)edit/[id]/EditContractorModal.tsx`
- `app/[locale]/(authorized)/app/super-admin/contractors/@modal/(.)add/AddContractorModal.tsx`
- `app/[locale]/(authorized)/app/super-admin/contractors/@modal/(.)edit/[id]/EditContractorModal.tsx`

#### Páginas de Contratistas:

- `app/[locale]/(authorized)/app/admin/contractors/page.tsx`
- `app/[locale]/(authorized)/app/super-admin/contractors/page.tsx`

#### Layouts y Protección de Rutas:

- `app/[locale]/(authorized)/app/admin/layout.tsx`
- `app/[locale]/(authorized)/app/super-admin/layout.tsx`
- `app/[locale]/(authorized)/app/client/layout.tsx`

#### Componentes del Design System:

- `packages/design-system/components/FormModal.tsx`
- `packages/design-system/components/Sidebar.tsx`

#### Servicios y Tipos:

- `packages/api/contractors/contractors.service.ts`
- `packages/types/FormModal.types.ts`

#### Internacionalización:

- `packages/internationalization/dictionaries/es.json`
- `packages/internationalization/dictionaries/en.json`

## Cómo probar / QA

### 1. Sincronización de Secciones de Contratistas

1. Iniciar sesión como `Superadmin` y navegar a `/app/super-admin/contractors`
2. Iniciar sesión como `TeamAdmin` y navegar a `/app/admin/contractors`
3. Verificar que ambas vistas tienen:
   - Misma estructura de tabla
   - Mismos filtros disponibles
   - Mismo comportamiento de columnas personalizadas
   - Mismo estilo visual

### 2. Seguridad en Activation Key

1. Navegar a la sección de contratistas (admin o super-admin)
2. Verificar que las claves de activación aparecen enmascaradas (formato: `Qwd******Xr5Lkt`)
3. Hacer clic en el botón de copiar
4. Verificar que:
   - El botón se deshabilita durante la operación
   - Se muestra un mensaje de confirmación "Copied"
   - La clave completa se copia al portapapeles
   - No hay forma de ver la clave completa en el DOM (inspeccionar elemento)

### 3. Horario de Almuerzo

1. Navegar a "Add Contractor" o "Edit Contractor"
2. En el campo "Hora de Inicio de Almuerzo", seleccionar una hora (ej: `12:00`)
3. Verificar que:
   - El campo "Hora de Fin de Almuerzo" se actualiza automáticamente a `13:00` (1 hora después)
   - El campo está bloqueado (no se puede editar manualmente)
4. Crear o actualizar el contratista
5. Verificar en la base de datos que ambos campos (`lunch_start` y `lunch_end`) se guardaron correctamente

### 4. Corrección de Bugs en Horarios Laborales

1. Crear un nuevo contratista con:
   - Hora de inicio: `08:00`
   - Hora de fin: `17:00`
   - Hora de inicio de almuerzo: `12:00`
2. Guardar el contratista
3. Verificar que todos los horarios se guardaron correctamente en la base de datos
4. Editar el contratista y verificar que todos los campos se cargan correctamente

### 5. Protección de Rutas

1. Iniciar sesión como `Superadmin`:
   - Intentar acceder a `/app/admin/*` → Debe redirigir a `/app/super-admin`
   - Intentar acceder a `/app/client/*` → Debe redirigir a `/app/super-admin`
2. Iniciar sesión como `TeamAdmin`:
   - Intentar acceder a `/app/super-admin/*` → Debe redirigir a `/app/admin`
   - Intentar acceder a `/app/client/*` → Debe redirigir a `/app/admin`
3. Iniciar sesión como `Visualizer`:
   - Intentar acceder a `/app/admin/*` → Debe redirigir a `/app/client`
   - Intentar acceder a `/app/super-admin/*` → Debe redirigir a `/app/client`

### 6. Header con Información del Usuario

1. Verificar que en todos los layouts (admin, super-admin, client) el header muestra el nombre del usuario autenticado
2. Verificar que el selector de idioma funciona correctamente

## Checklist

- [x] Mis cambios siguen las convenciones de commits (Conventional Commits).
- [x] Concurrency, performance y edge cases revisados si aplica.
- [x] El código sigue las convenciones de estilo del proyecto.
- [ ] Tests unitarios/integ. añadidos o actualizados cuando corresponda.
- [ ] Documentación actualizada cuando corresponde.
- [x] El build y linter pasan localmente.
- [x] Los cambios han sido probados en diferentes navegadores (si aplica).

## Notas para el reviewer

### Consideraciones de Seguridad:

- **Activation Key**: La implementación actual asegura que la clave completa nunca esté expuesta en el frontend. Sin embargo, es importante verificar que el endpoint `/contractors/:id/activation-key` tenga las validaciones de seguridad adecuadas en el backend (autenticación, autorización, rate limiting).

### Consideraciones de UX:

- El campo `lunch_end` está bloqueado para edición manual, lo cual es intencional ya que siempre debe ser 1 hora después de `lunch_start`. Si en el futuro se requiere flexibilidad, se puede considerar hacer el campo editable.

### Dependencias:

- Este PR requiere que el backend (`USER_MS` y `API_GATEWAY`) tenga implementado:
  - El endpoint `GET /contractors/:id/activation-key` para obtener la clave completa
  - El enmascaramiento de `activation_key` en todas las respuestas que devuelven contratistas
  - El soporte para el campo `lunch_end` en los DTOs de creación y actualización

### Breaking Changes:

- Ninguno. Todos los cambios son retrocompatibles.

## Capturas (si aplica)

N/A - Los cambios son principalmente funcionales y de seguridad, sin cambios visuales significativos en la UI (excepto la adición del campo `lunch_end`).

---

**Título sugerido del PR:**
`feat(contractors): sincronización admin/super-admin, seguridad en activation key y corrección de bugs en formularios`

**Labels sugeridos:**

- `feature`
- `bugfix`
- `security`
- `frontend`
