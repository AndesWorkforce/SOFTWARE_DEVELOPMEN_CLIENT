# Resumen

Agregar modal de exportación de reportes con selección de campos y llamado a backend para generar PDF, más soporte multilenguaje para el modal.

## Tipo de cambio

- [ ] Bugfix
- [x] Nueva funcionalidad
- [ ] Refactor
- [ ] Docs
- [ ] Chore

## Issue relacionada

SDT-225 (exportación de reportes a PDF).

## Descripción detallada

- Se añade modal en la vista de reportes que muestra filtros aplicados, permite elegir campos visibles y envía la solicitud de generación de PDF al endpoint `/reports/generate`.
- Se internacionalizan todos los textos del modal (en/es) incluyendo nombres de campos, botones y mensajes de error.
- El modal abre el PDF en nueva pestaña al éxito y maneja mensajes de error en el propio modal.

## Cómo probar / QA

1. `pnpm install` (si hace falta) y `pnpm dev` o `pnpm build`.
2. Ir a `/[locale]/app/super-admin/reports`, aplicar filtros opcionales.
3. Click en “Exportar PDF” → se abre el modal con filtros y lista de campos.
4. Seleccionar/deseleccionar campos (los requeridos no se pueden quitar) y confirmar “Generar PDF”.
5. Verificar que se abre el PDF en nueva pestaña y que errores se muestran en el modal si el backend falla.

## Checklist

- [x] Mis cambios siguen las convenciones de commits (Conventional Commits).
- [x] Concurrency, performance y edge cases revisados si aplica.
- [ ] Tests unitarios/integ. añadidos o actualizados cuando corresponda.
- [x] Documentación actualizada cuando corresponde.
- [x] El build y linter pasan localmente.

## Notas para el reviewer

- Revisar textos de i18n en en/es para el modal.
- Husky ejecutó typecheck y `next build` correctamente; aparece aviso de `baseline-browser-mapping` desactualizado (informativo).

## Capturas (si aplica)

_No adjuntas; si se requiere, puedo capturar el modal con campos y estados de error._

---

**Sugerencia de título del PR:** `feat(ui): export pdf modal` (Closes SDT-225 si aplica).
