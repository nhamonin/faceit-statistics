import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling, chunk } from '#utils';

export class MatchRepository extends BaseRepository {
  constructor(db) {
    super(db, 'match');
  }

  readAllBy = withErrorHandling(async (criteria, options = {}) => {
    let query = this.db(this.tableName).where(criteria);

    if (options.excludeNull) {
      query = query.whereNotNull(options.excludeNull);
    }

    if (options.orderBy && options.orderDirection) {
      query = query.orderBy(options.orderBy, options.orderDirection);
    } else {
      query = query.orderBy('timestamp', 'desc');
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  });

  createMany = withErrorHandling(async (records) => {
    const maxSingleInsert = 30;

    if (records.length < maxSingleInsert) {
      await this.db(this.tableName).insert(records);
    } else {
      const chunks = chunk(records, maxSingleInsert);
      for (const chunk of chunks) {
        await this.db(this.tableName)
          .insert(chunk)
          .onConflict(['match_id', 'player_id'])
          .ignore();
      }
    }
  });
}
