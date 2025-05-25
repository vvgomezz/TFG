import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const storageConfig = {
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "gamestore",
  },
  settings: {
    defaultUserMoney: 999999,
  },
}

async function initializeDatabase() {
  let connection

  try {
    // Conectar sin especificar base de datos para crearla si no existe
    const connectionConfig = { ...storageConfig.mysql }
    delete connectionConfig.database
    
    connection = await mysql.createConnection(connectionConfig)
    
    // Crear base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${storageConfig.mysql.database}`)
    await connection.execute(`USE ${storageConfig.mysql.database}`)

    console.log(`Base de datos '${storageConfig.mysql.database}' creada/verificada`)

    // Crear tabla de usuarios
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        money DECIMAL(10,2) DEFAULT ${storageConfig.settings.defaultUserMoney},
        points INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de productos/juegos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        description TEXT,
        genre VARCHAR(100),
        rating DECIMAL(2,1),
        image VARCHAR(500),
        discount INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de compras
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total DECIMAL(10,2) NOT NULL,
        points_earned INT NOT NULL,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Crear tabla de items de compra
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_id INT,
        game_id INT,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      )
    `)

    // Crear tabla de carrito
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        game_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_game (user_id, game_id)
      )
    `)

    console.log("Tablas creadas correctamente")

    // Insertar juegos de ejemplo si no existen
    const [existingGames] = await connection.execute("SELECT COUNT(*) as count FROM games")
    if (existingGames[0].count === 0) {
      await insertSampleGames(connection)
      console.log("Juegos de ejemplo insertados")
    } else {
      console.log("Los juegos ya existen en la base de datos")
    }

  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

async function insertSampleGames(conn) {
  const games = [
    {
      title: "Cyberpunk 2077",
      price: 29.99,
      original_price: 59.99,
      description: "Un RPG de mundo abierto ambientado en Night City",
      genre: "RPG",
      rating: 4.2,
      image: "/placeholder.svg?height=300&width=400",
      discount: 50,
    },
    {
      title: "The Witcher 3: Wild Hunt",
      price: 19.99,
      original_price: 39.99,
      description: "Aventura épica de fantasía con Geralt de Rivia",
      genre: "RPG",
      rating: 4.8,
      image: "/placeholder.svg?height=300&width=400",
      discount: 50,
    },
    {
      title: "FIFA 24",
      price: 69.99,
      original_price: null,
      description: "El simulador de fútbol más realista del mundo",
      genre: "Deportes",
      rating: 4.1,
      image: "/placeholder.svg?height=300&width=400",
      discount: null,
    },
    {
      title: "Call of Duty: Modern Warfare III",
      price: 79.99,
      original_price: null,
      description: "Acción militar intensa en primera persona",
      genre: "Acción",
      rating: 4.3,
      image: "/placeholder.svg?height=300&width=400",
      discount: null,
    },
    {
      title: "Baldur's Gate 3",
      price: 59.99,
      original_price: null,
      description: "RPG por turnos basado en D&D",
      genre: "RPG",
      rating: 4.9,
      image: "/placeholder.svg?height=300&width=400",
      discount: null,
    },
    {
      title: "Spider-Man Remastered",
      price: 39.99,
      original_price: 59.99,
      description: "Aventura de superhéroes en Nueva York",
      genre: "Acción",
      rating: 4.6,
      image: "/placeholder.svg?height=300&width=400",
      discount: 33,
    },
    {
      title: "Elden Ring",
      price: 49.99,
      original_price: null,
      description: "Souls-like de mundo abierto",
      genre: "RPG",
      rating: 4.7,
      image: "/placeholder.svg?height=300&width=400",
      discount: null,
    },
    {
      title: "Grand Theft Auto V",
      price: 14.99,
      original_price: 29.99,
      description: "Mundo abierto criminal en Los Santos",
      genre: "Acción",
      rating: 4.4,
      image: "/placeholder.svg?height=300&width=400",
      discount: 50,
    },
  ]

  for (const game of games) {
    await conn.execute(
      "INSERT INTO games (title, price, original_price, description, genre, rating, image, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        game.title,
        game.price,
        game.original_price,
        game.description,
        game.genre,
        game.rating,
        game.image,
        game.discount,
      ]
    )
  }
}

async function main() {
  try {
    console.log("🚀 Inicializando base de datos MySQL...")
    await initializeDatabase()
    console.log("✅ Base de datos inicializada correctamente")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error)
    process.exit(1)
  }
}

main()
