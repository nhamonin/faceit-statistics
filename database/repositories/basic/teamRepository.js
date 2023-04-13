import { BaseRepository } from '../baseRepository.js';
import { withErrorHandling } from '#utils';

export class TeamRepository extends BaseRepository {
  constructor(db) {
    super(db, 'team');
  }

  readAllByPlayerId = withErrorHandling(async (player_id) =>
    this.db(this.tableName)
      .select('team.*')
      .join('team_player', 'team.chat_id', '=', 'team_player.chat_id')
      .where('team_player.player_id', player_id)
  );

  updateSettings = withErrorHandling(async (chat_id, settings) =>
    this.updateAllBy(
      { chat_id },
      {
        settings: JSON.stringify(settings),
      }
    )
  );

  readAllChatIds = withErrorHandling(async () =>
    this.db(this.tableName).pluck('chat_id')
  );
}
