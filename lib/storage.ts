import { storageConfig } from "@/config/storage"

export interface User {
  id: number
  username: string
  email: string
  password: string
  money: number
  points: number
  purchases?: Purchase[]
}

export interface Game {
  id: number
  title: string
  price: number
  originalPrice?: number
  description: string
  genre: string
  rating: number
  image: string
  discount?: number
}

export interface Purchase {
  id: number
  items: CartItem[]
  total: number
  pointsEarned: number
  date: string
}

export interface CartItem extends Game {
  quantity: number
}

class StorageService {
  private isClient = typeof window !== "undefined"

  // Métodos de usuario
  async getUser(id: number): Promise<User | null> {
    if (storageConfig.mode === "client") {
      return this.getClientUser(id)
    } else {
      return this.getMySQLUser(id)
    }
  }

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    if (storageConfig.mode === "client") {
      return this.getClientUserByCredentials(username, password)
    } else {
      return this.getMySQLUserByCredentials(username, password)
    }
  }

  async createUser(userData: Omit<User, "id" | "money" | "points" | "purchases">): Promise<User> {
    if (storageConfig.mode === "client") {
      return this.createClientUser(userData)
    } else {
      return this.createMySQLUser(userData)
    }
  }

  async updateUser(user: User): Promise<User> {
    if (storageConfig.mode === "client") {
      return this.updateClientUser(user)
    } else {
      return this.updateMySQLUser(user)
    }
  }

  // Métodos de juegos
  async getGames(): Promise<Game[]> {
    if (storageConfig.mode === "client") {
      return this.getClientGames()
    } else {
      return this.getMySQLGames()
    }
  }

  // Métodos de carrito
  async getCart(userId: number): Promise<CartItem[]> {
    if (storageConfig.mode === "client") {
      return this.getClientCart()
    } else {
      return this.getMySQLCart(userId)
    }
  }

  async updateCart(userId: number, items: CartItem[]): Promise<void> {
    if (storageConfig.mode === "client") {
      return this.updateClientCart(items)
    } else {
      return this.updateMySQLCart(userId, items)
    }
  }

  async clearCart(userId: number): Promise<void> {
    if (storageConfig.mode === "client") {
      return this.clearClientCart()
    } else {
      return this.clearMySQLCart(userId)
    }
  }

  // Métodos de compras
  async createPurchase(userId: number, items: CartItem[], total: number, pointsEarned: number): Promise<Purchase> {
    if (storageConfig.mode === "client") {
      return this.createClientPurchase(userId, items, total, pointsEarned)
    } else {
      return this.createMySQLPurchase(userId, items, total, pointsEarned)
    }
  }

  // Implementaciones client-side
  private getClientUser(id: number): User | null {
    if (!this.isClient) return null
    const users = JSON.parse(localStorage.getItem("gamestore_users") || "[]")
    return users.find((u: User) => u.id === id) || null
  }

  private getClientUserByCredentials(username: string, password: string): User | null {
    if (!this.isClient) return null
    const users = JSON.parse(localStorage.getItem("gamestore_users") || "[]")
    return users.find((u: User) => u.username === username && u.password === password) || null
  }

  private createClientUser(userData: Omit<User, "id" | "money" | "points" | "purchases">): User {
    if (!this.isClient) throw new Error("Client-side operation called on server")

    const users = JSON.parse(localStorage.getItem("gamestore_users") || "[]")

    // Verificar si el usuario ya existe
    if (users.find((u: User) => u.username === userData.username)) {
      throw new Error("El nombre de usuario ya existe")
    }
    if (users.find((u: User) => u.email === userData.email)) {
      throw new Error("El email ya está registrado")
    }

    const newUser: User = {
      id: Date.now(),
      ...userData,
      money: storageConfig.settings.defaultUserMoney,
      points: 0,
      purchases: [],
    }

    users.push(newUser)
    localStorage.setItem("gamestore_users", JSON.stringify(users))

    return newUser
  }

  private updateClientUser(user: User): User {
    if (!this.isClient) throw new Error("Client-side operation called on server")

    const users = JSON.parse(localStorage.getItem("gamestore_users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === user.id)

    if (userIndex !== -1) {
      users[userIndex] = user
      localStorage.setItem("gamestore_users", JSON.stringify(users))
    }

    return user
  }

  private getClientGames(): Game[] {
    // Datos estáticos para client-side
    return [
      {
        id: 1,
        title: "Cyberpunk 2077",
        price: 29.99,
        originalPrice: 59.99,
        description: "Un RPG de mundo abierto ambientado en Night City",
        genre: "RPG",
        rating: 4.2,
        image: "/placeholder.svg?height=300&width=400",
        discount: 50,
      },
      {
        id: 2,
        title: "The Witcher 3: Wild Hunt",
        price: 19.99,
        originalPrice: 39.99,
        description: "Aventura épica de fantasía con Geralt de Rivia",
        genre: "RPG",
        rating: 4.8,
        image: "/placeholder.svg?height=300&width=400",
        discount: 50,
      },
      {
        id: 3,
        title: "FIFA 24",
        price: 69.99,
        description: "El simulador de fútbol más realista del mundo",
        genre: "Deportes",
        rating: 4.1,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        id: 4,
        title: "Call of Duty: Modern Warfare III",
        price: 79.99,
        description: "Acción militar intensa en primera persona",
        genre: "Acción",
        rating: 4.3,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        id: 5,
        title: "Baldur's Gate 3",
        price: 59.99,
        description: "RPG por turnos basado en D&D",
        genre: "RPG",
        rating: 4.9,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        id: 6,
        title: "Spider-Man Remastered",
        price: 39.99,
        originalPrice: 59.99,
        description: "Aventura de superhéroes en Nueva York",
        genre: "Acción",
        rating: 4.6,
        image: "/placeholder.svg?height=300&width=400",
        discount: 33,
      },
      {
        id: 7,
        title: "Elden Ring",
        price: 49.99,
        description: "Souls-like de mundo abierto",
        genre: "RPG",
        rating: 4.7,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        id: 8,
        title: "Grand Theft Auto V",
        price: 14.99,
        originalPrice: 29.99,
        description: "Mundo abierto criminal en Los Santos",
        genre: "Acción",
        rating: 4.4,
        image: "/placeholder.svg?height=300&width=400",
        discount: 50,
      },
    ]
  }

  private getClientCart(): CartItem[] {
    if (!this.isClient) return []
    return JSON.parse(localStorage.getItem("gamestore_cart") || "[]")
  }

  private updateClientCart(items: CartItem[]): void {
    if (!this.isClient) return
    localStorage.setItem("gamestore_cart", JSON.stringify(items))
  }

  private clearClientCart(): void {
    if (!this.isClient) return
    localStorage.removeItem("gamestore_cart")
  }

  private createClientPurchase(userId: number, items: CartItem[], total: number, pointsEarned: number): Purchase {
    if (!this.isClient) throw new Error("Client-side operation called on server")

    const purchase: Purchase = {
      id: Date.now(),
      items,
      total,
      pointsEarned,
      date: new Date().toISOString(),
    }

    // Actualizar usuario con la nueva compra
    const users = JSON.parse(localStorage.getItem("gamestore_users") || "[]")
    const userIndex = users.findIndex((u: User) => u.id === userId)

    if (userIndex !== -1) {
      users[userIndex].points += pointsEarned
      users[userIndex].purchases = users[userIndex].purchases || []
      users[userIndex].purchases.push(purchase)
      localStorage.setItem("gamestore_users", JSON.stringify(users))
    }

    return purchase
  }

  // Implementaciones MySQL (llamadas a API)
  private async getMySQLUser(id: number): Promise<User | null> {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) return null
    return response.json()
  }

  private async getMySQLUserByCredentials(username: string, password: string): Promise<User | null> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!response.ok) return null
    return response.json()
  }

  private async createMySQLUser(userData: Omit<User, "id" | "money" | "points" | "purchases">): Promise<User> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }
    return response.json()
  }

  private async updateMySQLUser(user: User): Promise<User> {
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
    if (!response.ok) throw new Error("Error updating user")
    return response.json()
  }

  private async getMySQLGames(): Promise<Game[]> {
    const response = await fetch("/api/games")
    if (!response.ok) return []
    return response.json()
  }

  private async getMySQLCart(userId: number): Promise<CartItem[]> {
    const response = await fetch(`/api/cart/${userId}`)
    if (!response.ok) return []
    return response.json()
  }

  private async updateMySQLCart(userId: number, items: CartItem[]): Promise<void> {
    await fetch(`/api/cart/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  }

  private async clearMySQLCart(userId: number): Promise<void> {
    await fetch(`/api/cart/${userId}`, {
      method: "DELETE",
    })
  }

  private async createMySQLPurchase(
    userId: number,
    items: CartItem[],
    total: number,
    pointsEarned: number,
  ): Promise<Purchase> {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, items, total, pointsEarned }),
    })
    if (!response.ok) throw new Error("Error creating purchase")
    return response.json()
  }
}

export const storageService = new StorageService()
