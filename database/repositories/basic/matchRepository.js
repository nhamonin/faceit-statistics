import Bottleneck from 'bottleneck';

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

  create = withErrorHandling(async (record) =>
    this.db(this.tableName)
      .insert(record)
      .onConflict(['match_id', 'player_id'])
      .merge()
  );

  createMany = withErrorHandling(async (records) => {
    const maxSingleInsert = 30;
    const concurrencyLimit = 10;
    const chunks = chunk(records, maxSingleInsert);

    const createChunk = async (chunk) => {
      await this.db(this.tableName)
        .insert(chunk)
        .onConflict(['match_id', 'player_id'])
        .merge();
    };

    const limiter = new Bottleneck({ maxConcurrent: concurrencyLimit });

    if (chunks.length === 1) {
      await createChunk(chunks[0]);
    } else {
      const promises = chunks.map((chunk) =>
        limiter.schedule(() => createChunk(chunk))
      );

      await Promise.all(promises);
    }
  });
}
