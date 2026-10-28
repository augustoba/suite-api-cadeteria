// Lee reportes/reporte.json (generado por Newman) y arma un resumen en Markdown.
// En GitHub Actions se agrega a $GITHUB_STEP_SUMMARY; en local se imprime por consola.
// Si existe reportes/cobertura.csv (JaCoCo), suma la cobertura de codigo del backend.
const fs = require("fs");
const archivo = process.argv[2] || "reportes/reporte.json";
const r = JSON.parse(fs.readFileSync(archivo, "utf8")).run;
const s = r.stats;
const tiempos = r.executions.map((e) => e.response && e.response.responseTime).filter((t) => typeof t === "number");
const prom = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
const p95 = tiempos.length ? tiempos.slice().sort((a, b) => a - b)[Math.floor(tiempos.length * 0.95)] : 0;

// Casos de prueba: los requests cuyo nombre empieza con el numero de caso (los P y Z son preparacion y limpieza).
const casos = {};
for (const e of r.executions) {
  const nombre = e.item.name;
  if (!/^\d{2} /.test(nombre)) continue;
  const ok = !(e.assertions || []).some((a) => a.error);
  casos[nombre] = casos[nombre] === false ? false : ok;
}
const nombres = Object.keys(casos);
const aprobados = nombres.filter((n) => casos[n]).length;
const fallos = r.failures.map((f) => `- **${f.source && f.source.name}** · ${f.error.test || f.error.name}: ${f.error.message}`);

const lineas = [
  "## Resultado de la suite de pruebas (Newman)",
  "",
  "| Métrica | Valor |", "|---|---|",
  `| Casos de prueba aprobados | ${aprobados} / ${nombres.length} |`,
  `| Iteraciones | ${s.iterations.total} |`,
  `| Requests ejecutados | ${s.requests.total} |`,
  `| Aserciones | ${s.assertions.total - s.assertions.failed} OK / ${s.assertions.failed} fallidas |`,
  `| Duración total | ${r.timings.completed - r.timings.started} ms |`,
  `| Tiempo de respuesta promedio / p95 | ${prom} ms / ${p95} ms |`,
];

const csv = "reportes/cobertura.csv";
if (fs.existsSync(csv)) {
  const filas = fs.readFileSync(csv, "utf8").trim().split("\n");
  const cab = filas.shift().split(",");
  const suma = (col) => filas.reduce((t, f) => t + Number(f.split(",")[cab.indexOf(col)]), 0);
  const pct = (m) => {
    const c = suma(m + "_COVERED"), t = c + suma(m + "_MISSED");
    return `${(100 * c / t).toFixed(1)} % (${c} / ${t})`;
  };
  lineas.push(`| Cobertura del backend: líneas | ${pct("LINE")} |`, `| Cobertura del backend: ramas | ${pct("BRANCH")} |`);
}

lineas.push("", fallos.length ? "### Fallos\n" + fallos.join("\n") : "Sin fallos.");
const md = lineas.join("\n");
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
console.log(md);
