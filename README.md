<p align="center">
  <img src="public/favicon.svg" width="80" alt="DentalPro Logo">
</p>

<h1 align="center">DentalPro - Sistema de Gesti&oacute;n Cl&iacute;nica Dental</h1>

<p align="center">
  <strong>Frontend completo para la gesti&oacute;n interna de una cl&iacute;nica dental</strong><br>
  Landing page p&uacute;blica + Intranet administrativa con control de acceso por roles
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-21-dd0031?style=flat-square&logo=angular" alt="Angular 21">
  <img src="https://img.shields.io/badge/TailwindCSS-4-06b6d4?style=flat-square&logo=tailwindcss" alt="TailwindCSS 4">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vitest-4-6e9f18?style=flat-square&logo=vitest" alt="Vitest">
</p>

---

## Descripci&oacute;n

DentalPro es un sistema web de gesti&oacute;n para cl&iacute;nicas dentales que incluye:

- **P&aacute;ginas p&uacute;blicas** (landing page, servicios, nosotros, contacto) con dise&ntilde;o premium oscuro y animaciones
- **Intranet administrativa** protegida con autenticaci&oacute;n JWT y control de acceso basado en roles
- **M&oacute;dulos funcionales** completos: Pacientes, Citas, Atenci&oacute;n, Usuarios y Reportes

Todo funciona con datos mock en memoria &mdash; no requiere backend ni servidor externo.

---

## Arquitectura

```
src/
├── app/
│   ├── core/              # Servicios, guards, interceptors, modelos
│   ├── features/          # M&oacute;dulos funcionales (pacientes, citas, etc.)
│   ├── layouts/           # IntranetLayoutComponent (sidebar + topbar)
│   ├── pages/             # P&aacute;ginas p&uacute;blicas (home, servicios, nosotros, contacto)
│   ├── shared/            # Componentes reutilizables (toast, pagination, skeleton, modal)
│   └── components/        # Navbar y Footer p&uacute;blicos
├── styles.css             # TailwindCSS 4 + variables de tema + animaciones
└── index.html
```

---

## Funcionalidades

### P&aacute;ginas P&uacute;blicas
- Landing page con hero, servicios, testimonios, galer&iacute;a y CTA
- P&aacute;gina de servicios con carrusel animado
- Secci&oacute;n Nosotros y Contacto
- Navbar con efecto glassmorphism al scroll
- Animaciones scroll-triggered con IntersectionObserver

### Intranet (requiere login)
| M&oacute;dulo | Funcionalidades |
|--------|-----------------|
| **Dashboard** | M&eacute;tricas, acciones r&aacute;pidas, citas del d&iacute;a |
| **Pacientes** | CRUD completo, historial cl&iacute;nico, validaci&oacute;n DNI |
| **Citas** | Agenda por fecha, filtros por odont&oacute;logo/estado, m&aacute;quina de estados |
| **Atenci&oacute;n** | Registro de notas cl&iacute;nicas, finalizaci&oacute;n de citas |
| **Usuarios** | Gesti&oacute;n de usuarios con roles (Admin, Recepcionista, Odont&oacute;logo) |
| **Reportes** | Lista de reportes, vista detalle, exportar PDF |

### Caracter&iacute;sticas Transversales
- Autenticaci&oacute;n mock con JWT (3 usuarios predefinidos)
- Guards funcionales (auth + roles)
- Sistema de notificaciones toast
- Modal de confirmaci&oacute;n personalizado
- Paginaci&oacute;n en tablas
- Skeleton loading en listas
- B&uacute;squeda global en topbar
- Toggle modo claro/oscuro con persistencia
- Transiciones de p&aacute;gina (fade)
- Breadcrumbs din&aacute;micos
- Sidebar responsive (m&oacute;vil + tablet + desktop)
- Exportaci&oacute;n de reportes a PDF

---

## Credenciales de Acceso

| Rol | Email | Contrase&ntilde;a | Acceso |
|-----|-------|------------|--------|
| Administrador | `admin@dental.com` | `123456` | Todos los m&oacute;dulos |
| Recepcionista | `recepcion@dental.com` | `123456` | Pacientes, Citas |
| Odont&oacute;logo | `doctor@dental.com` | `123456` | Citas, Atenci&oacute;n, Reportes |

---

## Tecnolog&iacute;as

| Categor&iacute;a | Tecnolog&iacute;a |
|-----------|------------|
| Framework | Angular 21 (Standalone Components, Signals) |
| Estilos | TailwindCSS 4 |
| Lenguaje | TypeScript 5.9 |
| Testing | Vitest + @analogjs/vitest-angular |
| Build | Vite (via @angular/build) |
| SSR | Angular SSR |

---

## Requisitos Previos

- Node.js 18+
- npm 10+

---

## Instalaci&oacute;n

```bash
git clone https://github.com/JuanVictorFY/Frontend-Clinica-DentalPro.git
cd Frontend-Clinica-DentalPro
npm install
```

---

## Comandos

| Comando | Descripci&oacute;n |
|---------|-------------|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producci&oacute;n en `dist/` |
| `npm test` | Ejecutar tests unitarios con Vitest |
| `npx vitest run src/app/core/` | Tests solo del core (guards + auth) |

---

## Estructura de Roles y Permisos

```
ADMIN
├── Dashboard
├── Pacientes (CRUD + Historial)
├── Citas (CRUD + Filtros)
├── Atenci&oacute;n (Notas cl&iacute;nicas)
├── Usuarios (CRUD)
└── Reportes (Ver + PDF)

RECEPCIONISTA
├── Dashboard
├── Pacientes (CRUD + Historial)
└── Citas (CRUD + Filtros)

ODONTOLOGO
├── Dashboard
├── Citas (Ver + Atender)
├── Atenci&oacute;n (Notas cl&iacute;nicas)
└── Reportes (Ver + PDF)
```

---

## Convenciones del Proyecto

- **Componentes**: Standalone, sin NgModules
- **Estado**: Signals (`signal()`, `computed()`)
- **DI**: `inject()` en vez de constructor injection
- **Control flow**: `@if`, `@for`, `@switch`
- **Inputs**: `input()` function con `withComponentInputBinding()`
- **Tema**: Dark por defecto, toggle claro/oscuro
- **Idioma**: Todo el UI en espa&ntilde;ol
- **Commits**: Conventional Commits en espa&ntilde;ol

---

## Licencia

Proyecto acad&eacute;mico &mdash; Uso educativo.
