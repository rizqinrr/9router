export default {
  version: 3,
  name: "003-users",
  up(db) {
    // Users table for multi-tenant SaaS
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        pin_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'grace', 'expired')),
        days_remaining INTEGER NOT NULL DEFAULT 30,
        expires_at TEXT NOT NULL,
        grace_until TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_expires ON users(expires_at)`);
  },
};
