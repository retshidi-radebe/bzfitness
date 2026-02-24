import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

export function getFreshDb() {
  const url = process.env['TURSO_DATABASE_URL']
  const authToken = process.env['TURSO_AUTH_TOKEN']

  console.log('[getFreshDb] TURSO_DATABASE_URL:', url ? `SET (${url.slice(0, 25)}...)` : 'NOT SET')
  console.log('[getFreshDb] DATABASE_URL:', process.env['DATABASE_URL'] ?? 'NOT SET')

  if (url) {
    const adapter = new PrismaLibSQL({ url, authToken })
    return new PrismaClient({ adapter })
  }

  // Local development: SQLite file
  return new PrismaClient()
}
