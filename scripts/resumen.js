// Lee reportes/reporte.json (generado por Newman) y arma un resumen en Markdown.
// En GitHub Actions se agrega a $GITHUB_STEP_SUMMARY; en local se imprime por consola.
const fs = require("fs");
const archivo = process.argv[2] || "reportes/reporte.json";
const r = JSON.parse(fs.readFileSync(archivo, "utf8")).run;
const s = r.stats;
const tiempos = r.executions.map((e) => e.response && e.response.responseTime).filter((t) => typeof t === "number");
const prom = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
const fallos = r.failures.map((f) => `- **${f.source && f.source.name}** · ${f.error.test || f.error.name}: ${f.error.message}`);
const md = [
  "## Resultado de la suite de pruebas (Newman)",
  "",
  "| Métrica | Valor |", "|---|---|",
  `| Requests ejecutados | ${s.requests.total} |`,
  `| Aserciones | ${s.assertions.total - s.assertions.failed} OK / ${s.assertions.failed} fallidas |`,
  `| Duración total | ${r.timings.completed - r.timings.started} ms |`,
  `| Tiempo de respuesta promedio | ${prom} ms |`,
  "",
  fallos.length ? "### Fallos\n" + fallos.join("\n") : "Sin fallos.",
].join("\n");
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
console.log(md);
