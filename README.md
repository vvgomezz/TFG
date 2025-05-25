# GameStore España - Tienda de Videojuegos

Una tienda de videojuegos completamente funcional con soporte para almacenamiento client-side y MySQL.

## 🚀 Características

- **Dual Storage**: Soporte para localStorage (client-side) y MySQL
- **Sistema de Puntos**: Gana puntos con cada compra
- **Carrito de Compras**: Gestión completa del carrito
- **Autenticación**: Login y registro de usuarios
- **Dinero Virtual**: Cada usuario tiene dinero ilimitado
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Español**: Completamente traducido al español de España

## ⚙️ Configuración

### 1. Modo Client-Side (Por defecto)

No requiere configuración adicional. Los datos se almacenan en localStorage.

\`\`\`typescript
// config/storage.ts
export const storageConfig = {
  mode: 'client', // Usar localStorage
  // ...
}
\`\`\`

### 2. Modo MySQL

1. Instala MySQL en tu sistema
2. Crea una base de datos llamada `gamestore`
3. Copia `.env.example` a `.env` y configura tus credenciales:

\`\`\`bash
cp .env.example .env
\`\`\`

4. Edita `.env` con tus datos de MySQL:

\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=tu_usuario
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=gamestore
\`\`\`

5. Cambia el modo en la configuración:

\`\`\`typescript
// config/storage.ts
export const storageConfig = {
  mode: 'mysql', // Usar MySQL
  // ...
}
\`\`\`

6. Inicializa la base de datos:

\`\`\`bash
npm run db:init
\`\`\`

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:

\`\`\`bash
npm install
\`\`\`

3. Configura el almacenamiento (ver sección anterior)
4. Ejecuta el proyecto:

\`\`\`bash
npm run dev
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
├── app/                    # Páginas de Next.js
│   ├── api/               # API routes (solo para MySQL)
│   ├── auth/              # Página de autenticación
│   ├── cart/              # Página del carrito
│   ├── profile/           # Página del perfil
│   └── page.tsx           # Página principal
├── config/
│   └── storage.ts         # Configuración del almacenamiento
├── lib/
│   ├── storage.ts         # Capa de abstracción de almacenamiento
│   └── mysql.ts           # Conexión y operaciones MySQL
└── scripts/
    └── init-db.js         # Script de inicialización de BD
\`\`\`

## 🔄 Cambiar entre Modos de Almacenamiento

Para cambiar entre client-side y MySQL, simplemente modifica el archivo `config/storage.ts`:

\`\`\`typescript
export const storageConfig = {
  mode: 'client', // o 'mysql'
  // ...
}
\`\`\`

No se requieren cambios adicionales en el código. La aplicación funcionará de manera idéntica en ambos modos.

## 🎮 Funcionalidades

- **Catálogo de Juegos**: 8 videojuegos populares con información detallada
- **Búsqueda y Filtros**: Busca por título y filtra por género
- **Sistema de Puntos**: 1 punto por cada euro gastado
- **Niveles de Usuario**: Novato → Jugador → Veterano → Experto → Leyenda
- **Historial de Compras**: Registro completo de todas las compras
- **Carrito Persistente**: El carrito se mantiene entre sesiones
- **Dinero Ilimitado**: Cada usuario tiene 999.999€ virtuales

## 🛡️ Seguridad

- Validación de datos en cliente y servidor
- Transacciones MySQL para operaciones críticas
- Manejo de errores robusto
- Sanitización de inputs

## 📱 Responsive Design

La aplicación está optimizada para:
- Móviles (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Pantallas grandes (1440px+)
\`\`\`

He mejorado la tienda de videojuegos existente añadiendo soporte opcional para MySQL sin alterar la funcionalidad client-side. Las características principales incluyen:

## 🔧 **Sistema de Configuración Dual**
- **Archivo de configuración centralizado** (`config/storage.ts`) para cambiar fácilmente entre modos
- **Modo client-side**: Usa localStorage (comportamiento original)
- **Modo MySQL**: Usa base de datos MySQL con API routes

## 🏗️ **Arquitectura de Abstracción**
- **Capa de abstracción** (`lib/storage.ts`) que maneja ambos tipos de almacenamiento
- **API routes** para operaciones MySQL cuando está habilitado
- **Interfaz consistente** independientemente del método de almacenamiento

## 🗄️ **Soporte MySQL Completo**
- **Esquema de base de datos** optimizado con tablas relacionales
- **Transacciones** para operaciones críticas como compras
- **Inicialización automática** de la base de datos con datos de ejemplo
- **Manejo de errores** robusto

## ⚡ **Funcionalidades Preservadas**
- **Sistema de puntos de recompensa** (1 punto por euro)
- **Carrito de compras** persistente
- **Autenticación** de usuarios
- **Dinero virtual ilimitado** (999.999€)
- **Historial de compras** completo
- **Niveles de usuario** y logros

## 🎯 **Experiencia de Usuario Idéntica**
- **Interfaz sin cambios** - el usuario no nota la diferencia
- **Rendimiento optimizado** en ambos modos
- **Traducción completa** al español de España
- **Diseño responsive** mantenido

Para cambiar entre modos, simplemente modifica una línea en `config/storage.ts`:
\`\`\`typescript
mode: 'client' // o 'mysql'
\`\`\`

La aplicación funcionará de manera idéntica en ambos modos, manteniendo toda la funcionalidad original mientras añade la flexibilidad de usar una base de datos MySQL cuando sea necesario.
