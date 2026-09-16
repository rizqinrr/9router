import { v4 as uuidv4 } from "uuid";
import { getAdapter } from "../driver.js";

function rowToKey(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    machineId: row.machineId,
    isActive: row.isActive === 1 || row.isActive === true,
    validDays: row.validDays ?? null,
    maxTokens: row.maxTokens ?? null,
    maxRequests: row.maxRequests ?? null,
    maxCost: row.maxCost ?? null,
    userId: row.userId || null,
    createdAt: row.createdAt,
  };
}

export async function getApiKeys(filter = {}) {
  const db = await getAdapter();
  const where = [];
  const params = [];
  if (filter.userId !== undefined && filter.userId !== null) { where.push("userId = ?"); params.push(filter.userId); }
  const sql = `SELECT * FROM apiKeys${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY createdAt ASC`;
  const rows = db.all(sql, params);
  return rows.map(rowToKey);
}

export async function getApiKeyById(id) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
  return rowToKey(row);
}

export async function getApiKeyByValue(keyValue) {
  const db = await getAdapter();
  const row = db.get(`SELECT * FROM apiKeys WHERE key = ?`, [keyValue]);
  return rowToKey(row);
}

export async function createApiKey(name, machineId, options = {}) {
  if (!machineId) throw new Error("machineId is required");

  // Enforce max 2 keys per user
  if (options.userId) {
    const existing = await getApiKeys({ userId: options.userId });
    if (existing.length >= 2) {
      throw new Error("Maximum 2 API keys per user allowed");
    }
  }

  const db = await getAdapter();
  const { generateApiKeyWithMachine } = await import("@/shared/utils/apiKey");
  const result = generateApiKeyWithMachine(machineId);
  const apiKey = {
    id: uuidv4(),
    name,
    key: result.key,
    machineId,
    isActive: true,
    validDays: options.validDays ?? null,
    maxTokens: options.maxTokens ?? null,
    maxRequests: options.maxRequests ?? null,
    maxCost: options.maxCost ?? null,
    userId: options.userId ?? null,
    createdAt: new Date().toISOString(),
  };
  db.run(
    `INSERT INTO apiKeys(id, key, name, machineId, isActive, validDays, maxTokens, maxRequests, maxCost, userId, createdAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [apiKey.id, apiKey.key, apiKey.name, apiKey.machineId, 1, apiKey.validDays, apiKey.maxTokens, apiKey.maxRequests, apiKey.maxCost, apiKey.userId, apiKey.createdAt]
  );
  return apiKey;
}

export async function updateApiKey(id, data) {
  const db = await getAdapter();
  let result = null;
  db.transaction(() => {
    const row = db.get(`SELECT * FROM apiKeys WHERE id = ?`, [id]);
    if (!row) return;
    const merged = { ...rowToKey(row), ...data };
    db.run(
      `UPDATE apiKeys SET key = ?, name = ?, machineId = ?, isActive = ?, validDays = ?, maxTokens = ?, maxRequests = ?, maxCost = ?, userId = ? WHERE id = ?`,
      [merged.key, merged.name, merged.machineId, merged.isActive ? 1 : 0, merged.validDays ?? null, merged.maxTokens ?? null, merged.maxRequests ?? null, merged.maxCost ?? null, merged.userId ?? null, id]
    );
    result = merged;
  });
  return result;
}

export async function deleteApiKey(id) {
  const db = await getAdapter();
  const res = db.run(`DELETE FROM apiKeys WHERE id = ?`, [id]);
  return (res?.changes ?? 0) > 0;
}

export async function validateApiKey(key) {
  const db = await getAdapter();
  const row = db.get(`SELECT isActive FROM apiKeys WHERE key = ?`, [key]);
  if (!row) return false;
  return row.isActive === 1 || row.isActive === true;
}

export async function getKeyUsageSummary(apiKeyValue) {
  try {
    const db = await getAdapter();
    const row = db.get(
      `SELECT COALESCE(SUM(promptTokens + completionTokens), 0) AS totalTokens,
              COUNT(*) AS totalRequests,
              COALESCE(SUM(cost), 0) AS totalCost
       FROM usageHistory WHERE apiKey = ?`,
      [apiKeyValue]
    );
    return {
      totalTokens: row.totalTokens ?? 0,
      totalRequests: row.totalRequests ?? 0,
      totalCost: row.totalCost ?? 0,
    };
  } catch {
    return { totalTokens: 0, totalRequests: 0, totalCost: 0 };
  }
}

export async function checkKeyLimits(keyData) {
  if (!keyData) return { allowed: false, reason: "invalid", warning: 0 };

  if (!keyData.isActive) {
    return { allowed: false, reason: "disabled", warning: 0 };
  }

  if (keyData.validDays) {
    const expiresAt = new Date(keyData.createdAt);
    expiresAt.setDate(expiresAt.getDate() + keyData.validDays);
    if (new Date() > expiresAt) {
      await updateApiKey(keyData.id, { isActive: false });
      return { allowed: false, reason: "expired", warning: 0 };
    }
  }

  const hasLimits = keyData.maxTokens || keyData.maxRequests || keyData.maxCost;
  if (!hasLimits) return { allowed: true, reason: null, warning: 0 };

  const usage = await getKeyUsageSummary(keyData.key);

  let warning = 0;

  if (keyData.maxTokens && usage.totalTokens >= keyData.maxTokens) {
    await updateApiKey(keyData.id, { isActive: false });
    return { allowed: false, reason: "token_quota", usage, warning: 100 };
  }

  if (keyData.maxRequests && usage.totalRequests >= keyData.maxRequests) {
    await updateApiKey(keyData.id, { isActive: false });
    return { allowed: false, reason: "request_quota", usage, warning: 100 };
  }

  if (keyData.maxCost && usage.totalCost >= keyData.maxCost) {
    await updateApiKey(keyData.id, { isActive: false });
    return { allowed: false, reason: "cost_quota", usage, warning: 100 };
  }

  const tokenRatio = keyData.maxTokens ? usage.totalTokens / keyData.maxTokens : 0;
  const requestRatio = keyData.maxRequests ? usage.totalRequests / keyData.maxRequests : 0;
  const costRatio = keyData.maxCost ? usage.totalCost / keyData.maxCost : 0;
  const maxRatio = Math.max(tokenRatio, requestRatio, costRatio);

  if (maxRatio >= 0.95) warning = 95;
  else if (maxRatio >= 0.80) warning = 80;

  return { allowed: true, reason: null, usage, warning };
}
