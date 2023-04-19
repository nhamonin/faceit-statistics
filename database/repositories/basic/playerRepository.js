import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling } from '#utils';

export class PlayerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'player');
  }

  readAllByChatId = withErrorHandling(async (chat_id) =>
    this.db(this.tableName)
      .select('player.*')
      .join('team_player', 'player.player_id', '=', 'team_player.player_id')
      .where('team_player.chat_id', chat_id)
  );

  readAllPlayerIds = withErrorHandling(async () =>
    this.db(this.tableName).pluck('player_id')
  );
}
