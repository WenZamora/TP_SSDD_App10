Repository: juancruzmateos/sistemas-distribuidos-practica
Branch: actividad8
Files analyzed: 46

Estimated tokens: 27.7k

Directory structure:
└── juancruzmateos-sistemas-distribuidos-practica/
    ├── README.md
    ├── database.json
    ├── docker-compose.yml
    ├── DOCKER.md
    ├── Dockerfile
    ├── eslint.config.mjs
    ├── next.config.js
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── tsconfig.json
    ├── .dockerignore
    └── src/
        └── app/
            ├── error.tsx
            ├── globals.css
            ├── layout.tsx
            ├── not-found.tsx
            ├── page.tsx
            ├── api/
            │   ├── README.md
            │   ├── favorites/
            │   │   ├── route.ts
            │   │   └── [id]/
            │   │       └── route.ts
            │   └── pokemon/
            │       └── [id]/
            │           └── route.ts
            ├── components/
            │   ├── README.md
            │   ├── PokemonFavouriteForm.tsx
            │   ├── PokemonFavouriteModal.tsx
            │   ├── PokemonItem.tsx
            │   ├── PokemonList.tsx
            │   ├── PokemonPagination.tsx
            │   └── PokemonSkeleton.tsx
            ├── favorites/
            │   └── page.tsx
            ├── hooks/
            │   ├── README.md
            │   ├── useFavorites.ts
            │   └── usePokemonList.ts
            ├── lib/
            │   └── database.ts
            ├── pokemon/
            │   ├── README.md
            │   └── [id]/
            │       ├── README.md
            │       ├── loading.tsx
            │       ├── not-found.tsx
            │       └── page.tsx
            ├── providers/
            │   ├── README.md
            │   └── QueryProvider.tsx
            ├── services/
            │   ├── README.md
            │   ├── favorites.service.ts
            │   └── pokemon.service.ts
            └── types/
                ├── README.md
                ├── favorite.ts
                └── pokemon.ts


================================================
FILE: README.md
================================================
# ¿Cómo funcionan los formularios en HTML?

Un formulario HTML es una estructura que permite al usuario ingresar datos y enviarlos a un servidor. En su forma más básica, un formulario tiene:

- Campos de entrada (`<input>`, `<textarea>`, `<select>`) donde el usuario escribe o selecciona información.
- Etiquetas (`<label>`) que describen cada campo.
- Un botón de envío (`<button type="submit">`) que dispara el envío del formulario.
- Una acción (atributo `action`) que indica a dónde enviar los datos.
- Un método (atributo `method`) que indica cómo enviarlos (GET o POST).

## Ejemplo básico en HTML

```html
<form action="/api/usuarios" method="POST">
  <label for="nombre">Nombre:</label>
  <input type="text" id="nombre" name="nombre" required />
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required />
  
  <button type="submit">Enviar</button>
</form>
```

Cuando el usuario hace clic en "Enviar", el navegador:

- Recopila todos los valores de los campos.
- Los envía a la URL especificada en `action`.
- Recarga la página con la respuesta del servidor.

**El problema:** Este comportamiento tradicional recarga toda la página, lo cual no es ideal para aplicaciones modernas donde queremos mantener el estado y ofrecer una experiencia más fluida.

## Formularios en React: El enfoque "Controlled Components"

En React, manejamos los formularios de manera diferente. En lugar de dejar que el navegador maneje el estado de los campos, nosotros controlamos ese estado usando `useState`.

```tsx
"use client";

import { useState } from "react";

export default function FormularioBasico() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita la recarga de la página
    console.log({ nombre, email });
    // Aquí enviaríamos los datos a una API
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre:
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Ventajas de este enfoque

- Tenemos control total sobre los valores en todo momento.
- Podemos validar en tiempo real mientras el usuario escribe.
- No hay recarga de página.
- Podemos manipular los datos antes de enviarlos.

### Desventajas

- Mucho código repetitivo (`useState`, `onChange` para cada campo).
- Validaciones manuales que pueden volverse complejas.
- Difícil de mantener cuando hay muchos campos.

## Librerías para facilitar el manejo de formularios

Para resolver los problemas del enfoque manual, existen varias librerías especializadas:

### 1. Formik

La librería más popular y madura para formularios en React. Simplifica el manejo de estado, validaciones y envío de datos.

**Ventajas:**

- API simple y clara.
- Excelente integración con librerías de validación como Yup.
- Maneja errores automáticamente.
- Reduce significativamente el código boilerplate.
- Muy bien documentada y con gran comunidad.

### 2. React Hook Form

Una alternativa moderna y performante que utiliza refs en lugar de re-renders.

**Ventajas:**

- Muy rápida (menos re-renders).
- API basada en hooks.
- Menos código que Formik.

**Desventajas:**

- Curva de aprendizaje un poco más pronunciada.
- Menos intuitiva para validaciones complejas.

### 3. React Final Form

Similar a Formik pero con un enfoque más modular.

Entre otros.

## ¿Por qué elegir Formik + Yup?

Para este curso, vamos a usar Formik + Yup por las siguientes razones:

- Formik es intuitivo y fácil de aprender para principiantes.
- Yup permite definir validaciones de forma declarativa y legible.
- La integración entre ambas es perfecta y está muy bien documentada.
- Es el estándar de la industria, lo encontrarán en muchos proyectos reales.
- La sintaxis es muy similar al enfoque manual, facilitando la transición.

## Validaciones con Yup

Yup es una librería de validación de esquemas que nos permite definir reglas de validación de forma clara y reutilizable.

### Instalación

```bash
npm install yup
```

### Ejemplo básico de esquema

En un archivo aparte, por ejemplo dentro de `/validations/users.ts`:

```typescript
import * as Yup from "yup";

const usuarioSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .required("El nombre es obligatorio"),
  
  email: Yup.string()
    .email("Debe ser un email válido")
    .required("El email es obligatorio"),
  
  edad: Yup.number()
    .min(18, "Debes ser mayor de edad")
    .max(100, "Edad inválida")
    .required("La edad es obligatoria"),
  
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[0-9]/, "Debe contener al menos un número")
    .required("La contraseña es obligatoria"),
  
  confirmarPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Debes confirmar la contraseña"),
  
  terminos: Yup.boolean()
    .oneOf([true], "Debes aceptar los términos y condiciones")
    .required(),
});
```

### Yup ofrece muchos tipos y validaciones

- **String:** `min()`, `max()`, `email()`, `url()`, `matches()` (regex)
- **Number:** `min()`, `max()`, `positive()`, `integer()`
- **Boolean:** `oneOf()`
- **Date:** `min()`, `max()`
- **Array:** `min()`, `max()`, `of()` (tipo de elementos)
- **Object:** `shape()` (estructura del objeto)

También soporta validaciones personalizadas con `.test()`.

## Formularios con Formik + Yup

### Instalación

```bash
npm install formik yup
```

### Ejemplo completo: Formulario de registro

```tsx
"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// 1. Definir el esquema de validación
const registroSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Requerido"),
  email: Yup.string()
    .email("Email inválido")
    .required("Requerido"),
  edad: Yup.number()
    .min(18, "Debes ser mayor de edad")
    .required("Requerido"),
  password: Yup.string()
    .min(8, "Mínimo 8 caracteres")
    .required("Requerido"),
});

// 2. Definir el tipo de los valores del formulario
interface FormValues {
  nombre: string;
  email: string;
  edad: number | "";
  password: string;
}

