# Suite automatizada de la API de cadetería — Sprint 3

Proyecto de Especialización en Herramientas de Testing (QualityTech Solutions). Herramienta: **Postman + Newman**.
Sistema bajo prueba: API REST del sistema de cadetería (Java 21 / Spring Boot 3.3.5, MySQL).

Esta suite ejecuta los 15 casos del Sprint 2 (5 endpoints × 3 casos) sin intervención manual, genera reportes HTML/JSON y corre sola en GitHub Actions.

## Contenido

| Ruta | Qué es |
|---|---|
| `postman/coleccion-cadeteria.postman_collection.json` | Colección: 15 casos + 3 pasos de preparación (P1–P3) + 1 de limpieza (Z1) |
| `postman/entorno-local.postman_environment.json` | URL de la API y usuarios de prueba (local) |
| `postman/entorno-ci.postman_environment.json` | Lo mismo para el pipeline |
| `.github/workflows/tests.yml` | Pipeline de integración continua |
| `mock/server.js` | Servidor simulado del contrato de la API (solo para validar la suite y el pipeline) |
| `scripts/resumen.js` | Arma el resumen de resultados a partir del reporte JSON |
| `docs/` | Documento de optimización, bitácora y análisis |
| `reportes/` | Se genera solo (no se versiona) |

## Requisitos

- Node.js 20 o superior
- La API levantada en `http://localhost:8080` con la carga de demostración (administrador `admin`, cadete `30111222` y pedidos de ejemplo), **o** el mock incluido

## Ejecución desde cero

```bash
git clone <URL-del-repositorio>
cd <carpeta>
npm install
```

**Contra la API real** (levantarla antes, con la carga de demostración):

```bash
npm test
```

**Contra el mock** (sin backend):

```bash
npm run mock        # en una terminal
npm run test:ci     # en otra
```

Al terminar, abrir `reportes/reporte.html` (reporte visual) o `reportes/reporte.json`. Para ver el resumen en consola: `npm run resumen`.

> La colección se ejecuta **completa y en orden**: P1–P3 guardan tokens e ids que usan los casos. Newman devuelve código de salida distinto de 0 si algún caso falla, y así el pipeline se marca en rojo.

## Integración continua

El workflow `tests.yml` corre en cada push a `main`, en cada pull request y a pedido (`workflow_dispatch`). Tiene dos jobs:

1. `suite-contra-mock`: corre siempre. Valida la suite y el pipeline contra el mock.
2. `api-real`: levanta el backend con MySQL y corre la misma colección. Se activa al definir la variable del repositorio `BACKEND_REPO` (Settings → Secrets and variables → Actions → Variables) y, si el repositorio es privado, el secreto `BACKEND_TOKEN`.

Los reportes quedan como *artifacts* de cada ejecución (pestaña Actions) y el resumen aparece en la página del workflow.

## Qué verifica la suite

- Cada caso: código HTTP y código de error esperados (ver `docs/` y el documento de casos del Sprint 2).
- En **todos** los requests (chequeos globales): tiempo de respuesta menor a `maxMs` (1500 ms por defecto), `Content-Type` JSON y, en las respuestas con error, el formato estándar `status / error / codigo / message`.
- Seguridad básica: los datos del cadete no exponen la contraseña.

## Variables

| Variable | Dónde | Uso |
|---|---|---|
| `baseUrl`, usuarios y contraseñas | Entorno | Cambia entre local y CI |
| `idInexistente`, `maxMs` | Colección | Id para los casos 404 y límite de tiempo |
| `tokenAdmin`, `tokenCadete`, `tokenVencido`, `cadeteId`, `pedidoId` | Colección (las completa la propia suite) | No editar a mano |

## Limitaciones conocidas

- La suite necesita datos de demostración cargados (cadete `30111222`, al menos un pedido en su historial).
- El caso 06 depende de que la API admita una sola sesión por cadete (el token de P2 queda inválido al ejecutar el caso 01).
- El paso Z1 restaura el estado del cadete a `LIBRE`; si el estado inicial era otro, ajustar Z1.
- El mock reproduce lo descrito en el documento de casos; no reemplaza las pruebas contra la API real.
