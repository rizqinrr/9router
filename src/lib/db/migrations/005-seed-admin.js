export default {
  version: 5,
  name: "005-seed-admin",
  up(db) {
    // Seed default admin user if not exists
    const existing = db.get(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (existing) return;

    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // Admin expires in 1 year
    const graceUntil = new Date(expiresAt);
    graceUntil.setDate(graceUntil.getDate() + 3);

    // Default PIN hash for '123456' — should be changed after first login
    // Using bcryptjs to hash at runtime would be async, so we use a placeholder
    // and let initializeApp.js set the real hash
    const placeholderHash = "$2a$10$placeholder";

    db.run(
      `INSERT INTO users (username, pin_hash, role, status, days_remaining, expires_at, grace_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        process.env.INITIAL_ADMIN_USERNAME || "admin",
        placeholderHash,
        "admin",
        "active",
        365,
        expiresAt.toISOString(),
        graceUntil.toISOString(),
        now,
        now,
      ]
    );
  },
};