export default function FormularioRegistro() {
  // 3. Valores iniciales
  const initialValues: FormValues = {
    nombre: "",
    email: "",
    edad: "",
    password: "",
  };

  // 4. Función que se ejecuta al enviar
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      // Aquí enviaríamos los datos a nuestra API
    } catch (error) {
      alert("Error al registrar usuario");
    } finally {
      setSubmitting(false); // Desactiva el estado de "enviando"
    }
  };

  return (
    <div>
      <h1>Registro de Usuario</h1>
      
      <Formik
        initialValues={initialValues}
        validationSchema={registroSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <div>
              <label htmlFor="nombre">Nombre</label>
              <Field
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Tu nombre"
              />
              <ErrorMessage name="nombre" component="div" className="error" />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                placeholder="tu@email.com"
              />
              <ErrorMessage name="email" component="div" className="error" />
            </div>

            <div>
              <label htmlFor="edad">Edad</label>
              <Field
                type="number"
                id="edad"
                name="edad"
                placeholder="18"
              />
              <ErrorMessage name="edad" component="div" className="error" />
            </div>

            <div>
              <label htmlFor="password">Contraseña</label>
              <Field
                type="password"
                id="password"
                name="password"
                placeholder="********"
              />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
```

### Componentes clave de Formik

- **`<Formik>`:** El contenedor principal. Recibe `initialValues`, `validationSchema` y `onSubmit`.
- **`<Form>`:** Reemplaza al `<form>` nativo y maneja automáticamente el `onSubmit`.
- **`<Field>`:** Un campo de entrada que se conecta automáticamente al estado de Formik.
- **`<ErrorMessage>`:** Muestra el mensaje de error del campo especificado.

### Props útiles del render prop de Formik

```tsx
{({ 
  values,        // Valores actuales del formulario
  errors,        // Errores de validación
  touched,       // Campos que el usuario ha tocado
  isSubmitting,  // Si el formulario se está enviando
  isValid,       // Si el formulario es válido
  setFieldValue, // Función para cambiar un valor manualmente
  resetForm,     // Función para resetear el formulario
}) => (
  <Form>
    {/* ... */}
  </Form>
)}
```

## Formularios en Next.js: Client vs Server

Hasta ahora, lo que vimos de Formik + Yup es aplicable para React, pero Next.js ofrece dos enfoques para manejar formularios, dependiendo de dónde queremos que se procese la lógica.

### 1. Formularios del lado del cliente (Client-side)

Este es el enfoque que hemos visto hasta ahora. El formulario se renderiza en el navegador y usa JavaScript para manejar el envío.

**Cuándo usarlo:**

- Cuando necesitas validaciones en tiempo real.
- Para formularios con lógica compleja del lado del cliente.
- Cuando el formulario es parte de una interfaz altamente interactiva.

**Ejemplo básico:**

```tsx
"use client";

import { useState } from "react";

export default function FormularioCliente() {
  const [resultado, setResultado] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const response = await fetch("/api/contacto", {
      method: "POST",
      body: JSON.stringify({
        nombre: formData.get("nombre"),
        mensaje: formData.get("mensaje"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setResultado(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="nombre" required />
      <textarea name="mensaje" required />
      <button type="submit">Enviar</button>
      {resultado && <p>{resultado}</p>}
    </form>
  );
}
```

### 2. Formularios del lado del servidor (Server-side) con Server Actions

Next.js 14+ introduce Server Actions, que permiten ejecutar código del servidor directamente desde un formulario sin necesidad de crear una API Route.

**Cuándo usarlo:**

- Para formularios simples sin mucha interactividad.
- Cuando queremos mejor SEO (el formulario funciona sin JavaScript).
- Para reducir el JavaScript enviado al cliente.
- Cuando trabajamos principalmente con Server Components.

**Ejemplo con Server Actions:**

```typescript
// app/actions/contacto.ts
"use server";

import { db } from "@/app/lib/database";

export async function enviarContacto(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const mensaje = formData.get("mensaje") as string;

  // Validaciones básicas
  if (!nombre || !email || !mensaje) {
    return { success: false, error: "Todos los campos son obligatorios" };
  }

  if (!email.includes("@")) {
    return { success: false, error: "Email inválido" };
  }

  try {
    // Guardar en la base de datos
    await db.create({
      nombre,
      email,
      mensaje,
      fecha: new Date().toISOString(),
    });

    return { success: true, message: "Mensaje enviado correctamente" };
  } catch (error) {
    return { success: false, error: "Error al enviar el mensaje" };
  }
}
```

```tsx
// app/contacto/page.tsx
import { enviarContacto } from "@/app/actions/contacto";

export default function FormularioServidor() {
  return (
    <form action={enviarContacto}>
      <div>
        <label htmlFor="nombre">Nombre</label>
        <input type="text" id="nombre" name="nombre" required />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />
      </div>

      <div>
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" required />
      </div>

      <button type="submit">Enviar</button>
    </form>
  );
}
```

### Server Actions con useFormState (para mostrar errores)

Para tener feedback visual en un Server Action, usamos el hook `useFormState`:

```typescript
// app/actions/contacto.ts
"use server";

export async function enviarContacto(prevState: any, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;

  if (!nombre || nombre.length < 2) {
    return { success: false, error: "El nombre debe tener al menos 2 caracteres" };
  }

  if (!email.includes("@")) {
    return { success: false, error: "Email inválido" };
  }

  // Guardar...
  
  return { success: true, message: "¡Mensaje enviado!" };
}
```

```tsx
// app/contacto/page.tsx
"use client";

import { useFormState } from "react-dom";
import { enviarContacto } from "@/app/actions/contacto";

export default function FormularioConEstado() {
  const [state, formAction] = useFormState(enviarContacto, null);

  return (
    <form action={formAction}>
      <input type="text" name="nombre" required />
      <input type="email" name="email" required />
      <button type="submit">Enviar</button>
      
      {state?.success && <p style={{ color: "green" }}>{state.message}</p>}
      {state?.error && <p style={{ color: "red" }}>{state.error}</p>}
    </form>
  );
}
```

### Validaciones en Server Actions con Zod

Para validaciones más robustas en Server Actions, podemos usar Zod (similar a Yup pero optimizado para TypeScript):

```bash
npm install zod
```

```typescript
// app/actions/contacto.ts
"use server";

import { z } from "zod";

const contactoSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

export async function enviarContacto(prevState: any, formData: FormData) {
  // Parsear y validar
  const validacion = contactoSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    mensaje: formData.get("mensaje"),
  });

  if (!validacion.success) {
    return {
      success: false,
      errors: validacion.error.flatten().fieldErrors,
    };
  }

  // Si es válido, usar los datos
  const { nombre, email, mensaje } = validacion.data;

  // Guardar en DB...
  
  return { success: true, message: "Mensaje enviado" };
}
```

## Comparación: Client-side vs Server-side

| Aspecto | Client-side (Formik + Yup) | Server-side (Server Actions) |
|---------|---------------------------|------------------------------|
| **JavaScript** | Mucho JS en el cliente | Mínimo JS en el cliente |
| **Validaciones en tiempo real** | Sí | No (solo al enviar) |
| **SEO** | Requiere JS habilitado | Funciona sin JS |
| **Complejidad** | Más código en el frontend | Menos código, más simple |
| **Use case ideal** | Formularios complejos e interactivos | Formularios simples y estáticos |
| **Performance** | Más re-renders | Menos carga en el cliente |

### Recomendación

- Usar **Formik + Yup** para formularios complejos con mucha interactividad.
- Usar **Server Actions** para formularios simples donde la progresividad es importante.

## Ejercicio propuesto

Modificar el ejercicio de la actividad anterior, para ahora al momento de agregar a favoritos los Pokemons, poder ponerle un nombre y una descripcion al item favorito, a traves de un formulario que aparecera dentro de un modal (usar una libreria a eleccion para esto). Hacer validaciones razonables para cada campo, y mostrar errores en los campos si lo hubiera, que impidan el submit del formulario (puede utilizar las flags `dirty` y `isValid`).

---

## Librerías Utilizadas

Esta sección documenta las principales librerías utilizadas en el proyecto y su propósito específico.

### Framework y Core

#### **Next.js** (`next@15.5.4`)
- **Propósito:** Framework de React para aplicaciones web con renderizado del lado del servidor (SSR), generación de sitios estáticos (SSG) y rutas API.
- **Uso en el proyecto:**
  - Estructura de carpetas con App Router
  - API Routes para endpoints backend (`/api/favorites`, `/api/pokemon`)
  - Server Components y Client Components
  - Enrutamiento automático basado en archivos
  - Optimización de imágenes con `next/image`

#### **React** (`react@18.3.1`)
- **Propósito:** Librería para construir interfaces de usuario interactivas.
- **Uso en el proyecto:**
  - Componentes funcionales con hooks
  - Estado local con `useState`
  - Efectos con `useEffect`
  - Memoización con `useMemo`
  - Context API para estado global

#### **TypeScript** (`typescript@5`)
- **Propósito:** Superset de JavaScript que añade tipado estático.
- **Uso en el proyecto:**
  - Definición de tipos e interfaces (`Pokemon`, `Favorite`, etc.)
  - Autocompletado y detección de errores en tiempo de desarrollo
  - Mejor mantenibilidad del código

### Gestión de Estado y Datos

#### **TanStack Query** (`@tanstack/react-query@5.90.5`)
- **Propósito:** Librería para gestión de estado asíncrono, caché y sincronización de datos del servidor.
- **Uso en el proyecto:**
  - `useQuery` para obtener listas de Pokémon y favoritos
  - `useMutation` para agregar/eliminar favoritos
  - Invalidación automática de caché después de mutaciones
  - Estados de loading, error y success
  - Reintento automático de peticiones fallidas
  - **Archivos:** `src/app/hooks/usePokemonList.ts`, `src/app/hooks/useFavorites.ts`

### Formularios y Validación

#### **Formik** (`formik@2.4.8`)
- **Propósito:** Librería para manejo de formularios en React.
- **Uso en el proyecto:**
  - Componente `<Formik>` para el contexto del formulario
  - `<Form>` para manejo automático de `onSubmit`
  - `<Field>` para campos de entrada controlados
  - `<ErrorMessage>` para mostrar errores de validación
  - Manejo de estados: `isSubmitting`, `isValid`, `dirty`, `errors`
  - **Archivos:** `src/app/components/PokemonFavouriteForm.tsx`

#### **Yup** (`yup@1.7.1`)
- **Propósito:** Librería de validación de esquemas para JavaScript.
- **Uso en el proyecto:**
  - Validación de formularios con esquemas declarativos
  - Reglas de validación: `min()`, `max()`, `required()`, `email()`, etc.
  - Mensajes de error personalizados
  - Integración perfecta con Formik
  - **Archivos:** `src/app/components/PokemonFavouriteForm.tsx`

### Componentes UI

#### **Radix UI Dialog** (`@radix-ui/react-dialog@1.1.15`)
- **Propósito:** Componente de modal/diálogo accesible y sin estilos.
- **Uso en el proyecto:**
  - `Dialog.Root` para el contexto del modal
  - `Dialog.Trigger` para el botón que abre el modal
  - `Dialog.Portal` para renderizar fuera del DOM padre
  - `Dialog.Overlay` para el fondo oscuro
  - `Dialog.Content` para el contenido del modal
  - Accesibilidad nativa (manejo de foco, ESC para cerrar, etc.)
  - **Archivos:** `src/app/components/PokemonFavouriteModal.tsx`

#### **React Loading Skeleton** (`react-loading-skeleton@3.5.0`)
- **Propósito:** Componente de skeleton screens para estados de carga.
- **Uso en el proyecto:**
  - Mostrar placeholders mientras se cargan los datos
  - Mejorar la percepción de rendimiento
  - **Archivos:** `src/app/components/PokemonSkeleton.tsx`

### Estilos

#### **Tailwind CSS** (`tailwindcss@4`)
- **Propósito:** Framework de CSS utility-first para diseño rápido y consistente.
- **Uso en el proyecto:**
  - Clases utilitarias para estilos: `flex`, `grid`, `p-4`, `text-center`, etc.
  - Sistema de colores personalizado
  - Responsive design con prefijos: `sm:`, `md:`, `lg:`
  - Estados: `hover:`, `focus:`, `disabled:`
  - **Archivos:** Todos los componentes utilizan clases de Tailwind

### HTTP y Comunicación

#### **Axios** (`axios@1.12.2`)
- **Propósito:** Cliente HTTP basado en promesas para navegador y Node.js.
- **Uso en el proyecto:**
  - Alternativa a `fetch` con mejor API
  - Interceptores de peticiones y respuestas
  - Transformación automática de datos
  - **Archivos:** `src/app/services/pokemonService.ts`, `src/app/services/favorites.service.ts`

### Desarrollo

#### **ESLint** (`eslint@9`)
- **Propósito:** Linter para identificar y reportar patrones problemáticos en código JavaScript/TypeScript.
- **Uso en el proyecto:**
  - Mantener consistencia en el código
  - Detectar errores potenciales
  - Configuración con `eslint-config-next`

### Estructura de Capas

```
UI Components (React)
    ↓
Custom Hooks (TanStack Query)
    ↓
Services (Axios)
    ↓
API Routes (Next.js)
    ↓
Database (JSON File)
```

### Instalación de Dependencias

Para instalar todas las dependencias del proyecto:

```bash
npm install
```

### Scripts Disponibles

```bash
# Desarrollo con Turbopack
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Ejecutar linter
npm run lint
```

## Docker

El proyecto incluye configuración de Docker para facilitar el despliegue y ejecución en contenedores.

### Requisitos

- Docker instalado en tu máquina
- Docker Compose instalado (generalmente viene con Docker Desktop)

### Ejecución con Docker

```bash
# Construir y ejecutar el contenedor
docker-compose up --build

# Ejecutar en segundo plano (detached)
docker-compose up -d --build

# Detener el contenedor
docker-compose down

# Ver logs
docker-compose logs -f
```

La aplicación estará disponible en `http://localhost:3000`

### Características del Setup Docker

- **Base Image:** Node 20 Alpine (imagen ligera y segura)
- **Puerto:** 3000
- **Volumen:** `database.json` montado para persistencia de datos
- **Seguridad:** Parches de seguridad aplicados con `apk upgrade`
- **Build optimizado:** Caché de dependencias para builds más rápidos

### Comandos Docker Adicionales

```bash
# Reconstruir sin caché
docker-compose build --no-cache

# Ver contenedores en ejecución
docker ps

# Acceder al shell del contenedor
docker-compose exec app sh

# Eliminar contenedores y volúmenes
docker-compose down -v
```

Para más información detallada sobre Docker, consulta el archivo `DOCKER.md`.



================================================
FILE: database.json
================================================
[]


================================================
FILE: docker-compose.yml
================================================
services:
  pokemon-app:
    container_name: pokemon-app
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./database.json:/app/database.json
    restart: unless-stopped



================================================
FILE: DOCKER.md
================================================
# Docker Setup Guide

Esta guía explica cómo ejecutar tu aplicación Next.js usando Docker con un Dockerfile y docker-compose simplificados.

## Requisitos

- Docker instalado en tu máquina
- Docker Compose instalado (generalmente viene con Docker Desktop)

## Inicio Rápido

```bash
# Construir y ejecutar el contenedor
docker-compose up --build

# O ejecutar en segundo plano (detached)
docker-compose up -d --build

# Detener el contenedor
docker-compose down
```

La aplicación estará disponible en `http://localhost:3000`

## Arquitectura Docker

### Dockerfile

El proyecto usa una imagen Node 20 Alpine (ligera y segura) con las siguientes características:

- **Base Image:** `node:20-alpine3.20`
- **Parches de seguridad:** `apk update && apk upgrade` aplicados
- **Dependencias:** Instaladas con `npm ci` para reproducibilidad
- **Build:** Next.js optimizado con standalone output
- **Puerto:** 3000

### docker-compose.yml

Configuración simple con:
- Puerto 3000 mapeado al host
- Volumen para persistir `database.json`
- Reinicio automático del contenedor

## Comandos de Docker

### Usando Docker Compose (Recomendado)

```bash
# Iniciar la aplicación
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir sin caché
docker-compose build --no-cache

# Ver estado de contenedores
docker-compose ps
```

### Comandos Docker Directos

```bash
# Construir la imagen
docker build -t mi-proyecto .

# Ejecutar el contenedor
docker run -p 3000:3000 -v $(pwd)/database.json:/app/database.json mi-proyecto

# Listar contenedores en ejecución
docker ps

# Ver logs de un contenedor
docker logs <container_id>

# Detener un contenedor
docker stop <container_id>
```

## Gestión de Contenedores

```bash
# Listar todos los contenedores (incluyendo detenidos)
docker ps -a

# Eliminar un contenedor
docker rm <container_id>

# Eliminar la imagen
docker rmi mi-proyecto

# Acceder al shell del contenedor
docker-compose exec app sh

# Ejecutar comandos dentro del contenedor
docker-compose exec app npm run lint
```

## Solución de Problemas

### Puerto 3000 Ya Está en Uso

Si el puerto 3000 ya está ocupado, modifica `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Cambia 3001 por el puerto que prefieras
```

### Base de Datos No Persiste

Asegúrate de que el archivo `database.json` existe antes de ejecutar:

```bash
touch database.json
echo "{}" > database.json
```

### Problemas con node_modules

Si encuentras problemas con node_modules, reconstruye sin caché:

```bash
docker-compose build --no-cache
```

### Problemas de Permisos (Linux)

En Linux, podrías necesitar ajustar los permisos:

```bash
sudo chown -R $USER:$USER database.json
```

### Ver Logs Detallados

Para debugging, ver los logs completos:

```bash
docker-compose logs -f --tail=100
```

## Variables de Entorno

Puedes agregar variables de entorno en `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api.example.com
      - DATABASE_PATH=/app/database.json
```

O crear un archivo `.env`:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://api.example.com
```

Y referenciarlo en docker-compose.yml:

```yaml
services:
  app:
    env_file:
      - .env
```

## Optimización y Rendimiento

### Usar BuildKit

Habilita Docker BuildKit para builds más rápidos:

```bash
DOCKER_BUILDKIT=1 docker build -t mi-proyecto .
```

### Caché de Capas

El Dockerfile está optimizado para aprovechar el caché:
1. Las dependencias se instalan primero (cambian poco)
2. El código fuente se copia después (cambia frecuentemente)

### Limpieza Regular

Limpia recursos no utilizados regularmente:

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Limpieza completa (cuidado!)
docker system prune -a

# Eliminar volúmenes sin usar
docker volume prune
```

## Despliegue

### Subir a Docker Registry

```bash
# Construir la imagen
docker build -t mi-proyecto .

# Tag la imagen
docker tag mi-proyecto:latest tu-usuario/mi-proyecto:latest

# Subir a Docker Hub
docker login
docker push tu-usuario/mi-proyecto:latest
```

### Desplegar en Plataformas Cloud

#### Docker Hub
```bash
docker tag mi-proyecto:latest tuusuario/mi-proyecto:latest
docker push tuusuario/mi-proyecto:latest
```

#### AWS ECR
```bash
aws ecr get-login-password --region region | docker login --username AWS --password-stdin aws_account_id.dkr.ecr.region.amazonaws.com
docker tag mi-proyecto:latest aws_account_id.dkr.ecr.region.amazonaws.com/mi-proyecto:latest
docker push aws_account_id.dkr.ecr.region.amazonaws.com/mi-proyecto:latest
```

#### Google Container Registry
```bash
docker tag mi-proyecto:latest gcr.io/project-id/mi-proyecto:latest
docker push gcr.io/project-id/mi-proyecto:latest
```

### Desplegar con Docker Compose en Servidor

1. Copia `docker-compose.yml` y `Dockerfile` a tu servidor
2. Ejecuta:
   ```bash
   docker-compose up -d --build
   ```

## Seguridad

### Vulnerabilidades

El proyecto incluye medidas de seguridad:

- ✅ Imagen base actualizada (`node:20-alpine3.20`)
- ✅ Parches de seguridad del sistema (`apk upgrade`)
- ✅ Dependencias npm actualizadas
- ✅ Puerto no privilegiado (3000)

Para escanear vulnerabilidades:

```bash
# Usando Docker Scout
docker scout quickview mi-proyecto

# Ver detalles de CVEs
docker scout cves mi-proyecto
```

### Mejores Prácticas

1. **No incluir secrets en la imagen:** Usa variables de entorno
2. **Mantener la imagen actualizada:** Reconstruye regularmente
3. **Usar .dockerignore:** Ya incluido en el proyecto
4. **Montar database.json como volumen:** Para persistencia segura

## Estructura de Archivos

```
.
├── Dockerfile           # Definición de la imagen
├── docker-compose.yml   # Orquestación de contenedores
├── .dockerignore       # Archivos excluidos del build
└── DOCKER.md          # Esta documentación
```

## Multi-plataforma

Para construir imágenes para diferentes arquitecturas:

```bash
# Configurar buildx
docker buildx create --use

# Construir para múltiples plataformas
docker buildx build --platform linux/amd64,linux/arm64 -t mi-proyecto:latest .
```

## Recursos Adicionales

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Alpine Linux](https://alpinelinux.org/)

## Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Reconstruye sin caché: `docker-compose build --no-cache`
4. Consulta esta documentación

Para más información sobre la aplicación, consulta el `README.md` principal.



================================================
FILE: Dockerfile
================================================
FROM node:20-alpine3.20

WORKDIR /app

# Update packages to patch vulnerabilities
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npx next build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]



================================================
FILE: eslint.config.mjs
================================================
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;



================================================
FILE: next.config.js
================================================
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  logging: {
    level: 'debug',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
}

module.exports = nextConfig



================================================
FILE: next.config.ts
================================================
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
};

export default nextConfig;



================================================
FILE: package.json
================================================
{
  "name": "mi-proyecto",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@tanstack/react-query": "^5.90.5",
    "axios": "^1.12.2",
    "formik": "^2.4.8",
    "next": "15.5.4",
    "npm": "^10.9.4",
    "radix-ui": "^1.4.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-loading-skeleton": "^3.5.0",
    "yup": "^1.7.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "eslint": "^9",
    "eslint-config-next": "15.5.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}



================================================
FILE: postcss.config.mjs
================================================
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;



================================================
FILE: tsconfig.json
================================================
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}



================================================
FILE: .dockerignore
================================================
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next
out
build
dist

# Testing
coverage
.nyc_output

# Misc
.DS_Store
*.pem

# Debug
*.log
.pnp
.pnp.js

# Local env files
.env*.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# Git
.git
.gitignore
.gitattributes

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Docker
Dockerfile
.dockerignore
docker-compose*.yml

# Documentation
README.md
*.md




================================================
FILE: src/app/error.tsx
================================================
"use client";

import { useEffect } from "react";

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void; 
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#134686' }}>
          ¡Oops! Algo salió mal
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#134686' }}>
            Error en la aplicación
          </h2>
          <p className="text-gray-600 mb-6">
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </p>
          <button 
            onClick={() => reset()}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#feb21a', color: '#134686' }}
          >
            Intentar otra vez
          </button>
        </div>
      </div>
    </div>
  );
}



================================================
FILE: src/app/globals.css
================================================
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}



