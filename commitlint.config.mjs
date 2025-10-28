export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Forzamos un conjunto de scopes comunes al equipo
    "scope-enum": [2, "always", ["client", "api", "infra", "i18n", "ui", "auth", "deps", "config"]],
    // Recomendado: kebab/lower case para el scope
    "scope-case": [2, "always", ["kebab-case", "lower-case"]],
    // No usar mayúsculas ni Pascal/Sentence case en el subject
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    // Límite de largo del encabezado
    "header-max-length": [2, "always", 100],
  },
};
