import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling } from '#utils';

export class TempPredictionRepository extends BaseRepository {
  constructor(db) {
    super(db, 'temp_prediction');
  }

  create = withErrorHandling(async ({ match_id, predictions }) =>
    this.db(this.tableName).insert({
      match_id,
      predictions: JSON.stringify(predictions),
    })
  );

  deleteOlderThan = withErrorHandling(async (timestamp) =>
    this.db(this.tableName).where('created_at', '<', timestamp).del()
  );
}
