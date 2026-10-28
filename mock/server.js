// Servidor simulado del contrato de la API de cadetería (según el documento de casos de prueba).
// SOLO sirve para validar la colección y el pipeline sin necesitar el backend real.
// No reemplaza a la API: los resultados contra este mock NO cuentan como pruebas del sistema.
const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 8080;
const ESTADOS = ["LIBRE", "OCUPADO", "DESCONECTADO"];
const CADETE = { id: "034bd6fc-48c3-485c-86af-97ec920da2be", nombre: "Juan", apellido: "Pérez", dni: "30111222", telefono: "3813010001", estado: "LIBRE" };
const PEDIDOS = [{ id: "demo-pedido-01", numero: 9100001, clienteNombre: "Marcos Herrera", origenDireccion: "25 de Mayo 231, Monteros" }];
const USERS = { admin: { pass: "cambiar123", tipo: "ADMIN" }, "30111222": { pass: "cadete123", tipo: "CADETE" } };

const sesiones = {};
const sesionCadete = { token: null };

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
const error = (res, status, nombre, codigo, message, fieldErrors = null) =>
  send(res, status, { timestamp: new Date().toISOString(), status, error: nombre, codigo, message, fieldErrors });

const auth = (req) => {
  const h = req.headers["authorization"] || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  return t && sesiones[t] ? { token: t, tipo: sesiones[t] } : null;
};
const noAuth = (res) => error(res, 401, "Unauthorized", "NO_AUTENTICADO", "Tu sesión venció o no iniciaste sesión.");
const sinPermiso = (res) => error(res, 403, "Forbidden", "SIN_PERMISO", "No tenés permiso para hacer eso.");

const login = (tipo, body, res) => {
  const u = USERS[body.username];
  if (body.versionApp !== undefined && typeof body.versionApp !== "number")
    return error(res, 400, "Bad Request", "VALIDACION", "El dato «versionApp» no tiene el formato correcto.", { versionApp: "Formato incorrecto" });
  if (!u || u.pass !== body.password || u.tipo !== tipo)
    return error(res, 401, "Unauthorized", "CREDENCIALES_INVALIDAS", "Usuario o contraseña incorrectos.");
  const token = "mock." + crypto.randomBytes(12).toString("hex") + ".firma";
  if (tipo === "CADETE") { if (sesionCadete.token) delete sesiones[sesionCadete.token]; sesionCadete.token = token; }
  sesiones[token] = tipo;
  send(res, 200, { token, tokenType: "Bearer", tipo, expiresAt: new Date(Date.now() + 12 * 3600e3).toISOString() });
};

http.createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (e) { return error(res, 400, "Bad Request", "VALIDACION", "JSON inválido."); }
    const path = req.url.split("?")[0];
    const key = req.method + " " + path;
    if (key === "POST /api/auth/login/cadete") return login("CADETE", body, res);
    if (key === "POST /api/auth/login/admin") return login("ADMIN", body, res);
    if (key === "GET /actuator/health") return send(res, 200, { status: "UP" });

    const s = auth(req);
    if (key === "GET /api/cadetes/me") return s ? send(res, 200, CADETE) : noAuth(res);
    if (key === "PATCH /api/cadetes/me/estado") {
      if (!s) return noAuth(res);
      if (s.tipo !== "CADETE") return sinPermiso(res);
      if (!ESTADOS.includes(body.estadoId))
        return error(res, 400, "Bad Request", "VALIDACION", "Revisá los datos: El estado tiene que ser LIBRE, OCUPADO o DESCONECTADO.", { estadoId: "El estado tiene que ser LIBRE, OCUPADO o DESCONECTADO." });
      CADETE.estado = body.estadoId;
      return send(res, 200, CADETE);
    }
    let m;
    if ((m = path.match(/^\/api\/admin\/cadetes\/(.+)$/)) && req.method === "GET") {
      if (!s) return noAuth(res);
      if (s.tipo !== "ADMIN") return sinPermiso(res);
      return m[1] === CADETE.id ? send(res, 200, CADETE) : error(res, 404, "Not Found", "NO_ENCONTRADO", "Cadete no encontrado: " + m[1]);
    }
    if (key === "GET /api/pedidos/me/historial") {
      if (!s) return noAuth(res);
      return s.tipo === "CADETE" ? send(res, 200, { pedidos: PEDIDOS }) : sinPermiso(res);
    }
    if ((m = path.match(/^\/api\/pedidos\/me\/(.+)$/)) && req.method === "GET") {
      if (!s) return noAuth(res);
      if (s.tipo !== "CADETE") return sinPermiso(res);
      const p = PEDIDOS.find((x) => x.id === m[1]);
      return p ? send(res, 200, p) : error(res, 404, "Not Found", "NO_ENCONTRADO", "Pedido no encontrado: " + m[1]);
    }
    error(res, 404, "Not Found", "NO_ENCONTRADO", "Ruta no encontrada.");
  });
}).listen(PORT, () => console.log("Mock de la API escuchando en http://localhost:" + PORT));
