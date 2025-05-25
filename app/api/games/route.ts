import { NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

export async function GET() {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const conn = await getConnection()
    const [rows] = await conn.execute("SELECT * FROM games ORDER BY title")

    const games = (rows as any[]).map((game) => ({
      id: game.id,
      title: game.title,
      price: Number.parseFloat(game.price),
      originalPrice: game.original_price ? Number.parseFloat(game.original_price) : undefined,
      description: game.description,
      genre: game.genre,
      rating: Number.parseFloat(game.rating),
      image: game.image,
      discount: game.discount,
    }))

    return NextResponse.json(games)
  } catch (error) {
    console.error("Games fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
