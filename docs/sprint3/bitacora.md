# Bitácora — Sprint 3

| Fecha | Integrante | Tarea | Decisión / problema | Resolución |
|---|---|---|---|---|
| | [Integrante 1] | Consolidar la colección y agregar chequeos globales | | |
| | [Integrante 2] | Workflow de GitHub Actions | | |
| | [Integrante 3] | Mediciones antes/después y documento de optimización | | |
| | [Integrante 4] | README, reportes y prueba desde cero | | |

## Decisiones técnicas

- Credenciales en entornos y no en la colección: `pm.variables.get` resuelve entorno + colección; `pm.collectionVariables.get` solo la colección.
- Los tokens e ids se guardan como variables de colección. No definirlos en el entorno: el valor del entorno tiene prioridad y pisaría lo que guardan los scripts.
- Ejecución contra mock en el pipeline para validar la suite sin depender del backend; la API real corre en el job `api-real`.

## Problemas resueltos

| Problema | Causa | Solución |
|---|---|---|
| | | |
