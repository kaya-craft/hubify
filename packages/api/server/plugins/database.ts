export default defineNitroPlugin(async () => {
  const db = useDatabase()

  // Email / Password
  await db.sql`
    CREATE TABLE IF NOT EXISTS hubify_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`

  // WebAuthn
  await db.sql`
    CREATE TABLE IF NOT EXISTS hubify_credentials (
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      id TEXT UNIQUE NOT NULL,
      publicKey TEXT NOT NULL,
      counter INTEGER NOT NULL,
      backedUp INTEGER NOT NULL,
      transports TEXT NOT NULL,
      PRIMARY KEY ("userId", "id")
    )`
})
