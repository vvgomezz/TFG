import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

export async function POST(request: NextRequest) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { username, password } = await request.json()

    const conn = await getConnection()
    const [rows] = await conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", [username, password])

    const users = rows as any[]
    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Obtener compras del usuario
    const [purchaseRows] = await conn.execute(
      `SELECT p.*, pi.game_id, pi.quantity, pi.price as item_price, g.title, g.description, g.genre, g.rating, g.image
       FROM purchases p
       LEFT JOIN purchase_items pi ON p.id = pi.purchase_id
       LEFT JOIN games g ON pi.game_id = g.id
       WHERE p.user_id = ?
       ORDER BY p.purchase_date DESC`,
      [user.id],
    )

    const purchases = groupPurchases(purchaseRows as any[])

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      money: Number.parseFloat(user.money),
      points: user.points,
      purchases,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function groupPurchases(rows: any[]) {
  const purchasesMap = new Map()

  rows.forEach((row) => {
    if (!purchasesMap.has(row.id)) {
      purchasesMap.set(row.id, {
        id: row.id,
        total: Number.parseFloat(row.total),
        pointsEarned: row.points_earned,
        date: row.purchase_date.toISOString(),
        items: [],
      })
    }

    if (row.game_id) {
      purchasesMap.get(row.id).items.push({
        id: row.game_id,
        title: row.title,
        description: row.description,
        genre: row.genre,
        rating: Number.parseFloat(row.rating),
        image: row.image,
        price: Number.parseFloat(row.item_price),
        quantity: row.quantity,
      })
    }
  })

  return Array.from(purchasesMap.values())
}