================================================
FILE: src/app/layout.tsx
================================================
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokemon App - Next.js Routing",
  description: "A Pokemon collection app demonstrating Next.js routing and navigation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
        <header className="shadow-lg" style={{ backgroundColor: '#134686' }}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-white text-xl font-bold hover:opacity-80 transition-opacity"
                >
                  Pokemon Collection
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-white hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium transition-opacity"
                >
                  Main List
                </Link>
                <Link
                  href="/favorites"
                  className="text-white hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium transition-opacity"
                >
                  Favorites
                </Link>
              </div>
            </div>
          </nav>
        </header>

          <main className="min-h-screen" style={{ backgroundColor: '#fdf4e3' }}>
            {children}
          </main>

          <footer className="text-white py-8" style={{ backgroundColor: '#134686' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
                <p className="mt-4 text-sm text-gray-400">
                  © 2025 Pokemon App - Next.js Routing Exercise | Juan Cruz Mateos FIUNMdP
                </p>
              </div>
            </div>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}



================================================
FILE: src/app/not-found.tsx
================================================
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-8xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#134686' }}>
            Página No Encontrada
          </h1>
          <p className="text-xl mb-8" style={{ color: '#134686' }}>
            La página que buscas no existe o ha sido movida.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg shadow-md transition-colors text-lg font-medium"
          style={{ backgroundColor: '#feb21a', color: '#134686' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}



================================================
FILE: src/app/page.tsx
================================================
import PokemonList from "@/app/components/PokemonList";

export default function Home() {
  return <PokemonList />;
}



================================================
FILE: src/app/api/README.md
================================================
# API Routes Directory

This directory contains Next.js API routes that provide server-side endpoints for the application.

## Structure

- `pokemon/[id]/route.ts` - API endpoint for fetching individual Pokemon details

## Purpose

API routes allow us to:
- Encapsulate server-side logic and data fetching
- Provide custom error handling with specific error codes
- Add authentication and authorization if needed
- Transform data before sending to the client
- Implement rate limiting and caching strategies
- Keep sensitive API keys on the server

## Best Practices

### Error Handling
- Use appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging
- Handle different types of errors (validation, network, not found, etc.)

### Response Format
- Use consistent response structure
- Include error details when appropriate
- Use NextResponse for proper HTTP responses

### Performance
- Implement proper caching strategies
- Use revalidation when appropriate
- Handle timeouts and network issues

## Example Usage

```typescript
// API Route
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Server Component
export default async function Page() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return <div>{data}</div>;
}
```

## Guidelines

When creating API routes:

1. **Use proper HTTP methods**: GET, POST, PUT, DELETE as appropriate
2. **Validate input parameters**: Check types and ranges
3. **Handle errors gracefully**: Provide meaningful error messages
4. **Use TypeScript**: Type all parameters and responses
5. **Implement proper caching**: Use Next.js caching features
6. **Log important events**: For debugging and monitoring
7. **Keep routes focused**: One concern per route
8. **Document endpoints**: Include JSDoc comments



================================================
FILE: src/app/api/favorites/route.ts
================================================
import { NextResponse } from "next/server";
import { db } from "@/app/lib/database";

interface FavoriteRequestBody {
  id: number;
  name: string;
  image: string;
  types: string[];
  nickname: string;
  description: string;
}

export async function GET() {
  try {
    const favorites = await db.getAll();
    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    console.error("Error retrieving favorites", error);
    return NextResponse.json(
      { error: "Error al obtener favoritos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<FavoriteRequestBody> = await request.json();
    const { id, name, image, types, nickname, description } = body;

    if (
      typeof id !== "number" ||
      !Number.isInteger(id) ||
      id <= 0 ||
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof image !== "string" ||
      image.trim() === "" ||
      !Array.isArray(types) ||
      types.length === 0 ||
      !types.every((type) => typeof type === "string" && type.trim() !== "")
    ) {
      return NextResponse.json(
        { error: "Datos inválidos: se requiere id, name, image y types" },
        { status: 400 }
      );
    }

    const favorite = await db.add({
      id,
      name: name.trim(),
      image: image.trim(),
      types: types.map((type) => type.trim()),
      nickname: nickname?.trim() ?? "",
      description: description?.trim() ?? "",
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "FAVORITE_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "El pokémon ya está en favoritos" },
        { status: 409 }
      );
    }

    console.error("Error creating favorite", error);

    return NextResponse.json(
      { error: "Error al agregar a favoritos" },
      { status: 500 }
    );
  }
}




================================================
FILE: src/app/api/favorites/[id]/route.ts
================================================
import { NextResponse } from "next/server";
import { db } from "@/app/lib/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const removed = await db.remove(parseInt(id as string));

    if (!removed) {
      return NextResponse.json(
        { error: "Pokémon no encontrado en favoritos" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Pokémon eliminado de favoritos" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing favorite", error);
    return NextResponse.json(
      { error: "Error al eliminar de favoritos" },
      { status: 500 }
    );
  }
}




================================================
FILE: src/app/api/pokemon/[id]/route.ts
================================================
import { NextResponse } from "next/server";
import { fetchPokemonById } from "@/app/services/pokemon.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Validate ID parameter
    const pokemonId = parseInt(id);
    if (isNaN(pokemonId) || pokemonId < 1) {
      return NextResponse.json(
        { 
          error: "Invalid Pokemon ID", 
          message: "Pokemon ID must be a positive number" 
        },
        { status: 400 }
      );
    }

    // Fetch Pokemon data
    const pokemon = await fetchPokemonById(pokemonId);
    
    return NextResponse.json(pokemon);
  } catch (error) {
    console.error('API Error fetching Pokemon:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return NextResponse.json(
          { 
            error: "Pokemon not found", 
            message: "The requested Pokemon does not exist" 
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('timeout') || error.message.includes('network')) {
        return NextResponse.json(
          { 
            error: "Service unavailable", 
            message: "Pokemon service is temporarily unavailable" 
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: "An unexpected error occurred while fetching Pokemon data" 
      },
      { status: 500 }
    );
  }
}



================================================
FILE: src/app/components/README.md
================================================
# Components Directory

This directory contains all the reusable React components used throughout the application.

## Structure

- `PokemonItem.tsx` - Individual Pokemon card component that displays Pokemon information
- `PokemonList.tsx` - Main component that renders the complete Pokemon list page with header, grid, loading states, and pagination
- `PokemonSkeleton.tsx` - Enhanced skeleton component using react-loading-skeleton library with smooth animations
- `PokemonPagination.tsx` - Pagination component with "Load More" functionality

## Usage

These components are designed to be reusable and follow React best practices:

- Each component is properly typed with TypeScript
- Components are exported as default exports
- Props interfaces are defined for type safety
- Components handle their own styling and behavior

## Guidelines

When adding new components to this directory:

1. Use TypeScript for all components
2. Define proper prop interfaces
3. Include JSDoc comments for complex components
4. Follow the existing naming conventions
5. Keep components focused on a single responsibility
6. Use proper error boundaries when necessary



================================================
FILE: src/app/components/PokemonFavouriteForm.tsx
================================================
"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import type { CSSProperties } from "react";
import { Pokemon } from "../types/pokemon";

interface PokemonFavouriteFormValues {
    nickname: string;
    description: string;
}

interface PokemonFavouriteFormProps {
    pokemon: Pokemon;
    onClose?: () => void;
    onSubmit: (nickname: string, description: string) => void;
}

const pokemonFavouriteSchema = Yup.object().shape({
    nickname: Yup.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .required("Requerido"),
    description: Yup.string()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(100, "La descripción no puede tener más de 100 caracteres")
        .required("Requerido"),
});

export default function PokemonFavouriteForm({ pokemon, onClose, onSubmit }: PokemonFavouriteFormProps) {
    const initialValues: PokemonFavouriteFormValues = {
        nickname: "",
        description: "",
    };

    const handleSubmit = async (
        values: PokemonFavouriteFormValues
    ) => {
        console.log("Form submitted with values:", values);
        try {
            await onSubmit(values.nickname, values.description);
            console.log("onSubmit completed successfully");
            onClose?.();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <h1
                className="text-2xl font-bold mb-6 text-center"
                style={{ color: "#134686" }}
            >
                Agregar <span className="italic capitalize">{pokemon?.name}</span> a favoritos como...
            </h1>
            <p className="text-sm text-gray-500 mb-6 text-center">
                {pokemon?.name} es un pokemon de tipo {pokemon?.types.map((type) => type.type.name).join(", ")}
            </p>

            <Formik
                initialValues={initialValues}
                validationSchema={pokemonFavouriteSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, isValid, dirty, errors, values }) => {
                    console.log("Form state:", { isValid, dirty, errors, isSubmitting, values });

                    return (
                        <Form className="space-y-4">
                            <div>
                                <label
                                    htmlFor="nickname"
                                    className="block text-sm font-semibold mb-2"
                                    style={{ color: "#134686" }}
                                >
                                    Nombre
                                </label>
                                <Field
                                    type="text"
                                    id="nickname"
                                    name="nickname"
                                    placeholder="Como se llama tu Pokemon favorito?"
                                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 text-gray-900"
                                    style={{
                                        borderColor: "#feb21a",
                                        "--tw-ring-color": "#134686"
                                    } as CSSProperties}
                                />
                                <ErrorMessage name="nickname">
                                    {(msg) => (
                                        <div className="text-sm mt-1" style={{ color: "#ed3f27" }}>
                                            {msg}
                                        </div>
                                    )}
                                </ErrorMessage>
                            </div>
                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-semibold mb-2"
                                    style={{ color: "#134686" }}
                                >
                                    Descripción
                                </label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    placeholder="Descripción de tu Pokemon favorito"
                                    rows={4}
                                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 transition-all resize-none placeholder:text-gray-400 text-gray-900"
                                    style={{
                                        borderColor: "#feb21a",
                                        "--tw-ring-color": "#134686"
                                    } as CSSProperties}
                                />
                                <ErrorMessage name="description">
                                    {(msg) => (
                                        <div className="text-sm mt-1" style={{ color: "#ed3f27" }}>
                                            {msg}
                                        </div>
                                    )}
                                </ErrorMessage>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 rounded-md text-white font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: "#134686" }}
                                >
                                    {isSubmitting ? "Agregando a favoritos..." : "Agregar a favoritos"}
                                </button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}


================================================
FILE: src/app/components/PokemonFavouriteModal.tsx
================================================
"use client";

import { useState, type MouseEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import PokemonFavouriteForm from "./PokemonFavouriteForm";
import { Pokemon } from "../types/pokemon";

interface PokemonFavouriteModalProps {
	pokemon: Pokemon;
	onSubmit: (nickname: string, description: string) => void;
}

export default function PokemonFavouriteModal({ pokemon, onSubmit }: PokemonFavouriteModalProps) {
	const [open, setOpen] = useState(false);

	const handleSubmit = (nickname: string, description: string) => {
		onSubmit(nickname, description);
		setOpen(false);
	};

	const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setOpen(true);
	};

	return (
		<div className="mt-2">
			<button 
				type="button"
				onClick={handleOpen}
				className="w-full px-3 py-2 rounded-md text-white font-semibold transition-all duration-200 hover:opacity-90"
				style={{ backgroundColor: "#134686" }}
			>
				Agregar a favoritos
			</button>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Overlay 
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>
					<Dialog.Content 
						className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
						onInteractOutside={(e) => {
							e.preventDefault();
						}}
						onClick={(event) => {
							event.stopPropagation();
						}}
					>
						<Dialog.Title className="sr-only">Agregar a favoritos</Dialog.Title>
						<PokemonFavouriteForm pokemon={pokemon} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}



================================================
FILE: src/app/components/PokemonItem.tsx
================================================
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { useAddFavorite, useRemoveFavorite } from "@/app/hooks/useFavorites";
import { Pokemon } from "@/app/types/pokemon";
import PokemonFavouriteModal from "./PokemonFavouriteModal";

interface PokemonItemProps {
    pokemon: Pokemon;
    isFavorite: boolean;
    isFavoritesLoading: boolean;
}

export default function PokemonItem({ pokemon, isFavorite, isFavoritesLoading }: PokemonItemProps) {
    const addFavoriteMutation = useAddFavorite();
    const removeFavoriteMutation = useRemoveFavorite();

    const isProcessing = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
    const mutationError = addFavoriteMutation.error?.message ?? removeFavoriteMutation.error?.message ?? null;

    const mainImage = useMemo(() => {
        return (
            pokemon.sprites.other?.["official-artwork"]?.front_default ||
            pokemon.sprites.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
        );
    }, [pokemon.id, pokemon.sprites]);

    const pokemonTypes = useMemo(() => pokemon.types.map((type) => type.type.name), [pokemon.types]);

    const handleAddToFavorites = (nickname: string, description: string) => {
        console.log("Adding to favorites:", { nickname, description });
        addFavoriteMutation.mutate({
            id: pokemon.id,
            name: pokemon.name,
            image: mainImage,
            types: pokemonTypes,
            nickname,
            description,
        });
    };

    const handleRemoveFavorite = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isProcessing && !isFavoritesLoading) {
            removeFavoriteMutation.mutate(pokemon.id);
        }
    };

    return (
        <Link
            href={`/pokemon/${pokemon.id}`}
            className="w-full bg-white rounded-lg shadow-md p-4 border transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 block hover:shadow-lg hover:scale-105"
            style={{
                borderColor: "#feb21a",
                "--tw-ring-color": "#134686",
            } as CSSProperties}
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold capitalize" style={{ color: "#134686" }}>
                    {pokemon.name}
                </h2>
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#feb21a", color: "#134686" }}
                    >
                        #{pokemon.id}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
                {mainImage && (
                    <Image
                        src={mainImage}
                        alt={pokemon.name}
                        width={64}
                        height={64}
                        className="object-contain"
                    />
                )}

                <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-1">
                        {pokemon.types.map((type) => (
                            <span
                                key={type.type.name}
                                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: "#ed3f27", color: "white" }}
                            >
                                {type.type.name}
                            </span>
                        ))}
                    </div>
                    <div className="text-xs" style={{ color: "#134686" }}>
                        {pokemon.height / 10}m • {pokemon.weight / 10}kg
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
                {pokemon.abilities.map((ability, index) => (
                    <span
                        key={`${ability.ability.name}-${ability.slot}-${index}`}
                        className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "#fdf4e3", color: "#134686" }}
                    >
                        {ability.ability.name}
                    </span>
                ))}
            </div>

            {isFavorite ? (
                <button
                    onClick={handleRemoveFavorite}
                    disabled={isProcessing || isFavoritesLoading}
                    className="mt-2 w-full px-3 py-2 rounded-md text-white font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#ed3f27" }}
                >
                    {isProcessing ? "Quitando..." : "Quitar de favoritos"}
                </button>
            ) : (
                <PokemonFavouriteModal pokemon={pokemon} onSubmit={handleAddToFavorites} />
            )}

            {mutationError && (
                <p className="mt-2 text-sm text-red-600">{mutationError}</p>
            )}
        </Link>
    );
}



