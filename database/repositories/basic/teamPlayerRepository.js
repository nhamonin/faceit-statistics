import { BaseRepository } from '../baseRepository.js';

export class TeamPlayerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'team_player');
  }
}
