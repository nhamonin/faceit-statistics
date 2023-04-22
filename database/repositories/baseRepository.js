import { withErrorHandling, chunk } from '#utils';

export class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  create = withErrorHandling(async (record) =>
    this.db(this.tableName).insert(record)
  );

  createMany = withErrorHandling(async (records) => {
    const maxSingleInsert = 30;

    if (records.length < maxSingleInsert) {
      await this.db(this.tableName).insert(records);
    } else {
      const chunks = chunk(records, maxSingleInsert);
      for (const chunk of chunks) {
        const res = await this.db(this.tableName).insert(chunk);
        console.log(res);
      }
    }
  });

  readBy = withErrorHandling(async (criteria) => {
    const result = await this.db(this.tableName).where(criteria).first();
    return result || null;
  });

  readAllBy = withErrorHandling(async (criteria, options = {}) => {
    let query = this.db(this.tableName).where(criteria);

    if (options.excludeNull) {
      query = query.whereNotNull(options.excludeNull);
    }

    if (options.orderBy && options.orderDirection) {
      query = query.orderBy(options.orderBy, options.orderDirection);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  });

  updateAllBy = withErrorHandling(async (criteria, updates) =>
    this.db(this.tableName).where(criteria).update(updates)
  );

  batchUpdate = withErrorHandling(async (key, records) => {
    const updateQueries = records.map((record) => {
      const { [key]: keyValue, ...updates } = record;
      const whereClause = `${key} = '${keyValue}'`;
      const setClause = Object.entries(updates)
        .map(([column, value]) => `${column} = ${this.db.raw('?', [value])}`)
        .join(', ');

      return this.db.raw(
        `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause}`
      );
    });

    await Promise.all(updateQueries);
  });

  deleteAllBy = withErrorHandling(async (criteria) =>
    this.db(this.tableName).where(criteria).del()
  );

  getCount = withErrorHandling(async () => {
    const result = await this.db(this.tableName).count('* as count');
    return parseInt(result[0].count, 10);
  });
}
