"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Star, Search, User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type Game } from "@/lib/storage"

interface GameOld {
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

const gamesOld: GameOld[] = [
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

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [cartItems, setCartItems] = useState<any[]>([])
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesData = await storageService.getGames()
        setGames(gamesData)
      } catch (error) {
        console.error("Error loading games:", error)
      }
    }
    loadGames()
  }, [])

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem("gamestore_user")
      if (userData) {
        const user = JSON.parse(userData)
        setUser(user)

        try {
          const cart = await storageService.getCart(user.id)
          setCartItems(cart)
        } catch (error) {
          console.error("Error loading cart:", error)
        }
      }
    }
    loadUserData()
  }, [])

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === "all" || game.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const genres = ["all", ...Array.from(new Set(games.map((game) => game.genre)))]

  const addToCart = async (game: Game) => {
    try {
      const currentCart = await storageService.getCart(user?.id || 0)
      const existingItem = currentCart.find((item: any) => item.id === game.id)

      let updatedCart
      if (existingItem) {
        updatedCart = currentCart.map((item: any) =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        updatedCart = [...currentCart, { ...game, quantity: 1 }]
      }

      await storageService.updateCart(user?.id || 0, updatedCart)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("gamestore_user")
    setUser(null)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">🎮 VictorStore España</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="text-white text-sm">
                    <span>¡Hola, {user.username}!</span>
                    <div className="text-yellow-400">
                      💰 {user.money.toLocaleString("es-ES")}€ | ⭐ {user.points} puntos
                    </div>
                  </div>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    <User className="w-4 h-4 mr-2" />
                    Iniciar sesión
                  </Button>
                </Link>
              )}

              <Link href="/cart">
                <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrito
                  {getCartItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar videojuegos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filtrar por género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los géneros</SelectItem>
                {genres.slice(1).map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {game.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">-{game.discount}%</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-white text-lg mb-2">{game.title}</CardTitle>
                <CardDescription className="text-gray-300 text-sm mb-3">{game.description}</CardDescription>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {game.genre}
                  </Badge>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-sm">{game.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">{game.price}€</span>
                    {game.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">{game.originalPrice}€</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => addToCart(game)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!user}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {user ? "Añadir al carrito" : "Inicia sesión para comprar"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg">No se encontraron videojuegos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </main>
    </div>
  )
}
