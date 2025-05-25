import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

export async function POST(request: NextRequest) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { userId, items, total, pointsEarned } = await request.json()

    const conn = await getConnection()

    // Iniciar transacción
    await conn.beginTransaction()

    try {
      // Crear la compra
      const [purchaseResult] = await conn.execute(
        "INSERT INTO purchases (user_id, total, points_earned) VALUES (?, ?, ?)",
        [userId, total, pointsEarned],
      )

      const purchaseId = (purchaseResult as any).insertId

      // Añadir items de la compra
      for (const item of items) {
        await conn.execute("INSERT INTO purchase_items (purchase_id, game_id, quantity, price) VALUES (?, ?, ?, ?)", [
          purchaseId,
          item.id,
          item.quantity,
          item.price,
        ])
      }

      // Actualizar puntos del usuario
      await conn.execute("UPDATE users SET points = points + ? WHERE id = ?", [pointsEarned, userId])

      await conn.commit()

      return NextResponse.json({
        id: purchaseId,
        items,
        total,
        pointsEarned,
        date: new Date().toISOString(),
      })
    } catch (error) {
      await conn.rollback()
      throw error
    }
  } catch (error) {
    console.error("Purchase creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
