import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling } from '#utils';

export class TeamPlayerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'team_player');
  }

  getActiveTeamsCount = withErrorHandling(async () => {
    const activeTeamsCount = await this.db('team_player').countDistinct(
      'chat_id as count'
    );

    return parseInt(activeTeamsCount[0].count, 10);
  });
}
