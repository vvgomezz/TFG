import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { storageConfig } from "@/config/storage"

export async function POST(request: NextRequest) {
  if (storageConfig.mode !== "mysql") {
    return NextResponse.json({ error: "MySQL mode not enabled" }, { status: 400 })
  }

  try {
    const { username, email, password } = await request.json()

    const conn = await getConnection()

    // Verificar si el usuario ya existe
    const [existingUsers] = await conn.execute("SELECT id FROM users WHERE username = ? OR email = ?", [
      username,
      email,
    ])

    if ((existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "El usuario o email ya existe" }, { status: 400 })
    }

    // Crear nuevo usuario
    const [result] = await conn.execute(
      "INSERT INTO users (username, email, password, money, points) VALUES (?, ?, ?, ?, ?)",
      [username, email, password, storageConfig.settings.defaultUserMoney, 0],
    )

    const userId = (result as any).insertId

    return NextResponse.json({
      id: userId,
      username,
      email,
      money: storageConfig.settings.defaultUserMoney,
      points: 0,
      purchases: [],
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
