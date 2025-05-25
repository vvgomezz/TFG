"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Star, Calendar, ShoppingBag, Trophy, Gift } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storageService } from "@/lib/storage"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      const userData = localStorage.getItem("gamestore_user")
      if (!userData) {
        router.push("/auth")
        return
      }

      const localUser = JSON.parse(userData)

      try {
        // Intentar obtener datos actualizados del storage service
        const updatedUser = await storageService.getUser(localUser.id)
        if (updatedUser) {
          setUser(updatedUser)
          // Actualizar localStorage con datos frescos
          localStorage.setItem("gamestore_user", JSON.stringify(updatedUser))
        } else {
          // Usar datos locales como fallback
          setUser(localUser)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        // Usar datos locales como fallback
        setUser(localUser)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const getPointsLevel = (points: number) => {
    if (points >= 1000) return { level: "Leyenda", color: "bg-purple-600", icon: "👑" }
    if (points >= 500) return { level: "Experto", color: "bg-yellow-600", icon: "🏆" }
    if (points >= 200) return { level: "Veterano", color: "bg-blue-600", icon: "⭐" }
    if (points >= 50) return { level: "Jugador", color: "bg-green-600", icon: "🎮" }
    return { level: "Novato", color: "bg-gray-600", icon: "🌟" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando perfil...</div>
      </div>
    )
  }

  if (!user) {
    return <div>Error al cargar el perfil</div>
  }

  const pointsLevel = getPointsLevel(user.points)
  const totalSpent = user.purchases?.reduce((total: number, purchase: any) => total + purchase.total, 0) || 0
  const totalGames =
    user.purchases?.reduce(
      (total: number, purchase: any) =>
        total + purchase.items.reduce((itemTotal: number, item: any) => itemTotal + item.quantity, 0),
      0,
    ) || 0

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
            <h1 className="text-2xl font-bold text-white">👤 Mi Perfil</h1>
            <div className="text-white text-sm">
              <span>¡Hola, {user.username}!</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-white text-xl">{user.username}</CardTitle>
                <CardDescription className="text-gray-300">{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`${pointsLevel.color} text-white text-lg px-4 py-2`}>
                    {pointsLevel.icon} {pointsLevel.level}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Saldo disponible:</span>
                    <span className="text-green-400 font-bold">💰 {user.money.toLocaleString("es-ES")}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Puntos de recompensa:</span>
                    <span className="text-yellow-400 font-bold">⭐ {user.points}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total gastado:</span>
                    <span className="text-white font-bold">{totalSpent.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Juegos comprados:</span>
                    <span className="text-white font-bold">{totalGames}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`flex items-center p-3 rounded-lg ${user.points >= 50 ? "bg-green-500/20" : "bg-gray-500/20"}`}
                >
                  <div className="text-2xl mr-3">🎮</div>
                  <div>
                    <div className="text-white font-semibold">Primer Jugador</div>
                    <div className="text-gray-300 text-sm">Gana 50 puntos</div>
                  </div>
                </div>

                <div
                  className={`flex items-center p-3 rounded-lg ${user.points >= 200 ? "bg-green-500/20" : "bg-gray-500/20"}`}
                >
                  <div className="text-2xl mr-3">⭐</div>
                  <div>
                    <div className="text-white font-semibold">Veterano</div>
                    <div className="text-gray-300 text-sm">Gana 200 puntos</div>
                  </div>
                </div>

                <div
                  className={`flex items-center p-3 rounded-lg ${user.points >= 500 ? "bg-green-500/20" : "bg-gray-500/20"}`}
                >
                  <div className="text-2xl mr-3">🏆</div>
                  <div>
                    <div className="text-white font-semibold">Experto</div>
                    <div className="text-gray-300 text-sm">Gana 500 puntos</div>
                  </div>
                </div>

                <div
                  className={`flex items-center p-3 rounded-lg ${user.points >= 1000 ? "bg-green-500/20" : "bg-gray-500/20"}`}
                >
                  <div className="text-2xl mr-3">👑</div>
                  <div>
                    <div className="text-white font-semibold">Leyenda</div>
                    <div className="text-gray-300 text-sm">Gana 1000 puntos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="purchases" className="text-white data-[state=active]:bg-white/20">
                  Historial de compras
                </TabsTrigger>
                <TabsTrigger value="rewards" className="text-white data-[state=active]:bg-white/20">
                  Sistema de puntos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="purchases" className="space-y-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Mis compras
                    </CardTitle>
                    <CardDescription className="text-gray-300">Historial completo de tus compras</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.purchases && user.purchases.length > 0 ? (
                      <div className="space-y-4">
                        {user.purchases.map((purchase: any) => (
                          <div key={purchase.id} className="border border-white/20 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="text-white font-semibold">Pedido #{purchase.id}</div>
                                <div className="text-gray-300 text-sm flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(purchase.date)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">{purchase.total.toFixed(2)}€</div>
                                <div className="text-yellow-400 text-sm">+{purchase.pointsEarned} puntos</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {purchase.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <div className="text-white text-sm font-medium">{item.title}</div>
                                    <div className="text-gray-300 text-xs">
                                      {item.quantity}x {item.price}€
                                    </div>
                                  </div>
                                  <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                                    {item.genre}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300">Aún no has realizado ninguna compra</p>
                        <Link href="/">
                          <Button className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                            Explorar tienda
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-4">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      Sistema de puntos de recompensa
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Gana puntos con cada compra y desbloquea recompensas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">¿Cómo funciona?</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Ganas 1 punto por cada euro que gastes</li>
                        <li>• Los puntos se acumulan automáticamente</li>
                        <li>• Desbloquea niveles y logros especiales</li>
                        <li>• ¡Más funciones de canje próximamente!</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-white font-semibold">Puntos actuales</div>
                        <div className="text-2xl font-bold text-yellow-400">{user.points}</div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <div className="text-white font-semibold">Nivel actual</div>
                        <div className="text-lg font-bold text-purple-400">{pointsLevel.level}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-white font-semibold">Próximos niveles:</h4>
                      <div className="space-y-2">
                        {[
                          { level: "Jugador", points: 50, icon: "🎮" },
                          { level: "Veterano", points: 200, icon: "⭐" },
                          { level: "Experto", points: 500, icon: "🏆" },
                          { level: "Leyenda", points: 1000, icon: "👑" },
                        ].map((level) => (
                          <div
                            key={level.level}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              user.points >= level.points ? "bg-green-500/20" : "bg-gray-500/20"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{level.icon}</span>
                              <span className="text-white">{level.level}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">{level.points} puntos</div>
                              {user.points >= level.points ? (
                                <Badge className="bg-green-500 text-white">¡Desbloqueado!</Badge>
                              ) : (
                                <div className="text-gray-400 text-sm">
                                  {level.points - user.points} puntos restantes
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
