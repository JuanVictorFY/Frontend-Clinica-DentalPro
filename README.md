<p align="center">
  <img src="public/favicon.svg" width="80" alt="DentalPro Logo">
</p>

<h1 align="center">DentalPro — Sistema de Gestión Clínica Dental</h1>

<p align="center">
  <strong>Frontend completo para la gestión interna de una clínica dental</strong><br>
  Landing page pública + Intranet administrativa con control de acceso por roles
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-dd0031?style=flat-square&logo=angular" alt="Angular">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06b6d4?style=flat-square&logo=tailwindcss" alt="TailwindCSS 4">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
</p>

---

## Backend

https://github.com/JuanVictorFY/Backend-Clinica-DentalPro.git

> El frontend consume la API REST del backend (Spring Boot 3.4.5 + PostgreSQL). Debe estar corriendo en `http://localhost:8080` antes de iniciar el frontend.

---

## Descripción

DentalPro es un sistema web de gestión para clínicas dentales que incluye:

- **Páginas públicas** (landing, servicios, nosotros, contacto) con diseño oscuro y animaciones
- **Intranet administrativa** protegida con autenticación JWT y control de acceso por roles
- **Módulos funcionales** completos conectados a la API REST

---

## Arquitectura

```
src/
├── app/
│   ├── core/              # Guards, interceptors, servicios de auth, modelos
│   ├── features/          # Módulos funcionales (pacientes, citas, atencion, tratamientos, pagos, ...)
│   ├── layouts/           # IntranetLayoutComponent (sidebar + topbar + búsqueda global)
│   ├── pages/             # Páginas públicas (home, servicios, nosotros, contacto)
│   ├── shared/            # Toast, confirmación, paginación, skeleton, búsqueda
│   └── components/        # Navbar y Footer públicos
├── styles.css             # TailwindCSS 4 + variables de tema + animaciones
└── index.html
```

---

## Módulos de la Intranet

| Módulo | Funcionalidades |
|--------|-----------------|
| **Dashboard** | Métricas del día, acciones rápidas, citas pendientes |
| **Pacientes** | CRUD completo, historial clínico (ficha médica editable + citas + notas) |
| **Citas** | Agenda por fecha, filtros por odontólogo/estado, cambio de estado |
| **Atención** | Registro de diagnóstico, tratamiento y notas clínicas |
| **Usuarios** | Gestión de personal con roles |
| **Reportes** | Lista paginada, vista detalle, descarga en PDF |
| **Tratamientos** | Catálogo de tratamientos con precio y duración (solo Admin) |
| **Pagos** | Registro de cobros, cambio de estado, resumen financiero |

---

## Credenciales de Acceso

| Rol | Email | Contraseña | Módulos disponibles |
|-----|-------|------------|---------------------|
| Administrador | `admin@dental.com` | `123456` | Todos |
| Recepcionista | `recepcion@dental.com` | `123456` | Dashboard, Pacientes, Citas, Pagos |
| Odontólogo | `doctor@dental.com` | `123456` | Dashboard, Citas, Atención, Reportes |

---

## Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Framework | Angular 19 (Standalone Components, Signals) |
| Estilos | TailwindCSS 4 |
| Lenguaje | TypeScript 5.x |
| Build | Vite (via @angular/build) |
| HTTP | HttpClient + Interceptor JWT |

---

## Requisitos Previos

- Node.js 18+
- npm 10+
- Backend corriendo en `http://localhost:8080`

---

## Instalación

```bash
git clone https://github.com/JuanVictorFY/Frontend-Clinica-DentalPro.git
cd Frontend-Clinica-DentalPro
npm install
```

---

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producción en `dist/` |

---

## Estructura de Roles y Permisos

```
ADMINISTRADOR
├── Dashboard
├── Pacientes      (CRUD + Historial clínico)
├── Citas          (CRUD + Filtros + Estados)
├── Atención       (Notas clínicas)
├── Usuarios       (CRUD)
├── Reportes       (Ver + PDF)
├── Tratamientos   (CRUD catálogo)
└── Pagos          (Ver + Cambiar estado)

RECEPCIONISTA
├── Dashboard
├── Pacientes      (CRUD + Historial clínico)
├── Citas          (CRUD + Filtros)
└── Pagos          (Ver + Marcar pagado)

ODONTOLOGO
├── Dashboard
├── Citas          (Ver + Atender)
├── Atención       (Notas clínicas)
└── Reportes       (Ver + PDF)
```

---

## Convenciones del Proyecto

- **Componentes**: Standalone, sin NgModules
- **Estado**: Signals (`signal()`, `computed()`)
- **DI**: `inject()` en lugar de constructor injection
- **Control flow**: `@if`, `@for`, `@switch`
- **Tema**: Dark por defecto, toggle claro/oscuro persistente
- **Idioma**: UI completamente en español

---

## Ramas

| Rama | Descripción |
|------|-------------|
| `feature/setup-angular` | Configuración base de Angular, rutas y TailwindCSS |
| `feature/paginas-publicas` | Home, Servicios, Nosotros y Contacto |
| `feature/componentes-globales` | Navbar y Footer responsivos |
| `feature/auth-login` | Login, registro de pacientes y recuperación de contraseña |
| `feature/guards-interceptors` | Guards de auth/rol e interceptor JWT |
| `feature/modulo-pacientes` | CRUD de pacientes e historial clínico |
| `feature/modulo-citas` | Agenda de citas con filtros avanzados |
| `feature/modulo-atencion` | Registro de notas y atención clínica |
| `feature/modulo-usuarios` | Gestión de usuarios del personal |
| `feature/modulo-pagos` | Registro de cobros y cambio de estado |
| `feature/modulo-reportes` | Reportes paginados con exportación a PDF |
| `feature/modulo-tratamientos` | Catálogo de tratamientos y precios |
| `feature/dashboard-shared` | Dashboard, layout de intranet y componentes compartidos |

---

## Autoría

Proyecto diseñado, desarrollado e implementado por:

- **Desarrollador:** Juan Victor Figueroa Yupton
- **GitHub:** [@JuanVictorFY](https://github.com/JuanVictorFY)
- **Contacto:** [figyuptonj99@gmail.com](mailto:figyuptonj99@gmail.com)

---

*Proyecto desarrollado con fines académicos — Ingeniería de Sistemas e Informática.*


