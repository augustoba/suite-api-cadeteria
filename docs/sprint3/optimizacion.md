# Documento de optimización — Sprint 3

## 1. Punto de partida (colección del Sprint 2)

- 18 requests (15 casos + P1, P2, P3), 18 scripts de test.
- 35 aserciones en total; cada caso de error repetía a mano las mismas verificaciones.
- Credenciales y URL dentro de la colección; ids inexistentes escritos a mano en los casos 08 y 14.
- El caso 10 cambiaba el estado del cadete a `DESCONECTADO` y no lo restauraba: una segunda ejecución partía de un estado distinto.
- Sin límite de tiempo de respuesta ni verificación del formato de error en todos los requests.
- Ejecución manual desde Postman.

## 2. Cambios realizados

| # | Cambio | Justificación técnica |
|---|---|---|
| 1 | Chequeos a nivel de colección: tiempo de respuesta, `Content-Type` JSON y formato estándar de error (`status` coincide con el HTTP, `error`, `codigo`, `message`) | Se escriben una vez y se aplican a los 19 requests; antes no existían. Detecta regresiones de contrato sin tocar cada caso |
| 2 | Aserciones nuevas en casos existentes: `expiresAt` (01), nombre y apellido (04), mismo cadete (10), número de pedido (13) | Verifican el contenido de la respuesta, no solo el código HTTP |
| 3 | Chequeo de que la respuesta no expone la contraseña (04 y 07) | Control de seguridad barato sobre datos del cadete |
| 4 | Paso Z1 de limpieza: restaura el estado del cadete a `LIBRE` | La suite queda repetible; el pipeline no depende del estado que dejó la ejecución anterior |
| 5 | Variables `idInexistente` y `maxMs` | Sin valores fijos en los casos; el umbral de tiempo se ajusta por entorno |
| 6 | Credenciales y URL en archivos de entorno (`local` y `ci`) | La misma colección corre en la máquina de cada integrante y en el pipeline |
| 7 | Newman + reporters HTML y JSON, scripts `npm` y workflow de GitHub Actions | Ejecución y reportes sin intervención manual |
| 8 | Resumen automático (`scripts/resumen.js`) | Resultados visibles en la pestaña del workflow sin abrir el reporte |

## 3. Medición antes / después

Mediciones estáticas (conteo sobre la colección) y ejecución de validación contra el mock del contrato:

| Métrica | Antes | Después |
|---|---|---|
| Requests | 18 | 19 (se suma Z1) |
| Casos de prueba | 15 | 15 |
| Aserciones por ejecución | 35 | 90 |
| Chequeos de tiempo de respuesta | 0 | 19 |
| Verificaciones de formato de error | 0 (cada caso verificaba `codigo` a mano) | 10 (una por cada respuesta de error, definidas una sola vez) |
| Valores fijos en los casos | 2 ids + credenciales | 0 |
| Estado del sistema tras ejecutar | modificado (estado del cadete) | restaurado |
| Pasos manuales para ejecutar y reportar | abrir Postman, importar, correr, armar el reporte a mano | 0 (`npm test` o push al repositorio) |

**Completar con la ejecución real** (misma máquina, API real, 3 corridas y promedio):

| Métrica | Antes (Postman manual) | Después (Newman) |
|---|---|---|
| Tiempo para ejecutar y obtener el reporte | [completar] | [completar] |
| Tiempo de respuesta promedio de la API | [completar] | [completar] |
| Casos aprobados / fallidos | [completar] | [completar] |

> Las cifras de tiempo contra el mock (≈1,1 s en total, ≈7 ms por request) validan que la suite funciona, pero no describen el rendimiento de la API real.

## 4. Evidencia

- Reporte HTML y JSON de la ejecución automática: pestaña Actions → ejecución → Artifacts.
- Capturas: [adjuntar captura del workflow en verde, del resumen y del reporte HTML].