================================================
FILE: src/app/components/PokemonList.tsx
================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import PokemonItem from "./PokemonItem";
import PokemonSkeleton from "./PokemonSkeleton";
import PokemonPagination from "./PokemonPagination";
import { usePokemonList } from "@/app/hooks/usePokemonList";
import { useFavorites } from "@/app/hooks/useFavorites";
import { Pokemon } from "@/app/types/pokemon";

export default function PokemonList() {
    const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
    
    const { data, isLoading, error, isFetching } = usePokemonList({
        limit: 30, // Fijo en 30
        offset: offset
    });

    const {
        data: favorites,
        isLoading: isFavoritesLoading,
        error: favoritesError,
    } = useFavorites();

    const favoriteIds = useMemo(() => {
        return new Set((favorites ?? []).map((favorite) => favorite.id));
    }, [favorites]);

    // Update allPokemons when new data arrives
    useEffect(() => {
        if (data && data.length > 0) {
            if (!hasLoadedInitial) {
                // primera carga -> reemplazar todos los datos
                setAllPokemons(data);
                setHasLoadedInitial(true);
            } else {
                // cargas posteriores -> solo appendear los nuevos datos
                setAllPokemons(prev => {
                    const newPokemons = data.filter(pokemon => 
                        !prev.some(existing => existing.id === pokemon.id)
                    );
                    return [...prev, ...newPokemons];
                });
            }
        }
    }, [data, hasLoadedInitial]); // se ejecuta cuando data o hasLoadedInitial cambia

    const handleLoadMore = () => {
        setOffset(prev => prev + 30);
    };

    const hasMore = allPokemons.length < 1000; // PokeAPI has around 1000+ Pokemon
    const isLoadingMore = isFetching && hasLoadedInitial;

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Error Loading Pokemon
                        </h3>
                        <p className="text-red-600 mb-4">
                            {error.message || 'Failed to load Pokemon data. Please try again.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2" style={{ color: '#134686' }}>
                    Pokemon Collection
                </h1>
                <p className="text-lg" style={{ color: '#134686' }}>
                    Discover amazing Pokémon from the PokeAPI with infinite scroll
                </p>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allPokemons.map((pokemon) => (
                    <PokemonItem
                        key={pokemon.id}
                        pokemon={pokemon}
                        isFavorite={favoriteIds.has(pokemon.id)}
                        isFavoritesLoading={isFavoritesLoading}
                    />
                ))}
            </div>

            {/* Loading State */}
            {isLoading && !hasLoadedInitial && (
                <PokemonSkeleton count={12} />
            )}

            {/* Loading More State */}
            {isLoadingMore && (
                <div className="mt-8">
                    <PokemonSkeleton count={6} />
                </div>
            )}

            {favoritesError && (
                <div className="mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700 text-sm font-medium">
                            {favoritesError.message || "No se pudieron cargar los favoritos. Aguarde e intente nuevamente."}
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            <PokemonPagination
                onLoadMore={handleLoadMore}
                isLoading={isLoadingMore}
                hasMore={hasMore}
                currentCount={allPokemons.length}
                totalCount={1000} // Approximate total
            />
        </div>
    );
}



================================================
FILE: src/app/components/PokemonPagination.tsx
================================================
"use client";

interface PokemonPaginationProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  currentCount: number;
  totalCount?: number;
}

