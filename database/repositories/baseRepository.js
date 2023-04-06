export class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async create(record) {
    return this.db(this.tableName).insert(record);
  }

  async readBy(criteria) {
    return this.db(this.tableName).where(criteria).first();
  }

  async readAllBy(criteria) {
    return this.db(this.tableName).where(criteria);
  }

  async updateAllBy(criteria, updates) {
    return this.db(this.tableName).where(criteria).update(updates);
  }

  async deleteAllBy(criteria) {
    return this.db(this.tableName).where(criteria).del();
  }

  async getCount() {
    const result = await this.db(this.tableName).count('* as count');
    return parseInt(result[0].count, 10);
  }
}
