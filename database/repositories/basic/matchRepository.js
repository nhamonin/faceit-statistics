import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling, chunk } from '#utils';

export class MatchRepository extends BaseRepository {
  constructor(db) {
    super(db, 'match');
  }

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