export default function PokemonPagination({
  onLoadMore,
  isLoading,
  hasMore,
  currentCount,
  totalCount
}: PokemonPaginationProps) {
  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className="text-center">
        <p className="text-lg font-medium" style={{ color: '#134686' }}>
          Showing {currentCount} Pokemon
          {totalCount && ` of ${totalCount}`}
        </p>
      </div>
      
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
            }
          `}
          style={{ 
            backgroundColor: isLoading ? '#9ca3af' : '#134686',
            minWidth: '200px'
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            'Load More Pokemon'
          )}
        </button>
      )}
      
      {!hasMore && totalCount && (
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            🎉 You have seen all {totalCount} Pokemon!
          </p>
        </div>
      )}
    </div>
  );
}



================================================
FILE: src/app/components/PokemonSkeleton.tsx
================================================
"use client";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface PokemonSkeletonProps {
  count?: number;
}

export default function PokemonSkeleton({ count = 1 }: PokemonSkeletonProps) {
  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            {/* Image skeleton */}
            <div className="flex justify-center mb-4">
              <Skeleton circle height={120} width={120} />
            </div>
            
            {/* Name skeleton */}
            <div className="text-center mb-2">
              <Skeleton height={24} width="60%" className="mx-auto" />
            </div>
            
            {/* ID skeleton */}
            <div className="text-center mb-3">
              <Skeleton height={16} width="30%" className="mx-auto" />
            </div>
            
            {/* Types skeleton */}
            <div className="flex justify-center gap-2 mb-4">
              <Skeleton height={20} width={60} />
              <Skeleton height={20} width={60} />
            </div>
            
            {/* Stats skeleton */}
            <div className="space-y-2">
              <Skeleton height={12} width="100%" />
              <Skeleton height={12} width="80%" />
              <Skeleton height={12} width="90%" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}



================================================
FILE: src/app/favorites/page.tsx
================================================
"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites, useRemoveFavorite } from "@/app/hooks/useFavorites";

export default function FavoritesPage() {
  const { data: favorites, isLoading, error } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  const handleRemove = (id: number) => {
    if (!removeFavorite.isPending) {
      removeFavorite.mutate(id);
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold" style={{ color: "#134686" }}>
          Tus Pokémon Favoritos
        </h1>
        <p className="mt-2 text-lg" style={{ color: "#134686" }}>
          Administra los pokémon que marcaste como favoritos.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 text-sm font-semibold rounded-md text-white"
          style={{ backgroundColor: "#ed3f27" }}
        >
          Volver a la lista principal
        </Link>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
          {error.message || "No pudimos cargar tus favoritos. Intenta nuevamente."}
        </div>
      )}

      {removeFavorite.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3">
          {removeFavorite.error.message}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => {
            const isRemoving =
              removeFavorite.isPending && removeFavorite.variables === favorite.id;

            return (
              <article
                key={favorite.id}
                className="bg-white rounded-lg shadow-md border p-4 flex flex-col gap-3"
                style={{ borderColor: "#feb21a" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={favorite.image}
                      alt={favorite.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                    <div>
                      <h2 className="text-xl font-semibold capitalize" style={{ color: "#134686" }}>
                        {favorite.name}
                      </h2>
                      <p className="text-sm text-gray-500">{favorite.nickname}</p>
                      <p className="text-sm text-gray-500">{favorite.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {favorite.types.map((type) => (
                          <span
                            key={type}
                            className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: "#ed3f27" }}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/pokemon/${favorite.id}`}
                    className="text-sm font-semibold px-3 py-2 rounded-md text-white"
                    style={{ backgroundColor: "#134686" }}
                  >
                    Ver detalle
                  </Link>
                </div>

                <button
                  onClick={() => handleRemove(favorite.id)}
                  disabled={isRemoving}
                  className={`w-full px-3 py-2 rounded-md text-sm font-semibold text-white transition-colors ${isRemoving ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                  {isRemoving ? "Eliminando..." : "Quitar de favoritos"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-lg" style={{ color: "#134686" }}>
            Todavía no agregaste pokémon a tu lista de favoritos.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Volvé a la lista principal y usa el botón &ldquo;Agregar a favoritos&rdquo; para empezar a armarla.
          </p>
        </div>
      )}
    </section>
  );
}




================================================
FILE: src/app/hooks/README.md
================================================
# Hooks Directory

This directory contains custom React hooks that encapsulate reusable logic and state management.

## Purpose

Custom hooks allow us to:
- Extract component logic into reusable functions
- Share stateful logic between components
- Keep components clean and focused on rendering
- Centralize data fetching and state management logic

## Structure

Currently empty - hooks will be added as needed for:
- Data fetching with TanStack Query
- State management
- API calls
- Form handling
- Local storage operations

## Naming Conventions

- Use `use` prefix for all hook names
- Use descriptive names that indicate the hook's purpose
- Group related hooks in subdirectories if needed

## Example Structure (Future)

```
hooks/
├── api/
│   ├── usePokemonList.ts
│   ├── usePokemonDetail.ts
│   └── usePokemonSearch.ts
├── state/
│   ├── usePagination.ts
│   └── useFilters.ts
└── ui/
    ├── useModal.ts
    └── useToast.ts
```

## Guidelines

When creating custom hooks:

1. Always start with `use` prefix
2. Return an object with descriptive property names
3. Include proper TypeScript types
4. Handle loading, error, and success states
5. Use TanStack Query for data fetching
6. Keep hooks focused on a single responsibility
7. Include JSDoc comments for complex logic



================================================
FILE: src/app/hooks/useFavorites.ts
================================================
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesService } from "@/app/services/favorites.service";
import type { FavoritePayload, FavoritePokemon } from "@/app/types/favorite";

export function useFavorites() {
  return useQuery<FavoritePokemon[], Error>({
    queryKey: ["favorites"],
    queryFn: favoritesService.getAll,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation<FavoritePokemon, Error, FavoritePayload>({
    mutationFn: favoritesService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: favoritesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}



================================================
FILE: src/app/hooks/usePokemonList.ts
================================================
import { useQuery } from "@tanstack/react-query";
import { fetchPokemonListWithDetails, fetchPokemonById, PokemonListParams } from "@/app/services/pokemon.service";
import { Pokemon } from "@/app/types/pokemon";

/**
 * Custom hook to fetch a list of Pokemon with their detailed information
 * @param params - Object containing limit and offset parameters
 * @returns Query result with Pokemon data, loading state, and error handling
 */
export function usePokemonList(params: PokemonListParams) {
  return useQuery<Pokemon[], Error>({
    queryKey: ["pokemon-list", params.limit, params.offset],
    queryFn: () => fetchPokemonListWithDetails(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
}

/**
 * Custom hook to fetch a single Pokemon by ID
 * @param pokemonId - The ID of the Pokemon to fetch
 * @returns Query result with Pokemon data, loading state, and error handling
 */
export function usePokemonById(pokemonId: number) {
  return useQuery<Pokemon, Error>({
    queryKey: ["pokemon", pokemonId],
    queryFn: () => fetchPokemonById(pokemonId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    enabled: !!pokemonId, // Only run query if pokemonId is provided
  });
}



================================================
FILE: src/app/lib/database.ts
================================================
import fs from "fs/promises";
import path from "path";
import type { FavoritePokemon, FavoritePayload } from "@/app/types/favorite";

const DB_PATH = path.join(process.cwd(), "database.json");

class Database {
  private async readDB(): Promise<FavoritePokemon[]> {
    try {
      const data = await fs.readFile(DB_PATH, "utf-8");
      return JSON.parse(data) as FavoritePokemon[];
    } catch (error) {
      console.error("Error reading database", error);
      throw new Error("Error reading database: " + error);
    }
  }

  private async writeDB(data: FavoritePokemon[]): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  }

  async getAll(): Promise<FavoritePokemon[]> {
    return this.readDB();
  }

  async getById(id: number): Promise<FavoritePokemon | undefined> {
    const data = await this.readDB();
    return data.find((item) => item.id === id);
  }

  async add(favorite: FavoritePayload): Promise<FavoritePokemon> {
    const data = await this.readDB();

    if (data.some((item) => item.id === favorite.id)) {
      throw new Error("FAVORITE_ALREADY_EXISTS");
    }

    const newFavorite: FavoritePokemon = {
      ...favorite,
      addedAt: new Date().toISOString(),
    };

    data.push(newFavorite);
    await this.writeDB(data);

    return newFavorite;
  }

  async remove(id: number): Promise<boolean> {
    const data = await this.readDB();
    const filtered = data.filter((item) => item.id !== id);

    if (filtered.length === data.length) {
      return false;
    }

    await this.writeDB(filtered);
    return true;
  }
}

export const db = new Database();


================================================
FILE: src/app/pokemon/README.md
================================================
# Pokemon Directory

This directory contains the Pokemon-related pages and routes in the application.

## Structure

- `[id]/` - Dynamic route for individual Pokemon detail pages

## Route Structure

The Pokemon directory follows Next.js App Router conventions:

- `pokemon/[id]/page.tsx` - Server-side rendered Pokemon detail page
- `pokemon/[id]/loading.tsx` - Loading state for Pokemon detail page
- `pokemon/[id]/not-found.tsx` - 404 page for Pokemon not found

## Features

### Pokemon Detail Page (`[id]/page.tsx`)
- Server-side rendered for better SEO and performance
- Fetches Pokemon data from PokeAPI
- Displays comprehensive Pokemon information including:
  - Basic stats (name, ID, height, weight)
  - Sprites and images
  - Types and abilities
  - Base stats
  - Evolution chain information

### Loading State (`[id]/loading.tsx`)
- Shows skeleton loading animation while Pokemon data is being fetched
- Provides better user experience during data loading
- Automatically displayed by Next.js during server-side rendering

### Error Handling (`[id]/not-found.tsx`)
- Custom 404 page for Pokemon that don't exist
- User-friendly error message
- Navigation back to Pokemon list

## Usage

Navigate to a Pokemon detail page using:
```
/pokemon/{pokemon-id}
```

Example:
- `/pokemon/1` - Shows details for Bulbasaur
- `/pokemon/25` - Shows details for Pikachu

## Technical Details

- Uses Next.js dynamic routing with `[id]` parameter
- Server Components for optimal performance
- TypeScript for type safety
- Responsive design for mobile and desktop
- Error boundaries for graceful error handling

## Future Enhancements

- Add Pokemon comparison feature
- Implement Pokemon search functionality
- Add favorite Pokemon feature
- Include Pokemon evolution chain visualization



================================================
FILE: src/app/pokemon/[id]/README.md
================================================
# Pokemon Detail Route (`[id]`)

This directory contains the dynamic route for individual Pokemon detail pages.

## Files

### `page.tsx`
The main Pokemon detail page component that:
- Receives the Pokemon ID as a dynamic parameter
- Fetches Pokemon data from PokeAPI on the server
- Renders comprehensive Pokemon information
- Handles server-side rendering for optimal SEO and performance

**Key Features:**
- Server Component (no "use client" directive)
- Async function for data fetching
- TypeScript with proper type definitions
- Error handling for invalid Pokemon IDs
- Responsive design

### `loading.tsx`
Loading state component that:
- Displays while the Pokemon data is being fetched
- Shows skeleton loading animation
- Automatically used by Next.js during server-side rendering
- Provides smooth user experience

**Features:**
- Skeleton loading animation
- Matches the layout of the actual Pokemon detail page
- Responsive design
- Fast loading state

### `not-found.tsx`
Error page component that:
- Displays when a Pokemon with the given ID doesn't exist
- Provides user-friendly error message
- Includes navigation back to the Pokemon list
- Handles 404 errors gracefully

**Features:**
- Custom 404 page design
- Clear error messaging
- Navigation options
- Consistent styling with the rest of the app

## Route Parameters

The `[id]` parameter accepts:
- Numeric Pokemon IDs (1, 2, 3, etc.)
- String representations of numbers
- Invalid IDs will trigger the `not-found.tsx` page

## Data Fetching

The page fetches data from:
- **Primary API**: PokeAPI (https://pokeapi.co/api/v2/pokemon/{id})
- **Method**: Server-side fetching with `fetch()`
- **Caching**: Uses Next.js built-in caching for performance

## Error Handling

1. **Invalid Pokemon ID**: Shows `not-found.tsx`
2. **API Errors**: Handled gracefully with error boundaries
3. **Network Issues**: Fallback to error state
4. **Type Errors**: TypeScript prevents many runtime errors

## Performance Optimizations

- Server-side rendering for faster initial load
- Automatic code splitting
- Image optimization with Next.js Image component
- Efficient data fetching patterns
- Proper error boundaries

## Usage Examples

```
/pokemon/1     → Bulbasaur details
/pokemon/25    → Pikachu details
/pokemon/999   → Invalid ID → not-found page
```



================================================
FILE: src/app/pokemon/[id]/loading.tsx
================================================
export default function PokemonDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="w-32 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 bg-gray-400 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-400 rounded w-16 animate-pulse"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-400 rounded w-24 mb-1 animate-pulse"></div>
              <div className="h-8 bg-gray-400 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-64 h-64 bg-gray-300 rounded-lg mx-auto animate-pulse"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-4 bg-gray-300 rounded w-12 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-300 rounded w-16 mx-auto animate-pulse"></div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-4 bg-gray-300 rounded w-12 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-300 rounded w-16 mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="h-6 bg-gray-300 rounded w-16 mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-gray-300 rounded-full w-20 animate-pulse"></div>
                  <div className="h-8 bg-gray-300 rounded-full w-24 animate-pulse"></div>
                </div>
              </div>

              <div>
                <div className="h-6 bg-gray-300 rounded w-20 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              </div>

              <div>
                <div className="h-6 bg-gray-300 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-300 h-2 rounded-full w-1/2 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-8 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



================================================
FILE: src/app/pokemon/[id]/not-found.tsx
================================================
import Link from "next/link";

export default function PokemonNotFound() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <div className="mb-6">
          <div className="text-8xl mb-4">😢</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Pokemon No Encontrado
          </h1>
          <p className="text-xl text-white mb-8">
            El Pokemon que buscas no existe o no está disponible.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg shadow-md transition-colors text-lg font-medium"
          style={{ backgroundColor: '#feb21a', color: '#134686' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la Lista de Pokemon
        </Link>
      </div>
    </div>
  );
}



================================================
FILE: src/app/pokemon/[id]/page.tsx
================================================
import Image from "next/image";
import Link from "next/link";
import { Pokemon } from "@/app/types/pokemon";
import { notFound } from "next/navigation";

interface PokemonDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getPokemonById(id: string): Promise<Pokemon | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Pokemon not found
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json() as Promise<Pokemon>;
  } catch (error) {
    console.error(`Error fetching Pokemon with ID ${id}:`, error);
    return null;
  }
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { id } = await params;
  const pokemon = await getPokemonById(id);

  if (!pokemon) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg shadow-md transition-colors"
          style={{ backgroundColor: '#feb21a', color: '#134686' }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Return to Main List
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 text-white" style={{ background: `linear-gradient(to right, #134686, #ed3f27)` }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold capitalize mb-2">
                {pokemon.name}
              </h1>
              <p className="text-xl opacity-90">
                #{pokemon.id.toString().padStart(3, '0')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Base Experience</p>
              <p className="text-2xl font-bold">{pokemon.base_experience}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="text-center">
                {pokemon.sprites.other?.["official-artwork"]?.front_default ? (
                  <Image
                    src={pokemon.sprites.other["official-artwork"].front_default}
                    alt={pokemon.name}
                    width={300}
                    height={300}
                    className="mx-auto"
                  />
                ) : pokemon.sprites.front_default ? (
                  <Image
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Height</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {(pokemon.height / 10).toFixed(1)}m
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Weight</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {(pokemon.weight / 10).toFixed(1)}kg
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#134686' }}>Types</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="px-4 py-2 rounded-full font-medium capitalize"
                      style={{ backgroundColor: '#ed3f27', color: 'white' }}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#134686' }}>Abilities</h3>
                <div className="space-y-2">
                  {pokemon.abilities.map((ability, index) => (
                    <div
                      key={`${ability.ability.name}-${ability.slot}-${index}`}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: '#fdf4e3' }}
                    >
                      <span className="capitalize font-medium" style={{ color: '#134686' }}>
                        {ability.ability.name.replace('-', ' ')}
                      </span>
                      {ability.is_hidden && (
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: '#feb21a', color: '#134686' }}
                        >
                          Hidden
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#134686' }}>Base Stats</h3>
                <div className="space-y-2">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="flex items-center justify-between">
                      <span className="capitalize font-medium" style={{ color: '#134686' }}>
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 rounded-full h-2" style={{ backgroundColor: '#fdf4e3' }}>
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: '#ed3f27',
                              width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-8 text-right" style={{ color: '#134686' }}>
                          {stat.base_stat}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



================================================
FILE: src/app/providers/README.md
================================================
# Providers Directory

This directory contains React context providers and other global providers used throughout the application.

## Structure

- `QueryProvider.tsx` - TanStack Query client provider wrapper

## Purpose

Providers allow us to:
- Wrap the application with necessary context providers
- Keep the main layout clean and focused
- Centralize provider configuration
- Follow React best practices for context usage

## Usage

Providers are typically used in the root layout to wrap the entire application:

```tsx
// layout.tsx
import QueryProvider from "./providers/QueryProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## Guidelines

When creating providers:

1. **Keep providers focused**: Each provider should handle one specific concern
2. **Use TypeScript**: Properly type all provider props and context values
3. **Handle client-side only code**: Use "use client" directive when needed
4. **Optimize performance**: Use proper memoization and avoid unnecessary re-renders
5. **Document configuration**: Include comments explaining configuration options
6. **Test providers**: Ensure providers work correctly in isolation



================================================
FILE: src/app/providers/QueryProvider.tsx
================================================
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}



================================================
FILE: src/app/services/README.md
================================================
# Services Directory

This directory contains service functions that handle API calls and external data fetching.

## Purpose

Services provide a clean abstraction layer for:
- Making HTTP requests to external APIs
- Handling API response formatting
- Managing API endpoints and configurations
- Centralizing data transformation logic

## Structure

Currently empty - services will be added as needed for:
- Pokemon API calls
- Data transformation
- Error handling
- Request/response interceptors

## Naming Conventions

- Use descriptive function names that indicate the action
- Group related services in subdirectories
- Use TypeScript for all service functions
- Include proper error handling

## Example Structure (Future)

```
services/
├── api/
│   ├── pokemonService.ts
│   ├── userService.ts
│   └── baseApi.ts
├── utils/
│   ├── dataTransformers.ts
│   └── validators.ts
└── constants/
    ├── apiEndpoints.ts
    └── apiConfig.ts
```

## Guidelines

When creating service functions:

1. Use async/await for API calls
2. Include proper TypeScript types for requests and responses
3. Handle errors gracefully with try/catch
4. Return consistent response formats
5. Use environment variables for API URLs
6. Include JSDoc comments for complex functions
7. Keep services pure and testable
8. Use proper HTTP status code handling

## Example Service Function

```typescript
// services/api/pokemonService.ts
export interface Pokemon {
  id: number;
  name: string;
  // ... other properties
}

export async function fetchPokemonList(limit: number, offset: number): Promise<Pokemon[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}
```



================================================
FILE: src/app/services/favorites.service.ts
================================================
import type { FavoritePayload, FavoritePokemon } from "@/app/types/favorite";

async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud";

  try {
    const error = await response.json();
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error;
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // Ignorar errores al parsear respuesta
  } 

  throw new Error(message);
}

export const favoritesService = {
  getAll: async (): Promise<FavoritePokemon[]> => {
    const res = await fetch("/api/favorites", { cache: "no-store" });
    if (!res.ok) {
      await handleErrorResponse(res);
    }
    return res.json();
  },

  add: async (favorite: FavoritePayload): Promise<FavoritePokemon> => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(favorite),
    });

    if (!res.ok) {
      await handleErrorResponse(res);
    }

    return res.json();
  },

  remove: async (id: number): Promise<void> => {
    const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    if (!res.ok) {
      await handleErrorResponse(res);
    }
  },
};




================================================
FILE: src/app/services/pokemon.service.ts
================================================
import { Pokemon } from "@/app/types/pokemon";

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonListParams {
  limit: number;
  offset: number;
}

/**
 * Fetches a list of Pokemon from the PokeAPI
 * @param params - Object containing limit and offset parameters
 * @returns Promise<PokemonListResponse>
 */
export async function fetchPokemonList(params: PokemonListParams): Promise<PokemonListResponse> {
  const { limit, offset } = params;
  
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw new Error('Failed to fetch Pokemon list. Please try again.');
  }
}

/**
 * Fetches detailed information for a specific Pokemon
 * @param pokemonUrl - The URL of the Pokemon to fetch
 * @returns Promise<Pokemon>
 */
export async function fetchPokemonDetail(pokemonUrl: string): Promise<Pokemon> {
  try {
    const response = await fetch(pokemonUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokemon detail:', error);
    throw new Error('Failed to fetch Pokemon details. Please try again.');
  }
}

/**
 * Fetches detailed information for a specific Pokemon by ID
 * @param pokemonId - The ID of the Pokemon to fetch
 * @returns Promise<Pokemon>
 */
export async function fetchPokemonById(pokemonId: number): Promise<Pokemon> {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pokemon by ID:', error);
    throw new Error('Failed to fetch Pokemon details. Please try again.');
  }
}

/**
 * Fetches a complete list of Pokemon with their detailed information
 * @param params - Object containing limit and offset parameters
 * @returns Promise<Pokemon[]>
 */
export async function fetchPokemonListWithDetails(params: PokemonListParams): Promise<Pokemon[]> {
  try {
    // First, get the list of Pokemon
    const listResponse = await fetchPokemonList(params);
    
    // Then, fetch details for each Pokemon
    const pokemonPromises = listResponse.results.map(pokemon => 
      fetchPokemonDetail(pokemon.url)
    );
    
    const pokemons = await Promise.all(pokemonPromises);
    return pokemons;
  } catch (error) {
    console.error('Error fetching Pokemon list with details:', error);
    throw new Error('Failed to fetch Pokemon data. Please try again.');
  }
}



================================================
FILE: src/app/types/README.md
================================================
# Types Directory

This directory contains TypeScript type definitions and interfaces used throughout the application.

## Purpose

Type definitions provide:
- Type safety across the application
- Better IDE support and autocompletion
- Documentation for data structures
- Consistency in data handling
- Easier refactoring and maintenance

## Structure

- `pokemon.ts` - Type definitions related to Pokemon data structures

## Naming Conventions

- Use PascalCase for type and interface names
- Use descriptive names that clearly indicate the purpose
- Group related types in the same file
- Use generic types when appropriate
- Export types that are used in multiple files

## Guidelines

When creating type definitions:

1. **Be specific**: Use precise types instead of `any`
2. **Use interfaces for objects**: Prefer `interface` over `type` for object shapes
3. **Use union types for variants**: When a value can be one of several types
4. **Use generics for reusability**: When types can be parameterized
5. **Document complex types**: Add JSDoc comments for complex type definitions
6. **Group related types**: Keep related types in the same file
7. **Use consistent naming**: Follow established naming patterns

## Example Type Definitions

```typescript
// Basic interface
export interface Pokemon {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonType[];
}

// Union type
export type PokemonStatus = 'loading' | 'success' | 'error';

// Generic type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Utility type
export type PokemonList = Pokemon[];
```

## File Organization

Group types by domain or feature:
- `pokemon.ts` - Pokemon-related types
- `api.ts` - API response types
- `ui.ts` - UI component prop types
- `common.ts` - Shared utility types



================================================
FILE: src/app/types/favorite.ts
================================================
export interface FavoritePokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  addedAt: string;
  nickname: string;
  description: string;
}

export type FavoritePayload = Omit<FavoritePokemon, "addedAt">;




================================================
FILE: src/app/types/pokemon.ts
================================================
export interface Pokemon {
    id: number;
    name: string;
    base_experience: number;
    height: number;
    weight: number;
    is_default: boolean;
    order: number;
    abilities: Array<{
        ability: {
            name: string;
            url: string;
        };
        is_hidden: boolean;
        slot: number;
    }>;
    cries: {
        latest: string;
        legacy: string;
    };
    forms: Array<{
        name: string;
        url: string;
    }>;
    game_indices: Array<{
        game_index: number;
        version: {
            name: string;
            url: string;
        };
    }>;
    held_items: Array<{
        item: {
            name: string;
            url: string;
        };
        version_details: Array<{
            rarity: number;
            version: {
                name: string;
                url: string;
            };
        }>;
    }>;
    location_area_encounters: string;
    moves: Array<{
        move: {
            name: string;
            url: string;
        };
        version_group_details: Array<{
            level_learned_at: number;
            move_learn_method: {
                name: string;
                url: string;
            };
            order: number | null;
            version_group: {
                name: string;
                url: string;
            };
        }>;
    }>;
    past_abilities: Array<{
        abilities: Array<{
            ability: {
                name: string;
                url: string;
            } | null;
            is_hidden: boolean;
            slot: number;
        }>;
        generation: {
            name: string;
            url: string;
        };
    }>;
    past_types: Array<{
        generation: {
            name: string;
            url: string;
        };
        types: Array<{
            slot: number;
            type: {
                name: string;
                url: string;
            };
        }>;
    }>;
    species: {
        name: string;
        url: string;
    };
    sprites: {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
        other: {
            dream_world: {
                front_default: string | null;
                front_female: string | null;
            };
            home: {
                front_default: string | null;
                front_female: string | null;
                front_shiny: string | null;
                front_shiny_female: string | null;
            };
            "official-artwork": {
                front_default: string | null;
                front_shiny: string | null;
            };
            showdown: {
                back_default: string | null;
                back_female: string | null;
                back_shiny: string | null;
                back_shiny_female: string | null;
                front_default: string | null;
                front_female: string | null;
                front_shiny: string | null;
                front_shiny_female: string | null;
            };
        };
        versions: {
            "generation-i": {
                "red-blue": {
                    back_default: string | null;
                    back_gray: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_gray: string | null;
                    front_transparent: string | null;
                };
                yellow: {
                    back_default: string | null;
                    back_gray: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_gray: string | null;
                    front_transparent: string | null;
                };
            };
            "generation-ii": {
                crystal: {
                    back_default: string | null;
                    back_shiny: string | null;
                    back_shiny_transparent: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_shiny_transparent: string | null;
                    front_transparent: string | null;
                };
                gold: {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_transparent: string | null;
                };
                silver: {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_transparent: string | null;
                };
            };
            "generation-iii": {
                emerald: {
                    front_default: string | null;
                    front_shiny: string | null;
                };
                "firered-leafgreen": {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                };
                "ruby-sapphire": {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                };
            };
            "generation-iv": {
                "diamond-pearl": {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                "heartgold-soulsilver": {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                platinum: {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            "generation-v": {
                "black-white": {
                    animated: {
                        back_default: string | null;
                        back_female: string | null;
                        back_shiny: string | null;
                        back_shiny_female: string | null;
                        front_default: string | null;
                        front_female: string | null;
                        front_shiny: string | null;
                        front_shiny_female: string | null;
                    };
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            "generation-vi": {
                "omegaruby-alphasapphire": {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                "x-y": {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            "generation-vii": {
                icons: {
                    front_default: string | null;
                    front_female: string | null;
                };
                "ultra-sun-ultra-moon": {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            "generation-viii": {
                icons: {
                    front_default: string | null;
                    front_female: string | null;
                };
            };
        };
    };
    stats: Array<{
        base_stat: number;
        effort: number;
        stat: {
            name: string;
            url: string;
        };
    }>;
    types: Array<{
        slot: number;
        type: {
            name: string;
            url: string;
        };
    }>;
}


