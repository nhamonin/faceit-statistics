import { BaseRepository } from '../baseRepository.js';

export class TempPredictionRepository extends BaseRepository {
  constructor(db) {
    super(db, 'temp_prediction');
  }

  async create({ match_id, predictions }) {
    return this.db(this.tableName).insert({
      match_id,
      predictions: JSON.stringify(predictions),
    });
  }

  async deleteOlderThan(timestamp) {
    return this.db(this.tableName).where('created_at', '<', timestamp).delete();
  }
}
