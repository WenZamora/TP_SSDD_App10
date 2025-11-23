# 💰 Administrador de Gastos Compartidos

**Sistema de gestión de gastos compartidos entre múltiples personas con soporte multi-moneda, cálculo automático de balances y estadísticas.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.90.10-red)](https://tanstack.com/query)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.5.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Table of Contents

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [API](#-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Core Features

- 👥 **Gestión de Contactos**: Agrega, edita y elimina contactos con validación de email
- 🏷️ **Gestión de Grupos**: Organiza contactos en grupos para facilitar el manejo de gastos
- 💸 **Gestión de Gastos**: Registra gastos con división automática entre participantes
- 💱 **Multi-Moneda**: Soporte para múltiples monedas con conversión automática (API en vivo)
- ⚖️ **Cálculo de Balances**: Calcula automáticamente quién debe a quién
- 🔄 **Sugerencias de Liquidación**: Minimiza el número de transacciones necesarias
- 📊 **Estadísticas**: Visualiza gastos por persona, categoría, y mes

### Technical Features

- 🚀 **Server-Side Rendering**: Next.js App Router para máxima performance
- 🔄 **Optimistic Updates**: UI instantánea con TanStack Query
- 💾 **Auto-Save**: Persistencia automática en JSON
- 🎨 **UI Moderna**: shadcn/ui + Tailwind CSS
- 📱 **Responsive**: Funciona en desktop, tablet y móvil
- 🔍 **Type-Safe**: TypeScript en toda la aplicación
- 🧩 **Componentizado**: Arquitectura modular y reutilizable
- ⚡ **Fast**: Carga inicial < 2s, respuestas de API < 200ms

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas** para máxima separación de responsabilidades:

```
┌─────────────────────────────────────────┐
│           UI Layer (React)              │
│  Components, Pages, Client Interactions │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Hooks Layer (TanStack Query)     │
│   useGroups, useContacts, useExpenses   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Services Layer (HTTP Clients)      │
│    groupsService, contactsService, etc  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        API Layer (Next.js Routes)       │
│     /api/groups, /api/contacts, etc     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         DB Layer (Business Logic)       │
│   groups.js, contacts.js, balance.js    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Persistence (JSON Database)       │
│              src/app/data/db.json               │
└─────────────────────────────────────────┘
```

### Capas

#### 1. UI Layer (`src/app/components/`)
- Componentes React
- Manejo de interacción del usuario
- Presentación de datos

#### 2. Hooks Layer (`src/app/hooks/`)
- Custom hooks con TanStack Query
- Gestión de estado del cliente
- Caché y sincronización con servidor

#### 3. Services Layer (`src/app/services/`)
- Cliente HTTP (fetch)
- Serialización/deserialización
- Manejo de errores

#### 4. API Layer (`src/app/api/`)
- Next.js Route Handlers
- Validación de requests
- Respuestas HTTP

#### 5. DB Layer (`src/app/lib/`)
- Lógica de negocio
- Validaciones
- Operaciones de base de datos

#### 6. Persistence
- JSON file (`src/app/data/db.json`)
- Atomic writes
- Backup automático

---

## 🚀 Instalación

### Prerequisites

- **Node.js**: v18.x o superior
- **npm**: v9.x o superior
- **Git**: Para clonar el repositorio

### Steps

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd TP_SSDD_App10
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Inicializar base de datos**

```bash
# La base de datos se crea automáticamente al iniciar
# O puedes crearla manualmente:
mkdir -p data
echo '{"groups":[],"contacts":[],"currentUser":null}' > src/app/data/db.json
```

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

5. **Abrir en navegador**

```
http://localhost:3000
```

---

## 📱 Uso

### 1. Crear Contactos

1. Ve a la página de **Contactos**
2. Ingresa un email en el campo de texto
3. Click **"Agregar"**
4. El contacto aparecerá en la lista

### 2. Crear Grupo

1. Ve a la página de **Grupos**
2. Click **"Crear Nuevo Grupo"**
3. Ingresa un nombre
4. Click **"Crear Grupo"**

### 3. Añadir Miembros al Grupo

1. En la tarjeta del grupo, click **"Añadir Miembros"**
2. Selecciona contactos de la lista
3. Click **"Añadir (X)"**

### 4. Registrar Gasto

**Vía API** (UI en desarrollo):

```bash
curl -X POST http://localhost:3000/api/groups/{groupId}/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cena en restaurante",
    "amount": 15000,
    "currency": "ARS",
    "category": "Comida",
    "payer": "{contactId}",
    "participants": ["{contactId1}", "{contactId2}"],
    "date": 1700000000000
  }'
```

### 5. Ver Balances

```bash
curl http://localhost:3000/api/groups/{groupId}/balance
```

Respuesta:
```json
{
  "balances": [
    {
      "memberId": "123",
      "memberName": "Juan Pérez",
      "totalPaid": 15000,
      "totalShare": 7500,
      "balance": 7500
    }
  ],
  "settlements": [
    {
      "from": "456",
      "fromName": "María García",
      "to": "123",
      "toName": "Juan Pérez",
      "amount": 7500
    }
  ]
}
```

### 6. Ver Estadísticas

```bash
# Por persona
curl "http://localhost:3000/api/groups/{groupId}/statistics?type=person"

# Por categoría
curl "http://localhost:3000/api/groups/{groupId}/statistics?type=category"

# Por mes
curl "http://localhost:3000/api/groups/{groupId}/statistics?type=month"

# Total
curl "http://localhost:3000/api/groups/{groupId}/statistics?type=total"
```

---

## 🔌 API

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts` | Get all contacts |
| GET | `/contacts/:id` | Get contact by ID |
| POST | `/contacts` | Create contact |
| PUT | `/contacts/:id` | Update contact |
| DELETE | `/contacts/:id` | Delete contact |

#### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups` | Get all groups |
| GET | `/groups/:id` | Get group by ID |
| POST | `/groups` | Create group |
| PUT | `/groups/:id` | Update group |
| DELETE | `/groups/:id` | Delete group |

#### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups/:id/expenses` | Get all expenses for group |
| POST | `/groups/:id/expenses` | Add expense to group |
| PUT | `/groups/:id/expenses/:expenseId` | Update expense |
| DELETE | `/groups/:id/expenses/:expenseId` | Delete expense |

#### Balance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups/:id/balance` | Get balances and settlements |

#### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/groups/:id/statistics?type=person` | Expenses by person |
| GET | `/groups/:id/statistics?type=category` | Expenses by category |
| GET | `/groups/:id/statistics?type=month` | Expenses by month |
| GET | `/groups/:id/statistics?type=total` | Total expenses |

#### Exchange Rates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchange?from=USD&to=ARS` | Get exchange rate |

### Example Requests

**Create Group**:
```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Viaje a Bariloche",
    "baseCurrency": "ARS",
    "members": ["contact-id-1", "contact-id-2"]
  }'
```

**Add Expense**:
```bash
curl -X POST http://localhost:3000/api/groups/group-id-123/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Hotel",
    "amount": 100,
    "currency": "USD",
    "category": "Alojamiento",
    "payer": "contact-id-1",
    "participants": ["contact-id-1", "contact-id-2"],
    "date": 1700000000000
  }'
```

**Get Balance**:
```bash
curl http://localhost:3000/api/groups/group-id-123/balance
```

---

## 📁 Estructura del Proyecto

```
TP_SSDD_App10/
├── public/                    # Static assets
│   └── images/
├── src/
│   └── app/
│       ├── api/               # API routes (Next.js)
│       │   ├── contacts/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       └── route.ts
│       │   ├── groups/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       ├── expenses/
│       │   │       ├── balance/
│       │   │       └── statistics/
│       │   └── exchange/
│       │       └── route.ts
│       ├── components/        # React components
│       │   ├── ui/           # shadcn/ui components
│       │   ├── contacts-management.tsx
│       │   ├── groups-management.tsx
│       │   └── ...
│       ├── hooks/             # Custom hooks
│       │   ├── useContacts.ts
│       │   ├── useGroups.ts
│       │   ├── useExpenses.ts
│       │   └── useBalance.ts
│       ├── services/          # HTTP clients
│       │   ├── contacts.service.ts
│       │   ├── groups.service.ts
│       │   └── exchange.service.ts
│       ├── lib/               # Business logic
│       │   ├── db.js
│       │   ├── contacts.js
│       │   ├── groups.js
│       │   ├── balance.js
│       │   ├── statistics.js
│       │   └── exchange.js
│       ├── data/              # JSON database
│       │   └── db.json
│       ├── types/             # TypeScript types
│       │   └── index.ts
│       ├── providers/         # React providers
│       │   └── query-provider.tsx
│       ├── layout.tsx         # Root layout
│       ├── page.tsx           # Home page
│       └── globals.css
├── .specs/                    # Documentation and specifications
│   ├── spec.md               # Technical specification
│   ├── tasks.md              # Task checklist
│   ├── REFACTORING_GUIDE.md  # Component refactoring guide
│   ├── TESTING_GUIDE.md      # Manual testing guide
│   ├── PHASE_*.md            # Phase completion summaries
│   └── ...                   # Other documentation
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Tecnologías

### Frontend

- **[Next.js 15](https://nextjs.org/)**: React framework con App Router
- **[React 19](https://reactjs.org/)**: UI library
- **[TypeScript 5](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[TanStack Query 5](https://tanstack.com/query)**: Server state management
- **[React Hook Form](https://react-hook-form.com/)**: Form handling
- **[Zod](https://zod.dev/)**: Schema validation
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)**: Component library
- **[Recharts](https://recharts.org/)**: Charts library
- **[Lucide React](https://lucide.dev/)**: Icon library
- **[Sonner](https://sonner.emilkowal.ski/)**: Toast notifications

### Backend

- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)**: REST API
- **[Node.js](https://nodejs.org/)**: JavaScript runtime
- **JSON File Storage**: Lightweight persistence

### Development

- **[ESLint](https://eslint.org/)**: Code linting
- **[Prettier](https://prettier.io/)**: Code formatting (configured via ESLint)

---

## 💻 Desarrollo

### Available Scripts

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Development Workflow

1. **Create a new branch** for your feature
2. **Make changes** following the architecture
3. **Test manually** using `.specs/TESTING_GUIDE.md`
4. **Run linter**: `npm run lint`
5. **Type check**: `npx tsc --noEmit`
6. **Commit** with descriptive message
7. **Push** and create pull request

### Adding a New Feature

Follow the layer-by-layer approach:

1. **Add types** in `src/app/types/index.ts`
2. **Create DB functions** in `src/app/lib/`
3. **Create API routes** in `src/app/api/`
4. **Create service** in `src/app/services/`
5. **Create hooks** in `src/app/hooks/`
6. **Create UI components** in `src/app/components/`

See `.specs/REFACTORING_GUIDE.md` for patterns and examples.

### Code Style

- **TypeScript** for all new files
- **Functional components** with hooks
- **Named exports** preferred over default exports
- **JSDoc comments** for all public functions
- **Tailwind CSS** for styling (no custom CSS)
- **shadcn/ui** components for UI primitives

---

## 🧪 Testing

### Manual Testing

Follow the comprehensive guide in `.specs/TESTING_GUIDE.md`:

```bash
# Quick test all features
npm run dev

# Then open:
# - http://localhost:3000 (UI)
# - http://localhost:3000/api/contacts (API)
```

### API Testing

Use the provided test script:

```bash
chmod +x test-api.sh
./test-api.sh
```

Or manually with curl/Postman:

```bash
# Test contacts endpoint
curl http://localhost:3000/api/contacts

# Test groups endpoint
curl http://localhost:3000/api/groups

# Test balance calculation
curl http://localhost:3000/api/groups/{groupId}/balance
```

### Test Coverage

Current test coverage:

- ✅ API endpoints: Manual testing
- ✅ UI components: Manual testing
- ⏳ Unit tests: Not implemented yet
- ⏳ Integration tests: Not implemented yet
- ⏳ E2E tests: Not implemented yet

---

## 📚 Documentación

### Available Docs

- **[spec.md](./.specs/spec.md)**: Complete technical specification
- **[tasks.md](./.specs/tasks.md)**: Task checklist and progress tracking
- **[REFACTORING_GUIDE.md](./.specs/REFACTORING_GUIDE.md)**: Component refactoring patterns
- **[TESTING_GUIDE.md](./.specs/TESTING_GUIDE.md)**: Manual testing guide
- **[PHASE_6_SUMMARY.md](./.specs/PHASE_6_SUMMARY.md)**: Phase 6 completion summary
- **[README.md](./README.md)**: This file

### API Documentation

See [API section](#-api) above or explore:

```bash
# List all routes
find src/app/api -name "route.ts" -type f
```

### Architecture Documentation

See `.specs/spec.md` for complete architecture details including:
- Data models
- Layer responsibilities
- Best practices
- Implementation checklist

---

## 🤝 Contribuir

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Pull Request Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and well-described

### Reporting Issues

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/OS version
- Console errors

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Sistema de Gastos Compartidos** - Trabajo Práctico SSDD

---

## 🙏 Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [TanStack Query](https://tanstack.com/query) for the powerful data fetching
- [Next.js](https://nextjs.org/) for the excellent framework
- [exchangerate.host](https://exchangerate.host/) for the free currency API

---

## 📞 Soporte

For support, please open an issue in the GitHub repository.

---

## 🔮 Roadmap

### Completed ✅
- [x] Contacts management
- [x] Groups management
- [x] Expense tracking
- [x] Balance calculation
- [x] Currency conversion
- [x] Statistics
- [x] REST API
- [x] TanStack Query integration
- [x] Loading/error states
- [x] Toast notifications

### In Progress 🚧
- [ ] Complete expense UI components
- [ ] User authentication
- [ ] Activity/event management

### Planned 📋
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Real-time updates (WebSockets)
- [ ] Export to PDF/Excel
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multiple currencies per expense
- [ ] Custom split ratios
- [ ] Receipt image upload
- [ ] Budget limits and alerts
- [ ] Dark mode
- [ ] Internationalization (i18n)

---

**Made with ❤️ for managing shared expenses**
