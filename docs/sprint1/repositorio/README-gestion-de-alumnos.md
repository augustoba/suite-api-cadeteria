# Gestión de Alumnos

Backend del sistema de gestión académica de la IES Alfredo Coviello. Este proyecto centraliza la administración de alumnos, preinscripciones, turnos, pagos, documentación, inscripciones a materias, asistencias, permisos y configuración institucional.

## Descripción general

Este repositorio implementa la API REST con Spring Boot para gestionar todo el flujo académico del instituto, incluyendo:

- Preinscripción y evaluación de aspirantes
- Asignación de turnos y confirmación por email
- Alta de alumnos habilitados
- Gestión de carreras, años, materias y horarios
- Inscripciones a materias y aprobación por administradores/docentes
- Registro de asistencias, incluyendo integración con Arduino
- Gestión documental y de perfiles
- Autenticación y autorización con JWT
- Envío de emails masivos y notificaciones

## Stack tecnológico

- Java 21
- Spring Boot 4.0.5
- Spring Security
- Spring Data JPA
- MySQL 8+
- JWT (jjwt)
- OpenAPI / Swagger UI
- Apache PDFBox para generación de PDFs
- Maven Wrapper

## Requisitos

Antes de levantar el proyecto, asegurate de tener instalado:

- JDK 21
- MySQL 8.x
- Maven Wrapper incluido en el repositorio (no hace falta instalar Maven por separado)

## Estructura del repositorio

```text
.
├── DATABASE/                     # Scripts SQL y datos base
├── docs/                        # Documentación y utilidades de endpoints
├── src/
│   ├── main/
│   │   ├── java/                # Código fuente Java
│   │   └── resources/           # application.properties y assets
│   └── test/                    # Pruebas automatizadas
├── .gitignore
├── .gitattributes
├── FLUJOS.md                    # Flujos de negocio por rol y endpoints
├── INSTALL.md                   # Guía paso a paso de instalación
├── pom.xml                      # Configuración de Maven y dependencias
├── mvnw                         # Maven Wrapper (Linux/macOS)
├── mvnw.cmd                     # Maven Wrapper (Windows)
├── init_db.sql                  # Script inicial de base de datos
├── Gestion-Alumnos.postman_collection.json
├── postman/                     # Colección y entorno Postman
└── README.md                    # Este documento
```

## Configuración rápida

1. Crear la base de datos en MySQL:

```sql
CREATE DATABASE IF NOT EXISTS GESTIONALUMNOS
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

2. Copiar la configuración de ejemplo:

```bash
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

3. Ajustar credenciales y configuración de email en `src/main/resources/application.properties` si es necesario.

4. Ejecutar la aplicación:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

La API quedará disponible en:

```text
http://localhost:8080
```

## Usuarios de prueba

Al iniciar la aplicación, se crean usuarios base por defecto:

- `superadmin@coviello.com` / `Admin1234`
- `admin@coviello.com` / `Admin1234`

Estos usuarios permiten acceder al panel administrativo según el rol configurado.

## Funcionalidades principales

### Autenticación y permisos

- Login con JWT
- Registro y activación de cuentas
- Recuperación de contraseña
- Roles: `SUPER_ADMIN`, `ADMIN`, `DOCENTE`, `ALUMNO`
- Permisos temporales por usuario

### Preinscripción y turnos

- Alta de preinscripciones públicas
- Validación de documentos físicos
- Registro de pagos
- Asignación de turnos de atención
- Confirmación de turnos por email

### Gestión académica

- Carreras, años y materias
- Horarios de clase
- Inscripciones y decisiones de docentes/administradores
- Asistencia por fecha y resumen de regularidad
- Calendario académico institucional

### Integración con Arduino

- Registro de asistencia por huella o PIN desde dispositivos físicos
- Validación por horario, materia y alumno activo
- Diferenciación entre presencia, tardanza y ausencia

## Documentación

El repositorio incluye documentación útil para entender el sistema y operar con él:

- `INSTALL.md` — instalación y puesta en marcha
- `FLUJOS.md` — flujos generales por rol y endpoints
- `docs/api-endpoints.md` — referencia de endpoints
- `docs/flujos.html` — versión visual de los flujos

## Pruebas

Para correr la suite de pruebas:

```bash
./mvnw test
```

## API y documentación Swagger

La aplicación incluye Swagger/OpenAPI para explorar la API REST.

Tras levantar el backend, podés abrir:

```text
http://localhost:8080/swagger-ui/index.html
```
