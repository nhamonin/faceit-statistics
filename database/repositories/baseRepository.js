import { withErrorHandling } from '#utils';

export class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  create = withErrorHandling(async (record) =>
    this.db(this.tableName).insert(record)
  );

  readBy = withErrorHandling(async (criteria) =>
    this.db(this.tableName).where(criteria).first()
  );

  readAllBy = withErrorHandling(async (criteria) =>
    this.db(this.tableName).where(criteria)
  );

  updateAllBy = withErrorHandling(async (criteria, updates) =>
    this.db(this.tableName).where(criteria).update(updates)
  );

  deleteAllBy = withErrorHandling(async (criteria) =>
    this.db(this.tableName).where(criteria).del()
  );

  getCount = withErrorHandling(async () => {
    const result = await this.db(this.tableName).count('* as count');
    return parseInt(result[0].count, 10);
  });
}
