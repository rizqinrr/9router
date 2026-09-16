export default {
  version: 4,
  name: "004-user-ownership",
  up(db) {
    // Add userId to providerConnections
    db.run(`ALTER TABLE providerConnections ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pc_user ON providerConnections(userId)`);

    // Add userId to apiKeys
    db.run(`ALTER TABLE apiKeys ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ak_user ON apiKeys(userId)`);

    // Add userId to combos
    db.run(`ALTER TABLE combos ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_combos_user ON combos(userId)`);

    // Add userId to proxyPools
    db.run(`ALTER TABLE proxyPools ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE CASCADE`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pp_user ON proxyPools(userId)`);

    // Add userId to usageHistory
    db.run(`ALTER TABLE usageHistory ADD COLUMN userId INTEGER REFERENCES users(id) ON DELETE SET NULL`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_uh_user ON usageHistory(userId)`);
  },
};
