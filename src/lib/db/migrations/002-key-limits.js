export default {
  version: 2,
  name: "key-limits",
  up(db) {
    db.exec(`ALTER TABLE apiKeys ADD COLUMN validDays INTEGER`);
    db.exec(`ALTER TABLE apiKeys ADD COLUMN maxTokens INTEGER`);
    db.exec(`ALTER TABLE apiKeys ADD COLUMN maxRequests INTEGER`);
    db.exec(`ALTER TABLE apiKeys ADD COLUMN maxCost REAL`);
  },
};
