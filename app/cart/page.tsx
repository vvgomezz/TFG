"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService, type CartItem } from "@/lib/storage"

interface User {
  id: number
  username: string
  email: string
  money: number
  points: number
  purchases: any[]
}

export default function CartPage() {
  const [user, setUser] = useState<User | any>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const userData = localStorage.getItem("gamestore_user")
      if (!userData) {
        router.push("/auth")
        return
      }

      const user = JSON.parse(userData)
      setUser(user)

      try {
        const cart = await storageService.getCart(user.id)
        setCartItems(cart)
      } catch (error) {
        console.error("Error loading cart:", error)
      }
    }
    loadData()
  }, [router])

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    try {
      const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
      await storageService.updateCart(user?.id || 0, updatedCart)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Error updating cart:", error)
    }
  }

  const removeItem = async (id: number) => {
    try {
      const updatedCart = cartItems.filter((item) => item.id !== id)
      await storageService.updateCart(user?.id || 0, updatedCart)
      setCartItems(updatedCart)
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalPoints = () => {
    // 1 punto por cada euro gastado
    return Math.floor(getTotalPrice())
  }

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return

    try {
      const totalPrice = getTotalPrice()
      const pointsEarned = getTotalPoints()

      // Crear la compra
      await storageService.createPurchase(user.id, cartItems, totalPrice, pointsEarned)

      // Obtener usuario actualizado desde el storage service
      const updatedUser = await storageService.getUser(user.id)

      if (updatedUser) {
        // Actualizar en localStorage
        localStorage.setItem("gamestore_user", JSON.stringify(updatedUser))
        setUser(updatedUser)
      } else {
        // Fallback: actualizar manualmente si no se puede obtener el usuario
        const fallbackUser = {
          ...user,
          points: user.points + pointsEarned,
        }
        localStorage.setItem("gamestore_user", JSON.stringify(fallbackUser))
        setUser(fallbackUser)
      }

      // Limpiar carrito
      await storageService.clearCart(user.id)
      setCartItems([])

      setSuccess(`¡Compra realizada con éxito! Has ganado ${pointsEarned} puntos de recompensa.`)
    } catch (error) {
      console.error("Error during checkout:", error)
      setSuccess("Error al procesar la compra. Inténtalo de nuevo.")
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la tienda
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">🛒 Mi Carrito</h1>
            <div className="text-white text-sm">
              <span>¡Hola, {user.username}!</span>
              <div className="text-yellow-400">
                💰 {user.money.toLocaleString("es-ES")}€ | ⭐ {user.points} puntos
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {success && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/50">
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center py-12">
            <CardContent>
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-300 mb-6">¡Explora nuestra tienda y encuentra tus videojuegos favoritos!</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Explorar tienda
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Productos en tu carrito</h2>
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-semibold">{item.title}</h3>
                            <p className="text-gray-300 text-sm">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                                {item.genre}
                              </Badge>
                              <div className="flex items-center text-yellow-400">
                                <Star className="w-3 h-3 fill-current mr-1" />
                                <span className="text-xs">{item.rating}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="text-white font-bold">{(item.price * item.quantity).toFixed(2)}€</div>
                            {item.originalPrice && (
                              <div className="text-gray-400 line-through text-sm">
                                {(item.originalPrice * item.quantity).toFixed(2)}€
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} productos)</span>
                      <span>{getTotalPrice().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Envío</span>
                      <span className="text-green-400">¡Gratis!</span>
                    </div>
                    <div className="border-t border-white/20 pt-2">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>{getTotalPrice().toFixed(2)}€</span>
                      </div>
                    </div>
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                      <div className="text-yellow-200 text-sm">
                        <div className="font-semibold">🎁 Puntos de recompensa</div>
                        <div>Ganarás {getTotalPoints()} puntos con esta compra</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    Finalizar compra
                  </Button>

                  <div className="text-center text-gray-300 text-sm">
                    💰 Tu saldo: {user?.money?.toLocaleString("es-ES")}€
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
