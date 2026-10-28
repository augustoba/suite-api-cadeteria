# Suite automatizada de la API de cadetería

Proyecto de Especialización en Herramientas de Testing — cliente QualityTech Solutions.
**Grupo 5** (IES Alfredo Coviello): Cesar Augusto Basaury Marquesto, Germán Garnica, Jorge Alberto Medina y Leandro Raúl Vallejo.

- **Herramienta:** Postman + Newman, con reportes HTML (`htmlextra`) y JSON.
- **Sistema bajo prueba:** API REST de una plataforma de cadetería (Java 21, Spring Boot 3.3.5 y MySQL 8), versión `30a29d1`, la misma que está desplegada en la copia del instituto.

**Último reporte:** https://augustoba.github.io/suite-api-cadeteria/

La suite tiene **22 casos de prueba**: los 15 del Sprint 2 (5 endpoints × 3) y 7 del flujo de un pedido, que verifican reglas de negocio. Corre sola en GitHub Actions contra una API levantada dentro del pipeline y publica el reporte en GitHub Pages.

## Contenido

| Ruta | Qué es |
|---|---|
| `postman/coleccion-cadeteria.postman_collection.json` | La colección: 22 casos, 7 pasos de preparación (P) y 1 de limpieza (Z) |
| `postman/entorno-local.postman_environment.json` | API en `localhost:8080` con la carga de demostración |
| `postman/entorno-ci.postman_environment.json` | API levantada dentro del pipeline |
| `postman/entorno-instituto.postman_environment.json` | Copia del instituto (`instituto.cademcadeteria.com.ar`). Las contraseñas no están en el repo |
| `.github/workflows/tests.yml` | Pipeline de CI/CD |
| `scripts/resumen.js` | Resumen de resultados y cobertura (consola y pestaña del workflow) |
| `docs/sprint1/`, `docs/sprint2/`, `docs/sprint3/` | Entregas anteriores, tal como se presentaron (en el Sprint 1 el sistema bajo prueba era la API de Gestión de Alumnos) |
| `docs/sprint4/` | Documento final y análisis de resultados (Markdown y PDF) y presentación de la defensa |
| `reportes/` | Se genera en cada corrida (no se versiona) |

## Ejecución local

Requisitos: Node.js 20 o superior, y la API corriendo en `http://localhost:8080` con la carga de demostración (`DEMO_ENABLED=true`).

```bash
npm ci
npm test          # corre la suite y deja reportes/reporte.html y reportes/reporte.json
npm run resumen   # resumen en la consola
```

Para medir la estabilidad, repetir la suite N veces: `npm test -- -n 10`.

Contra la copia del instituto (pedir las contraseñas al equipo, **no** subirlas al repo):

```bash
npm run test:instituto -- --env-var "adminPassword=..." --env-var "cadetePassword=..."
```

> **Cuidado:** la API bloquea una cuenta durante 15 minutos después de 5 contraseñas incorrectas. Con contraseñas equivocadas, la suite deja bloqueado al cadete de prueba. Nunca correrla en bucle contra el servidor.

## Pipeline (`.github/workflows/tests.yml`)

| Job | Cuándo | Qué hace |
|---|---|---|
| `api-aislada` | En cada push a `main`, en cada pull request, todos los días a las 9 (hora de Tucumán) y a mano | Levanta MySQL 8 y el backend `30a29d1` **dentro de la máquina de GitHub**, con base nueva y JaCoCo, corre la suite, mide la cobertura y sube los reportes |
| `publicar-reporte` | Después de `api-aislada`, solo en `main` | Publica el último reporte en GitHub Pages |
| `instituto` | Solo a mano: *Actions → Run workflow → destino: instituto* | Una sola vuelta de la suite contra la copia del instituto |

El pipeline **no tiene acceso a ningún servidor** (ni claves SSH ni de despliegue). La "entrega" de este proyecto es un reporte confiable, no un despliegue: el servidor del instituto es compartido con un sistema en producción. Ver `docs/sprint4/documento-final.md`, sección 4.

Para dejarlo andando en GitHub:
1. *Settings → Pages → Source: GitHub Actions*.
2. *Settings → Secrets and variables → Actions → Secrets*: cargar `INSTITUTO_ADMIN_PASSWORD` y `INSTITUTO_CADETE_PASSWORD`. Solo los usa el job `instituto`.
3. Opcional, en *Variables*: `BACKEND_REPO` y `BACKEND_REF` para probar otra versión del backend. Por defecto: `augustoba/cadeteria-backend` en `30a29d1`.

## Qué verifica la suite

- **Cada caso:** el código HTTP, el `codigo` de error de la API y el contenido de la respuesta que importa para ese caso (estado del pedido, hora de retiro, mensaje del error).
- **Todos los requests:** tiempo de respuesta menor a `maxMs` (1500 ms; 3000 ms contra el instituto), `Content-Type` JSON y, en los errores, el formato `status / error / codigo / message`.
- **Seguridad:** sesión única por cadete, permisos por rol, que la respuesta no exponga la contraseña y que una app vieja no pueda ponerse disponible.
- **Reglas de negocio:** espera mínima entre el retiro y la entrega, y cierre manual del admin solo con motivo.

| Grupo | Casos |
|---|---|
| 1. `POST /api/auth/login/cadete` | 01 a 03 |
| 2. `GET /api/cadetes/me` | 04 a 06 |
| 3. `GET /api/admin/cadetes/{id}` | 07 a 09 |
| 4. `PATCH /api/cadetes/me/estado` | 10 a 12 |
| 6. Flujo de un pedido (alta, asignación, aceptación, retiro, entrega) | 16 a 22 |
| 5. `GET /api/pedidos/me/{id}` (usa el pedido que crea el grupo 6, por eso corre después) | 13 a 15 |

La colección se corre **completa y en orden**: los pasos P guardan tokens e ids y preparan al cadete, y Z1 lo deja LIBRE.

## Limitaciones conocidas

- Depende de la carga de demostración: admin `admin` y cadete `30111222` con `cadete123`. Si el cadete no tiene la cuota semanal paga (el backend las deshabilita cada lunes), P1b la habilita.
- El caso 21 supone que `minutos_minimos_retiro_entrega` es mayor que 0 (vale 10 por defecto). Si en Configuración se pone en 0, el caso falla, y es correcto que falle: la regla dejó de existir.
- Cada corrida crea y cierra un pedido de prueba ("Prueba automatizada (Newman) - se puede borrar"), y si el cadete tiene incidentes abiertos, los cierra.
