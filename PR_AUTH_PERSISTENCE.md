# Resumen

Implementa persistencia de autenticación en recargas de página y redirección automática al login desde la raíz de la aplicación.

## Tipo de cambio

- [x] Bugfix
- [x] Nueva funcionalidad
- [ ] Refactor
- [ ] Docs
- [ ] Chore

## Issue relacionada

Si aplica, referencia la issue: `#XXX`.

## Descripción detallada

### Problema solucionado

Los usuarios perdían su sesión al recargar cualquier página del dashboard, siendo redirigidos al login a pesar de tener un token válido almacenado en localStorage. Esto se debía a una **race condition** entre el renderizado inicial de Next.js (SSR) y la rehidratación del store de Zustand desde localStorage.

### Cambios principales

#### 1. **Persistencia de autenticación** (`packages/store/index.ts`)

- Agregado estado `_hasHydrated` para rastrear cuándo Zustand completa la rehidratación desde localStorage
- Implementado callback `setHasHydrated()` para actualizar el estado
- Modificado `onRehydrateStorage` para marcar como hidratado después de sincronizar el token con axios

#### 2. **Layout autorizado client-side** (`app/[locale]/(authorized)/layout.tsx`)

- Convertido de server component a client component con `"use client"`
- Implementada lógica de espera: el layout NO verifica autenticación hasta que `_hasHydrated === true`
- Usado `useParams()` en lugar de props para compatibilidad con Next.js 15+
- Retorna `null` durante la hidratación y durante la redirección para evitar flash de contenido

#### 3. **Simplificación del dashboard** (`app/[locale]/(authorized)/app/client/page.tsx`)

- Removida verificación de autenticación duplicada (ahora la maneja el layout)
- Eliminado import innecesario de `useAuthStore`
- Simplificado `useEffect` para solo cargar métricas

#### 4. **Redirección automática a login** (`app/[locale]/page.tsx`)

- Eliminada página de bienvenida de Vercel con botones
- Implementado redirect del lado del servidor directo a `/login`
- Los usuarios ya no ven ninguna pantalla intermedia al acceder a la raíz

### Flujo resultante

**Antes:**

1. Usuario recarga → Token inicialmente `null` → Redirect inmediato a login → Token se rehidrata pero ya es tarde

**Ahora:**

1. Usuario recarga → Layout espera hidratación → Token se carga desde localStorage → Verifica autenticación → Usuario permanece en la página

## Cómo probar / QA

### Prueba 1: Persistencia de autenticación

1. Ejecutar `pnpm dev` en `SOFTWARE_DEVELOPMEN_CLIENT`
2. Acceder a `http://localhost:3000`
3. Hacer login con credenciales válidas
4. Navegar al dashboard (`/en/app/client`)
5. **Recargar la página con F5 o Ctrl+R**
6. ✅ Verificar que el usuario permanece autenticado y no es redirigido al login

### Prueba 2: Redirección automática

1. Cerrar sesión (logout)
2. Acceder a `http://localhost:3000`
3. ✅ Verificar que redirige automáticamente a `/en/login` sin mostrar página de bienvenida

### Prueba 3: Protección de rutas

1. Estando deslogueado, intentar acceder directamente a `http://localhost:3000/en/app/client`
2. ✅ Verificar que redirige al login
3. Hacer login nuevamente
4. ✅ Verificar que redirige correctamente al dashboard según el rol

### Prueba 4: Edge cases

1. Abrir DevTools → Application → Local Storage
2. Borrar manualmente la key `auth-storage`
3. Recargar la página
4. ✅ Verificar que redirige al login correctamente
5. Hacer login y verificar que el token se guarda en localStorage nuevamente

## Checklist

- [x] Mis cambios siguen las convenciones de commits (Conventional Commits).
- [x] Concurrency, performance y edge cases revisados si aplica.
- [x] Tests unitarios/integ. añadidos o actualizados cuando corresponda.
- [x] Documentación actualizada cuando corresponde.
- [x] El build y linter pasan localmente.

## Notas para el reviewer

### Puntos críticos a revisar:

1. **`packages/store/index.ts`**: Verificar que el estado `_hasHydrated` se inicializa correctamente y que `onRehydrateStorage` lo actualiza después de sincronizar el token
2. **`app/[locale]/(authorized)/layout.tsx`**: Confirmar que el early return durante la hidratación no causa problemas de UX (actualmente muestra `null`, podría mejorarse con un loading spinner)
3. **Race condition**: Validar que el flujo de hidratación → verificación → render funciona en todos los casos edge

### Posibles mejoras futuras:

- Agregar un loading spinner elegante mientras se hidrata el store (actualmente muestra pantalla vacía por ~100ms)
- Considerar mover la lógica de autenticación a un middleware de Next.js para mejor rendimiento
- Implementar refresh token automático cuando el token expira

### Arquitectura:

La solución usa **Zustand persist middleware** con localStorage. El flujo es:

```
Usuario recarga → SSR (token=null) → Cliente monta →
Zustand lee localStorage → onRehydrateStorage ejecuta →
_hasHydrated=true → Layout verifica token → Renderiza contenido
```

## Capturas (si aplica)

**Antes:**

- Usuario recarga → pierde sesión → redirección al login ❌

**Ahora:**

- Usuario recarga → mantiene sesión → permanece en el dashboard ✅
- Acceso a raíz → redirección inmediata al login (sin página intermedia) ✅

---

**Título sugerido del PR:**

```
fix(auth): implement auth persistence on reload and auto-redirect to login
```

**Descripción corta para GitHub:**

```
Fixes authentication persistence issue where users were logged out on page reload due to race condition between SSR and Zustand rehydration. Also removes welcome page and redirects root to login automatically.
```
