// Configuración del sistema de almacenamiento
export const storageConfig = {
  // Cambiar a 'mysql' para usar base de datos MySQL
  // Cambiar a 'client' para usar localStorage (client-side)
  mode: "mysql" as "client" | "mysql",

  // Configuración de MySQL (solo se usa si mode = 'mysql')
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "gamestore",
  },

  // Configuración general
  settings: {
    defaultUserMoney: 999999, // Dinero virtual ilimitado
    pointsPerEuro: 1, // 1 punto por cada euro gastado
    enableRewards: true,
    enableCart: true,
    enableUserRegistration: true,
  },
}

export type StorageMode = typeof storageConfig.mode
export type StorageConfig = typeof storageConfig
