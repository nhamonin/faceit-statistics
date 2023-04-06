import { BaseRepository } from '../baseRepository.js';

export class MatchPredictionRepository extends BaseRepository {
  constructor(db) {
    super(db, 'match_prediction');
  }
}
