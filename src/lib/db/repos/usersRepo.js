import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getAdapter } from "../driver.js";

const USERNAME_REGEX = /^[a-z0-9]+$/;
const GRACE_DAYS = 3;

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    status: row.status,
    daysRemaining: row.days_remaining,
    expiresAt: row.expires_at,
    graceUntil: row.grace_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUsers(filter = {}) {
  const db = await getAdapter();
  const where = [];
  const params = [];
  if (filter.status) { where.push("status = ?"); params.push(filter.status); }
  if (filter.role) { where.push("role = ?"); params.push(filter.role); }
  const sql = `SELECT * FROM users${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC`;
  const rows = db.all(sql, params);
  return rows.map(rowToUser);
}

export async function getUserById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE id = ?`, [id]);
  return rowToUser(row);
}

export async function getUserByUsername(username) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  return rowToUser(row);
}

export async function createUser({ username, pin, role = "user", daysRemaining = 30 }) {
  if (!USERNAME_REGEX.test(username)) {
    throw new Error("Username must be lowercase alphanumeric only");
  }
  if (!pin || pin.length < 4) {
    throw new Error("PIN must be at least 4 characters");
  }

  const db = await getAdapter();
  const now = new Date().toISOString();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysRemaining);
  const graceUntil = new Date(expiresAt);
  graceUntil.setDate(graceUntil.getDate() + GRACE_DAYS);

  const pinHash = await bcrypt.hash(pin, 10);

  const user = {
    username,
    pinHash,
    role,
    status: "active",
    daysRemaining,
    expiresAt: expiresAt.toISOString(),
    graceUntil: graceUntil.toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  db.run(
    `INSERT INTO users (username, pin_hash, role, status, days_remaining, expires_at, grace_until, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.username, user.pinHash, user.role, user.status, user.daysRemaining, user.expiresAt, user.graceUntil, user.createdAt, user.updatedAt]
  );

  return { ...user, id: db.get(`SELECT last_insert_rowid() AS id`)?.id };
}

export async function updateUser(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!row) return;
    const existing = rowToUser(row);
    const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };

    // Recalculate grace_until if expires_at changed
    if (data.expiresAt && !data.graceUntil) {
      const grace = new Date(data.expiresAt);
      grace.setDate(grace.getDate() + GRACE_DAYS);
      merged.graceUntil = grace.toISOString();
    }

    db.run(
      `UPDATE users SET username = ?, role = ?, status = ?, days_remaining = ?, expires_at = ?, grace_until = ?, updated_at = ? WHERE id = ?`,
      [merged.username, merged.role, merged.status, merged.daysRemaining, merged.expiresAt, merged.graceUntil, merged.updatedAt, id]
    );
    result = merged;
  });
  return result;
}

export async function deleteUser(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM users WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function verifyUserPin(username, pin) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!row) return null;
  const isValid = await bcrypt.compare(pin, row.pin_hash);
  if (!isValid) return null;
  return rowToUser(row);
}

export async function addDaysToUser(id, days) {
  const user = await getUserById(id);
  if (!user) return null;

  const newDays = user.daysRemaining + days;
  const newExpiresAt = new Date(user.expiresAt);
  newExpiresAt.setDate(newExpiresAt.getDate() + days);
  const newGraceUntil = new Date(newExpiresAt);
  newGraceUntil.setDate(newGraceUntil.getDate() + GRACE_DAYS);

  return updateUser(id, {
    daysRemaining: newDays,
    expiresAt: newExpiresAt.toISOString(),
    graceUntil: newGraceUntil.toISOString(),
    status: newDays > 0 ? "active" : user.status,
  });
}

export async function resetUserPin(id, newPin) {
  if (!newPin || newPin.length < 4) {
    throw new Error("PIN must be at least 4 characters");
  }
  const pinHash = await bcrypt.hash(newPin, 10);
  const db = await getAdapter();
  db.run(`UPDATE users SET pin_hash = ?, updated_at = ? WHERE id = ?`, [pinHash, new Date().toISOString(), id]);
  return getUserById(id);
}

export async function tickCountdown() {
  const db = await getAdapter();
  const now = new Date().toISOString();

  // 1. Decrement days_remaining for all active users
  db.run(`UPDATE users SET days_remaining = days_remaining - 1, updated_at = ? WHERE status = 'active' AND days_remaining > 0`, [now]);

  // 2. Transition active → grace when days_remaining hits 0
  db.run(`
    UPDATE users SET status = 'grace', updated_at = ?
    WHERE status = 'active' AND days_remaining <= 0
  `, [now]);

  // 3. Transition grace → expired when grace_until passed
  db.run(`
    UPDATE users SET status = 'expired', updated_at = ?
    WHERE status = 'grace' AND grace_until < ?
  `, [now]);

  // 4. Return expired users for hard delete
  const expired = db.all(`SELECT id FROM users WHERE status = 'expired'`);
  return expired.map(r => r.id);
}

export async function hardDeleteExpiredUsers() {
  const db = await getAdapter();
  const expired = db.all(`SELECT id FROM users WHERE status = 'expired'`);
  const ids = expired.map(r => r.id);

  if (ids.length === 0) return 0;

  // SQLite doesn't support arrays in IN clause easily, use transaction
  let deleted = 0;
  db.transaction(() => {
    for (const id of ids) {
      db.run(`DELETE FROM users WHERE id = ?`, [id]);
      deleted++;
    }
  });
  return deleted;
}

export async function getActiveUserCount() {
  const db = await getAdapter();
  const row = db.get(`SELECT COUNT(*) AS n FROM users WHERE status IN ('active', 'grace')`);
  return row?.n || 0;
}
