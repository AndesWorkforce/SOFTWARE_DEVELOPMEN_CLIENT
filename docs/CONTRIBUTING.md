## Guía rápida para commits y checks locales

Este proyecto aplica validaciones automáticas antes y durante cada commit para mantener el repo consistente. Aquí tienes un resumen práctico para el equipo.

---

### 1) Convención de mensajes (Conventional Commits)

Formato del encabezado:

```
<type>(<scope>): <subject>
```

- type: uno de los tipos permitidos (ver más abajo).
- scope: obligatorio y en kebab-case o lower-case.
- subject: en minúsculas, conciso (máx. 100 caracteres), sin punto final.

Tipos más usados:

- feat: nueva funcionalidad
- fix: corrección de bug
- refactor: cambio interno sin alterar comportamiento público
- chore: tareas de mantenimiento (configs, scripts, etc.)
- docs: documentación
- style: formateo/cambios estéticos (sin cambio de lógica)
- test: tests
- perf: mejoras de performance
- build: cambios en build, deps o herramientas
- ci: cambios en pipelines/CI
- revert: revertir un commit previo

Scopes permitidos (según commitlint):

```
client, api, infra, i18n, ui, auth, deps, config
```

Reglas importantes:

- El scope debe estar en kebab-case o lower-case.
- No usar Sentence/Start/Pascal/Upper case en el subject.
- El header completo no debe superar 100 caracteres.

Ejemplos correctos:

- `feat(client): agrega pantalla de login`
- `fix(auth): evita redirect cuando falta la cookie session`
- `chore(config): integra husky + lint-staged`
- `refactor(i18n): extrae routing a packages/internationalization`
- `docs(client): añade guía de commits`

Ejemplos incorrectos (serán rechazados):

- `Update files` (no sigue el formato)
- `feat: Nueva Funcionalidad` (falta scope y subject con mayúsculas)
- `fix(client):` (falta subject)
- `feat(client super) agrega login` (scope inválido)

Extras opcionales del estándar:

- Breaking change: `feat(client)!: cambia contrato de login` y detallar en el body o footer `BREAKING CHANGE: ...`
- Referencias a issues: incluir en el body/footer `Refs #123` o `Closes #123`.

Tip: usa el asistente interactivo

```
pnpm commit
```

Te guiará con los tipos y scopes permitidos (usa cz-git tras bambalinas).

---

### 2) Qué se valida automáticamente

Hooks configurados:

1. pre-commit
   - lint-staged: ejecuta Prettier (check) + ESLint (sin warnings) sobre archivos staged.
   - typecheck: `tsc --noEmit` sobre todo el proyecto.
   - build: `next build` (si algo falla, se bloquea el commit).

2. commit-msg
   - commitlint: valida que el mensaje cumpla el formato de Conventional Commits y los scopes/longitudes definidos.

Orden de ejecución: primero corre pre-commit, luego commit-msg.

Mensajes típicos y cómo actuar:

- `No staged files match any configured task.`
  - No hay archivos staged que coincidan con los patrones de lint-staged. Es normal si sólo cambiaste archivos no incluidos (p. ej., .gitignore). Igualmente correrán typecheck y build.

- Falla Prettier/ESLint
  - Ejecuta `pnpm format` para arreglar formato y `pnpm lint` para ver detalles. Corrige y vuelve a commitear.

- Falla typecheck
  - Ejecuta `pnpm typecheck` localmente, corrige errores de TypeScript.

- Falla build
  - Ejecuta `pnpm build` y revisa el error que Next.js o Turbopack reporta.

- Falla commitlint (formato mensaje)
  - Usa `pnpm commit` para rehacer el mensaje con el asistente, o edítalo a mano siguiendo el formato.

---

### 3) Comandos útiles

- Formatear todo: `pnpm format`
- Verificar formato sin cambiar archivos: `pnpm format:check`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Commit asistido: `pnpm commit`

---

### 4) Referencias

- Convención: https://www.conventionalcommits.org/
- Commitlint: https://commitlint.js.org/

Si necesitas que agreguemos otro scope a la lista o ajustemos reglas, avísanos y lo sincronizamos en commitlint y en el prompt interactivo.
