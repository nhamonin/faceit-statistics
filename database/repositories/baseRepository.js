import Bottleneck from 'bottleneck';

import { withErrorHandling, chunk } from '#utils';

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100,
});

export class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  create = withErrorHandling(async (record) => this.db(this.tableName).insert(record));

  createMany = withErrorHandling(async (records) => {
    const maxSingleInsert = 30;

    if (records.length < maxSingleInsert) {
      await this.db(this.tableName).insert(records);
    } else {
      const chunks = chunk(records, maxSingleInsert);
      for (const chunk of chunks) {
        await this.db(this.tableName).insert(chunk);
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

    if (options.pluck) {
      query = query.pluck(options.pluck);
    }

    return query;
  });

  readByNicknames = withErrorHandling(async (nicknames, options = {}) => {
    let query = this.db(this.tableName).whereIn('nickname', nicknames);

    if (options.excludeNull) {
      query = query.whereNotNull(options.excludeNull);
    }

    if (options.orderBy && options.orderDirection) {
      query = query.orderBy(options.orderBy, options.orderDirection);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.pluck) {
      query = query.pluck(options.pluck);
    }

    return query;
  });

  readAllWhereIn = withErrorHandling(async (columnName, valuesArray, options = {}) => {
    let query = this.db(this.tableName).whereIn(columnName, valuesArray);

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

  batchUpdate = withErrorHandling(async (key, records, chunkSize = 10) => {
    const executeUpdateQuery = async (record) => {
      const { [key]: keyValue, ...updates } = record;

      return this.db(this.tableName)
        .where({ [key]: keyValue })
        .update(updates);
    };

    const chunks = chunk(records, chunkSize);

    const tasks = chunks.map((chunk) =>
      limiter.schedule(() => Promise.all(chunk.map((record) => executeUpdateQuery(record))))
    );
    await Promise.all(tasks);
  });

  deleteAllBy = withErrorHandling(async (criteria) =>
    this.db(this.tableName).where(criteria).del()
  );

  getCount = withErrorHandling(async () => {
    const result = await this.db(this.tableName).count('* as count');
    return parseInt(result[0].count, 10);
  });
}
