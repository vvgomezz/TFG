import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

// GET - Obtener usuario por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { id: userId } = await params
    const conn = await getConnection()

    // Obtener usuario
    const [userRows] = await conn.execute("SELECT * FROM users WHERE id = ?", [userId])
    const users = userRows as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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
      [userId],
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
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { id: userId } = await params
    const userData = await request.json()
    const conn = await getConnection()

    await conn.execute("UPDATE users SET username = ?, email = ?, money = ?, points = ? WHERE id = ?", [
      userData.username,
      userData.email,
      userData.money,
      userData.points,
      userId,
    ])

    return NextResponse.json(userData)
  } catch (error) {
    console.error("User update error:", error)
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
