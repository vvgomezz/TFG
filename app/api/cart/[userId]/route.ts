import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

// GET - Obtener carrito del usuario
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { userId } = await params
    const conn = await getConnection()

    // Obtener items del carrito con información del juego
    const [rows] = await conn.execute(
      `SELECT c.*, g.title, g.price, g.original_price, g.description, g.genre, g.rating, g.image, g.discount
       FROM cart_items c
       JOIN games g ON c.game_id = g.id
       WHERE c.user_id = ?`,
      [userId],
    )

    const cartItems = (rows as any[]).map((item) => ({
      id: item.game_id,
      title: item.title,
      price: Number.parseFloat(item.price),
      originalPrice: item.original_price ? Number.parseFloat(item.original_price) : undefined,
      description: item.description,
      genre: item.genre,
      rating: Number.parseFloat(item.rating),
      image: item.image,
      discount: item.discount,
      quantity: item.quantity,
    }))

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Actualizar carrito completo
export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { userId } = await params
    const { items } = await request.json()
    const conn = await getConnection()

    // Iniciar transacción
    await conn.beginTransaction()

    try {
      // Limpiar carrito actual
      await conn.execute("DELETE FROM cart_items WHERE user_id = ?", [userId])

      // Insertar nuevos items
      for (const item of items) {
        await conn.execute("INSERT INTO cart_items (user_id, game_id, quantity) VALUES (?, ?, ?)", [
          userId,
          item.id,
          item.quantity,
        ])
      }

      await conn.commit()
      return NextResponse.json({ success: true })
    } catch (error) {
      await conn.rollback()
      throw error
    }
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Limpiar carrito
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { userId } = await params
    const conn = await getConnection()

    await conn.execute("DELETE FROM cart_items WHERE user_id = ?", [userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart clear error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
